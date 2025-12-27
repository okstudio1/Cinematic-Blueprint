# Cinematic Blueprint MCP Server

## What is MCP?

**Model Context Protocol (MCP)** is an open standard that allows AI assistants to interact directly with external tools and data sources. The Cinematic Blueprint MCP server enables AI assistants like Claude, Windsurf Cascade, and others to read and modify your storyboards programmatically.

---

## Why Use the MCP Server?

### Without MCP
1. Export your storyboard as JSON
2. Ask AI to analyze or suggest changes
3. Manually apply changes back in the tool
4. Re-import the modified file

### With MCP
1. Ask AI: "Add a new beat called 'The Revelation' to Act II"
2. AI directly creates the beat in your storyboard
3. Changes appear immediately in Cinematic Blueprint

**The MCP server eliminates the export/import cycle** and lets you collaborate with AI in real-time.

---

## Capabilities

### Read Operations
| Resource | Description |
|----------|-------------|
| `storyboard://current` | Complete storyboard data (acts, beats, shots) |
| `storyboard://acts` | All acts and their structure |
| `storyboard://beats` | All story beat cards |
| `storyboard://shots` | All storyboard shots |

### Write Operations

#### Story Beats
- **add_beat** — Create a new story beat in any act
- **edit_beat** — Modify title, description, status, or subplot
- **delete_beat** — Remove a beat
- **move_beat** — Move a beat to a different act

#### Storyboard Shots
- **add_shot** — Add a new shot with camera direction, duration, etc.
- **edit_shot** — Modify shot details
- **delete_shot** — Remove a shot
- **reorder_shots** — Change shot sequence

#### Acts
- **add_act** — Create a new act

#### Import/Export
- **import_markdown** — Parse markdown into acts and beats (H1 = acts, H2 = beats)
- **export_storyboard** — Export to JSON or markdown format

---

## Installation

### Prerequisites
- Node.js 18+
- npm

### Build the Server

```powershell
cd story-cards-mcp
npm install
npm run build
```

---

## Configuration

### Windsurf / Cascade

Go to **Settings → MCP Servers** and add:

```json
{
  "mcpServers": {
    "cinematic-blueprint": {
      "command": "node",
      "args": ["C:/Users/YOUR_USERNAME/path/to/Cinematic-Blueprint/story-cards-mcp/dist/index.js"],
      "env": {
        "STORYBOARD_PATH": "C:/Users/YOUR_USERNAME/path/to/your-project/storyboard.json"
      }
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json` (usually in `%APPDATA%\Claude\`):

```json
{
  "mcpServers": {
    "cinematic-blueprint": {
      "command": "node",
      "args": ["C:/Users/YOUR_USERNAME/path/to/Cinematic-Blueprint/story-cards-mcp/dist/index.js"],
      "env": {
        "STORYBOARD_PATH": "C:/Users/YOUR_USERNAME/path/to/your-project/storyboard.json"
      }
    }
  }
}
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STORYBOARD_PATH` | `./storyboard.json` | Path to your storyboard file |

---

## Example Interactions

### Adding Story Beats

**You:** "Add a new beat called 'The Dark Night of the Soul' to Act II with status 'draft'"

**AI calls:** 
```json
add_beat({
  "title": "The Dark Night of the Soul",
  "act": "act-2",
  "status": "draft"
})
```

### Importing from Markdown

**You:** "Import this outline into my storyboard:
# Act I: Setup
## Opening Image
The world before the journey begins.
## Catalyst
Something happens that changes everything."

**AI calls:**
```json
import_markdown({
  "markdown": "# Act I: Setup\n## Opening Image\nThe world before the journey begins.\n## Catalyst\nSomething happens that changes everything."
})
```

### Editing Shots

**You:** "Change shot 3 to a close-up with 2 second duration"

**AI calls:**
```json
edit_shot({
  "id": "shot-3",
  "camera": "CU",
  "duration": "2s"
})
```

### Querying Your Storyboard

**You:** "What beats do I have in Act III?"

**AI reads:** `storyboard://beats` and filters by act

---

## Use Cases

### Story Development
- Brainstorm beats with AI assistance
- Restructure acts based on feedback
- Generate beat descriptions from outlines

### Pre-Production
- Plan shot sequences with AI suggestions
- Calculate total runtime from shot durations
- Generate shot lists for specific scenes

### Collaboration
- AI can read your current structure and suggest improvements
- Import scripts or treatments directly into beat format
- Export formatted documents for team review

---

## Security Considerations

- The MCP server only accesses the storyboard file you specify
- No network requests are made by the server
- All data stays local on your machine
- The server runs as a subprocess of your AI client

---

## Troubleshooting

### Server not connecting
1. Verify the path to `dist/index.js` is correct
2. Ensure Node.js is in your PATH
3. Check that `STORYBOARD_PATH` points to a valid JSON file

### Changes not appearing
1. Reload the storyboard in Cinematic Blueprint (Load → select file)
2. Check the storyboard.json file was actually modified

### "Tool not found" errors
1. Restart your AI client after adding the MCP configuration
2. Verify the server name matches in your config

---

## Contributing

The MCP server source code is in the `story-cards-mcp/` directory. Contributions welcome!

---

© OK Studio Inc. 2025
