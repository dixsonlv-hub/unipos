import React from "react";
import { Link } from "react-router-dom";
import { Monitor, Smartphone, Settings, MonitorSmartphone, QrCode, ChefHat } from "lucide-react";
import uniwebLogo from "@/assets/uniweb-logo.jpg";
import GrainyGradientBg from "@/components/GrainyGradientBg";

const Index: React.FC = () => (
  <GrainyGradientBg>
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center">
        <img src={uniwebLogo} alt="Uniweb" className="w-16 h-16 rounded-2xl mx-auto mb-5" />
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Uniweb Smart POS</h1>
        <p className="text-[13px] text-muted-foreground mb-10">Select a surface to explore</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { to: "/tablet", icon: Monitor, title: "Tablet POS", desc: "Cashier workstation" },
            { to: "/mobile", icon: Smartphone, title: "Mobile POS", desc: "Handheld ordering" },
            { to: "/kiosk", icon: MonitorSmartphone, title: "Kiosk", desc: "Self-service ordering" },
            { to: "/qr", icon: QrCode, title: "QR Order", desc: "Scan & order at table" },
            { to: "/kds", icon: ChefHat, title: "KDS", desc: "Kitchen display system" },
            { to: "/admin", icon: Settings, title: "Admin", desc: "Merchant portal" },
          ].map(s => (
            <Link key={s.to} to={s.to} className="backdrop-blur-sm bg-white/70 dark:bg-white/10 border-[1.5px] border-white/40 dark:border-white/15 rounded-xl p-6 hover:border-primary/40 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-[11px] bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground text-[13px] mb-1">{s.title}</h2>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </GrainyGradientBg>
);

export default Index;
