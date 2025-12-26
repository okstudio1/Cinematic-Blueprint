import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { loadStoryboard, getStoryboardPath } from "./storage.js";
import { handleTool } from "./tools.js";

const server = new Server(
  { name: "story-cards-mcp", version: "1.0.0" },
  { capabilities: { resources: {}, tools: {} } }
);

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "storyboard://current",
      name: "Current Storyboard",
      mimeType: "application/json",
      description: "The complete storyboard with acts, beats, and shots",
    },
    {
      uri: "storyboard://shots",
      name: "All Shots",
      mimeType: "application/json",
      description: "List of all shots in the storyboard",
    },
    {
      uri: "storyboard://beats",
      name: "Story Beats",
      mimeType: "application/json",
      description: "All story beat cards organized by act",
    },
    {
      uri: "storyboard://acts",
      name: "Act Structure",
      mimeType: "application/json",
      description: "The act structure of the story",
    },
  ],
}));

// Read a resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const data = await loadStoryboard();
  const uri = request.params.uri;

  let content: unknown;
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
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(content, null, 2),
      },
    ],
  };
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "add_shot",
      description: "Add a new shot to the storyboard",
      inputSchema: {
        type: "object" as const,
        properties: {
          shotNumber: { type: "string", description: "Shot number (e.g., '1', '1A', '2B')" },
          description: { type: "string", description: "What happens in the shot" },
          camera: { type: "string", description: "Camera angle/movement (e.g., 'Wide', 'CU', 'Dolly in')" },
          duration: { type: "string", description: "Duration (e.g., '5s')" },
          insertAfter: { type: "string", description: "Shot ID to insert after (optional)" },
        },
        required: ["description"],
      },
    },
    {
      name: "edit_shot",
      description: "Edit an existing shot",
      inputSchema: {
        type: "object" as const,
        properties: {
          shotId: { type: "string", description: "ID of shot to edit" },
          shotNumber: { type: "string", description: "New shot number" },
          description: { type: "string", description: "New description" },
          camera: { type: "string", description: "New camera info" },
          duration: { type: "string", description: "New duration" },
        },
        required: ["shotId"],
      },
    },
    {
      name: "delete_shot",
      description: "Delete a shot from the storyboard",
      inputSchema: {
        type: "object" as const,
        properties: {
          shotId: { type: "string", description: "ID of shot to delete" },
        },
        required: ["shotId"],
      },
    },
    {
      name: "reorder_shots",
      description: "Reorder shots in the storyboard",
      inputSchema: {
        type: "object" as const,
        properties: {
          shotIds: {
            type: "array",
            items: { type: "string" },
            description: "Shot IDs in desired order",
          },
        },
        required: ["shotIds"],
      },
    },
    {
      name: "add_beat",
      description: "Add a story beat card",
      inputSchema: {
        type: "object" as const,
        properties: {
          title: { type: "string", description: "Beat title" },
          description: { type: "string", description: "Beat description" },
          act: { type: "string", description: "Act ID to add beat to" },
          status: { type: "string", enum: ["draft", "review", "done"], description: "Beat status" },
          subplot: { type: "string", description: "Subplot identifier" },
        },
        required: ["title"],
      },
    },
    {
      name: "edit_beat",
      description: "Edit an existing story beat",
      inputSchema: {
        type: "object" as const,
        properties: {
          beatId: { type: "string", description: "ID of beat to edit" },
          title: { type: "string", description: "New title" },
          description: { type: "string", description: "New description" },
          status: { type: "string", enum: ["draft", "review", "done"] },
          subplot: { type: "string", description: "New subplot" },
        },
        required: ["beatId"],
      },
    },
    {
      name: "delete_beat",
      description: "Delete a story beat",
      inputSchema: {
        type: "object" as const,
        properties: {
          beatId: { type: "string", description: "ID of beat to delete" },
        },
        required: ["beatId"],
      },
    },
    {
      name: "move_beat",
      description: "Move a beat to a different act",
      inputSchema: {
        type: "object" as const,
        properties: {
          beatId: { type: "string", description: "ID of beat to move" },
          targetAct: { type: "string", description: "Target act ID" },
        },
        required: ["beatId", "targetAct"],
      },
    },
    {
      name: "add_act",
      description: "Add a new act",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Act name (e.g., 'Act II: Confrontation')" },
          insertAfter: { type: "string", description: "Act ID to insert after" },
        },
        required: ["name"],
      },
    },
    {
      name: "import_markdown",
      description: "Import story structure from markdown. H1 headers become acts, H2 headers become beats.",
      inputSchema: {
        type: "object" as const,
        properties: {
          markdown: { type: "string", description: "Markdown text to parse and import" },
        },
        required: ["markdown"],
      },
    },
    {
      name: "export_storyboard",
      description: "Export storyboard data",
      inputSchema: {
        type: "object" as const,
        properties: {
          format: { type: "string", enum: ["json", "markdown"], description: "Export format" },
        },
        required: ["format"],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await handleTool(name, args as Record<string, unknown>);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Story Cards MCP server running. Path: ${getStoryboardPath()}`);
}

main().catch(console.error);
