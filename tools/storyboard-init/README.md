# Storyboard Init

**A portable utility to scaffold Cinematic Blueprint storyboard projects.**

Copy this entire folder to any repo to create video project storyboards.

## Quick Start

```bash
# From any repo where you've copied this tool
cd tools/storyboard-init
node bin/cli.js init my-documentary

# Or with options
node bin/cli.js init my-film --output ../projects --template documentary
```

## Installation

**No dependencies required.** Just copy the `storyboard-init` folder to your project:

```bash
cp -r /path/to/Cinematic-Blueprint/tools/storyboard-init ./tools/
```

## Commands

### `init <project-name>`

Creates a new storyboard project folder with:
- `cinematic-blueprint.html` — The visual storyboard tool
- `storyboard.json` — Project data file
- `images/` — Folder for reference images
- `exports/` — Folder for exported versions
- `README.md` — Project documentation

```bash
node bin/cli.js init my-documentary
node bin/cli.js init my-film --output ./projects
node bin/cli.js init interview-series --template documentary --title "Interview Series"
```

### `build`

Just copies the HTML tool to current directory (no project structure):

```bash
node bin/cli.js build
node bin/cli.js build --output /path/to/destination
```

## Templates

| Template | Use Case |
|----------|----------|
| `basic` | Three-act narrative structure (default) |
| `documentary` | Documentary with problem/solution arc |

```bash
node bin/cli.js init my-project --template documentary
```

---

## LLM Integration Guide

This section is for AI assistants working with Cinematic Blueprint storyboards.

### Overview

Cinematic Blueprint is a visual story planning tool. The core data is stored in `storyboard.json` which you can read and modify directly. The HTML file is a viewer/editor that humans use interactively.

### File Structure

```
project-folder/
├── cinematic-blueprint.html   # Visual tool (don't modify)
├── storyboard.json            # ← Edit this file
├── images/                    # Reference images
└── exports/                   # Version history
```

### Schema: storyboard.json

```json
{
  "version": "1.0",
  "updated": "2026-01-25T20:00:00.000Z",
  "projectName": "My Documentary",
  "description": "Optional project description",
  
  "acts": [
    { "id": "act-1", "name": "Act I: Setup", "order": 0 },
    { "id": "act-2", "name": "Act II: Confrontation", "order": 1 }
  ],
  
  "cards": [
    {
      "id": "beat-1",
      "title": "Opening Image",
      "description": "What happens in this beat",
      "act": "act-1",
      "status": "draft",
      "subplot": "A-plot"
    }
  ],
  
  "shots": [
    {
      "id": "shot-1",
      "shotNumber": "1",
      "description": "Wide establishing shot of location",
      "camera": "Wide",
      "duration": "10s"
    }
  ]
}
```

### Schema Details

#### Acts
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., "act-1") |
| `name` | string | Display name (e.g., "Act I: Setup") |
| `order` | number | Sort order (0, 1, 2...) |

#### Cards (Story Beats)
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., "beat-1") |
| `title` | string | Beat title |
| `description` | string | What happens in this beat |
| `act` | string | Reference to act.id |
| `status` | string | "draft", "in-progress", "complete" |
| `subplot` | string | "A-plot", "B-plot", or custom |

#### Shots
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., "shot-1") |
| `shotNumber` | string | Display number ("1", "1A", "2B") |
| `description` | string | What happens in the shot |
| `camera` | string | Camera setup ("Wide", "Medium", "CU", "Dolly", etc.) |
| `duration` | string | Estimated duration ("5s", "10-15s") |
| `image` | string | Optional: path to reference image |
| `scene` | string | Optional: scene name for grouping |
| `day` | string | Optional: shoot day for scheduling |

### Common Operations

#### Add a new shot
```json
{
  "id": "shot-new",
  "shotNumber": "4",
  "description": "Close-up of subject's hands",
  "camera": "CU",
  "duration": "5s"
}
```

#### Add a new story beat
```json
{
  "id": "beat-new",
  "title": "New Beat Title",
  "description": "What happens here",
  "act": "act-1",
  "status": "draft",
  "subplot": "A-plot"
}
```

#### Add a new act
```json
{ "id": "act-new", "name": "New Section", "order": 3 }
```

### Best Practices for LLMs

1. **Always read the existing storyboard.json first** before making changes
2. **Use unique IDs** — prefix with type (shot-, beat-, act-)
3. **Preserve existing data** — don't remove entries unless asked
4. **Update the `updated` timestamp** when modifying
5. **Keep descriptions concise** but include key details
6. **Use standard camera terminology**: Wide, Medium, CU (close-up), ECU, OTS (over-the-shoulder), POV, Dolly, Pan, Tilt, Tracking

### Converting from Shot Lists

When converting a markdown shot list to storyboard.json:

1. Each scene becomes shots with shared `scene` field
2. Shot numbers from the document become `shotNumber`
3. Framing descriptions become `camera`
4. Duration estimates become `duration`
5. Purpose/notes become `description`

Example conversion:
```markdown
**Shot 1.1 - Wide: Bedroom establishing**
- Framing: Wide shot of bedroom, natural light
- Duration: 10-15 seconds
- Purpose: Establish space, accessibility features
```

Becomes:
```json
{
  "id": "shot-1-1",
  "shotNumber": "1.1",
  "description": "Wide: Bedroom establishing - natural light, accessibility features, morning atmosphere",
  "camera": "Wide",
  "duration": "10-15s",
  "scene": "Bedroom"
}
```

### Workflow for Creating a Storyboard

1. **Scaffold the project**: `node bin/cli.js init project-name --template documentary`
2. **Read source materials**: Outlines, shot lists, scripts
3. **Define acts**: Major sections or filming days
4. **Create story beats**: Key narrative moments in each act
5. **Add shots**: Individual camera setups with details
6. **Review**: Ensure all shots reference valid acts

---

## Updating the HTML Tool

To update the HTML template with a newer version:

```bash
cp /path/to/cinematic-blueprint.html ./templates/
```

Existing projects can be updated by copying the new HTML file into their folder. The storyboard.json data is preserved.

---

## License

MIT — OK Studio Inc.
