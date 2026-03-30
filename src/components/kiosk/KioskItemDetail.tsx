import React, { useState } from "react";
import { X, Check, Minus, Plus } from "lucide-react";
import { type MenuItem, modifierGroups, menuItems } from "@/data/mock-data";

interface Props {
  item: MenuItem;
  lang: "en" | "zh";
  onAdd: (item: MenuItem, qty: number, modifiers: { name: string; price: number }[], notes: string, comboItems?: { name: string; groupName: string }[]) => void;
  onClose: () => void;
}

export const KioskItemDetail: React.FC<Props> = ({ item, lang, onAdd, onClose }) => {
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [comboSel, setComboSel] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");

  const groups = modifierGroups.filter(g => item.modifierGroupIds?.includes(g.id));

  const toggle = (gId: string, oId: string, multi: boolean) => {
    setSelected(prev => {
      const cur = prev[gId] || [];
      if (multi) return { ...prev, [gId]: cur.includes(oId) ? cur.filter(x => x !== oId) : [...cur, oId] };
      return { ...prev, [gId]: cur.includes(oId) ? [] : [oId] };
    });
  };

  const toggleCombo = (gId: string, itemId: string, max: number) => {
    setComboSel(prev => {
      const cur = prev[gId] || [];
      if (cur.includes(itemId)) return { ...prev, [gId]: cur.filter(x => x !== itemId) };
      if (cur.length >= max) return prev;
      return { ...prev, [gId]: [...cur, itemId] };
    });
  };

  const modValid = groups.filter(g => g.required).every(g => (selected[g.id]?.length || 0) > 0);
  const comboValid = !item.comboGroups || item.comboGroups.every(g => (comboSel[g.id]?.length || 0) === (g.maxSelect || g.itemIds.length));
  const canAdd = modValid && comboValid;

  const handleAdd = () => {
    const mods = groups.flatMap(g => (selected[g.id] || []).map(oId => {
      const opt = g.options.find(o => o.id === oId)!;
      return { name: opt.name, price: opt.price };
    }));
    let cItems: { name: string; groupName: string }[] | undefined;
    if (item.comboGroups) {
      cItems = item.comboGroups.flatMap(g => (comboSel[g.id] || []).map(iId => {
        const mi = menuItems.find(m => m.id === iId);
        return { name: mi?.name || iId, groupName: g.name };
      }));
    }
    onAdd(item, qty, mods, notes, cItems);
  };

  const modTotal = groups.reduce((s, g) => s + (selected[g.id] || []).reduce((a, oId) => {
    const o = g.options.find(x => x.id === oId);
    return a + (o?.price || 0);
  }, 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8" onClick={onClose}>
      <div className="bg-card rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {item.image && (
          <div className="aspect-[16/9] overflow-hidden rounded-t-3xl">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {lang === "zh" && item.nameZh ? item.nameZh : item.name}
              </h2>
              {item.description && <p className="text-lg text-muted-foreground mt-2">{item.description}</p>}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent"><X className="w-7 h-7" /></button>
          </div>

          {/* Combo groups */}
          {item.comboGroups?.map(g => (
            <div key={g.id} className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{g.name} <span className="text-base text-muted-foreground">({lang === "en" ? "Select" : "选择"} {g.maxSelect || g.itemIds.length})</span></h3>
              <div className="grid grid-cols-2 gap-3">
                {g.itemIds.map(iId => {
                  const mi = menuItems.find(m => m.id === iId);
                  if (!mi) return null;
                  const isSel = (comboSel[g.id] || []).includes(iId);
                  return (
                    <button key={iId} onClick={() => toggleCombo(g.id, iId, g.maxSelect || g.itemIds.length)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${isSel ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">{lang === "zh" && mi.nameZh ? mi.nameZh : mi.name}</span>
                        {isSel && <Check className="w-5 h-5 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Modifier groups */}
          {groups.map(g => (
            <div key={g.id} className="mb-6">
              <h3 className="text-xl font-semibold mb-3">
                {g.name} {g.required && <span className="text-sm text-destructive font-normal">({lang === "en" ? "Required" : "必选"})</span>}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {g.options.map(o => {
                  const isSel = (selected[g.id] || []).includes(o.id);
                  return (
                    <button key={o.id} onClick={() => toggle(g.id, o.id, g.multiSelect)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${isSel ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{o.name}</span>
                        <div className="flex items-center gap-2">
                          {o.price > 0 && <span className="text-base text-muted-foreground">+${o.price.toFixed(2)}</span>}
                          {isSel && <Check className="w-5 h-5 text-primary" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes */}
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder={lang === "en" ? "Special instructions..." : "特别备注..."}
            className="w-full p-4 rounded-2xl border border-border bg-background text-lg resize-none h-24 mb-6"
          />

          {/* Quantity + Add */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center hover:bg-accent">
                <Minus className="w-6 h-6" />
              </button>
              <span className="text-3xl font-bold w-12 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center hover:bg-accent">
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className="px-10 py-5 rounded-2xl bg-primary text-primary-foreground text-xl font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {lang === "en" ? "Add to Order" : "加入订单"} — ${((item.price + modTotal) * qty).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
