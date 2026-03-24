import React, { useState } from "react";
import { X, CreditCard, Banknote, QrCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Order } from "@/data/mock-data";

interface PaymentSheetProps {
  order: Order;
  onClose: () => void;
  onComplete: () => void;
}

type PaymentMethod = "card" | "cash" | "qr";

export const PaymentSheet: React.FC<PaymentSheetProps> = ({ order, onClose, onComplete }) => {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cashAmount, setCashAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const numericCash = parseFloat(cashAmount) || 0;
  const changeDue = method === "cash" ? Math.max(0, numericCash - order.total) : 0;

  const handleKeypad = (val: string) => {
    if (val === "C") { setCashAmount(""); return; }
    if (val === "." && cashAmount.includes(".")) return;
    setCashAmount(prev => prev + val);
  };

  const handlePay = async () => {
    if (method === "cash" && numericCash < order.total) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsProcessing(false);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={onComplete}>
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center animate-slide-up border-1.5 border-border" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-2xl bg-status-green-light flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-status-green" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">Payment Complete</h3>
          <p className="text-muted-foreground text-[13px] mb-1">${order.total.toFixed(2)} paid via {method}</p>
          {method === "cash" && changeDue > 0 && (
            <p className="text-lg font-bold text-status-green font-mono">Change: ${changeDue.toFixed(2)}</p>
          )}
          <Button variant="pay" className="w-full mt-6 rounded-lg" onClick={onComplete}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up border-1.5 border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-lg font-bold text-foreground tracking-tight">Payment</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 text-center border-b border-border">
          <p className="section-label mb-1">Amount Due</p>
          <p className="text-3xl font-bold text-foreground tracking-tighter font-mono">${order.total.toFixed(2)}</p>
        </div>

        <div className="flex gap-2 p-5 border-b border-border">
          {([
            { id: "card" as const, icon: CreditCard, label: "Card" },
            { id: "cash" as const, icon: Banknote, label: "Cash" },
            { id: "qr" as const, icon: QrCode, label: "SGQR" },
          ]).map(m => (
            <button
              key={m.id}
              onClick={() => { setMethod(m.id); setCashAmount(""); }}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-1.5 transition-all",
                method === m.id
                  ? "bg-status-blue-light border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-accent"
              )}
            >
              <m.icon className="h-5 w-5" />
              <span className="text-[11px] font-semibold">{m.label}</span>
            </button>
          ))}
        </div>

        {method === "cash" && (
          <div className="p-5 space-y-3">
            <div className="text-center">
              <p className="section-label mb-1">Cash Received</p>
              <p className="text-2xl font-bold text-foreground font-mono">${cashAmount || "0.00"}</p>
              {numericCash >= order.total && (
                <p className="text-[13px] text-status-green font-semibold mt-1 font-mono">Change: ${changeDue.toFixed(2)}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9",".","0","C"].map(key => (
                <button
                  key={key}
                  onClick={() => handleKeypad(key)}
                  className={cn(
                    "h-12 rounded-lg text-lg font-medium transition-colors",
                    key === "C"
                      ? "bg-status-red-light text-destructive hover:bg-destructive/15"
                      : "bg-accent text-foreground hover:bg-secondary"
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[10, 20, 50, 100].map(amt => (
                <button
                  key={amt}
                  onClick={() => setCashAmount(amt.toFixed(2))}
                  className="flex-1 h-9 rounded-lg bg-accent text-[13px] font-semibold text-foreground hover:bg-secondary transition-colors font-mono"
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>
        )}

        {method === "card" && (
          <div className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">Tap, insert, or swipe card</p>
            <p className="text-[11px] text-muted-foreground mt-1">Powered by Uniweb</p>
          </div>
        )}

        {method === "qr" && (
          <div className="p-8 text-center">
            <div className="w-32 h-32 bg-accent rounded-xl mx-auto mb-3 flex items-center justify-center">
              <QrCode className="h-16 w-16 text-muted-foreground/20" />
            </div>
            <p className="text-[13px] text-muted-foreground">Scan SGQR / PayNow</p>
          </div>
        )}

        <div className="p-5 border-t border-border">
          <Button
            variant="pay"
            size="xl"
            className="w-full rounded-lg"
            disabled={isProcessing || (method === "cash" && numericCash < order.total)}
            onClick={handlePay}
          >
            {isProcessing ? "Processing..." : `Confirm Payment $${order.total.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
