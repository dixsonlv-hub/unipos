import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const mockStats = [
  { label: "Today's Revenue", value: "$2,847.50", change: "+12.5%", up: true, icon: DollarSign, stripe: "bg-status-green" },
  { label: "Total Orders", value: "48", change: "+8", up: true, icon: ShoppingBag, stripe: "bg-primary" },
  { label: "Unique Customers", value: "92", change: "+15", up: true, icon: Users, stripe: "bg-status-amber" },
  { label: "Avg Wait Time", value: "12 min", change: "-2 min", up: true, icon: Clock, stripe: "bg-status-red" },
];

const mockRecentOrders = [
  { id: "TXN-0048", table: "T3", items: 4, total: "$96.23", status: "open", time: "12:15 PM" },
  { id: "TXN-0047", table: "T2", items: 4, total: "$47.52", status: "open", time: "12:30 PM" },
  { id: "TXN-0046", table: "T8", items: 2, total: "$21.38", status: "open", time: "12:45 PM" },
  { id: "TXN-0045", table: "—", items: 3, total: "$35.20", status: "settled", time: "12:00 PM" },
  { id: "TXN-0044", table: "T5", items: 2, total: "$18.50", status: "settled", time: "11:45 AM" },
];

interface DashboardOrder {
  id: string;
  table: string;
  items: number;
  total: string;
  status: string;
  time: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState(mockStats);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>(mockRecentOrders);
  const [liveMode, setLiveMode] = useState(false);

  useEffect(() => {
    // Try to load from Supabase; fall back to mock
    async function loadOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select("id, table_number, status, total, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        setLiveMode(true);
        const todayOrders = data;
        const totalRevenue = todayOrders.reduce((s, o) => s + Number(o.total || 0), 0);
        const openCount = todayOrders.filter(o => o.status !== "settled" && o.status !== "cancelled").length;

        setStats([
          { label: "Today's Revenue", value: `$${totalRevenue.toFixed(2)}`, change: "+live", up: true, icon: DollarSign, stripe: "bg-status-green" },
          { label: "Total Orders", value: `${todayOrders.length}`, change: "+live", up: true, icon: ShoppingBag, stripe: "bg-primary" },
          { label: "Open Orders", value: `${openCount}`, change: "", up: true, icon: Users, stripe: "bg-status-amber" },
          { label: "Avg Ticket", value: todayOrders.length ? `$${(totalRevenue / todayOrders.length).toFixed(2)}` : "$0", change: "", up: true, icon: Clock, stripe: "bg-status-red" },
        ]);

        setRecentOrders(todayOrders.map(o => ({
          id: o.id.slice(0, 8).toUpperCase(),
          table: o.table_number || "—",
          items: 0,
          total: `$${Number(o.total || 0).toFixed(2)}`,
          status: o.status || "draft",
          time: new Date(o.created_at).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" }),
        })));
      }
    }
    loadOrders();

    // Realtime subscription
    const channel = supabase
      .channel("dashboard-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Today's overview · Song Fa Bak Kut Teh
            {liveMode && <span className="ml-2 text-status-green font-medium">● Live</span>}
          </p>
        </div>
        {liveMode && <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" style={{ animationDuration: "3s" }} />}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="uniweb-card relative overflow-hidden p-5">
            <div className={`kpi-stripe ${s.stripe}`} />
            <div className="section-label mt-1.5 mb-2.5">{s.label}</div>
            <div className="text-[26px] font-bold text-foreground tracking-tighter leading-none mb-2">{s.value}</div>
            {s.change && (
              <div className="flex items-center gap-1.5">
                <span className={`status-badge ${s.up ? "bg-status-green-light text-status-green" : "bg-status-red-light text-status-red"}`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.change}
                </span>
                {!liveMode && <span className="text-[12px] text-muted-foreground">vs last week</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="uniweb-card">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
          <span className="text-[11px] text-muted-foreground">{liveMode ? "Realtime" : "Last 24 hours"}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                {!liveMode && <th>Items</th>}
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="table-row border-b border-border last:border-0 hover:bg-accent transition-colors cursor-pointer">
                  <td className="font-medium text-foreground font-mono text-xs">{o.id}</td>
                  <td className="text-muted-foreground">{o.table}</td>
                  {!liveMode && <td className="text-muted-foreground">{o.items}</td>}
                  <td className="font-semibold text-foreground font-mono">{o.total}</td>
                  <td>
                    <span className={`status-badge ${
                      o.status === "open" || o.status === "sent" || o.status === "draft"
                        ? "bg-status-amber-light text-status-amber"
                        : o.status === "settled"
                        ? "bg-status-green-light text-status-green"
                        : "bg-status-red-light text-status-red"
                    }`}>
                      <span className={`status-dot ${
                        o.status === "open" || o.status === "sent" || o.status === "draft" ? "bg-status-amber" :
                        o.status === "settled" ? "bg-status-green" : "bg-status-red"
                      }`} />
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td className="text-muted-foreground text-xs">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
