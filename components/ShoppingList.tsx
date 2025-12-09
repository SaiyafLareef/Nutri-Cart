import React, { useState } from 'react';
import { GroceryItem, CATEGORIES } from '../types';
import { Plus, Trash2, Check, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { getHealthierAlternative } from '../services/suggestionService';

interface Props {
  items: GroceryItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string, category: string) => void;
  onSwap: (id: string, newName: string) => void;
}

const ShoppingList: React.FC<Props> = ({ items, onToggle, onDelete, onAdd, onSwap }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(CATEGORIES[0]);
  const [loadingSwap, setLoadingSwap] = useState<string | null>(null);
  const [swapData, setSwapData] = useState<{itemId: string, alternative: string, reason: string} | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(newItemName.trim(), newItemCategory);
      setNewItemName('');
    }
  };

  const checkHealth = async (item: GroceryItem) => {
    setLoadingSwap(item.id);
    const result = await getHealthierAlternative(item.name);
    setLoadingSwap(null);
    
    if (result) {
      setSwapData({
        itemId: item.id,
        alternative: result.alternative,
        reason: result.reason
      });
    } else {
        // Show temporary toast or simple alert in real app. 
        // For now we just don't show the modal if no alternative found.
        alert(`Good choice! ${item.name} seems healthy enough.`);
    }
  };

  const confirmSwap = () => {
    if (swapData) {
      onSwap(swapData.itemId, swapData.alternative);
      setSwapData(null);
    }
  };

  const activeItems = items.filter(i => !i.isChecked);
  const checkedItems = items.filter(i => i.isChecked);

  return (
    <div className="space-y-6 pb-24">
      {/* Add Item Form */}
      <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-0 z-10">
        <div className="flex flex-col gap-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Add item (e.g., Milk)"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                    type="submit"
                    className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    disabled={!newItemName.trim()}
                >
                    <Plus size={24} />
                </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setNewItemCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                            newItemCategory === cat 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </form>

      {/* Lists */}
      <div className="space-y-4">
        {activeItems.length === 0 && checkedItems.length === 0 && (
             <div className="text-center text-slate-400 py-10">
                <p>Your cart is empty.</p>
                <p className="text-sm">Add items to get started!</p>
             </div>
        )}

        {/* Active Items */}
        {activeItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 group">
            <button 
                onClick={() => onToggle(item.id)}
                className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-transparent hover:border-emerald-500 hover:text-emerald-500 transition-all"
            >
                <Check size={14} strokeWidth={3} />
            </button>
            
            <div className="flex-1">
                <h3 className="font-medium text-slate-800">{item.name}</h3>
                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{item.category}</span>
            </div>

            <div className="flex gap-1">
                <button 
                    onClick={() => checkHealth(item)}
                    disabled={loadingSwap === item.id}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Find healthier alternative"
                >
                    {loadingSwap === item.id ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                </button>
                <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        ))}

        {/* Checked Items */}
        {checkedItems.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Purchased</h4>
                <div className="space-y-2 opacity-60">
                    {checkedItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2">
                        <button 
                            onClick={() => onToggle(item.id)}
                            className="w-5 h-5 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600"
                        >
                            <Check size={12} strokeWidth={3} />
                        </button>
                        <span className="text-slate-500 line-through decoration-slate-400 decoration-1">{item.name}</span>
                    </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Swap Modal */}
      {swapData && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
                  <div className="flex items-start gap-4 mb-4">
                      <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                          <AlertCircle size={24} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-800">Healthier Choice?</h3>
                          <p className="text-slate-600 text-sm mt-1">Instead of <span className="font-semibold text-slate-800">{items.find(i => i.id === swapData.itemId)?.name}</span>, consider:</p>
                      </div>
                  </div>
                  
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6">
                      <p className="text-lg font-bold text-emerald-800 mb-1">{swapData.alternative}</p>
                      <p className="text-sm text-emerald-700">{swapData.reason}</p>
                  </div>

                  <div className="flex gap-3">
                      <button 
                          onClick={() => setSwapData(null)}
                          className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                      >
                          Keep Original
                      </button>
                      <button 
                          onClick={confirmSwap}
                          className="flex-1 py-2.5 px-4 bg-emerald-600 rounded-xl text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 font-medium"
                      >
                          Swap Item
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ShoppingList;
