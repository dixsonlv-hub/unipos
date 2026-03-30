import React, { useState } from "react";
import { CreditCard, QrCode, Loader2 } from "lucide-react";

interface Props {
  total: number;
  lang: "en" | "zh";
  onComplete: (method: string) => void;
  onBack: () => void;
}

export const KioskPayment: React.FC<Props> = ({ total, lang, onComplete, onBack }) => {
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<"card" | "qr">("card");

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    onComplete(method === "card" ? "Card" : "QR Pay");
  };

  if (processing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-20 h-20 text-primary animate-spin mb-8" />
        <p className="text-3xl font-semibold text-foreground">
          {lang === "en" ? "Processing Payment..." : "支付处理中..."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="p-8 border-b border-border">
        <button onClick={onBack} className="text-xl text-muted-foreground hover:text-foreground mb-4">
          ← {lang === "en" ? "Back" : "返回"}
        </button>
        <h1 className="text-4xl font-bold text-foreground">
          {lang === "en" ? "Payment" : "支付"}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <p className="text-2xl text-muted-foreground mb-3">
          {lang === "en" ? "Amount Due" : "应付金额"}
        </p>
        <p className="text-6xl font-bold text-foreground mb-16">${total.toFixed(2)}</p>

        <div className="flex gap-8 mb-16 w-full max-w-xl">
          <button
            onClick={() => setMethod("card")}
            className={`flex-1 p-8 rounded-3xl border-2 transition-all ${method === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
          >
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-2xl font-semibold">{lang === "en" ? "Card" : "银行卡"}</p>
          </button>
          <button
            onClick={() => setMethod("qr")}
            className={`flex-1 p-8 rounded-3xl border-2 transition-all ${method === "qr" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
          >
            <QrCode className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-2xl font-semibold">{lang === "en" ? "QR Pay" : "扫码支付"}</p>
          </button>
        </div>

        {method === "card" ? (
          <div className="text-center mb-12">
            <div className="w-32 h-20 rounded-2xl border-2 border-dashed border-border mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-xl text-muted-foreground">
              {lang === "en" ? "Tap, insert, or swipe your card" : "请刷卡、插卡或感应"}
            </p>
          </div>
        ) : (
          <div className="text-center mb-12">
            <div className="w-48 h-48 rounded-3xl bg-foreground/5 mx-auto mb-4 flex items-center justify-center">
              <QrCode className="w-24 h-24 text-muted-foreground" />
            </div>
            <p className="text-xl text-muted-foreground">
              {lang === "en" ? "Scan to pay with your mobile wallet" : "使用手机钱包扫码支付"}
            </p>
          </div>
        )}

        <button
          onClick={handlePay}
          className="px-16 py-6 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold hover:opacity-90 transition-opacity"
        >
          {lang === "en" ? "Confirm Payment" : "确认支付"}
        </button>
      </div>
    </div>
  );
};
