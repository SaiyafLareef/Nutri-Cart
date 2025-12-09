import React, { useState, useEffect } from 'react';
import { GroceryItem, InventoryItem, View, Suggestion, CATEGORIES } from './types';
import { checkExpiringItems, checkRebuySuggestions, getEstimatedExpiry } from './utils/rules';
import ShoppingList from './components/ShoppingList';
import Inventory from './components/Inventory';
import SmartDashboard from './components/SmartDashboard';
import { LayoutList, Package, Sparkles, ChefHat } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Simple UUID generator if uuid package not available, but user said use existing libs. 
// I'll implement a simple one to avoid dependency issues in this specific format response
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<View>(View.LIST);
  const [shoppingList, setShoppingList] = useState<GroceryItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // --- Initial Mock Data & Effects ---
  useEffect(() => {
    // Load data from local storage or set defaults
    const savedList = localStorage.getItem('nutricart_list');
    const savedInventory = localStorage.getItem('nutricart_inventory');

    if (savedList) setShoppingList(JSON.parse(savedList));
    else {
        setShoppingList([
            { id: '1', name: 'Milk', category: 'Dairy', quantity: 1, unit: 'carton', isChecked: false, addedDate: Date.now() },
            { id: '2', name: 'White Bread', category: 'Bakery', quantity: 1, unit: 'loaf', isChecked: false, addedDate: Date.now() }
        ]);
    }

    if (savedInventory) setInventory(JSON.parse(savedInventory));
    else {
        // Mock history
        const now = Date.now();
        setInventory([
            { id: 'inv1', name: 'Eggs', category: 'Dairy', quantity: 12, unit: 'pcs', isChecked: true, addedDate: now - 86400000 * 10, purchasedDate: now - 86400000 * 10, expiryDate: now - 86400000, consumed: false }, // Expired
            { id: 'inv2', name: 'Apples', category: 'Produce', quantity: 5, unit: 'pcs', isChecked: true, addedDate: now - 86400000 * 2, purchasedDate: now - 86400000 * 2, expiryDate: now + 86400000 * 5, consumed: false },
            { id: 'inv3', name: 'Chicken Breast', category: 'Meat', quantity: 2, unit: 'lbs', isChecked: true, addedDate: now - 86400000 * 15, purchasedDate: now - 86400000 * 15, expiryDate: now - 86400000 * 12, consumed: true }, // History item
        ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nutricart_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('nutricart_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Run Rule Engine
  useEffect(() => {
    const expiring = checkExpiringItems(inventory);
    const rebuy = checkRebuySuggestions(inventory, shoppingList.map(i => i.name));
    setSuggestions([...expiring, ...rebuy]);
  }, [inventory, shoppingList]);

  // --- Handlers ---

  const addItem = (name: string, category: string) => {
    const newItem: GroceryItem = {
      id: generateId(),
      name,
      category,
      quantity: 1,
      unit: 'pkg',
      isChecked: false,
      addedDate: Date.now()
    };
    setShoppingList(prev => [...prev, newItem]);
  };

  const deleteItem = (id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
  };

  const toggleItem = (id: string) => {
    setShoppingList(prev => prev.map(item => {
        if (item.id === id) {
            const newVal = !item.isChecked;
            // If checking OFF (purchased), move to inventory logic handled manually by user usually, 
            // but here we can automate: if user checks it off, we ask or automatically move it?
            // For this UX, let's keep it simple: Checked items stay in list until cleared/moved.
            // Let's implement a "Finish Shopping" feature or just auto-move.
            // Simplified: If checked, it stays checked. We add a "Move Checked to Pantry" button or auto-move after delay.
            // Let's just toggle for now.
            return { ...item, isChecked: newVal };
        }
        return item;
    }));
  };

  const swapItem = (id: string, newName: string) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, name: newName } : item
    ));
  };

  const moveCheckedToInventory = () => {
    const checked = shoppingList.filter(i => i.isChecked);
    if (checked.length === 0) return;

    const newInventoryItems: InventoryItem[] = checked.map(item => ({
        ...item,
        purchasedDate: Date.now(),
        expiryDate: getEstimatedExpiry(item.name, Date.now()),
        consumed: false
    }));

    setInventory(prev => [...prev, ...newInventoryItems]);
    setShoppingList(prev => prev.filter(i => !i.isChecked));
    setView(View.INVENTORY);
  };

  const consumeInventoryItem = (id: string) => {
    setInventory(prev => prev.map(item => 
        item.id === id ? { ...item, consumed: true } : item
    ));
  };

  const removeInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const handleAcceptSuggestion = (s: Suggestion) => {
    if (s.suggestedItemName) {
        addItem(s.suggestedItemName, 'Other');
        // Remove from suggestions locally to prevent instant reappear
        setSuggestions(prev => prev.filter(x => x.id !== s.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                    <ChefHat size={20} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800">NutriCart <span className="text-emerald-600">AI</span></h1>
            </div>
            
            {view === View.LIST && shoppingList.some(i => i.isChecked) && (
                <button 
                    onClick={moveCheckedToInventory}
                    className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all animate-fade-in"
                >
                    Done Shopping ({shoppingList.filter(i => i.isChecked).length})
                </button>
            )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
        {view === View.LIST && (
            <ShoppingList 
                items={shoppingList}
                onAdd={addItem}
                onDelete={deleteItem}
                onToggle={toggleItem}
                onSwap={swapItem}
            />
        )}
        {view === View.INVENTORY && (
            <Inventory 
                items={inventory}
                onConsume={consumeInventoryItem}
                onRemove={removeInventoryItem}
            />
        )}
        {view === View.DASHBOARD && (
            <SmartDashboard 
                suggestions={suggestions}
                inventory={inventory}
                shoppingList={shoppingList}
                onAcceptSuggestion={handleAcceptSuggestion}
                onDismissSuggestion={(id) => setSuggestions(prev => prev.filter(s => s.id !== id))}
            />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom z-30">
        <div className="max-w-2xl mx-auto grid grid-cols-3 h-16">
            <button 
                onClick={() => setView(View.LIST)}
                className={`flex flex-col items-center justify-center gap-1 ${view === View.LIST ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <LayoutList size={24} strokeWidth={view === View.LIST ? 2.5 : 2} />
                <span className="text-[10px] font-medium">List</span>
            </button>
            <button 
                onClick={() => setView(View.DASHBOARD)}
                className={`flex flex-col items-center justify-center gap-1 ${view === View.DASHBOARD ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <div className={`relative ${view === View.DASHBOARD ? 'scale-110 transition-transform' : ''}`}>
                    <Sparkles size={24} strokeWidth={view === View.DASHBOARD ? 2.5 : 2} />
                    {suggestions.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                    )}
                </div>
                <span className="text-[10px] font-medium">Assistant</span>
            </button>
            <button 
                onClick={() => setView(View.INVENTORY)}
                className={`flex flex-col items-center justify-center gap-1 ${view === View.INVENTORY ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Package size={24} strokeWidth={view === View.INVENTORY ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Pantry</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default App;