import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface Props {
  collectionNumber: string;
  lang: "en" | "zh";
  onNewOrder: () => void;
}

export const KioskComplete: React.FC<Props> = ({ collectionNumber, lang, onNewOrder }) => {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { onNewOrder(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onNewOrder]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background p-12">
      <div className="w-32 h-32 rounded-full bg-[hsl(var(--pos-pay))]/10 flex items-center justify-center mb-10 animate-in zoom-in duration-500">
        <CheckCircle2 className="w-20 h-20 text-[hsl(var(--pos-pay))]" />
      </div>

      <h1 className="text-4xl font-bold text-foreground mb-4">
        {lang === "en" ? "Order Confirmed!" : "下单成功！"}
      </h1>

      <p className="text-2xl text-muted-foreground mb-12">
        {lang === "en" ? "Your collection number" : "您的取餐号码"}
      </p>

      <div className="w-80 h-80 rounded-[2rem] bg-primary/5 border-4 border-primary flex items-center justify-center mb-12">
        <span className="text-8xl font-black text-primary tracking-wider">
          #{collectionNumber}
        </span>
      </div>

      <p className="text-xl text-muted-foreground mb-4">
        {lang === "en" ? "Estimated preparation time" : "预计准备时间"}
      </p>
      <p className="text-3xl font-bold text-foreground mb-16">
        {lang === "en" ? "10-15 minutes" : "10-15 分钟"}
      </p>

      <button
        onClick={onNewOrder}
        className="px-16 py-6 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold hover:opacity-90 transition-opacity"
      >
        {lang === "en" ? "Start New Order" : "开始新订单"}
      </button>

      <p className="text-base text-muted-foreground mt-6">
        {lang === "en"
          ? `Returning to home screen in ${countdown}s`
          : `${countdown}秒后返回主页`}
      </p>
    </div>
  );
};
