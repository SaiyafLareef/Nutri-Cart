import React from 'react';
import { InventoryItem } from '../types';
import { Clock, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  items: InventoryItem[];
  onConsume: (id: string) => void;
  onRemove: (id: string) => void;
}

const Inventory: React.FC<Props> = ({ items, onConsume, onRemove }) => {
  // Sort by expiry date (soonest first)
  const sortedItems = [...items]
    .filter(i => !i.consumed)
    .sort((a, b) => a.expiryDate - b.expiryDate);

  const getExpiryStatus = (expiryDate: number) => {
    const daysLeft = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { color: 'text-rose-500 bg-rose-50 border-rose-100', text: 'Expired', icon: <AlertTriangle size={14} /> };
    if (daysLeft <= 3) return { color: 'text-amber-600 bg-amber-50 border-amber-100', text: `${daysLeft} days left`, icon: <Clock size={14} /> };
    return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', text: `${daysLeft} days`, icon: <CheckCircle size={14} /> };
  };

  return (
    <div className="pb-24 space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">My Pantry & Fridge</h2>
            <p className="text-slate-500 text-sm">Track what you have at home to reduce waste.</p>
        </div>

        {sortedItems.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
                <p>Your inventory is empty.</p>
                <p className="text-sm">Check off items in your shopping list to add them here.</p>
            </div>
        ) : (
            <div className="grid gap-3">
                {sortedItems.map(item => {
                    const status = getExpiryStatus(item.expiryDate);
                    return (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{item.name}</h3>
                                    <p className="text-xs text-slate-400">Bought on {new Date(item.purchasedDate).toLocaleDateString()}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                    {status.icon}
                                    {status.text}
                                </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                                <button 
                                    onClick={() => onConsume(item.id)}
                                    className="flex-1 bg-slate-800 text-white text-sm py-2 rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    Consumed / Finished
                                </button>
                                <button 
                                    onClick={() => onRemove(item.id)}
                                    className="px-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};

export default Inventory;
