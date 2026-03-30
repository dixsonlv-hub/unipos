import React, { useState, useCallback } from "react";
import { type MenuItem } from "@/data/mock-data";
import { getNextCollectionNumber } from "@/state/kiosk-store";
import { KioskWelcome } from "@/components/kiosk/KioskWelcome";
import { KioskMenu } from "@/components/kiosk/KioskMenu";
import { KioskItemDetail } from "@/components/kiosk/KioskItemDetail";
import { KioskCart, type KioskCartItem } from "@/components/kiosk/KioskCart";
import { KioskPayment } from "@/components/kiosk/KioskPayment";
import { KioskComplete } from "@/components/kiosk/KioskComplete";

type Step = "welcome" | "menu" | "payment" | "complete";

const KioskOrdering: React.FC = () => {
  const [step, setStep] = useState<Step>("welcome");
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [serviceMode, setServiceMode] = useState<"dine-in" | "takeaway">("dine-in");
  const [cart, setCart] = useState<KioskCartItem[]>([]);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [collectionNum, setCollectionNum] = useState("");

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleStart = (mode: "dine-in" | "takeaway") => {
    setServiceMode(mode);
    setStep("menu");
  };

  const handleAddItem = useCallback((item: MenuItem, qty: number, modifiers: { name: string; price: number }[], notes: string, comboItems?: { name: string; groupName: string }[]) => {
    const id = `k-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setCart(prev => [...prev, {
      id, menuItemId: item.id,
      name: lang === "zh" && item.nameZh ? item.nameZh : item.name,
      price: item.price, quantity: qty, modifiers, notes, comboItems,
    }]);
    setDetailItem(null);
  }, [lang]);

  const handleUpdateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const handleRemove = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const calcTotal = () => {
    const sub = cart.reduce((s, i) => s + (i.price + i.modifiers.reduce((a, m) => a + m.price, 0)) * i.quantity, 0);
    const svc = Math.round(sub * 10) / 100;
    const gst = Math.round((sub + svc) * 9) / 100;
    return Math.round((sub + svc + gst) * 100) / 100;
  };

  const handlePaymentComplete = useCallback(() => {
    const num = getNextCollectionNumber();
    setCollectionNum(num);
    setStep("complete");
  }, []);

  const handleNewOrder = useCallback(() => {
    setCart([]);
    setStep("welcome");
    setDetailItem(null);
    setShowCart(false);
    setCollectionNum("");
  }, []);

  if (step === "welcome") {
    return <KioskWelcome onStart={handleStart} lang={lang} onToggleLang={() => setLang(l => l === "en" ? "zh" : "en")} />;
  }

  if (step === "payment") {
    return <KioskPayment total={calcTotal()} lang={lang} onComplete={handlePaymentComplete} onBack={() => setStep("menu")} />;
  }

  if (step === "complete") {
    return <KioskComplete collectionNumber={collectionNum} lang={lang} onNewOrder={handleNewOrder} />;
  }

  // Menu step
  return (
    <>
      <KioskMenu
        lang={lang}
        cartCount={cartCount}
        onSelectItem={setDetailItem}
        onOpenCart={() => setShowCart(true)}
        onBack={() => setStep("welcome")}
      />
      {detailItem && (
        <KioskItemDetail item={detailItem} lang={lang} onAdd={handleAddItem} onClose={() => setDetailItem(null)} />
      )}
      {showCart && (
        <KioskCart
          items={cart} lang={lang}
          onUpdateQty={handleUpdateQty} onRemove={handleRemove}
          onClose={() => setShowCart(false)}
          onCheckout={() => { setShowCart(false); setStep("payment"); }}
        />
      )}
    </>
  );
};

export default KioskOrdering;
