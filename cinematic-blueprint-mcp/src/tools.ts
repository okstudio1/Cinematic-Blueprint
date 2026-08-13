import { loadStoryboard, saveStoryboard, generateId } from "./storage.js";
import type { Shot, Card, Act } from "./types.js";

// Tool arguments come from a model, so the declared inputSchema is a hint
// rather than a guarantee. Coerce every field to a bounded string instead of
// casting, so non-string values cannot reach storyboard.json and from there
// the browser app.
const MAX_FIELD = 5000;

function str(value: unknown, max = MAX_FIELD): string {
  if (value == null) return "";
  if (typeof value === "object") return "";
  return String(value).slice(0, max);
}

const STATUSES: ReadonlyArray<Card["status"]> = ["draft", "review", "done"];

function toStatus(value: unknown): Card["status"] {
  const s = str(value, 20) as Card["status"];
  return STATUSES.includes(s) ? s : "draft";
}

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const data = await loadStoryboard();

  switch (name) {
    // Shot tools
    case "add_shot": {
      const shot: Shot = {
        id: generateId(),
        shotNumber: str(args.shotNumber, 50) || String(data.shots.length + 1),
        description: str(args.description),
        camera: str(args.camera, 200),
        duration: str(args.duration, 50),
        image: args.image === undefined ? undefined : str(args.image, 1000),
      };

      if (args.insertAfter) {
        const idx = data.shots.findIndex((s) => s.id === args.insertAfter);
        if (idx >= 0) {
          data.shots.splice(idx + 1, 0, shot);
        } else {
          data.shots.push(shot);
        }
      } else {
        data.shots.push(shot);
      }

      await saveStoryboard(data);
      return { success: true, shot };
    }

    case "edit_shot": {
      const shot = data.shots.find((s) => s.id === args.shotId);
      if (!shot) return { success: false, error: "Shot not found" };

      if (args.shotNumber !== undefined) shot.shotNumber = str(args.shotNumber, 50);
      if (args.description !== undefined) shot.description = str(args.description);
      if (args.camera !== undefined) shot.camera = str(args.camera, 200);
      if (args.duration !== undefined) shot.duration = str(args.duration, 50);

      await saveStoryboard(data);
      return { success: true, shot };
    }

    case "delete_shot": {
      const idx = data.shots.findIndex((s) => s.id === args.shotId);
      if (idx < 0) return { success: false, error: "Shot not found" };

      const deleted = data.shots.splice(idx, 1)[0];
      await saveStoryboard(data);
      return { success: true, deleted };
    }

    case "reorder_shots": {
      const shotIds = Array.isArray(args.shotIds) ? args.shotIds.map((id) => str(id, 200)) : [];
      const reordered: Shot[] = [];
      for (const id of shotIds) {
        const shot = data.shots.find((s) => s.id === id);
        if (shot) reordered.push(shot);
      }
      data.shots = reordered;
      await saveStoryboard(data);
      return { success: true, count: reordered.length };
    }

    // Beat/Card tools
    case "add_beat": {
      const card: Card = {
        id: generateId(),
        title: str(args.title, 500) || "Untitled Beat",
        description: str(args.description),
        act: str(args.act, 200) || data.acts[0]?.id || "act-1",
        status: toStatus(args.status),
        subplot: args.subplot === undefined ? undefined : str(args.subplot, 100),
      };

      data.cards.push(card);
      await saveStoryboard(data);
      return { success: true, card };
    }

    case "edit_beat": {
      const card = data.cards.find((c) => c.id === args.beatId);
      if (!card) return { success: false, error: "Beat not found" };

      if (args.title !== undefined) card.title = str(args.title, 500);
      if (args.description !== undefined) card.description = str(args.description);
      if (args.status !== undefined) card.status = toStatus(args.status);
      if (args.subplot !== undefined) card.subplot = str(args.subplot, 100);

      await saveStoryboard(data);
      return { success: true, card };
    }

    case "delete_beat": {
      const idx = data.cards.findIndex((c) => c.id === args.beatId);
      if (idx < 0) return { success: false, error: "Beat not found" };

      const deleted = data.cards.splice(idx, 1)[0];
      await saveStoryboard(data);
      return { success: true, deleted };
    }

    case "move_beat": {
      const card = data.cards.find((c) => c.id === args.beatId);
      if (!card) return { success: false, error: "Beat not found" };

      card.act = str(args.targetAct, 200);
      await saveStoryboard(data);
      return { success: true, card };
    }

    // Act tools
    case "add_act": {
      const maxOrder = Math.max(...data.acts.map((a) => a.order), -1);
      const act: Act = {
        id: generateId(),
        name: str(args.name, 200) || "New Act",
        order: maxOrder + 1,
      };

      if (args.insertAfter) {
        const afterAct = data.acts.find((a) => a.id === args.insertAfter);
        if (afterAct) {
          act.order = afterAct.order + 0.5;
          // Renormalize order
          data.acts.push(act);
          data.acts.sort((a, b) => a.order - b.order);
          data.acts.forEach((a, i) => (a.order = i));
        } else {
          data.acts.push(act);
        }
      } else {
        data.acts.push(act);
      }

      await saveStoryboard(data);
      return { success: true, act };
    }

    // Import markdown
    case "import_markdown": {
      const markdown = str(args.markdown, 500000);
      const result = parseMarkdownToBeats(markdown);

      // Add parsed acts
      for (const act of result.acts) {
        if (!data.acts.find((a) => a.name === act.name)) {
          data.acts.push(act);
        }
      }

      // Add parsed cards
      data.cards.push(...result.cards);

      await saveStoryboard(data);
      return {
        success: true,
        actsAdded: result.acts.length,
        beatsAdded: result.cards.length,
      };
    }

    // Export
    case "export_storyboard": {
      const format = str(args.format, 20);
      if (format === "json") {
        return { success: true, data };
      } else if (format === "markdown") {
        const md = storyboardToMarkdown(data);
        return { success: true, markdown: md };
      }
      return { success: false, error: "Unknown format" };
    }

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

function parseMarkdownToBeats(markdown: string): { acts: Act[]; cards: Card[] } {
  const acts: Act[] = [];
  const cards: Card[] = [];
  let currentAct: Act | null = null;
  let order = 0;

  const lines = markdown.split("\n");

  for (const line of lines) {
    // H1 = Act
    if (line.startsWith("# ")) {
      const name = line.slice(2).trim();
      currentAct = { id: generateId(), name, order: order++ };
      acts.push(currentAct);
    }
    // H2 = Beat
    else if (line.startsWith("## ") && currentAct) {
      const title = line.slice(3).trim();
      cards.push({
        id: generateId(),
        title,
        description: "",
        act: currentAct.id,
        status: "draft",
      });
    }
    // Description line (non-empty, not a header, not a list item)
    else if (cards.length > 0 && line.trim() && !line.startsWith("#") && !line.startsWith("-")) {
      cards[cards.length - 1].description += line.trim() + " ";
    }
    // Status metadata
    else if (line.toLowerCase().includes("- status:") && cards.length > 0) {
      const status = line.split(":")[1]?.trim().toLowerCase();
      if (status === "draft" || status === "review" || status === "done") {
        cards[cards.length - 1].status = status;
      }
    }
    // Subplot metadata
    else if (line.toLowerCase().includes("- subplot:") && cards.length > 0) {
      cards[cards.length - 1].subplot = line.split(":")[1]?.trim();
    }
  }

  // Trim descriptions
  cards.forEach((c) => (c.description = c.description.trim()));

  return { acts, cards };
}

function storyboardToMarkdown(data: { acts: Act[]; cards: Card[] }): string {
  let md = "# Storyboard Export\n\n";

  for (const act of data.acts.sort((a, b) => a.order - b.order)) {
    md += `# ${act.name}\n\n`;
    const actCards = data.cards.filter((c) => c.act === act.id);
    for (const card of actCards) {
      md += `## ${card.title}\n`;
      if (card.description) md += `${card.description}\n`;
      md += `- Status: ${card.status}\n`;
      if (card.subplot) md += `- Subplot: ${card.subplot}\n`;
      md += "\n";
    }
  }

  return md;
}
