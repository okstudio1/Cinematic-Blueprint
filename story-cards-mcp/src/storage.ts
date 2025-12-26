import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import type { Storyboard } from "./types.js";

const STORYBOARD_PATH = process.env.STORYBOARD_PATH || "./storyboard.json";

export async function loadStoryboard(): Promise<Storyboard> {
  try {
    if (!existsSync(STORYBOARD_PATH)) {
      return createEmptyStoryboard();
    }
    const data = await readFile(STORYBOARD_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return createEmptyStoryboard();
  }
}

export async function saveStoryboard(data: Storyboard): Promise<void> {
  data.updated = new Date().toISOString();
  await writeFile(STORYBOARD_PATH, JSON.stringify(data, null, 2));
}

function createEmptyStoryboard(): Storyboard {
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

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getStoryboardPath(): string {
  return STORYBOARD_PATH;
}
