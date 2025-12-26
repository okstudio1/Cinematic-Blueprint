import { loadStoryboard, saveStoryboard, generateId } from "./storage.js";
export async function handleTool(name, args) {
    const data = await loadStoryboard();
    switch (name) {
        // Shot tools
        case "add_shot": {
            const shot = {
                id: generateId(),
                shotNumber: args.shotNumber || String(data.shots.length + 1),
                description: args.description || "",
                camera: args.camera || "",
                duration: args.duration || "",
                image: args.image,
            };
            if (args.insertAfter) {
                const idx = data.shots.findIndex((s) => s.id === args.insertAfter);
                if (idx >= 0) {
                    data.shots.splice(idx + 1, 0, shot);
                }
                else {
                    data.shots.push(shot);
                }
            }
            else {
                data.shots.push(shot);
            }
            await saveStoryboard(data);
            return { success: true, shot };
        }
        case "edit_shot": {
            const shot = data.shots.find((s) => s.id === args.shotId);
            if (!shot)
                return { success: false, error: "Shot not found" };
            if (args.shotNumber !== undefined)
                shot.shotNumber = args.shotNumber;
            if (args.description !== undefined)
                shot.description = args.description;
            if (args.camera !== undefined)
                shot.camera = args.camera;
            if (args.duration !== undefined)
                shot.duration = args.duration;
            await saveStoryboard(data);
            return { success: true, shot };
        }
        case "delete_shot": {
            const idx = data.shots.findIndex((s) => s.id === args.shotId);
            if (idx < 0)
                return { success: false, error: "Shot not found" };
            const deleted = data.shots.splice(idx, 1)[0];
            await saveStoryboard(data);
            return { success: true, deleted };
        }
        case "reorder_shots": {
            const shotIds = args.shotIds;
            const reordered = [];
            for (const id of shotIds) {
                const shot = data.shots.find((s) => s.id === id);
                if (shot)
                    reordered.push(shot);
            }
            data.shots = reordered;
            await saveStoryboard(data);
            return { success: true, count: reordered.length };
        }
        // Beat/Card tools
        case "add_beat": {
            const card = {
                id: generateId(),
                title: args.title || "Untitled Beat",
                description: args.description || "",
                act: args.act || data.acts[0]?.id || "act-1",
                status: args.status || "draft",
                subplot: args.subplot,
            };
            data.cards.push(card);
            await saveStoryboard(data);
            return { success: true, card };
        }
        case "edit_beat": {
            const card = data.cards.find((c) => c.id === args.beatId);
            if (!card)
                return { success: false, error: "Beat not found" };
            if (args.title !== undefined)
                card.title = args.title;
            if (args.description !== undefined)
                card.description = args.description;
            if (args.status !== undefined)
                card.status = args.status;
            if (args.subplot !== undefined)
                card.subplot = args.subplot;
            await saveStoryboard(data);
            return { success: true, card };
        }
        case "delete_beat": {
            const idx = data.cards.findIndex((c) => c.id === args.beatId);
            if (idx < 0)
                return { success: false, error: "Beat not found" };
            const deleted = data.cards.splice(idx, 1)[0];
            await saveStoryboard(data);
            return { success: true, deleted };
        }
        case "move_beat": {
            const card = data.cards.find((c) => c.id === args.beatId);
            if (!card)
                return { success: false, error: "Beat not found" };
            card.act = args.targetAct;
            await saveStoryboard(data);
            return { success: true, card };
        }
        // Act tools
        case "add_act": {
            const maxOrder = Math.max(...data.acts.map((a) => a.order), -1);
            const act = {
                id: generateId(),
                name: args.name || "New Act",
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
                }
                else {
                    data.acts.push(act);
                }
            }
            else {
                data.acts.push(act);
            }
            await saveStoryboard(data);
            return { success: true, act };
        }
        // Import markdown
        case "import_markdown": {
            const markdown = args.markdown;
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
            const format = args.format;
            if (format === "json") {
                return { success: true, data };
            }
            else if (format === "markdown") {
                const md = storyboardToMarkdown(data);
                return { success: true, markdown: md };
            }
            return { success: false, error: "Unknown format" };
        }
        default:
            return { success: false, error: `Unknown tool: ${name}` };
    }
}
function parseMarkdownToBeats(markdown) {
    const acts = [];
    const cards = [];
    let currentAct = null;
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
function storyboardToMarkdown(data) {
    let md = "# Storyboard Export\n\n";
    for (const act of data.acts.sort((a, b) => a.order - b.order)) {
        md += `# ${act.name}\n\n`;
        const actCards = data.cards.filter((c) => c.act === act.id);
        for (const card of actCards) {
            md += `## ${card.title}\n`;
            if (card.description)
                md += `${card.description}\n`;
            md += `- Status: ${card.status}\n`;
            if (card.subplot)
                md += `- Subplot: ${card.subplot}\n`;
            md += "\n";
        }
    }
    return md;
}
