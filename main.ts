import { Plugin, Editor, PluginSettingTab, Setting, App, TFile, SuggestModal, Modifier, Hotkey, EditorSuggest, EditorSuggestTriggerInfo, EditorPosition, EditorSuggestContext } from "obsidian";

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

class MarkdownElementSuggest extends EditorSuggest<MarkdownElement> {
    plugin: MarkdownSelectorPlugin;

    constructor(plugin: MarkdownSelectorPlugin) {
        super(plugin.app);
        this.plugin = plugin;
    }

    onTrigger(cursor: EditorPosition, editor: Editor, _file: TFile): EditorSuggestTriggerInfo | null {
        const line = editor.getLine(cursor.line);
        const beforeCursor = line.substring(0, cursor.ch);
        if (beforeCursor.endsWith("//")) {
            // remove the trigger characters and open the selector modal
            editor.replaceRange("", { line: cursor.line, ch: cursor.ch - 2 }, cursor);
            new MarkdownElementSuggestModal(this.plugin, editor).open();
        }
        return null;
    }

    getSuggestions(_context: EditorSuggestContext): MarkdownElement[] {
        return this.plugin.getMarkdownElements();
    }

    renderSuggestion(value: MarkdownElement, el: HTMLElement) {
        el.createEl("div", { text: `${value.label} – ${value.description}` });
    }

    selectSuggestion(value: MarkdownElement) {
        const editor = this.context?.editor;
        if (!editor) return;
        this.plugin.insertElement(editor, value);
    }
}

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
        this.plugin.insertElement(this.editor, element);
    }
}

export default class MarkdownSelectorPlugin extends Plugin {
    settings: MarkdownSelectorSettings = DEFAULT_SETTINGS;

    insertElement(editor: Editor, element: MarkdownElement) {
        const selection = editor.getSelection();
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
            const from = editor.getCursor('from');
            editor.replaceSelection(insertText);
            editor.setCursor({ line: from.line, ch: from.ch + insertText.length });
        } else {
            const placeholders = [
                'Text',
                'Code',
                'Linktext',
                'URL',
                'Bild-URL',
                'Notizname',
                'tag',
                'Inhalt',
                'Aufgabe'
            ];
            let cursorOffset = insertText.length;
            for (const p of placeholders) {
                const idx = insertText.indexOf(p);
                if (idx !== -1) {
                    insertText = insertText.replace(p, '');
                    cursorOffset = idx;
                    break;
                }
            }
            const from = editor.getCursor('from');
            editor.replaceSelection(insertText);
            editor.setCursor({ line: from.line, ch: from.ch + cursorOffset });
        }
    }

    private parseHotkey(hotkey: string): Hotkey | null {
        if (!hotkey) return null;
        const parts = hotkey.split("+").map(p => p.trim()).filter(p => p.length > 0);
        if (parts.length === 0) return null;
        const key = parts.pop() as string;
        const modifiers = parts as Modifier[];
        return { modifiers, key };
    }

    registerCommand() {
        const parsed = this.parseHotkey(this.settings.hotkey);
        const fullId = `${this.manifest.id}:open-markdown-selector`;
        try {
            (this.app as any).commands.removeCommand(fullId);
        } catch (e) {
            // ignore if command does not exist
        }
        this.addCommand({
            id: "open-markdown-selector",
            name: "Markdown-Selector öffnen",
            editorCallback: (editor) => new MarkdownElementSuggestModal(this, editor).open(),
            hotkeys: parsed ? [parsed] : []
        });
    }

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new MarkdownSelectorSettingTab(this.app, this));
        this.registerEditorSuggest(new MarkdownElementSuggest(this));
        this.registerCommand();
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
                    this.plugin.registerCommand();
                }));
    }
}
