import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";

const dailyData = [
  { day: "Mon", sales: 1820 },
  { day: "Tue", sales: 2150 },
  { day: "Wed", sales: 1950 },
  { day: "Thu", sales: 2480 },
  { day: "Fri", sales: 3100 },
  { day: "Sat", sales: 3650 },
  { day: "Sun", sales: 2847 },
];

const topItems = [
  { name: "Chicken Rice", qty: 42, revenue: "$231.00" },
  { name: "Laksa", qty: 35, revenue: "$245.00" },
  { name: "Teh Tarik", qty: 68, revenue: "$170.00" },
  { name: "Chilli Crab", qty: 12, revenue: "$456.00" },
  { name: "Nasi Lemak", qty: 38, revenue: "$247.00" },
];

const maxSales = Math.max(...dailyData.map(d => d.sales));

const AdminSales: React.FC = () => (
  <div className="p-8">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Sales Report</h1>
      <p className="text-sm text-muted-foreground">This week's performance</p>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
        <p className="text-2xl font-bold text-foreground">$17,997</p>
        <div className="flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3 text-pos-pay" /><span className="text-xs text-pos-pay">+8.3%</span></div>
      </div>
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground mb-1">Orders</p>
        <p className="text-2xl font-bold text-foreground">312</p>
        <div className="flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3 text-pos-pay" /><span className="text-xs text-pos-pay">+5.1%</span></div>
      </div>
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
        <p className="text-2xl font-bold text-foreground">$57.68</p>
        <div className="flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3 text-pos-pay" /><span className="text-xs text-pos-pay">+3.0%</span></div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      {/* Chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Daily Sales</h2>
        <div className="flex items-end gap-3 h-40">
          {dailyData.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">${d.sales}</span>
              <div className="w-full bg-primary/20 rounded-t-md" style={{ height: `${(d.sales / maxSales) * 100}%` }}>
                <div className="w-full h-full bg-primary rounded-t-md" />
              </div>
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Items */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Top Items</h2>
        <div className="space-y-3">
          {topItems.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="w-5 text-xs font-bold text-muted-foreground">#{i + 1}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.qty} sold</span>
              <span className="text-sm font-semibold text-foreground">{item.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminSales;
