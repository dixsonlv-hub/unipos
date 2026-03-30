import React from "react";
import { Building2, CreditCard, Globe, Bell, MonitorSmartphone, QrCode } from "lucide-react";
import { useSettings, updateSettings, type QRPaymentMode } from "@/state/settings-store";

const AdminSettings: React.FC = () => {
  const settings = useSettings();

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Configure your outlet</p>
      </div>

      {/* General settings */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { icon: Building2, title: "Outlet Details", desc: "Business name, address, operating hours", status: "Configured" },
          { icon: CreditCard, title: "Payment Setup", desc: "Uniweb card rail, PayNow, SGQR configuration", status: "Pending KYB" },
          { icon: Globe, title: "Compliance", desc: "ACRA registration, UBO details, KYB status", status: "Under Review" },
          { icon: Bell, title: "Notifications", desc: "Alert preferences, order notifications", status: "Configured" },
        ].map(item => (
          <button key={item.title} className="uniweb-card p-5 text-left hover:border-primary/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-[11px] bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-[13px]">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
            <span className={`status-badge ${
              item.status === "Configured" ? "bg-[hsl(var(--pos-pay))]/10 text-[hsl(var(--pos-pay))]" :
              item.status === "Under Review" ? "bg-accent text-accent-foreground" :
              "bg-primary/10 text-primary"
            }`}>
              {item.status}
            </span>
          </button>
        ))}
      </div>

      {/* Ordering Channels */}
      <h2 className="text-lg font-bold text-foreground mb-4">Ordering Channels</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Kiosk */}
        <div className="uniweb-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-[11px] bg-primary/10 flex items-center justify-center">
              <MonitorSmartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-[13px]">Self-Service Kiosk</h3>
              <p className="text-[11px] text-muted-foreground">In-store ordering terminal</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Enable Kiosk</span>
              <button
                onClick={() => updateSettings({ kioskEnabled: !settings.kioskEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative ${settings.kioskEnabled ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${settings.kioskEnabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </label>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Payment Methods</p>
              {(["card", "qr"] as const).map(m => (
                <label key={m} className="flex items-center gap-2 mb-1.5">
                  <input
                    type="checkbox"
                    checked={settings.kioskPaymentMethods.includes(m)}
                    onChange={() => {
                      const methods = settings.kioskPaymentMethods.includes(m)
                        ? settings.kioskPaymentMethods.filter(x => x !== m)
                        : [...settings.kioskPaymentMethods, m];
                      updateSettings({ kioskPaymentMethods: methods });
                    }}
                    className="rounded border-border text-primary"
                  />
                  <span className="text-sm capitalize">{m === "qr" ? "QR Pay" : "Card"}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* QR Ordering */}
        <div className="uniweb-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-[11px] bg-primary/10 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-[13px]">QR Table Ordering</h3>
              <p className="text-[11px] text-muted-foreground">Customer scan-to-order</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Enable QR Ordering</span>
              <button
                onClick={() => updateSettings({ qrEnabled: !settings.qrEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative ${settings.qrEnabled ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${settings.qrEnabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </label>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Payment Mode</p>
              {([
                { value: "pre-pay" as QRPaymentMode, label: "Pay First" },
                { value: "post-pay" as QRPaymentMode, label: "Pay at Counter" },
                { value: "choice" as QRPaymentMode, label: "Customer Choice" },
              ]).map(opt => (
                <label key={opt.value} className="flex items-center gap-2 mb-1.5">
                  <input
                    type="radio"
                    name="qr-payment"
                    checked={settings.qrPaymentMode === opt.value}
                    onChange={() => updateSettings({ qrPaymentMode: opt.value })}
                    className="text-primary"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Loyalty Points / $1</p>
              <input
                type="number" min={0} max={10}
                value={settings.loyaltyPointsPerDollar}
                onChange={e => updateSettings({ loyaltyPointsPerDollar: Number(e.target.value) || 1 })}
                className="w-20 px-3 py-1.5 rounded-lg border border-border bg-card text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
