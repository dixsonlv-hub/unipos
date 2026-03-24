import React from "react";
import { Link } from "react-router-dom";
import { Monitor, Smartphone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <div className="max-w-2xl w-full text-center">
      <h1 className="text-3xl font-bold text-foreground mb-2">Singapore F&B Smart POS</h1>
      <p className="text-muted-foreground mb-10">Select a surface to explore</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: "/tablet", icon: Monitor, title: "Tablet POS", desc: "Cashier workstation" },
          { to: "/mobile", icon: Smartphone, title: "Mobile POS", desc: "Handheld ordering" },
          { to: "/admin", icon: Settings, title: "Admin", desc: "Dashboard & config" },
        ].map(s => (
          <Link key={s.to} to={s.to} className="bg-card rounded-xl border border-border p-6 hover:border-primary hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <s.icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground mb-1">{s.title}</h2>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default Index;
