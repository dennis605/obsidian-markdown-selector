"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class MarkdownSelectorPlugin extends obsidian_1.Plugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.registerEditorSuggest(new MarkdownElementSuggest(this));
        });
    }
}
exports.default = MarkdownSelectorPlugin;
class MarkdownElementSuggest extends obsidian_1.EditorSuggest {
    constructor(plugin) {
        super(plugin.app);
        this.plugin = plugin;
    }
    onTrigger(cursor, editor, file) {
        const line = editor.getLine(cursor.line);
        const beforeCursor = line.substring(0, cursor.ch);
        if (beforeCursor.endsWith("//")) {
            return {
                start: { line: cursor.line, ch: cursor.ch - 2 },
                end: cursor,
                query: ""
            };
        }
        return null;
    }
    getSuggestions(context) {
        return [
            // Überschriften
            { label: 'H1 - Überschrift 1', insert: '# ', description: 'Hauptüberschrift' },
            { label: 'H2 - Überschrift 2', insert: '## ', description: 'Unterüberschrift' },
            { label: 'H3 - Überschrift 3', insert: '### ', description: 'Unterüberschrift Ebene 3' },
            { label: 'H4 - Überschrift 4', insert: '#### ', description: 'Unterüberschrift Ebene 4' },
            { label: 'H5 - Überschrift 5', insert: '##### ', description: 'Unterüberschrift Ebene 5' },
            { label: 'H6 - Überschrift 6', insert: '###### ', description: 'Unterüberschrift Ebene 6' },
            // Textformatierung
            { label: 'Fett', insert: '**Text**', description: 'Fetter Text' },
            { label: 'Kursiv', insert: '*Text*', description: 'Kursiver Text' },
            { label: 'Fett und Kursiv', insert: '***Text***', description: 'Fetter und kursiver Text' },
            { label: 'Durchgestrichen', insert: '~~Text~~', description: 'Durchgestrichener Text' },
            { label: 'Hervorgehoben', insert: '==Text==', description: 'Hervorgehobener Text' },
            { label: 'Code inline', insert: '`Code`', description: 'Inline Code' },
            // Listen
            { label: 'Ungeordnete Liste', insert: '- ', description: 'Aufzählungsliste' },
            { label: 'Geordnete Liste', insert: '1. ', description: 'Nummerierte Liste' },
            { label: 'Aufgabenliste', insert: '- [ ] ', description: 'Checkbox Liste' },
            // Blöcke
            { label: 'Codeblock', insert: '```\nCode\n```', description: 'Mehrzeiliger Codeblock' },
            { label: 'Zitat', insert: '> ', description: 'Blockzitat' },
            { label: 'Horizontale Linie', insert: '---', description: 'Trennlinie' },
            // Links und Medien
            { label: 'Link', insert: '[Linktext](URL)', description: 'Externer Link' },
            { label: 'Interner Link', insert: '[[Notizname]]', description: 'Link zu anderer Notiz' },
            { label: 'Bild', insert: '![Alt-Text](Bild-URL)', description: 'Bild einfügen' },
            // Tabellen
            { label: 'Tabelle', insert: '| Spalte 1 | Spalte 2 |\n|----------|----------|\n| Zeile 1  | Zeile 1  |', description: 'Einfache Tabelle' },
            // Obsidian spezifisch
            { label: 'Callout Info', insert: '> [!info]\n> Inhalt', description: 'Info Callout' },
            { label: 'Callout Warnung', insert: '> [!warning]\n> Inhalt', description: 'Warnungs Callout' },
            { label: 'Callout Fehler', insert: '> [!error]\n> Inhalt', description: 'Fehler Callout' },
            { label: 'Callout Tipp', insert: '> [!tip]\n> Inhalt', description: 'Tipp Callout' },
            { label: 'Tag', insert: '#tag', description: 'Hashtag' },
            { label: 'Fußnote', insert: 'Text[^1]\n\n[^1]: Fußnotentext', description: 'Fußnote' }
        ];
    }
    renderSuggestion(element, el) {
        el.createEl("div", { text: element.label + " – " + element.description });
    }
    selectSuggestion(element, evt) {
        var _a;
        const editor = (_a = this.context) === null || _a === void 0 ? void 0 : _a.editor;
        if (!editor)
            return;
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const newLine = line.substring(0, cursor.ch - 2) + element.insert + line.substring(cursor.ch);
        editor.setLine(cursor.line, newLine);
        editor.setCursor(cursor.line, cursor.ch - 2 + element.insert.length);
    }
}
//# sourceMappingURL=main.js.map