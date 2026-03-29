import React, { useState } from "react";
import { Plus, Pencil, Trash2, Tag, Clock, Calendar, AlertTriangle, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePricingRules, addPricingRule, updatePricingRule, deletePricingRule, detectConflicts, type PricingRule } from "@/state/pricing-store";

const typeLabels: Record<string, { label: string; color: string }> = {
  "time-based": { label: "Time-Based", color: "bg-status-blue-light text-primary" },
  category: { label: "Category", color: "bg-status-amber-light text-status-amber" },
  item: { label: "Item", color: "bg-status-green-light text-status-green" },
  "happy-hour": { label: "Happy Hour", color: "bg-[hsl(280,60%,90%)] text-[hsl(280,60%,40%)]" },
};

const daysOfWeekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyRule: Omit<PricingRule, "id" | "createdAt"> = {
  name: "", type: "time-based", discountType: "percentage", discountValue: 10,
  targetCategory: "", startTime: "", endTime: "", daysOfWeek: [],
  active: true, priority: 1,
};

const AdminPromotions: React.FC = () => {
  const rules = usePricingRules();
  const [editing, setEditing] = useState<PricingRule | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleCreate = () => {
    const newRule: PricingRule = { ...emptyRule, id: `pr-${Date.now()}`, createdAt: new Date().toISOString() };
    setEditing(newRule);
    setIsNew(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (isNew) addPricingRule(editing);
    else updatePricingRule(editing.id, editing);
    setEditing(null);
    setIsNew(false);
  };

  const conflicts = editing ? detectConflicts(editing) : [];

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Promotions & Pricing</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{rules.length} pricing rules · {rules.filter(r => r.active).length} active</p>
        </div>
        <Button className="rounded-lg" onClick={handleCreate}><Plus className="h-4 w-4 mr-1.5" />Add Rule</Button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="uniweb-card p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-foreground">{isNew ? "New Pricing Rule" : "Edit Rule"}</h3>
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-[13px] text-muted-foreground hover:text-foreground">Cancel</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label mb-1.5 block">Rule Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10" />
            </div>
            <div>
              <label className="section-label mb-1.5 block">Type</label>
              <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value as PricingRule["type"] })}
                className="w-full h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground focus:outline-none focus:border-primary">
                <option value="time-based">Time-Based</option>
                <option value="category">Category</option>
                <option value="happy-hour">Happy Hour</option>
                <option value="item">Item-Specific</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="section-label mb-1.5 block">Discount Type</label>
              <select value={editing.discountType} onChange={e => setEditing({ ...editing, discountType: e.target.value as "percentage" | "fixed" })}
                className="w-full h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground focus:outline-none focus:border-primary">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="section-label mb-1.5 block">Discount Value</label>
              <input type="number" value={editing.discountValue} onChange={e => setEditing({ ...editing, discountValue: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 font-mono" />
            </div>
            <div>
              <label className="section-label mb-1.5 block">Target Category</label>
              <input value={editing.targetCategory || ""} onChange={e => setEditing({ ...editing, targetCategory: e.target.value })}
                placeholder="e.g. Alcohol, Mains..."
                className="w-full h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label mb-1.5 block">Start Time</label>
              <input type="time" value={editing.startTime || ""} onChange={e => setEditing({ ...editing, startTime: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-mono" />
            </div>
            <div>
              <label className="section-label mb-1.5 block">End Time</label>
              <input type="time" value={editing.endTime || ""} onChange={e => setEditing({ ...editing, endTime: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-mono" />
            </div>
          </div>

          <div>
            <label className="section-label mb-1.5 block">Active Days</label>
            <div className="flex gap-2">
              {daysOfWeekLabels.map((day, i) => (
                <button key={day} onClick={() => {
                  const current = editing.daysOfWeek || [];
                  setEditing({ ...editing, daysOfWeek: current.includes(i) ? current.filter(d => d !== i) : [...current, i] });
                }}
                  className={cn("w-10 h-10 rounded-lg text-xs font-semibold transition-colors",
                    editing.daysOfWeek?.includes(i) ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:bg-secondary"
                  )}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-status-amber-light border border-status-amber/20">
              <AlertTriangle className="h-4 w-4 text-status-amber mt-0.5 shrink-0" />
              <div className="text-[12px] text-foreground">
                <strong>Potential conflict</strong> with: {conflicts.map(c => c.name).join(", ")}
              </div>
            </div>
          )}

          <Button onClick={handleSave} className="rounded-lg">Save Rule</Button>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map(rule => {
          const tl = typeLabels[rule.type];
          return (
            <div key={rule.id} className={cn("uniweb-card p-5 transition-all", !rule.active && "opacity-60")}>
              <div className="flex items-center gap-4">
                <button onClick={() => updatePricingRule(rule.id, { active: !rule.active })} className="text-muted-foreground hover:text-foreground">
                  {rule.active ? <ToggleRight className="h-5 w-5 text-status-green" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-semibold text-foreground">{rule.name || "Untitled Rule"}</h3>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", tl?.color)}>{tl?.label}</span>
                    {rule.active && <span className="status-badge bg-status-green-light text-status-green"><span className="status-dot bg-status-green" />Active</span>}
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                    <span className="font-mono">{rule.discountType === "percentage" ? `${rule.discountValue}% off` : `$${rule.discountValue} off`}</span>
                    {rule.targetCategory && <span>→ {rule.targetCategory}</span>}
                    {rule.startTime && rule.endTime && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rule.startTime}–{rule.endTime}</span>
                    )}
                    {rule.daysOfWeek && rule.daysOfWeek.length > 0 && rule.daysOfWeek.length < 7 && (
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{rule.daysOfWeek.map(d => daysOfWeekLabels[d]).join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditing(rule); setIsNew(false); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deletePricingRule(rule.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {rules.length === 0 && (
          <div className="uniweb-card p-12 text-center">
            <Tag className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">No pricing rules yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotions;
