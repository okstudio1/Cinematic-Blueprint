# MCP Server Design for Story Cards Tool

## The Big Picture: What Problem Does This Solve?

Right now, if you want an AI to help edit your storyboard, the workflow is:

1. You export `storyboard.json` from the browser
2. You ask the AI to read and edit the file
3. You reload the file in the browser

**With an MCP server**, the workflow becomes:

1. You just talk to the AI: *"Add a close-up shot after the opening scene"*
2. The AI directly updates your storyboard
3. The browser shows the change immediately

No exporting. No reloading. Just conversation → changes.

---

## What is MCP?

**Model Context Protocol (MCP)** is an open standard created by Anthropic that lets AI assistants plug into external tools and data. Think of it like a USB port for AI — a standardized way to connect.

### Analogy: Restaurant Kitchen

Imagine a restaurant:
- **You (the customer)** = The user talking to the AI
- **The waiter (AI agent)** = Cascade, Claude, etc.
- **The kitchen (MCP server)** = A small program running on your computer
- **The recipe book (resources)** = Your storyboard data
- **The cooking actions (tools)** = Add shot, edit beat, reorder, etc.

Without MCP, the waiter has to run outside, find your recipe book, bring it back, and read it to you. With MCP, the waiter can just ask the kitchen directly.

---

## How It Works in Practice

### Step 1: You Install the MCP Server
A small Node.js program runs in the background on your computer. It knows how to read and write your `storyboard.json` file.

### Step 2: Your IDE Connects to It
Windsurf/Cascade is configured to know about this MCP server. When you start a conversation, the AI can see what tools are available.

### Step 3: You Just Talk Naturally
```
You: "Add three shots for the chase scene - wide, medium, close-up"

AI: [Internally calls add_shot tool 3 times]
    "Done! I've added:
     - Shot 4: Wide shot of chase scene
     - Shot 5: Medium shot of chase scene  
     - Shot 6: Close-up of chase scene"
```

### Step 4: Browser Updates (Optional)
If you add the WebSocket sync, your browser shows the new shots immediately without refreshing.

---

## What You'd Need to Build

| Component | What It Is | Effort |
|-----------|------------|--------|
| **MCP Server** | ~200 lines of Node.js/TypeScript | 2-3 hours |
| **IDE Config** | A few lines in settings | 5 minutes |
| **Browser Sync** | Optional WebSocket listener | 1 hour |

The MCP server is just a small program that:
1. Reads your storyboard files
2. Exposes them as "resources" the AI can read
3. Provides "tools" the AI can call to make changes
4. Saves changes back to the files

---

## Architecture Overview

```
┌─────────────────┐     MCP Protocol      ┌─────────────────┐
│                 │ ◄──────────────────► │                 │
│   AI Agent      │    JSON-RPC over      │  MCP Server     │
│   (Cascade)     │    stdio/WebSocket    │  (Node.js)      │
│                 │                       │                 │
└─────────────────┘                       └────────┬────────┘
                                                   │
                                                   │ File I/O
                                                   ▼
                                          ┌─────────────────┐
                                          │  storyboard.json│
                                          │  story-beats.md │
                                          └─────────────────┘
                                                   │
                                                   │ WebSocket (optional)
                                                   ▼
                                          ┌─────────────────┐
                                          │ story-cards.html│
                                          │   (Browser)     │
                                          └─────────────────┘
```

---

## MCP Server Components

### 1. Resources (Read-Only Data)

Resources expose your storyboard data to AI agents:

```typescript
// Resource: storyboard://current
{
  uri: "storyboard://current",
  name: "Current Storyboard",
  mimeType: "application/json",
  description: "The current storyboard with all shots"
}

// Resource: storyboard://shots
{
  uri: "storyboard://shots",
  name: "All Shots",
  mimeType: "application/json",
  description: "List of all shots in the storyboard"
}

// Resource: storyboard://beats
{
  uri: "storyboard://beats",
  name: "Story Beats",
  mimeType: "application/json", 
  description: "All story beat cards organized by act"
}

// Resource: storyboard://acts
{
  uri: "storyboard://acts",
  name: "Act Structure",
  mimeType: "application/json",
  description: "The act structure of the story"
}
```

### 2. Tools (Actions)

Tools let AI agents modify the storyboard:

```typescript
// Tool: add_shot
{
  name: "add_shot",
  description: "Add a new shot to the storyboard",
  inputSchema: {
    type: "object",
    properties: {
      shotNumber: { type: "string", description: "Shot number (e.g., '1A', '2B')" },
      description: { type: "string", description: "What happens in the shot" },
      camera: { type: "string", description: "Camera angle/movement" },
      duration: { type: "number", description: "Duration in seconds" },
      insertAfter: { type: "string", description: "Shot ID to insert after (optional)" }
    },
    required: ["description"]
  }
}

// Tool: edit_shot
{
  name: "edit_shot",
  description: "Edit an existing shot",
  inputSchema: {
    type: "object",
    properties: {
      shotId: { type: "string", description: "ID of shot to edit" },
      shotNumber: { type: "string" },
      description: { type: "string" },
      camera: { type: "string" },
      duration: { type: "number" }
    },
    required: ["shotId"]
  }
}

// Tool: delete_shot
{
  name: "delete_shot",
  description: "Delete a shot from the storyboard",
  inputSchema: {
    type: "object",
    properties: {
      shotId: { type: "string", description: "ID of shot to delete" }
    },
    required: ["shotId"]
  }
}

// Tool: reorder_shots
{
  name: "reorder_shots",
  description: "Reorder shots in the storyboard",
  inputSchema: {
    type: "object",
    properties: {
      shotIds: { 
        type: "array", 
        items: { type: "string" },
        description: "Shot IDs in desired order" 
      }
    },
    required: ["shotIds"]
  }
}

// Tool: add_beat
{
  name: "add_beat",
  description: "Add a story beat card",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Beat title" },
      description: { type: "string", description: "Beat description" },
      act: { type: "string", description: "Act ID to add beat to" },
      status: { type: "string", enum: ["draft", "review", "done"] },
      subplot: { type: "string", description: "Subplot identifier" }
    },
    required: ["title", "act"]
  }
}

// Tool: edit_beat
{
  name: "edit_beat",
  description: "Edit an existing story beat",
  inputSchema: {
    type: "object",
    properties: {
      beatId: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      status: { type: "string" },
      subplot: { type: "string" }
    },
    required: ["beatId"]
  }
}

// Tool: move_beat
{
  name: "move_beat",
  description: "Move a beat to a different act",
  inputSchema: {
    type: "object",
    properties: {
      beatId: { type: "string" },
      targetAct: { type: "string" },
      position: { type: "number", description: "Position within act (0-indexed)" }
    },
    required: ["beatId", "targetAct"]
  }
}

// Tool: add_act
{
  name: "add_act",
  description: "Add a new act",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Act name (e.g., 'Act II: Confrontation')" },
      insertAfter: { type: "string", description: "Act ID to insert after" }
    },
    required: ["name"]
  }
}

// Tool: export_storyboard
{
  name: "export_storyboard",
  description: "Export storyboard to file",
  inputSchema: {
    type: "object",
    properties: {
      format: { type: "string", enum: ["json", "markdown"] },
      filename: { type: "string" }
    },
    required: ["format"]
  }
}
```

### 3. Prompts (Pre-built Templates)

Prompts provide common workflows:

```typescript
// Prompt: generate_shot_list
{
  name: "generate_shot_list",
  description: "Generate a shot list from story beats",
  arguments: [
    { name: "style", description: "Visual style (cinematic, documentary, etc.)" },
    { name: "pacing", description: "Pacing preference (fast, slow, mixed)" }
  ]
}

// Prompt: review_structure
{
  name: "review_structure", 
  description: "Review and suggest improvements to story structure",
  arguments: [
    { name: "focus", description: "Area to focus on (pacing, character arcs, etc.)" }
  ]
}
```

---

## Implementation

### File Structure

```
story-cards-mcp/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── resources.ts      # Resource handlers
│   ├── tools.ts          # Tool implementations
│   ├── prompts.ts        # Prompt templates
│   ├── storage.ts        # File I/O for storyboard data
│   └── types.ts          # TypeScript types
└── README.md
```

### Core Server Implementation

```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema 
} from "@modelcontextprotocol/sdk/types.js";
import { loadStoryboard, saveStoryboard } from "./storage.js";
import { handleTool } from "./tools.js";

const server = new Server(
  { name: "story-cards-mcp", version: "1.0.0" },
  { capabilities: { resources: {}, tools: {}, prompts: {} } }
);

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    { uri: "storyboard://current", name: "Current Storyboard", mimeType: "application/json" },
    { uri: "storyboard://shots", name: "All Shots", mimeType: "application/json" },
    { uri: "storyboard://beats", name: "Story Beats", mimeType: "application/json" },
    { uri: "storyboard://acts", name: "Act Structure", mimeType: "application/json" }
  ]
}));

// Read a resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const data = await loadStoryboard();
  const uri = request.params.uri;
  
  let content;
  switch (uri) {
    case "storyboard://current":
      content = data;
      break;
    case "storyboard://shots":
      content = data.shots;
      break;
    case "storyboard://beats":
      content = data.cards;
      break;
    case "storyboard://acts":
      content = data.acts;
      break;
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
  
  return {
    contents: [{
      uri,
      mimeType: "application/json",
      text: JSON.stringify(content, null, 2)
    }]
  };
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "add_shot", description: "Add a new shot", inputSchema: { /* ... */ } },
    { name: "edit_shot", description: "Edit a shot", inputSchema: { /* ... */ } },
    { name: "delete_shot", description: "Delete a shot", inputSchema: { /* ... */ } },
    { name: "add_beat", description: "Add a story beat", inputSchema: { /* ... */ } },
    { name: "edit_beat", description: "Edit a story beat", inputSchema: { /* ... */ } },
    // ... more tools
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await handleTool(name, args);
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Storage Layer

```typescript
// src/storage.ts
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const STORYBOARD_PATH = process.env.STORYBOARD_PATH || "./storyboard.json";
const BEATS_PATH = process.env.BEATS_PATH || "./story-beats.json";

export interface Storyboard {
  version: string;
  updated: string;
  acts: Act[];
  cards: Card[];
  shots: Shot[];
}

export async function loadStoryboard(): Promise<Storyboard> {
  try {
    const data = await readFile(STORYBOARD_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    // Return empty storyboard if file doesn't exist
    return { version: "1.0", updated: new Date().toISOString(), acts: [], cards: [], shots: [] };
  }
}

export async function saveStoryboard(data: Storyboard): Promise<void> {
  data.updated = new Date().toISOString();
  await writeFile(STORYBOARD_PATH, JSON.stringify(data, null, 2));
}
```

---

## IDE Configuration

### Windsurf/Cascade Configuration

Add to your MCP settings (typically in IDE settings or `mcp.json`):

```json
{
  "mcpServers": {
    "story-cards": {
      "command": "node",
      "args": ["path/to/story-cards-mcp/dist/index.js"],
      "env": {
        "STORYBOARD_PATH": "C:/Users/Owen/dev/Story-Cards-Tool/storyboard.json"
      }
    }
  }
}
```

### VS Code + Continue Configuration

```json
{
  "continue.mcpServers": [
    {
      "name": "story-cards",
      "command": "npx",
      "args": ["-y", "story-cards-mcp"],
      "env": {
        "STORYBOARD_PATH": "./storyboard.json"
      }
    }
  ]
}
```

---

## Usage Examples

Once configured, you can interact naturally:

**User:** "Add a new shot after shot 3 - a close-up of the protagonist's face showing determination"

**AI Agent (using MCP):**
1. Reads `storyboard://shots` to find shot 3
2. Calls `add_shot` tool with description and insertAfter
3. Returns confirmation with new shot details

**User:** "Move the 'Inciting Incident' beat to Act II"

**AI Agent:**
1. Reads `storyboard://beats` to find the beat
2. Calls `move_beat` tool with targetAct
3. Confirms the move

**User:** "Generate a shot list for the first act in a documentary style"

**AI Agent:**
1. Reads `storyboard://beats` filtered by Act I
2. Uses `generate_shot_list` prompt
3. Calls `add_shot` multiple times to create shots
4. Returns summary of created shots

---

## Optional: Browser Sync

For real-time sync between MCP edits and the browser UI, add WebSocket support:

```typescript
// In MCP server - notify browser of changes
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8765 });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});

function notifyBrowser(event: string, data: any) {
  const message = JSON.stringify({ event, data });
  clients.forEach(client => client.send(message));
}

// Call after any tool modifies data
await saveStoryboard(data);
notifyBrowser("storyboard_updated", data);
```

```javascript
// In story-cards.html - listen for MCP changes
const ws = new WebSocket("ws://localhost:8765");
ws.onmessage = (event) => {
  const { event: type, data } = JSON.parse(event.data);
  if (type === "storyboard_updated") {
    loadFromData(data);
    console.log("Storyboard updated via MCP");
  }
};
```

---

## Implementation Roadmap

### Phase 1: Basic MCP Server (2-3 hours)
- [ ] Set up Node.js project with MCP SDK
- [ ] Implement resource handlers (read storyboard data)
- [ ] Implement basic tools (add/edit/delete shots and beats)
- [ ] Test with IDE

### Phase 2: Full Tool Suite (2-3 hours)
- [ ] Add all CRUD operations for shots, beats, acts
- [ ] Add reordering tools
- [ ] Add export tool
- [ ] Add validation and error handling

### Phase 3: Browser Sync (1-2 hours)
- [ ] Add WebSocket server
- [ ] Update story-cards.html to connect
- [ ] Real-time sync on MCP changes

### Phase 4: Prompts & Intelligence (2-3 hours)
- [ ] Add prompt templates
- [ ] Generate shot lists from beats
- [ ] Structure review suggestions

---

## Benefits of MCP Approach

| Benefit | Description |
|---------|-------------|
| **Native AI Integration** | AI agents can directly read/write storyboards |
| **Standardized Protocol** | Works with any MCP-compatible AI tool |
| **Real-time Capable** | Optional WebSocket sync to browser |
| **Type-Safe** | Full TypeScript support |
| **Extensible** | Easy to add new tools and resources |
| **Local-First** | Runs on your machine, no cloud required |

---

## Comparison to Other Options

| Approach | Setup Effort | Real-time | AI Native | Offline |
|----------|--------------|-----------|-----------|---------|
| File-based | None | No | Partial | Yes |
| Watch Mode | Low | Yes | Partial | Yes |
| **MCP Server** | **Medium** | **Yes** | **Yes** | **Yes** |
| GitHub Integration | Medium | No | Yes | No |
| Firebase API | High | Yes | Partial | No |

**MCP is the most AI-native solution** while remaining fully local and offline-capable.

---

*Document created December 12, 2025*
