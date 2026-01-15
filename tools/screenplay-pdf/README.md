# Screenplay PDF

Convert markdown screenplay files to professionally formatted PDF documents.

## Features

- **Markdown to PDF** — Write screenplays in markdown, export to industry-standard PDF
- **Fountain support** — Compatible with Fountain screenplay format
- **Batch conversion** — Convert entire directories of scene files
- **Proper formatting** — Courier font, correct margins, page numbers
- **Title page** — Automatic title page generation

## Installation

```bash
cd tools/screenplay-pdf
npm install
```

## Usage

### Command Line

```bash
# Convert a directory of scene files
npx screenplay-pdf -i ./Scenes -o screenplay.pdf --title "My Movie" --author "Writer Name"

# Convert with HTML preview
npx screenplay-pdf -i ./Scenes -o screenplay.pdf --title "Over Par" --html

# Convert single file
npx screenplay-pdf -i ./script.md -o script.pdf
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --input <path>` | Input directory or file | (required) |
| `-o, --output <path>` | Output PDF path | (required) |
| `-t, --title <title>` | Screenplay title | "Untitled Screenplay" |
| `-a, --author <author>` | Author name | "" |
| `-d, --draft-date <date>` | Draft date | Current date |
| `-c, --contact <contact>` | Contact info | "" |
| `-p, --pattern <glob>` | File pattern | "*.md" |
| `--html` | Also output HTML preview | false |
| `-v, --verbose` | Verbose output | false |

### Programmatic API

```javascript
const { ScreenplayPDF } = require('./src/index');

const converter = new ScreenplayPDF({
  title: 'Over Par',
  author: 'Your Name',
  draftDate: '2025-01-02'
});

// Convert directory
await converter.convertDirectory('./Scenes', './output.pdf');

// Convert single file
await converter.convertFile('./script.md', './output.pdf');

// Get HTML for preview
await converter.generateHTML('./Scenes', './preview.html');
```

## Input Format

The tool accepts markdown files formatted for screenwriting:

```markdown
## INT. COFFEE SHOP - DAY

James wheels in. The BARISTA looks up.

## BARISTA
The usual?

## JAMES
(tired)
Yeah. Extra shot.

He pays and waits.

FADE OUT.
```

### Supported Elements

| Markdown | Screenplay Element |
|----------|-------------------|
| `## INT. LOCATION - TIME` | Scene Heading |
| `## CHARACTER` | Character Cue |
| `(parenthetical)` | Parenthetical |
| Regular text after character | Dialogue |
| Regular text elsewhere | Action |
| `FADE OUT.`, `CUT TO:` | Transition |
| `---` (in frontmatter) | YAML metadata |

## Integration with OverPar

This tool is designed to work with the OverPar-Film project structure:

```bash
# From Cinematic-Blueprint directory
npx screenplay-pdf \
  -i "C:\Users\Owen\dev\OverPar-Film\Scenes" \
  -o "C:\Users\Owen\dev\OverPar-Film\Final Draft\OverPar.pdf" \
  --title "Over Par" \
  --author "OK Studio" \
  --html
```

## Integration with Cinematic Blueprint

The screenplay-pdf tool can be called from Cinematic Blueprint to export scenes as PDF. See the integration guide for details.

## Requirements

- Node.js 18+
- Puppeteer (included) — uses headless Chrome for PDF generation

## Output Format

The generated PDF follows industry screenplay standards:

- **Paper**: US Letter (8.5" × 11")
- **Font**: Courier 12pt
- **Margins**: 1" top/bottom/right, 1.5" left
- **Page numbers**: Top right corner
- **Title page**: Centered title, author, date

## License

MIT — OK Studio Inc. 2025
