# Story Cards MCP Server

MCP (Model Context Protocol) server for the Story Cards Tool. Enables AI assistants like Cascade, Claude, and others to directly read and modify storyboards.

## Installation

```powershell
cd story-cards-mcp
npm install
npm run build
```

## Usage

### Configure in Windsurf/Cascade

Add to your MCP settings (Settings → MCP Servers):

```json
{
  "mcpServers": {
    "story-cards": {
      "command": "node",
      "args": ["C:/Users/Owen/dev/Story-Cards-Tool/story-cards-mcp/dist/index.js"],
      "env": {
        "STORYBOARD_PATH": "C:/Users/Owen/dev/Story-Cards-Tool/storyboard.json"
      }
    }
  }
}
```

### Configure in Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "story-cards": {
      "command": "node",
      "args": ["C:/Users/Owen/dev/Story-Cards-Tool/story-cards-mcp/dist/index.js"],
      "env": {
        "STORYBOARD_PATH": "C:/Users/Owen/dev/Story-Cards-Tool/storyboard.json"
      }
    }
  }
}
```

## Available Resources

| Resource | Description |
|----------|-------------|
| `storyboard://current` | Complete storyboard data |
| `storyboard://shots` | All shots |
| `storyboard://beats` | All story beats |
| `storyboard://acts` | Act structure |

## Available Tools

### Shot Tools
- **add_shot** — Add a new shot
- **edit_shot** — Edit an existing shot
- **delete_shot** — Delete a shot
- **reorder_shots** — Reorder shots

### Beat Tools
- **add_beat** — Add a story beat
- **edit_beat** — Edit a beat
- **delete_beat** — Delete a beat
- **move_beat** — Move beat to different act

### Act Tools
- **add_act** — Add a new act

### Import/Export
- **import_markdown** — Parse markdown and create beats (H1 = acts, H2 = beats)
- **export_storyboard** — Export to JSON or markdown

## Example Interactions

**User:** "Add a new beat called 'The Revelation' to Act II"

**AI calls:** `add_beat({ title: "The Revelation", act: "act-2" })`

**User:** "Import this story outline: # Act I\n## Opening Scene\nThe hero wakes up."

**AI calls:** `import_markdown({ markdown: "# Act I\n## Opening Scene\nThe hero wakes up." })`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STORYBOARD_PATH` | `./storyboard.json` | Path to storyboard file |
