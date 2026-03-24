import React, { useState } from "react";
import { Search, Star, Plus } from "lucide-react";
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
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
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
      <div className="px-5 py-3 border-b border-border flex items-center gap-4">
        <div className="flex-1">
          {selectedTable ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Table {selectedTable.number}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {currentOrder?.serviceMode || "dine-in"}
              </span>
              {selectedTable.guestCount && (
                <span className="text-xs text-muted-foreground">
                  {selectedTable.guestCount} guests
                </span>
              )}
            </div>
          ) : currentOrder ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground capitalize">{currentOrder.serviceMode}</span>
              <span className="text-xs text-muted-foreground">#{currentOrder.id.slice(-4)}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Select a table or create an order</span>
          )}
        </div>
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-md bg-muted text-sm text-foreground placeholder:text-muted-foreground border-0 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Category Rail */}
      <div className="flex gap-1.5 px-5 py-2.5 overflow-x-auto border-b border-border bg-muted/30">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              activeCategory === cat && !searchQuery
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-secondary border border-border"
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
                "relative p-3.5 rounded-lg border text-left transition-all group",
                item.available && currentOrder
                  ? "bg-card border-border hover:border-primary hover:shadow-sm cursor-pointer"
                  : "bg-muted/50 border-border/50 opacity-60 cursor-not-allowed"
              )}
            >
              {item.popular && (
                <Star className="absolute top-2 right-2 h-3.5 w-3.5 text-pos-occupied fill-pos-occupied" />
              )}
              <div className="font-medium text-sm text-foreground leading-tight mb-1">{item.name}</div>
              <div className="text-sm font-semibold text-primary">${item.price.toFixed(2)}</div>
              {!item.available && (
                <div className="text-[10px] text-destructive mt-1 font-medium">Unavailable</div>
              )}
              {item.available && currentOrder && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Plus className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modifier Dialog */}
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
