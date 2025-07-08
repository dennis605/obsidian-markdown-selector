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
const DEFAULT_SETTINGS = {
    hotkey: "Mod+M"
};
class MarkdownElementSuggestModal extends obsidian_1.SuggestModal {
    constructor(plugin, editor) {
        super(plugin.app);
        this.plugin = plugin;
        this.editor = editor;
    }
    getSuggestions(query) {
        // Optional: Filter nach query
        return this.plugin.getMarkdownElements();
    }
    renderSuggestion(element, el) {
        el.createEl("div", { text: element.label + " – " + element.description });
    }
    onChooseSuggestion(element, evt) {
        // Gleiche Logik wie bisher für das Einfügen
        const selection = this.editor.getSelection();
        let insertText = element.insert;
        if (selection && selection.length > 0) {
            insertText = insertText
                .replace(/Text/g, selection)
                .replace(/Code/g, selection)
                .replace(/Linktext/g, selection)
                .replace(/Bild-URL/g, selection)
                .replace(/Notizname/g, selection)
                .replace(/tag/g, selection)
                .replace(/Inhalt/g, selection);
            if (element.label === 'Fußnote') {
                insertText = insertText.replace(selection + '[^1]', selection + '[^1]');
            }
            this.editor.replaceSelection(insertText);
        }
        else {
            this.editor.replaceSelection(insertText);
        }
    }
}
class MarkdownSelectorPlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.settings = DEFAULT_SETTINGS;
    }
    parseHotkey(hotkey) {
        if (!hotkey)
            return null;
        const parts = hotkey.split("+").map(p => p.trim()).filter(p => p.length > 0);
        if (parts.length === 0)
            return null;
        const key = parts.pop();
        const modifiers = parts;
        return { modifiers, key };
    }
    registerCommand() {
        const parsed = this.parseHotkey(this.settings.hotkey);
        const fullId = `${this.manifest.id}:open-markdown-selector`;
        try {
            this.app.commands.removeCommand(fullId);
        }
        catch (e) {
            // ignore if command does not exist
        }
        this.addCommand({
            id: "open-markdown-selector",
            name: "Markdown-Selector öffnen",
            editorCallback: (editor) => new MarkdownElementSuggestModal(this, editor).open(),
            hotkeys: parsed ? [parsed] : []
        });
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addSettingTab(new MarkdownSelectorSettingTab(this.app, this));
            this.registerCommand();
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    getMarkdownElements() {
        return [
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
            { label: 'Aufgabe offen', insert: '- [ ] Aufgabe', description: 'Einzelne offene Aufgabe' },
            { label: 'Aufgabe erledigt', insert: '- [x] Aufgabe', description: 'Abgeschlossene Aufgabe' },
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
}
exports.default = MarkdownSelectorPlugin;
class MarkdownSelectorSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Markdown Selector Einstellungen" });
        new obsidian_1.Setting(containerEl)
            .setName("Tastenkombination")
            .setDesc("Wähle die Tastenkombination zum Öffnen des Selectors (Standard: Mod+M)")
            .addText(text => text
            .setPlaceholder("Mod+M")
            .setValue(this.plugin.settings.hotkey)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.hotkey = value;
            yield this.plugin.saveSettings();
            this.plugin.registerCommand();
        })));
    }
}
//# sourceMappingURL=main.js.map