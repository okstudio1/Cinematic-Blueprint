import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
const STORYBOARD_PATH = process.env.STORYBOARD_PATH || "./storyboard.json";
// The storyboard file is shared with an LLM-driven tool surface and with the
// browser app, so its contents are not trusted. Missing or wrong-typed arrays
// are replaced rather than handed on to callers that assume the shape.
function normalize(parsed) {
    if (!parsed || typeof parsed !== "object")
        return createEmptyStoryboard();
    const empty = createEmptyStoryboard();
    const raw = parsed;
    return {
        version: typeof raw.version === "string" ? raw.version : empty.version,
        updated: typeof raw.updated === "string" ? raw.updated : empty.updated,
        acts: Array.isArray(raw.acts) ? raw.acts : empty.acts,
        cards: Array.isArray(raw.cards) ? raw.cards : [],
        shots: Array.isArray(raw.shots) ? raw.shots : [],
    };
}
export async function loadStoryboard() {
    try {
        if (!existsSync(STORYBOARD_PATH)) {
            return createEmptyStoryboard();
        }
        const data = await readFile(STORYBOARD_PATH, "utf-8");
        return normalize(JSON.parse(data));
    }
    catch {
        return createEmptyStoryboard();
    }
}
export async function saveStoryboard(data) {
    data.updated = new Date().toISOString();
    await writeFile(STORYBOARD_PATH, JSON.stringify(data, null, 2));
}
function createEmptyStoryboard() {
    return {
        version: "1.0",
        updated: new Date().toISOString(),
        acts: [
            { id: "act-1", name: "Act I: Setup", order: 0 },
            { id: "act-2", name: "Act II: Confrontation", order: 1 },
            { id: "act-3", name: "Act III: Resolution", order: 2 },
        ],
        cards: [],
        shots: [],
    };
}
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
export function getStoryboardPath() {
    return STORYBOARD_PATH;
}
