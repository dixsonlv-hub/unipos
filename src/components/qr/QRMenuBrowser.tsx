import React, { useState } from "react";
import { Search, ShoppingCart, Star, Check, Minus, Plus, X } from "lucide-react";
import { menuItems, categories, modifierGroups, type MenuItem } from "@/data/mock-data";
import { useMenuItems } from "@/state/menu-store";

export interface QRCartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: { name: string; price: number }[];
  notes: string;
  comboItems?: { name: string; groupName: string }[];
}

interface Props {
  cart: QRCartItem[];
  onAddToCart: (item: QRCartItem) => void;
  onOpenCart: () => void;
}

export const QRMenuBrowser: React.FC<Props> = ({ cart, onAddToCart, onOpenCart }) => {
  const storeItems = useMenuItems();
  const allItems = storeItems.length > 0 ? storeItems : menuItems;
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const filtered = allItems.filter(i => {
    if (!i.available) return false;
    const q = search.toLowerCase();
    const ms = !q || i.name.toLowerCase().includes(q) || (i.nameZh && i.nameZh.includes(q));
    const mc = activeCat === "All" || (activeCat === "Popular" ? i.popular : i.category === activeCat);
    return ms && mc;
  });

  const openDetail = (item: MenuItem) => {
    setDetailItem(item);
    setSelected({});
    setNotes("");
    setQty(1);
  };

  const toggle = (gId: string, oId: string, multi: boolean) => {
    setSelected(prev => {
      const cur = prev[gId] || [];
      if (multi) return { ...prev, [gId]: cur.includes(oId) ? cur.filter(x => x !== oId) : [...cur, oId] };
      return { ...prev, [gId]: cur.includes(oId) ? [] : [oId] };
    });
  };

  const handleAdd = () => {
    if (!detailItem) return;
    const groups = modifierGroups.filter(g => detailItem.modifierGroups?.includes(g.id));
    const mods = groups.flatMap(g => (selected[g.id] || []).map(oId => {
      const opt = g.options.find(o => o.id === oId)!;
      return { name: opt.name, price: opt.price };
    }));
    onAddToCart({
      id: `qr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      menuItemId: detailItem.id,
      name: detailItem.name,
      price: detailItem.price,
      quantity: qty,
      modifiers: mods,
      notes,
    });
    setDetailItem(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Search */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {["All", "Popular", ...categories].map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCat === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {filtered.map(item => (
          <button key={item.id} onClick={() => openDetail(item)}
            className="uniweb-card overflow-hidden text-left group">
            {item.image && (
              <div className="aspect-[4/3] overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
            )}
            <div className="p-3">
              <div className="flex items-start gap-1">
                {item.popular && <Star className="w-3 h-3 text-primary mt-0.5 fill-primary shrink-0" />}
                <h3 className="text-sm font-semibold text-foreground line-clamp-2">{item.name}</h3>
              </div>
              <p className="text-sm font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <button onClick={onOpenCart}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            View Cart ({cartCount})
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setDetailItem(null)}>
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {detailItem.image && (
              <div className="aspect-[16/9] overflow-hidden rounded-t-3xl relative">
                <img src={detailItem.image} alt={detailItem.name} className="w-full h-full object-cover" />
                <button onClick={() => setDetailItem(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            <div className="p-5">
              <h2 className="text-lg font-bold text-foreground">{detailItem.name}</h2>
              {detailItem.nameZh && <p className="text-sm text-muted-foreground">{detailItem.nameZh}</p>}
              <p className="text-xl font-bold text-primary mt-1">${detailItem.price.toFixed(2)}</p>

              {/* Modifiers */}
              {modifierGroups.filter(g => detailItem.modifierGroups?.includes(g.id)).map(g => (
                <div key={g.id} className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">{g.name} {g.required && <span className="text-destructive text-xs">(Required)</span>}</h3>
                  <div className="space-y-2">
                    {g.options.map(o => {
                      const isSel = (selected[g.id] || []).includes(o.id);
                      return (
                        <button key={o.id} onClick={() => toggle(g.id, o.id, g.multiSelect)}
                          className={`w-full p-3 rounded-xl border text-left text-sm flex justify-between items-center ${isSel ? "border-primary bg-primary/5" : "border-border"}`}>
                          <span>{o.name}</span>
                          <div className="flex items-center gap-2">
                            {o.price > 0 && <span className="text-muted-foreground">+${o.price.toFixed(2)}</span>}
                            {isSel && <Check className="w-4 h-4 text-primary" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Special instructions..."
                className="w-full p-3 rounded-xl border border-border bg-background text-sm resize-none h-16 mt-4" />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold w-6 text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={handleAdd}
                  className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
                  Add ${(detailItem.price * qty).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
