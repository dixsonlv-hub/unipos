import React from "react";
import { Building2, CreditCard, Globe, Bell } from "lucide-react";

const AdminSettings: React.FC = () => (
  <div className="p-8">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="text-sm text-muted-foreground">Configure your outlet</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {[
        { icon: Building2, title: "Outlet Details", desc: "Business name, address, operating hours", status: "Configured" },
        { icon: CreditCard, title: "Payment Setup", desc: "Uniweb card rail, PayNow, SGQR configuration", status: "Pending KYB" },
        { icon: Globe, title: "Compliance", desc: "ACRA registration, UBO details, KYB status", status: "Under Review" },
        { icon: Bell, title: "Notifications", desc: "Alert preferences, order notifications", status: "Configured" },
      ].map(item => (
        <button key={item.title} className="bg-card rounded-xl border border-border p-5 text-left hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            item.status === "Configured" ? "bg-pos-available/15 text-pos-available" :
            item.status === "Under Review" ? "bg-pos-occupied/15 text-pos-occupied" :
            "bg-pos-reserved/15 text-pos-reserved"
          }`}>{item.status}</span>
        </button>
      ))}
    </div>
  </div>
);

export default AdminSettings;
