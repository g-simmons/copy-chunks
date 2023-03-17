import * as vscode from 'vscode';
import { encode, decode } from 'gpt-3-encoder';
const hljs = require('highlight.js');

export function activate(context: vscode.ExtensionContext) {

    const copyChunksCommand = vscode.commands.registerCommand('copy-chunks.copyChunks', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor.');
            return;
        }
        let chunkLength = vscode.workspace.getConfiguration().get('copy-chunks.chunkLength') as number;
        if (chunkLength <= 0) {
            vscode.window.showErrorMessage('Invalid chunk length.');
            return;
        }
        const text = editor.document.getText();
        const tokens = tokenize(text);
        const chunks = splitIntoChunks(tokens, chunkLength);
        const panel = vscode.window.createWebviewPanel(
            'copyChunks',
            'Copy Chunks',
            vscode.ViewColumn.Beside,
            {}
        );
        panel.webview.html = getWebviewContent(chunks, chunkLength);
        panel.onDidDispose(() => {
            // Clean up event listeners
            chunkLength = 0;
        });
    });


    context.subscriptions.push(copyChunksCommand);
}


function tokenize(text: string): string[] {
    const chunkLength = vscode.workspace.getConfiguration('copy-chunks').get('chunkLength');
    if (typeof chunkLength !== 'number' || chunkLength <= 0) {
        vscode.window.showErrorMessage('Invalid chunk length specified in settings.');
        return [];
    }

    const tokens = encode(text);
    const numTokens = tokens.length;

    const chunks: string[] = [];
    let startIndex = 0;
    while (startIndex < numTokens) {
        let endIndex = startIndex + chunkLength;
        if (endIndex > numTokens) {
            endIndex = numTokens;
        }
        const chunkTokens = tokens.slice(startIndex, endIndex);
        const chunk = decode(chunkTokens);
        chunks.push(chunk);
        startIndex += chunkTokens.length;
    }

    return chunks;
}

function splitIntoChunks(tokens: string[], chunkLength: number): string[][] {
    const chunks: string[][] = [];
    let chunk: string[] = [];

    for (const token of tokens) {
        if (chunk.length + token.length > chunkLength) {
            chunks.push(chunk);
            chunk = [];
        }

        chunk.push(token);
    }

    if (chunk.length > 0) {
        chunks.push(chunk);
    }

    return chunks;
}

function getWebviewContent(chunks: string[][], chunkLength: number): string {
    let html = `
        <html>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/styles/vs.min.css" integrity="sha512-sF+kSaZ1zjUB2cXkC9v+PSI4mJ4oU6dyNYW6BbU1mnZDj/soe1JRGW8sR26PoxgjPJBbUrTf+MB3qvlY2QDAA==" crossorigin="anonymous" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/highlight.min.js" integrity="sha512-nQPNF9xB+OxF6eO4CGR4j6WJ0LwSe1OgZXM+W97/G50xTh5vkXwoiK1V7zt1oiyQ2A7OsDjKpkhzf7zPmqayag==" crossorigin="anonymous"></script>
                <style>
                    .copy-box {
                        border: 1px solid #ccc;
                        padding: 10px;
                        margin-bottom: 20px;
                        box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
                        transition: all 0.3s ease;
                        overflow-x: auto;
                        white-space: pre-wrap;
                    }
                    .copy-box:hover {
                        transform: translate(0px, -2px);
                        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
                    }
                    .copy-button {
                        cursor: pointer;
                        border: none;
                        background-color: transparent;
                        margin-bottom: 5px;
                        font-size: 14px;
                    }
                    .copy-button:hover {
                        color: #007acc;
                    }
                    .chunk-length-input {
                        margin-bottom: 10px;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div>
                    <label for="chunkLengthInput">Chunk Length:</label>
                    <input type="number" class="chunk-length-input" id="chunkLengthInput" value="${chunkLength}">
                </div>
    `;
    const editor = vscode.window.activeTextEditor;
    const languageId = editor ? editor.document.languageId : undefined;
    for (const chunk of chunks) {
        const text = chunk.join('');
        const language = languageId ? languageId : hljs.highlightAuto(text).language;
        const highlighted = hljs.highlight(text, { language }).value;
        html += `
            <div class="copy-box">
                <button class="copy-button" onclick="copyToClipboard(this)">Copy</button>
                <pre><code class="hljs ${language}">
                    ${highlighted}
                </code></pre>
            </div>
        `;
    }
    html += `
            <script>
                function copyToClipboard(button) {
                    const copyText = button.parentNode.querySelector('code').innerText;
                    navigator.clipboard.writeText(copyText).then(() => {
                        button.innerText = 'Copied!';
                        setTimeout(() => {
                            button.innerText = 'Copy';
                        }, 1000);
                    });
                }
                const chunkLengthInput = document.querySelector('#chunkLengthInput');

                chunkLengthInput.addEventListener('change', e => {
                    const chunkLength = parseInt(e.target.value);
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        return;
                    }
                    const text = editor.document.getText();
                    const tokens = tokenize(text);
                    const chunks = splitIntoChunks(tokens, chunkLength);
                    const panel = vscode.window.createWebviewPanel(
                            'copyChunks',
                            'Copy Chunks',
                            vscode.ViewColumn.Beside,
                            {}
                        );
                    panel.webview.html = getWebviewContent(chunks, chunkLength);
                });
        </script>
    </body>
</html>
`;
return html;

}