import React, { useState } from 'react';
import { Suggestion, InventoryItem, GroceryItem } from '../types';
import { Sparkles, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { predictMissingItems } from '../services/suggestionService';

interface Props {
  suggestions: Suggestion[];
  inventory: InventoryItem[];
  shoppingList: GroceryItem[];
  onAcceptSuggestion: (suggestion: Suggestion) => void;
  onDismissSuggestion: (id: string) => void;
}

const SmartDashboard: React.FC<Props> = ({ suggestions, inventory, shoppingList, onAcceptSuggestion, onDismissSuggestion }) => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [smartPredictions, setSmartPredictions] = useState<{item: string, reason: string}[]>([]);

  const handleSmartPrediction = async () => {
    setIsPredicting(true);
    // Prepare data context
    const inventoryNames = inventory.filter(i => !i.consumed).map(i => i.name);
    const recentHistory = inventory.filter(i => i.consumed).slice(-10).map(i => i.name); // Last 10 consumed
    
    const results = await predictMissingItems(inventoryNames, recentHistory);
    setSmartPredictions(results);
    setIsPredicting(false);
  };

  const expiringSuggestions = suggestions.filter(s => s.type === 'EXPIRING_SOON');
  const rebuySuggestions = suggestions.filter(s => s.type === 'REBUY');

  return (
    <div className="pb-24 space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
        <div className="flex items-center gap-2 mb-2 opacity-90">
            <Sparkles size={20} className="text-yellow-300" />
            <span className="text-sm font-medium uppercase tracking-wide">AI Assistant</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">AI Overview</h2>
        <p className="text-emerald-50 text-sm mb-6">
            We've analyzed your habits. Here is what you should pay attention to today.
        </p>
        
        <button 
            onClick={handleSmartPrediction}
            disabled={isPredicting}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all"
        >
            {isPredicting ? <Loader2 className="animate-spin" /> : <Lightbulb size={20} />}
            {isPredicting ? 'Checking Patterns...' : 'Predict Needed Items'}
        </button>
      </div>

      {/* Suggested Items */}
      {smartPredictions.length > 0 && (
          <div className="space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Smart Recommendations
              </h3>
              {smartPredictions.map((pred, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                          <span className="font-semibold text-slate-800">{pred.item}</span>
                          <button 
                            onClick={() => {
                                onAcceptSuggestion({
                                    id: `smart-pred-${idx}`,
                                    type: 'REBUY',
                                    message: '',
                                    suggestedItemName: pred.item
                                });
                                setSmartPredictions(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                          >
                              Add
                          </button>
                      </div>
                      <p className="text-xs text-slate-500 italic">"{pred.reason}"</p>
                  </div>
              ))}
          </div>
      )}

      {/* Expiring Alerts */}
      {expiringSuggestions.length > 0 && (
          <div className="space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Expiring Soon
              </h3>
              {expiringSuggestions.map(s => (
                  <div key={s.id} className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                      <p className="text-rose-800 font-medium text-sm mb-2">{s.message}</p>
                      <button 
                        onClick={() => onDismissSuggestion(s.id)} // Usually implies "I checked it" or "Consumed"
                        className="text-xs text-rose-600 font-semibold hover:underline"
                      >
                          Dismiss
                      </button>
                  </div>
              ))}
          </div>
      )}

      {/* Rebuy Rules */}
      {rebuySuggestions.length > 0 && (
           <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Regular Purchases
            </h3>
            {rebuySuggestions.map(s => (
                <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100/50 flex items-center justify-between">
                    <div className="flex-1 pr-4">
                        <p className="text-slate-700 text-sm">{s.message}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onDismissSuggestion(s.id)}
                            className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            ×
                        </button>
                        <button 
                            onClick={() => onAcceptSuggestion(s)}
                            className="bg-emerald-100 text-emerald-700 p-2 rounded-lg hover:bg-emerald-200 transition-colors"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}

      {suggestions.length === 0 && smartPredictions.length === 0 && (
          <div className="text-center py-8 text-slate-400">
              <p>Everything looks good!</p>
              <p className="text-xs mt-1">No urgent alerts or suggestions.</p>
          </div>
      )}
    </div>
  );
};

export default SmartDashboard;