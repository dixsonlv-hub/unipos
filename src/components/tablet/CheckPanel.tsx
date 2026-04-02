import React, { useState } from "react";
import { Minus, Plus, Trash2, Users, UtensilsCrossed, Percent, TicketPercent, SplitSquareVertical, Star, Gift, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Order, type Table } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";
import { type Customer, getAvailableCoupons, applyCoupon, type Coupon } from "@/state/customer-store";

interface CheckPanelProps {
  order: Order | null;
  table?: Table;
  customer?: Customer | null;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPay: () => void;
  onApplyDiscount?: (amount: number) => void;
  onCancelOrder?: () => void;
  canCancel?: boolean;
}

export const CheckPanel: React.FC<CheckPanelProps> = ({ order, table, customer, onUpdateQuantity, onRemoveItem, onPay, onApplyDiscount, onCancelOrder, canCancel }) => {
  const { t } = useLanguage();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [showSplit, setShowSplit] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [pointsToUse, setPointsToUse] = useState(0);

  if (!order) {
    return (
      <div className="w-80 bg-card border-l border-border flex flex-col items-center justify-center shrink-0">
        <UtensilsCrossed className="h-10 w-10 text-muted-foreground/20 mb-3" />
        <p className="text-[13px] text-muted-foreground">{t("select_table_start")}</p>
      </div>
    );
  }

  const couponDiscount = selectedCoupon ? applyCoupon(selectedCoupon, order.subtotal) : 0;
  const pointsDiscount = pointsToUse / 10;
  const discountAmount = manualDiscount + (promoApplied ? order.subtotal * 0.1 : 0) + couponDiscount + pointsDiscount;
  const adjustedSubtotal = Math.max(0, order.subtotal - discountAmount);
  const serviceCharge = Math.round(adjustedSubtotal * 0.1 * 100) / 100;
  const gst = Math.round((adjustedSubtotal + serviceCharge) * 0.09 * 100) / 100;
  const total = Math.round((adjustedSubtotal + serviceCharge + gst) * 100) / 100;
  const splitAmount = showSplit ? Math.round((total / splitCount) * 100) / 100 : 0;

  const availableCoupons = customer ? getAvailableCoupons(customer) : [];

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "welcome10" || promoCode.toLowerCase() === "vip10") {
      setPromoApplied(true);
    }
  };

  const handlePresetDiscount = (type: "10%" | "20%" | "$5" | "$10") => {
    if (type === "10%") setManualDiscount(Math.round(order.subtotal * 0.1 * 100) / 100);
    else if (type === "20%") setManualDiscount(Math.round(order.subtotal * 0.2 * 100) / 100);
    else if (type === "$5") setManualDiscount(5);
    else if (type === "$10") setManualDiscount(10);
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-[13px]">
              {table ? `${t("tables")} ${table.number}` : `${order.serviceMode}`}
            </h3>
            <span className="text-[11px] text-muted-foreground capitalize">{order.serviceMode}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {order.guestCount}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto pos-scrollbar p-3 space-y-1">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-[13px]">{t("no_items")}</p>
            <p className="text-[11px] mt-1">{t("add_from_menu")}</p>
          </div>
        ) : (
          order.items.map(item => (
            <div key={item.id} className="group flex gap-2 p-2 rounded-md hover:bg-accent transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <span className="text-[13px] font-medium text-foreground leading-tight">{item.name}</span>
                  <span className="text-[13px] text-foreground font-semibold ml-2 shrink-0 font-mono">
                    ${((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
                {item.modifiers.length > 0 && (
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {item.modifiers.map(m => m.name).join(", ")}
                  </div>
                )}
                {item.notes && (
                  <div className="text-[11px] text-status-amber mt-0.5">📝 {item.notes}</div>
                )}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-md bg-accent flex items-center justify-center hover:bg-secondary transition-colors">
                    <Minus className="h-3 w-3 text-foreground" />
                  </button>
                  <span className="text-xs font-semibold text-foreground w-5 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-md bg-accent flex items-center justify-center hover:bg-secondary transition-colors">
                    <Plus className="h-3 w-3 text-foreground" />
                  </button>
                  <button onClick={() => onRemoveItem(item.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all ml-auto">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Member Benefits */}
      {customer && order.items.length > 0 && (
        <div className="px-3 py-2 border-t border-border space-y-2">
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-primary" />
            <span className="text-[11px] font-bold text-foreground">{customer.name}</span>
            <span className="ml-auto text-[10px] font-semibold text-primary capitalize">{customer.tier} · {customer.points} pts</span>
          </div>
          {/* Points redemption */}
          {customer.points >= 10 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground shrink-0">Use pts:</span>
              {[100, 200, 500].filter(p => p <= customer.points).map(pts => (
                <button key={pts} onClick={() => setPointsToUse(pointsToUse === pts ? 0 : pts)}
                  className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors",
                    pointsToUse === pts
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-muted-foreground hover:bg-secondary"
                  )}>
                  {pts}
                </button>
              ))}
              {pointsToUse > 0 && (
                <span className="ml-auto text-[10px] font-bold text-primary">-${(pointsToUse / 10).toFixed(2)}</span>
              )}
            </div>
          )}
          {/* Coupons */}
          {availableCoupons.length > 0 && (
            <div className="space-y-1">
              {availableCoupons.slice(0, 3).map(c => {
                const isSelected = selectedCoupon?.id === c.id;
                const eligible = order.subtotal >= c.minSpend;
                return (
                  <button key={c.id} disabled={!eligible}
                    onClick={() => setSelectedCoupon(isSelected ? null : c)}
                    className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors",
                      isSelected ? "bg-primary/10 border border-primary" : eligible ? "bg-accent hover:bg-secondary border border-transparent" : "bg-muted/30 opacity-50 border border-transparent"
                    )}>
                    <TicketPercent className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-[10px] font-medium text-foreground truncate flex-1">{c.label}</span>
                    {eligible && (
                      <span className="text-[10px] font-bold text-primary shrink-0">
                        {isSelected ? "✓" : `-$${applyCoupon(c, order.subtotal).toFixed(2)}`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Discount Section */}
      {order.items.length > 0 && (
        <div className="px-4 py-2 border-t border-border space-y-2">
          {/* Promo Code */}
          <div className="flex gap-1.5">
            <input placeholder={t("promo_code")} value={promoCode} onChange={e => setPromoCode(e.target.value)}
              className="flex-1 h-7 px-2.5 rounded-md bg-background border-1.5 border-border text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
            <button onClick={handleApplyPromo}
              className={cn("px-2.5 h-7 rounded-md text-[10px] font-semibold transition-colors",
                promoApplied ? "bg-status-green-light text-status-green" : "bg-accent text-muted-foreground hover:bg-secondary"
              )}>
              {promoApplied ? "✓" : t("apply")}
            </button>
          </div>
          {/* Preset Discounts */}
          <div className="flex gap-1">
            {(["10%", "20%", "$5", "$10"] as const).map(d => (
              <button key={d} onClick={() => handlePresetDiscount(d)}
                className={cn("flex-1 h-6 rounded-md text-[10px] font-semibold transition-colors",
                  (d === "10%" && manualDiscount === Math.round(order.subtotal * 0.1 * 100) / 100) ||
                  (d === "20%" && manualDiscount === Math.round(order.subtotal * 0.2 * 100) / 100) ||
                  (d === "$5" && manualDiscount === 5) ||
                  (d === "$10" && manualDiscount === 10)
                    ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:bg-secondary"
                )}>
                {d}
              </button>
            ))}
            {manualDiscount > 0 && (
              <button onClick={() => setManualDiscount(0)} className="h-6 px-2 rounded-md text-[10px] font-semibold bg-status-red-light text-destructive">✕</button>
            )}
          </div>
          {/* Split Bill */}
          <button onClick={() => setShowSplit(!showSplit)} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground">
            <SplitSquareVertical className="h-3 w-3" />{t("split_bill")}
          </button>
          {showSplit && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">{t("split_into")}</span>
              {[2, 3, 4].map(n => (
                <button key={n} onClick={() => setSplitCount(n)}
                  className={cn("w-6 h-6 rounded-md text-xs font-bold",
                    splitCount === n ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
                  )}>{n}</button>
              ))}
              <span className="text-[11px] font-mono text-foreground ml-auto">${splitAmount.toFixed(2)} ea</span>
            </div>
          )}
        </div>
      )}

      {/* Totals & Pay */}
      <div className="border-t border-border p-4 space-y-2">
        <div className="flex justify-between text-[13px] text-muted-foreground">
          <span>{t("subtotal")}</span>
          <span className="font-mono">${order.subtotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-[13px] text-status-green">
            <span>{t("discount")}</span>
            <span className="font-mono">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-[13px] text-muted-foreground">
          <span>{t("service_charge")} (10%)</span>
          <span className="font-mono">${serviceCharge.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[13px] text-muted-foreground">
          <span>{t("gst")}</span>
          <span className="font-mono">${gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
          <span>{t("total")}</span>
          <span className="font-mono">${total.toFixed(2)}</span>
        </div>
        {customer && (
          <p className="text-[10px] text-primary text-center">🎉 Earn {Math.floor(total)} pts on this order</p>
        )}
        {canCancel && onCancelOrder && (
          <Button variant="destructive" size="sm" className="w-full mt-2 rounded-lg text-xs gap-1.5" onClick={onCancelOrder}>
            <XCircle className="h-3.5 w-3.5" />Cancel Order
          </Button>
        )}
        <Button variant="pay" size="xl" className="w-full mt-2 rounded-lg" disabled={order.items.length === 0} onClick={onPay}>
          {t("pay")} ${total.toFixed(2)}
        </Button>
      </div>
    </div>
  );
};