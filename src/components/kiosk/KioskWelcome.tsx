import React from "react";
import { UtensilsCrossed } from "lucide-react";

interface Props {
  onStart: (mode: "dine-in" | "takeaway") => void;
  lang: "en" | "zh";
  onToggleLang: () => void;
}

export const KioskWelcome: React.FC<Props> = ({ onStart, lang, onToggleLang }) => (
  <div className="h-screen flex flex-col items-center justify-center bg-background p-12 relative">
    <button
      onClick={onToggleLang}
      className="absolute top-8 right-8 px-5 py-3 rounded-2xl border border-border text-lg font-medium text-muted-foreground hover:bg-accent transition-colors"
    >
      {lang === "en" ? "中文" : "English"}
    </button>

    <div className="w-28 h-28 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-10">
      <UtensilsCrossed className="w-14 h-14 text-primary" />
    </div>

    <h1 className="text-5xl font-bold text-foreground tracking-tight mb-3">
      {lang === "en" ? "Welcome" : "欢迎光临"}
    </h1>
    <p className="text-2xl text-muted-foreground mb-16">
      {lang === "en" ? "How would you like to order?" : "请选择用餐方式"}
    </p>

    <div className="flex gap-8 w-full max-w-2xl">
      <button
        onClick={() => onStart("dine-in")}
        className="flex-1 uniweb-card p-10 hover:border-primary/40 hover:shadow-lg transition-all group"
      >
        <div className="text-6xl mb-6">🍽️</div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {lang === "en" ? "Dine In" : "堂食"}
        </h2>
        <p className="text-xl text-muted-foreground">
          {lang === "en" ? "Eat here" : "在店内用餐"}
        </p>
      </button>

      <button
        onClick={() => onStart("takeaway")}
        className="flex-1 uniweb-card p-10 hover:border-primary/40 hover:shadow-lg transition-all group"
      >
        <div className="text-6xl mb-6">🥡</div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {lang === "en" ? "Takeaway" : "外带"}
        </h2>
        <p className="text-xl text-muted-foreground">
          {lang === "en" ? "Take out" : "打包带走"}
        </p>
      </button>
    </div>
  </div>
);
