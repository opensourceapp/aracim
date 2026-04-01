export type ItemStatus = "unchecked" | "ok" | "issue";

export interface ItemState {
  status: ItemStatus;
  note?: string;
  photos?: string[];
  updatedAt?: number;
}

export interface VehicleInfo {
  brand?: string;
  model?: string;
  plate?: string;
  year?: string;
}

export type ChecklistState = Record<string, ItemState>;
