import React from "react";
import { Plus, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuItems, categories } from "@/data/mock-data";

const AdminMenu: React.FC = () => (
  <div className="p-8">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
        <p className="text-sm text-muted-foreground">{menuItems.length} items across {categories.length} categories</p>
      </div>
      <Button><Plus className="h-4 w-4 mr-1" />Add Item</Button>
    </div>

    <div className="relative w-72 mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input placeholder="Search menu items..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    {categories.map(cat => {
      const items = menuItems.filter(m => m.category === cat);
      if (items.length === 0) return null;
      return (
        <div key={cat} className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{cat}</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.modifierGroups?.length || 0} modifier groups</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-foreground">${item.price.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.available ? "bg-pos-available/15 text-pos-available" : "bg-pos-dirty/15 text-pos-dirty"}`}>
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                  <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></button>
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
