import React, { useState } from "react";
import { ArrowLeft, Search, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { menuItems, categories, modifierGroups, type Table, type ServiceMode, type OrderItem, type MenuItem } from "@/data/mock-data";
import { MobileModifierSheet } from "@/components/mobile/MobileModifierSheet";

interface Props {
  table: Table;
  serviceMode: ServiceMode;
  orderItems: OrderItem[];
  onAddItem: (menuItemId: string, modifiers: { name: string; price: number }[], notes?: string) => void;
  onReview: () => void;
  onBack: () => void;
  total: number;
  itemCount: number;
}

export const MobileMenuScreen: React.FC<Props> = ({ table, serviceMode, orderItems, onAddItem, onReview, onBack, total, itemCount }) => {
  const [category, setCategory] = useState("Popular");
  const [search, setSearch] = useState("");
  const [modifierItem, setModifierItem] = useState<MenuItem | null>(null);

  const filtered = menuItems.filter(i => {
    if (search) return i.name.toLowerCase().includes(search.toLowerCase());
    return i.category === category;
  });

  const getItemQty = (id: string) => orderItems.filter(i => i.menuItemId === id).reduce((s, i) => s + i.quantity, 0);

  const handleItemTap = (item: MenuItem) => {
    if (!item.available) return;
    if (item.modifierGroups?.length) {
      setModifierItem(item);
    } else {
      onAddItem(item.id, []);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="bg-card border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground tracking-tight">Table {table.number}</h1>
            <p className="text-[11px] text-muted-foreground capitalize">{serviceMode}</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-[9px] bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto shrink-0">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); setSearch(""); }}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors",
              category === c && !search
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border-1.5 border-border"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="space-y-2">
          {filtered.map(item => {
            const qty = getItemQty(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleItemTap(item)}
                disabled={!item.available}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border-1.5 transition-all active:scale-[0.98]",
                  item.available
                    ? "bg-card border-border hover:border-primary/30"
                    : "bg-accent border-border/50 opacity-60"
                )}
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-[13px] text-foreground">{item.name}</span>
                    {item.popular && <Star className="h-3 w-3 text-status-amber fill-status-amber" />}
                  </div>
                  <span className="text-[13px] font-semibold text-primary font-mono">${item.price.toFixed(2)}</span>
                  {!item.available && <span className="text-[11px] text-destructive ml-2 font-semibold">Sold out</span>}
                </div>
                {qty > 0 && (
                  <span className="w-6 h-6 rounded-md bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                    {qty}
                  </span>
                )}
                {item.available && (
                  <div className="w-8 h-8 rounded-lg bg-status-blue-light flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <Button variant="pay" size="xl" className="w-full rounded-lg" onClick={onReview}>
            Review Order · {itemCount} items · ${total.toFixed(2)}
          </Button>
        </div>
      )}

      {modifierItem && (
        <MobileModifierSheet
          item={modifierItem}
          groups={modifierGroups.filter(g => modifierItem.modifierGroups?.includes(g.id))}
          onConfirm={(mods, notes) => { onAddItem(modifierItem.id, mods, notes); setModifierItem(null); }}
          onCancel={() => setModifierItem(null)}
        />
      )}
    </div>
  );
};
