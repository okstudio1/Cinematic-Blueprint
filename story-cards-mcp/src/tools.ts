import { loadStoryboard, saveStoryboard, generateId } from "./storage.js";
import type { Shot, Card, Act } from "./types.js";

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
        shotNumber: (args.shotNumber as string) || String(data.shots.length + 1),
        description: (args.description as string) || "",
        camera: (args.camera as string) || "",
        duration: (args.duration as string) || "",
        image: args.image as string | undefined,
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

      if (args.shotNumber !== undefined) shot.shotNumber = args.shotNumber as string;
      if (args.description !== undefined) shot.description = args.description as string;
      if (args.camera !== undefined) shot.camera = args.camera as string;
      if (args.duration !== undefined) shot.duration = args.duration as string;

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
      const shotIds = args.shotIds as string[];
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
        title: (args.title as string) || "Untitled Beat",
        description: (args.description as string) || "",
        act: (args.act as string) || data.acts[0]?.id || "act-1",
        status: (args.status as Card["status"]) || "draft",
        subplot: args.subplot as string | undefined,
      };

      data.cards.push(card);
      await saveStoryboard(data);
      return { success: true, card };
    }

    case "edit_beat": {
      const card = data.cards.find((c) => c.id === args.beatId);
      if (!card) return { success: false, error: "Beat not found" };

      if (args.title !== undefined) card.title = args.title as string;
      if (args.description !== undefined) card.description = args.description as string;
      if (args.status !== undefined) card.status = args.status as Card["status"];
      if (args.subplot !== undefined) card.subplot = args.subplot as string;

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

      card.act = args.targetAct as string;
      await saveStoryboard(data);
      return { success: true, card };
    }

    // Act tools
    case "add_act": {
      const maxOrder = Math.max(...data.acts.map((a) => a.order), -1);
      const act: Act = {
        id: generateId(),
        name: (args.name as string) || "New Act",
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
      const markdown = args.markdown as string;
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
      const format = args.format as string;
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
