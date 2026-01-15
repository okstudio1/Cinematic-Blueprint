# Scene Organization Guide for Cinematic Blueprint

This guide explains how to organize your scenes and story beats so they can be easily imported into [Cinematic Blueprint](https://cinematicblueprint.com).

---

## Quick Start

1. Create a `storyboard.json` file in your project root
2. Follow the format below
3. Open Cinematic Blueprint → Click **Load** → Select your file

---

## File Format

Cinematic Blueprint uses a single JSON file with three main sections:

```json
{
  "version": "1.0",
  "updated": "2025-01-01T00:00:00.000Z",
  "acts": [...],
  "cards": [...],
  "shots": [...]
}
```

---

## Acts

Define your story structure (acts, chapters, sequences):

```json
"acts": [
  { "id": "act-1", "name": "Act I: Setup", "order": 0 },
  { "id": "act-2", "name": "Act II: Confrontation", "order": 1 },
  { "id": "act-3", "name": "Act III: Resolution", "order": 2 }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (e.g., `act-1`, `setup`) |
| `name` | Yes | Display name |
| `order` | Yes | Sort order (0-indexed) |

---

## Story Beat Cards

Define your story beats, scenes, or plot points:

```json
"cards": [
  {
    "id": "beat-1",
    "title": "Opening Image",
    "description": "Establish the world and tone.",
    "act": "act-1",
    "status": "draft",
    "subplot": "A-plot"
  }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier |
| `title` | Yes | Beat/scene title |
| `description` | No | Detailed description |
| `act` | Yes | Reference to act `id` |
| `status` | No | `draft`, `review`, or `done` |
| `subplot` | No | Subplot/storyline name (e.g., `A-plot`, `Romance`, `B-story`) |

---

## Storyboard Shots

Define visual shots for your storyboard:

```json
"shots": [
  {
    "id": "shot-1",
    "shotNumber": "1",
    "description": "Wide establishing shot - city skyline at dawn",
    "camera": "Wide",
    "duration": "5s",
    "image": "images/shot-001.jpg"
  }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier |
| `shotNumber` | Yes | Display number (e.g., `1`, `1A`, `2B`) |
| `description` | No | What happens in the shot |
| `camera` | No | Camera direction (e.g., `Wide`, `CU`, `Medium`, `Dolly in`) |
| `duration` | No | Shot duration (e.g., `5s`, `2.5s`) |
| `image` | No | Relative path or URL to reference image |

---

## Complete Example

```json
{
  "version": "1.0",
  "updated": "2025-01-01T12:00:00.000Z",
  "acts": [
    { "id": "act-1", "name": "Act I", "order": 0 },
    { "id": "act-2", "name": "Act II", "order": 1 },
    { "id": "act-3", "name": "Act III", "order": 2 }
  ],
  "cards": [
    {
      "id": "scene-1",
      "title": "Opening",
      "description": "Introduce protagonist in their ordinary world.",
      "act": "act-1",
      "status": "draft",
      "subplot": "A-plot"
    },
    {
      "id": "scene-2",
      "title": "Call to Adventure",
      "description": "Something disrupts the status quo.",
      "act": "act-1",
      "status": "draft",
      "subplot": "A-plot"
    }
  ],
  "shots": [
    {
      "id": "shot-1",
      "shotNumber": "1",
      "description": "Establishing shot of location",
      "camera": "Wide",
      "duration": "4s"
    }
  ]
}
```

---

## Recommended Project Structure

```
your-project/
├── storyboard.json       # Main file (import this)
├── images/               # Reference images for storyboard
│   ├── shot-001.jpg
│   └── shot-002.png
└── exports/              # Versioned backups
    ├── storyboard-v1.json
    └── storyboard-v2.json
```

---

## Status Values

| Status | Color | Use for |
|--------|-------|---------|
| `draft` | Orange | Work in progress |
| `review` | Blue | Ready for review |
| `done` | Green | Completed |

---

## Subplot Examples

Use consistent subplot names across your project:

- `A-plot` — Main storyline
- `B-story` — Secondary storyline
- `Romance` — Love interest subplot
- `Villain` — Antagonist's arc
- `Comic Relief` — Humor beats

---

## Tips

1. **Use meaningful IDs** — `inciting-incident` is better than `card-47`
2. **Keep descriptions concise** — Full scripts go elsewhere
3. **Version your exports** — Save dated backups in `exports/`
4. **Reference images** — Use relative paths like `images/shot-001.jpg`
5. **Validate JSON** — Use a JSON validator before importing

---

## Importing

1. Open [Cinematic Blueprint](https://cinematicblueprint.com)
2. Click **Load**
3. Select your `storyboard.json` file
4. Your acts, cards, and shots will appear

---

## Exporting Changes

After editing in Cinematic Blueprint:

1. Click **Export**
2. Save the downloaded `storyboard.json`
3. Replace or version your project's file

---

---

## Screenplay PDF Export

Cinematic Blueprint includes a screenplay-to-PDF tool for converting markdown scene files to industry-standard PDF format.

### Location

```
Cinematic-Blueprint/
└── tools/
    └── screenplay-pdf/    # PDF export tool
```

### Usage

```bash
cd tools/screenplay-pdf
npm install

# Export a project's scenes to PDF
npx screenplay-pdf \
  -i "/path/to/your/project/Scenes" \
  -o "/path/to/your/project/screenplay.pdf" \
  --title "Your Title" \
  --author "Your Name"
```

### Integration with Scene Files

If your project uses markdown scene files (like OverPar-Film), you can export them directly:

```bash
# Example: Export OverPar scenes
npx screenplay-pdf \
  -i "C:\Users\Owen\dev\OverPar-Film\Scenes" \
  -o "C:\Users\Owen\dev\OverPar-Film\Final Draft\OverPar.pdf" \
  --title "Over Par" \
  --html
```

### Supported Format

Scene files should use this markdown structure:

```markdown
## INT. LOCATION - TIME

Action description.

## CHARACTER
(parenthetical)
Dialogue here.
```

See `tools/screenplay-pdf/README.md` for full documentation.

---

© OK Studio Inc. 2025
