import React from "react";
import { Plus, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuItems, categories } from "@/data/mock-data";

const AdminMenu: React.FC = () => (
  <div className="p-7">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Menu Management</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{menuItems.length} items across {categories.length} categories</p>
      </div>
      <Button className="rounded-lg"><Plus className="h-4 w-4 mr-1.5" />Add Item</Button>
    </div>

    <div className="relative w-64 mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        placeholder="Search menu items..."
        className="w-full h-10 pl-10 pr-4 rounded-[9px] bg-card border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
      />
    </div>

    {categories.map(cat => {
      const items = menuItems.filter(m => m.category === cat);
      if (items.length === 0) return null;
      return (
        <div key={cat} className="mb-6">
          <div className="section-label mb-3 pb-2 border-b border-border">{cat}</div>
          <div className="uniweb-card divide-y divide-border">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-accent transition-colors cursor-pointer">
                <div>
                  <h3 className="text-[13px] font-medium text-foreground">{item.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.modifierGroups?.length || 0} modifier groups</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-semibold text-foreground font-mono">${item.price.toFixed(2)}</span>
                  <span className={`status-badge ${item.available ? "bg-status-green-light text-status-green" : "bg-status-red-light text-status-red"}`}>
                    <span className={`status-dot ${item.available ? "bg-status-green" : "bg-status-red"}`} />
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                  <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

export default AdminMenu;
