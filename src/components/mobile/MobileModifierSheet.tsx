import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type MenuItem, type ModifierGroup } from "@/data/mock-data";

interface Props {
  item: MenuItem;
  groups: ModifierGroup[];
  onConfirm: (modifiers: { name: string; price: number }[], notes?: string) => void;
  onCancel: () => void;
}

export const MobileModifierSheet: React.FC<Props> = ({ item, groups, onConfirm, onCancel }) => {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");

  const toggle = (gId: string, oId: string, multi: boolean) => {
    setSelected(prev => {
      const cur = prev[gId] || [];
      if (multi) return { ...prev, [gId]: cur.includes(oId) ? cur.filter(x => x !== oId) : [...cur, oId] };
      return { ...prev, [gId]: [oId] };
    });
  };

  const valid = groups.filter(g => g.required).every(g => (selected[g.id] || []).length > 0);

  const handleConfirm = () => {
    const mods: { name: string; price: number }[] = [];
    Object.entries(selected).forEach(([gId, oIds]) => {
      const g = groups.find(x => x.id === gId);
      oIds.forEach(oId => { const o = g?.options.find(x => x.id === oId); if (o) mods.push({ name: o.name, price: o.price }); });
    });
    onConfirm(mods, notes || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 animate-fade-in" onClick={onCancel}>
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
          </div>
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-muted"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {groups.map(g => (
            <div key={g.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground">{g.name}</span>
                {g.required && <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded font-medium">Required</span>}
              </div>
              <div className="space-y-1.5">
                {g.options.map(o => {
                  const sel = (selected[g.id] || []).includes(o.id);
                  return (
                    <button key={o.id} onClick={() => toggle(g.id, o.id, g.multiSelect)}
                      className={cn("w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
                        sel ? "bg-primary/10 border-primary" : "bg-card border-border")}>
                      <span className="text-sm text-foreground">{o.name}</span>
                      <div className="flex items-center gap-2">
                        {o.price > 0 && <span className="text-xs text-muted-foreground">+${o.price.toFixed(2)}</span>}
                        {sel && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <span className="text-sm font-medium text-foreground mb-2 block">Notes</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions..."
              className="w-full h-16 px-3 py-2 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground border-0 focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        </div>
        <div className="p-4 border-t border-border">
          <Button variant="pay" size="xl" className="w-full" disabled={!valid} onClick={handleConfirm}>Add to Order</Button>
        </div>
      </div>
    </div>
  );
};
