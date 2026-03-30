import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, ArrowRight, ShoppingCart, X, Minus, Plus, Trash2, CheckCircle2, CreditCard, QrCode, Loader2, ChevronLeft } from "lucide-react";
import { tables } from "@/data/mock-data";
import { useSettings } from "@/state/settings-store";
import { addPoints, type Customer } from "@/state/customer-store";
import { QRMemberAuth } from "@/components/qr/QRMemberAuth";
import { QRMenuBrowser, type QRCartItem } from "@/components/qr/QRMenuBrowser";

type Step = "table" | "auth" | "menu" | "cart" | "payment" | "complete";

function calcTotals(items: QRCartItem[]) {
  const subtotal = items.reduce((s, i) => s + (i.price + i.modifiers.reduce((a, m) => a + m.price, 0)) * i.quantity, 0);
  const svc = Math.round(subtotal * 10) / 100;
  const gst = Math.round((subtotal + svc) * 9) / 100;
  return { subtotal, svc, gst, total: Math.round((subtotal + svc + gst) * 100) / 100 };
}

const QROrdering: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");
  const settings = useSettings();

  const [step, setStep] = useState<Step>(tableParam ? "auth" : "table");
  const [tableNum, setTableNum] = useState(tableParam || "");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<QRCartItem[]>([]);
  const [payMethod, setPayMethod] = useState<"card" | "qr">("card");
  const [processing, setProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const totals = useMemo(() => calcTotals(cart), [cart]);
  const validTable = tables.find(t => t.number === tableNum || t.id === tableNum);

  const handleTableConfirm = () => {
    if (validTable || tableNum.trim()) {
      setStep("auth");
    }
  };

  const handleAuthComplete = (c: Customer | null) => {
    setCustomer(c);
    setStep("menu");
  };

  const handleAddToCart = (item: QRCartItem) => {
    setCart(prev => [...prev, item]);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const handleRemove = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handlePay = async (method: "now" | "later") => {
    if (method === "later") {
      // Pay at counter
      const num = `QR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      setOrderNumber(num);
      if (customer) addPoints(customer.id, Math.floor(totals.total), `QR Order #${num}`);
      setStep("complete");
      return;
    }
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    const num = `QR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setOrderNumber(num);
    if (customer) addPoints(customer.id, Math.floor(totals.total), `QR Order #${num}`);
    setProcessing(false);
    setStep("complete");
  };

  // Table selection
  if (step === "table") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground text-center mb-2">Enter Table Number</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">Please enter the number shown on your table</p>
          <input value={tableNum} onChange={e => setTableNum(e.target.value)}
            placeholder="e.g. T5"
            className="w-full px-4 py-4 rounded-2xl border border-border bg-card text-2xl text-center font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-ring mb-4" />
          <button onClick={handleTableConfirm} disabled={!tableNum.trim()}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold disabled:opacity-40 flex items-center justify-center gap-2">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Auth
  if (step === "auth") {
    return <QRMemberAuth onComplete={handleAuthComplete} />;
  }

  // Cart view
  if (step === "cart") {
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={() => setStep("menu")} className="p-2 rounded-xl hover:bg-accent">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Your Order ({cartCount})</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="p-4 rounded-2xl border border-border">
              <div className="flex justify-between mb-1">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <span className="font-bold text-sm">
                  ${((item.price + item.modifiers.reduce((a, m) => a + m.price, 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
              {item.modifiers.length > 0 && (
                <p className="text-xs text-muted-foreground">{item.modifiers.map(m => m.name).join(", ")}</p>
              )}
              {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => item.quantity === 1 ? handleRemove(item.id) : handleUpdateQty(item.id, -1)}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center">
                  {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3" />}
                </button>
                <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                <button onClick={() => handleUpdateQty(item.id, 1)}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Service 10%</span><span>${totals.svc.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">GST 9%</span><span>${totals.gst.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
            <span>Total</span><span>${totals.total.toFixed(2)}</span>
          </div>
          {customer && (
            <p className="text-xs text-primary text-center">🎉 You'll earn {Math.floor(totals.total)} points</p>
          )}
          <div className="space-y-2 mt-3">
            {(settings.qrPaymentMode === "pre-pay" || settings.qrPaymentMode === "choice") && (
              <button onClick={() => setStep("payment")}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
                Pay Now — ${totals.total.toFixed(2)}
              </button>
            )}
            {(settings.qrPaymentMode === "post-pay" || settings.qrPaymentMode === "choice") && (
              <button onClick={() => handlePay("later")}
                className="w-full py-3.5 rounded-2xl border-2 border-primary text-primary font-bold text-sm">
                Pay at Counter
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Payment
  if (step === "payment") {
    if (processing) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <p className="text-lg font-semibold">Processing Payment...</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={() => setStep("cart")} className="p-2 rounded-xl hover:bg-accent">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Payment</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-sm text-muted-foreground mb-2">Amount Due</p>
          <p className="text-4xl font-bold mb-10">${totals.total.toFixed(2)}</p>
          <div className="flex gap-4 mb-10 w-full max-w-xs">
            <button onClick={() => setPayMethod("card")}
              className={`flex-1 p-6 rounded-2xl border-2 text-center ${payMethod === "card" ? "border-primary bg-primary/5" : "border-border"}`}>
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Card</p>
            </button>
            <button onClick={() => setPayMethod("qr")}
              className={`flex-1 p-6 rounded-2xl border-2 text-center ${payMethod === "qr" ? "border-primary bg-primary/5" : "border-border"}`}>
              <QrCode className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">QR Pay</p>
            </button>
          </div>
          <button onClick={() => handlePay("now")}
            className="w-full max-w-xs py-4 rounded-2xl bg-primary text-primary-foreground font-bold">
            Confirm Payment
          </button>
        </div>
      </div>
    );
  }

  // Complete
  if (step === "complete") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <CheckCircle2 className="w-16 h-16 text-[hsl(var(--pos-pay))] mb-6" />
        <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
        <p className="text-muted-foreground mb-6">Table {tableNum}</p>
        <div className="px-8 py-6 rounded-2xl bg-primary/5 border-2 border-primary mb-8">
          <p className="text-sm text-muted-foreground text-center mb-1">Order Number</p>
          <p className="text-3xl font-black text-primary text-center">{orderNumber}</p>
        </div>
        {customer && (
          <p className="text-sm text-primary mb-8">✨ {Math.floor(totals.total)} points earned!</p>
        )}
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Your order has been sent to the kitchen. You can close this page now.
        </p>
      </div>
    );
  }

  // Menu step
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Table {tableNum}</p>
          {customer && <p className="text-xs text-primary font-medium">Hi, {customer.name} 👋</p>}
        </div>
        <button onClick={() => setStep("cart")} className="relative p-2">
          <ShoppingCart className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>
      <QRMenuBrowser cart={cart} onAddToCart={handleAddToCart} onOpenCart={() => setStep("cart")} />
    </div>
  );
};

export default QROrdering;
