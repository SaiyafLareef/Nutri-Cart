export interface HealthSwapResult {
  original: string;
  alternative: string;
  reason: string;
  caloriesDiff: string;
}

// Simple dictionary for health swaps
const HEALTH_SWAPS: Record<string, { alternative: string, reason: string, diff: string }> = {
  "white bread": { alternative: "Whole Wheat Bread", reason: "More fiber and nutrients.", diff: "Higher fiber, lower GI" },
  "white rice": { alternative: "Brown Rice", reason: "Better for digestion and blood sugar.", diff: "More vitamins & fiber" },
  "soda": { alternative: "Sparkling Water", reason: "Avoids high sugar content.", diff: "0 sugar vs 40g sugar" },
  "chips": { alternative: "Popcorn or Nuts", reason: "Lower saturated fats and sodium.", diff: "Less processed fat" },
  "candy": { alternative: "Fresh Fruit", reason: "Natural sugars with vitamins.", diff: "Nutrient dense" },
  "milk chocolate": { alternative: "Dark Chocolate", reason: "Higher antioxidant content.", diff: "Less sugar" },
  "ice cream": { alternative: "Frozen Yogurt", reason: "Lower fat content.", diff: "Less saturated fat" },
  "pasta": { alternative: "Whole Wheat Pasta", reason: "Complex carbs are better for energy.", diff: "Higher fiber" },
  "sugar": { alternative: "Honey or Stevia", reason: "Natural sweetener alternatives.", diff: "Lower glycemic load" },
  "mayonnaise": { alternative: "Greek Yogurt or Mustard", reason: "Significantly lower fat.", diff: "Less calories" },
  "vegetable oil": { alternative: "Olive Oil", reason: "Healthier heart-friendly fats.", diff: "More omega-3s" },
  "butter": { alternative: "Avocado Oil", reason: "Plant-based healthy fats.", diff: "Less saturated fat" },
  "cereal": { alternative: "Oatmeal", reason: "Less processed sugar.", diff: "More fiber, less sugar" }
};

// Common pairings for predictions
const PAIRINGS: Record<string, string> = {
  "cereal": "Milk",
  "pasta": "Tomato Sauce",
  "bread": "Butter",
  "salad": "Dressing",
  "eggs": "Bacon",
  "chips": "Salsa",
  "coffee": "Creamer",
  "peanut butter": "Jelly",
  "rice": "Soy Sauce",
  "pancakes": "Syrup"
};

export const getHealthierAlternative = async (itemName: string): Promise<HealthSwapResult | null> => {
  // Simulate network delay for UX consistency
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerName = itemName.toLowerCase();
  
  // exact match or partial match logic
  for (const [key, data] of Object.entries(HEALTH_SWAPS)) {
    if (lowerName.includes(key)) {
       // Avoid suggesting if the user already typed the alternative
       if (lowerName.includes(data.alternative.toLowerCase())) continue;
       
       return {
         original: itemName,
         alternative: data.alternative,
         reason: data.reason,
         caloriesDiff: data.diff
       };
    }
  }

  return null;
};

export const predictMissingItems = async (
  inventory: string[], 
  recentPurchases: string[]
): Promise<{item: string, reason: string}[]> => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const suggestions: {item: string, reason: string}[] = [];
  const inventoryLower = inventory.map(i => i.toLowerCase());

  // 1. Check pairings
  inventoryLower.forEach(invItem => {
    for (const [key, pair] of Object.entries(PAIRINGS)) {
      if (invItem.includes(key)) {
         // If we have the key (e.g. Cereal), do we have the pair (Milk)?
         const hasPair = inventoryLower.some(i => i.includes(pair.toLowerCase()));
         if (!hasPair) {
            // Avoid duplicates
            if (!suggestions.some(s => s.item === pair)) {
                suggestions.push({
                    item: pair,
                    reason: `You have ${key}, but might need ${pair}.`
                });
            }
         }
      }
    }
  });

  // 2. Random logic from purchases if logic 1 didn't yield enough
  if (suggestions.length < 3 && recentPurchases.length > 0) {
     const candidates = recentPurchases.filter(p => !inventoryLower.includes(p.toLowerCase()));
     // Pick random up to fill 3
     const shuffled = candidates.sort(() => 0.5 - Math.random());
     shuffled.slice(0, 3 - suggestions.length).forEach(p => {
        suggestions.push({
            item: p,
            reason: "Based on your frequent purchases."
        });
     });
  }

  return suggestions.slice(0, 3);
}