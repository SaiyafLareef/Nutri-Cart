export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
  addedDate: number;
}

export interface InventoryItem extends GroceryItem {
  purchasedDate: number;
  expiryDate: number; // Timestamp
  consumed: boolean;
}

export interface Suggestion {
  id: string;
  type: 'REBUY' | 'HEALTH_SWAP' | 'EXPIRING_SOON';
  message: string;
  relatedItemId?: string; // ID of the item this suggestion is about
  suggestedItemName?: string; // If it's a swap or new item
  data?: any;
}

export enum View {
  LIST = 'LIST',
  INVENTORY = 'INVENTORY',
  DASHBOARD = 'DASHBOARD'
}

export const CATEGORIES = [
  'Produce',
  'Dairy',
  'Bakery',
  'Meat',
  'Pantry',
  'Frozen',
  'Beverages',
  'Snacks',
  'Other'
];
