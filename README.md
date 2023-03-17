# Copy Chunks

Split a file into chunks of N tokens for easy copy-paste.
Copy Chunks is a Visual Studio Code extension that makes it easy to copy chunks of a document 
to paste into length-limited chatbot conversations. The extension provides a command palette 
command "Copy Chunks" that opens a sidebar with a page showing chunks of the current file, each 
chunk having a specified length in tokens. 

- Tokenization uses [gpt-3-encoder](https://www.npmjs.com/package/gpt-3-encoder). 
- Syntax highlightig uses [highlight.js](https://www.npmjs.com/package/highlight.js).

## Features

    Copy chunks of a document to paste into length-limited chatbot conversations.
    Command palette command "Copy Chunks" that opens a sidebar with a page showing chunks of the current file.
    Specify the length of chunks in tokens using OpenAI Tokenizers or Huggingface Tokenizers.

## Requirements

    Visual Studio Code 1.56.0 or later.

## Extension Settings

This extension contributes the following settings:

    copy-chunks.chunkLength: The length of each chunk in tokens. Default is 100.

## Usage

To use the Copy Chunks extension, follow these steps:

    Open a file in Visual Studio Code.

    Press Ctrl+Shift+P (Windows, Linux) or Cmd+Shift+P (macOS) to open the Command Palette.

    Type "Copy Chunks" in the Command Palette and select the "Copy Chunks" command.

    In the sidebar that opens, specify the length of each chunk in tokens using the input field.

    Click on a chunk to copy it to the clipboard.

## Known Issues

There are no known issues with this extension.

## Release Notes
1.0.0

Initial release of Copy Chunks.

## Contributing

PRs welcome!

## License

This extension is licensed under the MIT License.