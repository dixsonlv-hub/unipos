import React, { useState } from "react";
import { Search, Star, Plus, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { menuItems, categories, modifierGroups, type Table, type Order, type MenuItem } from "@/data/mock-data";
import { ModifierDialog } from "@/components/tablet/ModifierDialog";

interface MenuComposerProps {
  onAddItem: (menuItemId: string, modifiers: { name: string; price: number }[], notes?: string) => void;
  selectedTable?: Table;
  currentOrder: Order | null;
}

export const MenuComposer: React.FC<MenuComposerProps> = ({ onAddItem, selectedTable, currentOrder }) => {
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [modifierItem, setModifierItem] = useState<MenuItem | null>(null);

  const filteredItems = menuItems.filter(item => {
    if (searchQuery) return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === "All") return true;
    return item.category === activeCategory;
  });

  const handleItemClick = (item: MenuItem) => {
    if (!item.available) return;
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setModifierItem(item);
    } else {
      onAddItem(item.id, []);
    }
  };

  const handleModifierConfirm = (modifiers: { name: string; price: number }[], notes?: string) => {
    if (modifierItem) {
      onAddItem(modifierItem.id, modifiers, notes);
      setModifierItem(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-card flex items-center gap-4">
        <div className="flex-1">
          {selectedTable ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-[13px]">Table {selectedTable.number}</span>
              <span className="text-[11px] text-primary bg-status-blue-light px-2 py-0.5 rounded-md font-medium">
                {currentOrder?.serviceMode || "dine-in"}
              </span>
              {selectedTable.guestCount && (
                <span className="text-[11px] text-muted-foreground">{selectedTable.guestCount} guests</span>
              )}
            </div>
          ) : currentOrder ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-[13px] capitalize">{currentOrder.serviceMode}</span>
              <span className="text-[11px] text-muted-foreground font-mono">#{currentOrder.id.slice(-4)}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-[13px]">Select a table or create an order</span>
          )}
        </div>
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-[9px] bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Category Rail */}
      <div className="flex gap-1.5 px-5 py-2.5 overflow-x-auto border-b border-border bg-card">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
              activeCategory === cat && !searchQuery
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto pos-scrollbar p-5">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={!item.available || !currentOrder}
              className={cn(
                "relative rounded-lg border-1.5 text-left transition-all group overflow-hidden",
                item.available && currentOrder
                  ? "bg-card border-border hover:border-primary/40 hover:shadow-sm cursor-pointer"
                  : "bg-accent border-border/50 opacity-60 cursor-not-allowed"
              )}
            >
              {/* Image */}
              {item.image ? (
                <div className="w-full aspect-[4/3] overflow-hidden bg-accent">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-full aspect-[4/3] bg-accent/50 flex items-center justify-center">
                  <span className="text-2xl opacity-30">🍽</span>
                </div>
              )}
              <div className="p-3">
                {item.popular && (
                  <Star className="absolute top-2 right-2 h-3.5 w-3.5 text-status-amber fill-status-amber drop-shadow-sm" />
                )}
                {item.isCombo && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    <Package className="h-2.5 w-2.5" />COMBO
                  </span>
                )}
                <div className="font-medium text-[13px] text-foreground leading-tight mb-1 line-clamp-1">{item.name}</div>
                <div className="text-[13px] font-semibold text-primary font-mono">${item.price.toFixed(2)}</div>
                {!item.available && (
                  <div className="text-[10px] text-destructive mt-1 font-semibold">Unavailable</div>
                )}
              </div>
              {item.available && currentOrder && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                    <Plus className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {modifierItem && (
        <ModifierDialog
          item={modifierItem}
          groups={modifierGroups.filter(g => modifierItem.modifierGroups?.includes(g.id))}
          onConfirm={handleModifierConfirm}
          onCancel={() => setModifierItem(null)}
        />
      )}
    </div>
  );
};
