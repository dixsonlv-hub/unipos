import React, { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { menuItems, categories, type MenuItem } from "@/data/mock-data";
import { useMenuItems } from "@/state/menu-store";

interface Props {
  lang: "en" | "zh";
  cartCount: number;
  onSelectItem: (item: MenuItem) => void;
  onOpenCart: () => void;
  onBack: () => void;
}

const catLabels: Record<string, Record<string, string>> = {
  All: { en: "All", zh: "全部" }, Popular: { en: "Popular", zh: "热门" },
  Starters: { en: "Starters", zh: "前菜" }, Mains: { en: "Mains", zh: "主菜" },
  Noodles: { en: "Noodles", zh: "面食" }, Rice: { en: "Rice", zh: "饭类" },
  Sides: { en: "Sides", zh: "配菜" }, Desserts: { en: "Desserts", zh: "甜品" },
  Beverages: { en: "Beverages", zh: "饮料" }, Alcohol: { en: "Alcohol", zh: "酒类" },
  Combos: { en: "Combos", zh: "套餐" },
};

export const KioskMenu: React.FC<Props> = ({ lang, cartCount, onSelectItem, onOpenCart, onBack }) => {
  const storeItems = useMenuItems();
  const allItems = storeItems.length > 0 ? storeItems : menuItems;
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = allItems.filter(i => {
    if (!i.available) return false;
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || (i.nameZh && i.nameZh.includes(q));
    const matchCat = activeCat === "All" || (activeCat === "Popular" ? i.popular : i.category === activeCat);
    return matchSearch && matchCat;
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border">
        <button onClick={onBack} className="text-xl text-muted-foreground hover:text-foreground">
          ← {lang === "en" ? "Back" : "返回"}
        </button>
        <div className="relative flex-1 max-w-md mx-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={lang === "en" ? "Search menu..." : "搜索菜品..."}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-card text-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button onClick={onOpenCart} className="relative p-4 rounded-2xl bg-primary text-primary-foreground">
          <ShoppingCart className="w-7 h-7" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-destructive text-destructive-foreground text-sm font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Category sidebar */}
        <div className="w-48 border-r border-border overflow-y-auto py-4">
          {["All", "Popular", ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`w-full text-left px-6 py-4 text-lg font-medium transition-colors ${
                activeCat === cat ? "bg-primary/10 text-primary border-r-4 border-primary" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {catLabels[cat]?.[lang] || cat}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-5">
            {filtered.map(item => (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="uniweb-card overflow-hidden text-left hover:border-primary/40 hover:shadow-md transition-all group"
              >
                {item.image && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {lang === "zh" && item.nameZh ? item.nameZh : item.name}
                  </h3>
                  {item.description && (
                    <p className="text-base text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                  )}
                  <p className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-64 text-xl text-muted-foreground">
              {lang === "en" ? "No items found" : "未找到菜品"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
