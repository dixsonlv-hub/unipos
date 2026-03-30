import React from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";

export interface KioskCartItem {
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
  items: KioskCartItem[];
  lang: "en" | "zh";
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onCheckout: () => void;
}

function calcTotals(items: KioskCartItem[]) {
  const subtotal = items.reduce((s, i) => s + (i.price + i.modifiers.reduce((a, m) => a + m.price, 0)) * i.quantity, 0);
  const svc = Math.round(subtotal * 10) / 100;
  const gst = Math.round((subtotal + svc) * 9) / 100;
  return { subtotal, svc, gst, total: Math.round((subtotal + svc + gst) * 100) / 100 };
}

export const KioskCart: React.FC<Props> = ({ items, lang, onUpdateQty, onRemove, onClose, onCheckout }) => {
  const { subtotal, svc, gst, total } = calcTotals(items);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-xl bg-card h-full flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold">{lang === "en" ? "Your Order" : "您的订单"} ({count})</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-xl text-muted-foreground py-20">
              {lang === "en" ? "Your cart is empty" : "购物车为空"}
            </div>
          ) : items.map(item => (
            <div key={item.id} className="p-5 rounded-2xl border border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.modifiers.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.modifiers.map(m => m.name).join(", ")}
                    </p>
                  )}
                  {item.comboItems && item.comboItems.length > 0 && (
                    <p className="text-sm text-primary mt-1">
                      {item.comboItems.map(c => c.name).join(", ")}
                    </p>
                  )}
                  {item.notes && <p className="text-sm text-muted-foreground italic mt-1">{item.notes}</p>}
                </div>
                <p className="text-lg font-bold">
                  ${((item.price + item.modifiers.reduce((a, m) => a + m.price, 0)) * item.quantity).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => item.quantity === 1 ? onRemove(item.id) : onUpdateQty(item.id, -1)}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-accent">
                  {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4" />}
                </button>
                <span className="text-xl font-bold w-8 text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.id, 1)}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-accent">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border space-y-3">
            <div className="flex justify-between text-lg"><span className="text-muted-foreground">{lang === "en" ? "Subtotal" : "小计"}</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-base"><span className="text-muted-foreground">{lang === "en" ? "Service Charge 10%" : "服务费 10%"}</span><span>${svc.toFixed(2)}</span></div>
            <div className="flex justify-between text-base"><span className="text-muted-foreground">{lang === "en" ? "GST 9%" : "消费税 9%"}</span><span>${gst.toFixed(2)}</span></div>
            <div className="flex justify-between text-2xl font-bold pt-2 border-t border-border">
              <span>{lang === "en" ? "Total" : "合计"}</span><span>${total.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout}
              className="w-full py-5 rounded-2xl bg-primary text-primary-foreground text-xl font-bold hover:opacity-90 transition-opacity mt-4">
              {lang === "en" ? "Proceed to Payment" : "前往支付"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
