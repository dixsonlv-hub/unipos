import React from "react";
import { TrendingUp, DollarSign, Users, ShoppingBag, Clock } from "lucide-react";

const stats = [
  { label: "Today's Sales", value: "$2,847.50", change: "+12.5%", icon: DollarSign, color: "text-pos-pay" },
  { label: "Orders", value: "48", change: "+8", icon: ShoppingBag, color: "text-primary" },
  { label: "Customers", value: "92", change: "+15", icon: Users, color: "text-pos-occupied" },
  { label: "Avg Wait Time", value: "12 min", change: "-2 min", icon: Clock, color: "text-pos-reserved" },
];

const recentOrders = [
  { id: "#0048", table: "T3", items: 4, total: "$96.23", status: "Open", time: "12:15 PM" },
  { id: "#0047", table: "T2", items: 4, total: "$47.52", status: "Open", time: "12:30 PM" },
  { id: "#0046", table: "T8", items: 2, total: "$21.38", status: "Open", time: "12:45 PM" },
  { id: "#0045", table: "—", items: 3, total: "$35.20", status: "Paid", time: "12:00 PM" },
  { id: "#0044", table: "T5", items: 2, total: "$18.50", status: "Paid", time: "11:45 AM" },
];

const AdminDashboard: React.FC = () => (
  <div className="p-8">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Today's overview · Hawker House Main Outlet</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map(s => (
        <div key={s.label} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{s.label}</span>
            <s.icon className={`h-5 w-5 ${s.color}`} />
          </div>
          <div className="text-2xl font-bold text-foreground">{s.value}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-pos-pay" />
            <span className="text-xs text-pos-pay font-medium">{s.change}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Recent Orders */}
    <div className="bg-card rounded-xl border border-border">
      <div className="p-5 border-b border-border">
        <h2 className="font-semibold text-foreground">Recent Orders</h2>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="text-left p-4 font-medium">Order</th>
            <th className="text-left p-4 font-medium">Table</th>
            <th className="text-left p-4 font-medium">Items</th>
            <th className="text-left p-4 font-medium">Total</th>
            <th className="text-left p-4 font-medium">Status</th>
            <th className="text-left p-4 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map(o => (
            <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="p-4 text-sm font-medium text-foreground">{o.id}</td>
              <td className="p-4 text-sm text-muted-foreground">{o.table}</td>
              <td className="p-4 text-sm text-muted-foreground">{o.items}</td>
              <td className="p-4 text-sm font-medium text-foreground">{o.total}</td>
              <td className="p-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  o.status === "Open" ? "bg-pos-occupied/15 text-pos-occupied" : "bg-pos-available/15 text-pos-available"
                }`}>{o.status}</span>
              </td>
              <td className="p-4 text-sm text-muted-foreground">{o.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminDashboard;
