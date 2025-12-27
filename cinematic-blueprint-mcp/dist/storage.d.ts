import type { Storyboard } from "./types.js";
export declare function loadStoryboard(): Promise<Storyboard>;
export declare function saveStoryboard(data: Storyboard): Promise<void>;
export declare function generateId(): string;
export declare function getStoryboardPath(): string;
