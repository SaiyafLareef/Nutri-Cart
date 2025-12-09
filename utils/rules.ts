import { InventoryItem, Suggestion } from "../types";

// Common expiration times in days
const SHELF_LIFE_DAYS: Record<string, number> = {
  'Milk': 7,
  'Bread': 5,
  'Eggs': 21,
  'Bananas': 4,
  'Chicken': 3,
  'Spinach': 5,
  'Yogurt': 14,
  'Rice': 365,
};

export const getEstimatedExpiry = (itemName: string, purchasedDate: number): number => {
  // Simple heuristic: check if name contains key word
  const lowerName = itemName.toLowerCase();
  let days = 14; // Default

  for (const [key, value] of Object.entries(SHELF_LIFE_DAYS)) {
    if (lowerName.includes(key.toLowerCase())) {
      days = value;
      break;
    }
  }
  
  const ms = days * 24 * 60 * 60 * 1000;
  return purchasedDate + ms;
};

// Rule-Based Logic: Check for expiring items
export const checkExpiringItems = (inventory: InventoryItem[]): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const now = Date.now();
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

  inventory.forEach(item => {
    if (!item.consumed) {
      const timeLeft = item.expiryDate - now;
      if (timeLeft > 0 && timeLeft < THREE_DAYS) {
        suggestions.push({
          id: `exp-${item.id}`,
          type: 'EXPIRING_SOON',
          message: `${item.name} is expiring in ${Math.ceil(timeLeft / (24 * 60 * 60 * 1000))} days! Plan a meal around it.`,
          relatedItemId: item.id,
          data: item
        });
      } else if (timeLeft <= 0) {
        suggestions.push({
          id: `exp-expired-${item.id}`,
          type: 'EXPIRING_SOON',
          message: `${item.name} has likely expired.`,
          relatedItemId: item.id,
          data: item
        });
      }
    }
  });

  return suggestions;
};

// Rule-Based Logic: Re-buy suggestions
// Suggests items purchased > 7 days ago that aren't in current inventory or active list
export const checkRebuySuggestions = (inventory: InventoryItem[], activeListNames: string[]): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  // Filter consumed items that were bought long ago
  inventory.filter(i => i.consumed).forEach(item => {
    const timeSincePurchase = now - item.purchasedDate;
    
    // If bought more than 7 days ago AND not currently in active list AND not currently in inventory (unconsumed)
    const isCurrentlyInStock = inventory.some(i => !i.consumed && i.name === item.name);
    const isInShoppingList = activeListNames.includes(item.name);

    if (timeSincePurchase > SEVEN_DAYS && !isCurrentlyInStock && !isInShoppingList) {
       // Avoid duplicate suggestions
       if (!suggestions.some(s => s.suggestedItemName === item.name)) {
         suggestions.push({
            id: `rebuy-${item.id}`,
            type: 'REBUY',
            message: `You bought ${item.name} a while ago. Need more?`,
            suggestedItemName: item.name
         });
       }
    }
  });

  return suggestions;
};
