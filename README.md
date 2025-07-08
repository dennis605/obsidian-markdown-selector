# Markdown Element Selector

*For the English version see [README.en.md](README.en.md).* 

Dieses Obsidian‑Plugin erweitert den Editor um ein Suchmenü für gängige Markdown-Elemente. 
Über eine Tastenkombination oder beim Tippen von `//` können verschiedene Formatierungen, Links oder 
Strukturelemente ausgewählt und direkt eingefügt werden.

## Installation

1. Repository klonen oder ZIP herunterladen
   ```bash
   git clone <repository-url>
   cd obsidian-markdown-selector
   ```
2. Abhängigkeiten installieren und Plugin bauen
   ```bash
   npm install
   npm run build
   ```
3. Den gesamten Ordner in das Verzeichnis `.obsidian/plugins/markdown-selector` 
   eurer Obsidian-Vault kopieren
4. In Obsidian unter "Einstellungen → Community-Plugins" das Plugin aktivieren

## Verwendung

- Mit `Ctrl/Cmd + M` öffnet sich das Auswahlfenster für Markdown-Elemente
- Alternativ erscheint es automatisch, wenn ihr im Editor `//` eingebt
- Eine Auswahl kann per Tastatur durchsucht und mit Enter übernommen werden
- Ist Text markiert, wird er an den passenden Stellen des Snippets eingefügt
- Die Tastenkombination lässt sich in Obsidian unter "Einstellungen → Hotkeys" anpassen

Unterstützt werden unter anderem Überschriften, Listen, Formatierungen, Links,
Bilder, Tabellen, Callouts sowie Fußnoten und Tags. Der Cursor springt nach dem
Einfügen an die nächste sinnvolle Position, sodass direkt weitergeschrieben
werden kann.

## Entwicklung

Für eigene Anpassungen steht der Quellcode in `main.ts`. Mit `npm run dev`
werden Änderungen laufend übersetzt. Die fertigen Dateien `main.js`,
`manifest.json` und `style.css` müssen anschließend im Plugin-Verzeichnis
überschrieben werden.

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe `package.json` für weitere
Informationen.
