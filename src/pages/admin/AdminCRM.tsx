import React from "react";
import { Search, Star, Phone, Mail } from "lucide-react";
import { customers } from "@/data/mock-data";

const tierColors: Record<string, string> = {
  bronze: "bg-pos-occupied/15 text-pos-occupied",
  silver: "bg-secondary text-secondary-foreground",
  gold: "bg-pos-occupied/20 text-pos-occupied",
  platinum: "bg-primary/15 text-primary",
};

const AdminCRM: React.FC = () => (
  <div className="p-8">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Customer Management</h1>
      <p className="text-sm text-muted-foreground">{customers.length} customers</p>
    </div>

    <div className="relative w-72 mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input placeholder="Search customers..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <div className="grid grid-cols-2 gap-4">
      {customers.map(c => (
        <div key={c.id} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">{c.name}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${tierColors[c.tier]}`}>{c.tier}</span>
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{c.phone}</div>
            {c.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{c.email}</div>}
          </div>
          <div className="flex gap-4 mt-4 pt-3 border-t border-border text-sm">
            <div><span className="font-semibold text-foreground">{c.visits}</span> <span className="text-muted-foreground">visits</span></div>
            <div><span className="font-semibold text-foreground">{c.points}</span> <span className="text-muted-foreground">points</span></div>
            <div className="text-muted-foreground ml-auto text-xs">Last: {c.lastVisit}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminCRM;
