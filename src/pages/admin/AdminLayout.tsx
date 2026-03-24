import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, UtensilsCrossed, Users, Shield, Monitor, BarChart3,
  DollarSign, Settings, Building2
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Menu", url: "/admin/menu", icon: UtensilsCrossed },
  { title: "Staff", url: "/admin/staff", icon: Shield },
  { title: "CRM", url: "/admin/crm", icon: Users },
  { title: "KDS Monitor", url: "/admin/kds", icon: Monitor },
  { title: "Sales Report", url: "/admin/sales", icon: BarChart3 },
  { title: "Finance", url: "/admin/finance", icon: DollarSign },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-60 bg-pos-nav flex flex-col shrink-0">
        <div className="p-5 border-b border-pos-nav-foreground/10">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-bold text-primary-foreground text-sm">Hawker House</h1>
              <p className="text-[11px] text-pos-nav-foreground/60">Admin Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => {
            const active = location.pathname === item.url ||
              (item.url !== "/admin" && location.pathname.startsWith(item.url));
            return (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === "/admin"}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-pos-nav-active/20 text-primary-foreground font-medium"
                    : "text-pos-nav-foreground hover:bg-pos-nav-foreground/10 hover:text-primary-foreground"
                }`}
                activeClassName=""
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
