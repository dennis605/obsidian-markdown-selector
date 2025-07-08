# Markdown Element Selector

This Obsidian plugin adds a search menu for common Markdown elements. You can open the menu via hotkey or by typing `//` and insert headings, links and other structures directly into the editor.

## Installation

1. Clone this repository or download the ZIP
   ```bash
   git clone <repository-url>
   cd obsidian-markdown-selector
   ```
2. Install dependencies and build the plugin
   ```bash
   npm install
   npm run build
   ```
3. Copy the entire folder to your vault's `.obsidian/plugins/markdown-selector`
4. Enable the plugin in Obsidian under "Settings → Community Plugins"

## Usage

- Press `Ctrl/Cmd + M` to open the Markdown element menu
- Alternatively, the menu appears automatically when you type `//`
- Search the list and confirm with Enter
- Selected text will be placed into the snippet at the appropriate spots
- The hotkey can be changed in Obsidian under "Settings → Hotkeys"

Supported elements include headings, lists, formatting, links, images, tables, callouts, footnotes and tags. After inserting a snippet the cursor jumps to the next logical position so you can keep writing without interruption.

## Development

For custom adjustments edit `main.ts`. Running `npm run dev` compiles changes continuously. Afterwards copy `main.js`, `manifest.json` and `style.css` to your plugin folder to overwrite the existing files.

## License

This project is licensed under the MIT License. See `package.json` for more information.
