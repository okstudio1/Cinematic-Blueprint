export interface Shot {
  id: string;
  shotNumber: string;
  description: string;
  camera: string;
  duration: string;
  image?: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  act: string;
  status: "draft" | "review" | "done";
  subplot?: string;
}

export interface Act {
  id: string;
  name: string;
  order: number;
}

export interface Storyboard {
  version: string;
  updated: string;
  acts: Act[];
  cards: Card[];
  shots: Shot[];
}
