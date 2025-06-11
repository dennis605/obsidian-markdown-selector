import { Plugin, Editor, PluginSettingTab, Setting, App, TFile, SuggestModal } from "obsidian";

interface MarkdownElement {
    label: string;
    insert: string;
    description: string;
}

interface MarkdownSelectorSettings {
    hotkey: string;
}

const DEFAULT_SETTINGS: MarkdownSelectorSettings = {
    hotkey: "Mod+M"
};

class MarkdownElementSuggestModal extends SuggestModal<MarkdownElement> {
    editor: Editor;
    plugin: MarkdownSelectorPlugin;
    constructor(plugin: MarkdownSelectorPlugin, editor: Editor) {
        super(plugin.app);
        this.plugin = plugin;
        this.editor = editor;
    }
    getSuggestions(query: string): MarkdownElement[] {
        // Optional: Filter nach query
        return this.plugin.getMarkdownElements();
    }
    renderSuggestion(element: MarkdownElement, el: HTMLElement) {
        el.createEl("div", { text: element.label + " – " + element.description });
    }
    onChooseSuggestion(element: MarkdownElement, evt: MouseEvent | KeyboardEvent) {
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
        } else {
            this.editor.replaceSelection(insertText);
        }
    }
}

export default class MarkdownSelectorPlugin extends Plugin {
    settings: MarkdownSelectorSettings = DEFAULT_SETTINGS;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new MarkdownSelectorSettingTab(this.app, this));
        this.addCommand({
            id: "open-markdown-selector",
            name: "Markdown-Selector öffnen",
            editorCallback: (editor) => {
                new MarkdownElementSuggestModal(this, editor).open();
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
    getMarkdownElements(): MarkdownElement[] {
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

class MarkdownSelectorSettingTab extends PluginSettingTab {
    plugin: MarkdownSelectorPlugin;
    constructor(app: import("obsidian").App, plugin: MarkdownSelectorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Markdown Selector Einstellungen" });
        new Setting(containerEl)
            .setName("Tastenkombination")
            .setDesc("Wähle die Tastenkombination zum Öffnen des Selectors (Standard: Mod+M)")
            .addText(text => text
                .setPlaceholder("Mod+M")
                .setValue(this.plugin.settings.hotkey)
                .onChange(async (value) => {
                    this.plugin.settings.hotkey = value;
                    await this.plugin.saveSettings();
                }));
    }
}