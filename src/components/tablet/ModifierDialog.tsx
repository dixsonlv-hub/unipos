import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type MenuItem, type ModifierGroup } from "@/data/mock-data";

interface ModifierDialogProps {
  item: MenuItem;
  groups: ModifierGroup[];
  onConfirm: (modifiers: { name: string; price: number }[], notes?: string) => void;
  onCancel: () => void;
}

export const ModifierDialog: React.FC<ModifierDialogProps> = ({ item, groups, onConfirm, onCancel }) => {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");

  const toggleOption = (groupId: string, optionId: string, multiSelect: boolean) => {
    setSelected(prev => {
      const current = prev[groupId] || [];
      if (multiSelect) {
        return { ...prev, [groupId]: current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId] };
      }
      return { ...prev, [groupId]: [optionId] };
    });
  };

  const isValid = groups.filter(g => g.required).every(g => (selected[g.id] || []).length > 0);

  const handleConfirm = () => {
    const modifiers: { name: string; price: number }[] = [];
    Object.entries(selected).forEach(([groupId, optionIds]) => {
      const group = groups.find(g => g.id === groupId);
      optionIds.forEach(optId => {
        const opt = group?.options.find(o => o.id === optId);
        if (opt) modifiers.push({ name: opt.name, price: opt.price });
      });
    });
    onConfirm(modifiers, notes || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={onCancel}>
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 animate-slide-up border-1.5 border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground text-[13px]">{item.name}</h3>
            <p className="text-[13px] text-primary font-semibold font-mono">${item.price.toFixed(2)}</p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto pos-scrollbar space-y-5">
          {groups.map(group => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[13px] font-semibold text-foreground">{group.name}</span>
                {group.required && (
                  <span className="text-[10px] font-bold text-destructive bg-status-red-light px-1.5 py-0.5 rounded">Required</span>
                )}
                <span className="text-[10px] text-muted-foreground">{group.multiSelect ? "Select multiple" : "Select one"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {group.options.map(opt => {
                  const isSelected = (selected[group.id] || []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(group.id, opt.id, group.multiSelect)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all border-1.5",
                        isSelected
                          ? "bg-status-blue-light border-primary text-foreground"
                          : "bg-card border-border text-foreground hover:bg-accent"
                      )}
                    >
                      <span>{opt.name}</span>
                      <span className="flex items-center gap-1">
                        {opt.price > 0 && <span className="text-[11px] text-muted-foreground font-mono">+${opt.price.toFixed(2)}</span>}
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <span className="text-[13px] font-semibold text-foreground mb-2 block">Special Notes</span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. No onion, extra chilli..."
              className="w-full h-16 px-3 py-2 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 resize-none transition-all"
            />
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-lg">Cancel</Button>
          <Button onClick={handleConfirm} disabled={!isValid} className="flex-1 rounded-lg">Add to Order</Button>
        </div>
      </div>
    </div>
  );
};
