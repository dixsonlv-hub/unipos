import React from "react";
import { Minus, Plus, Trash2, Users, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Order, type Table } from "@/data/mock-data";

interface CheckPanelProps {
  order: Order | null;
  table?: Table;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPay: () => void;
}

export const CheckPanel: React.FC<CheckPanelProps> = ({ order, table, onUpdateQuantity, onRemoveItem, onPay }) => {
  if (!order) {
    return (
      <div className="w-80 bg-card border-l border-border flex flex-col items-center justify-center shrink-0">
        <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Select a table to start</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              {table ? `Table ${table.number}` : `${order.serviceMode}`}
            </h3>
            <span className="text-xs text-muted-foreground capitalize">{order.serviceMode}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {order.guestCount}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto pos-scrollbar p-3 space-y-1">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No items yet</p>
            <p className="text-xs mt-1">Add items from the menu</p>
          </div>
        ) : (
          order.items.map(item => (
            <div key={item.id} className="group flex gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-foreground leading-tight">{item.name}</span>
                  <span className="text-sm text-foreground font-medium ml-2 shrink-0">
                    ${((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
                {item.modifiers.length > 0 && (
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {item.modifiers.map(m => m.name).join(", ")}
                  </div>
                )}
                {item.notes && (
                  <div className="text-[11px] text-pos-occupied mt-0.5">📝 {item.notes}</div>
                )}
                {/* Qty controls */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-md bg-muted flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus className="h-3 w-3 text-foreground" />
                  </button>
                  <span className="text-xs font-medium text-foreground w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-md bg-muted flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Plus className="h-3 w-3 text-foreground" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all ml-auto"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals & Pay */}
      <div className="border-t border-border p-4 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Service Charge (10%)</span>
          <span>${order.serviceCharge.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>GST (9%)</span>
          <span>${order.gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
        <Button
          variant="pay"
          size="xl"
          className="w-full mt-2"
          disabled={order.items.length === 0}
          onClick={onPay}
        >
          Pay ${order.total.toFixed(2)}
        </Button>
      </div>
    </div>
  );
};
