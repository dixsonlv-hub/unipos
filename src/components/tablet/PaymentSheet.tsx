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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 animate-fade-in" onClick={onComplete}>
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center animate-slide-up" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-pos-pay/15 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-pos-pay" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">Payment Complete</h3>
          <p className="text-muted-foreground text-sm mb-1">${order.total.toFixed(2)} paid via {method}</p>
          {method === "cash" && changeDue > 0 && (
            <p className="text-lg font-semibold text-pos-pay">Change: ${changeDue.toFixed(2)}</p>
          )}
          <Button variant="pay" className="w-full mt-6" onClick={onComplete}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Payment</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount */}
        <div className="p-5 text-center border-b border-border">
          <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
          <p className="text-3xl font-bold text-foreground">${order.total.toFixed(2)}</p>
        </div>

        {/* Method Selection */}
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
                "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors",
                method === m.id
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <m.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Cash Keypad */}
        {method === "cash" && (
          <div className="p-5 space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Cash Received</p>
              <p className="text-2xl font-bold text-foreground">${cashAmount || "0.00"}</p>
              {numericCash >= order.total && (
                <p className="text-sm text-pos-pay font-medium mt-1">Change: ${changeDue.toFixed(2)}</p>
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
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      : "bg-muted text-foreground hover:bg-secondary"
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
            {/* Quick amounts */}
            <div className="flex gap-2">
              {[10, 20, 50, 100].map(amt => (
                <button
                  key={amt}
                  onClick={() => setCashAmount(amt.toFixed(2))}
                  className="flex-1 h-9 rounded-md bg-muted text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>
        )}

        {method === "card" && (
          <div className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Tap, insert, or swipe card</p>
            <p className="text-xs text-muted-foreground mt-1">Powered by Uniweb</p>
          </div>
        )}

        {method === "qr" && (
          <div className="p-8 text-center">
            <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-3 flex items-center justify-center">
              <QrCode className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground">Scan SGQR / PayNow</p>
          </div>
        )}

        {/* Pay Button */}
        <div className="p-5 border-t border-border">
          <Button
            variant="pay"
            size="xl"
            className="w-full"
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
