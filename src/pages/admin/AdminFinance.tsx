import React from "react";
import { DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

const tenderMix = [
  { method: "Card (Uniweb)", amount: 1680.50, pct: 59 },
  { method: "Cash", amount: 820.00, pct: 29 },
  { method: "SGQR / PayNow", amount: 347.00, pct: 12 },
];

const settlements = [
  { id: "STL-001", date: "15 Jan 2024", amount: "$2,501.50", status: "settled" },
  { id: "STL-002", date: "14 Jan 2024", amount: "$2,180.00", status: "settled" },
  { id: "STL-003", date: "13 Jan 2024", amount: "$1,950.30", status: "settled" },
  { id: "STL-004", date: "12 Jan 2024", amount: "$2,320.80", status: "pending" },
];

const exceptions = [
  { type: "Void", order: "#0041", amount: "$12.50", reason: "Customer complaint", time: "11:30 AM" },
  { type: "Refund", order: "#0038", amount: "$7.00", reason: "Wrong order", time: "10:15 AM" },
];

const AdminFinance: React.FC = () => (
  <div className="p-8">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Finance & Reconciliation</h1>
      <p className="text-sm text-muted-foreground">Settlement tracking and GST reporting</p>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground mb-1">Today's Gross</p>
        <p className="text-2xl font-bold text-foreground">$2,847.50</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground mb-1">Cash Expected</p>
        <p className="text-2xl font-bold text-foreground">$820.00</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground mb-1">GST Collected</p>
        <p className="text-2xl font-bold text-foreground">$231.45</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-8">
      {/* Tender Mix */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Tender Mix</h2>
        <div className="space-y-3">
          {tenderMix.map(t => (
            <div key={t.method}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground font-medium">{t.method}</span>
                <span className="text-muted-foreground">${t.amount.toFixed(2)} ({t.pct}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${t.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exceptions */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-pos-occupied" />
          Exceptions
        </h2>
        <div className="space-y-3">
          {exceptions.map(e => (
            <div key={e.order} className="flex items-center gap-3 p-3 rounded-lg bg-pos-occupied/5 border border-pos-occupied/20">
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">{e.type}</span>
                <span className="text-xs text-muted-foreground ml-2">{e.order}</span>
                <p className="text-xs text-muted-foreground">{e.reason}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-pos-dirty">{e.amount}</span>
                <p className="text-xs text-muted-foreground">{e.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Settlements */}
    <div className="bg-card rounded-xl border border-border">
      <div className="p-5 border-b border-border">
        <h2 className="font-semibold text-foreground">Settlement History</h2>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="text-left p-4 font-medium">ID</th>
            <th className="text-left p-4 font-medium">Date</th>
            <th className="text-left p-4 font-medium">Amount</th>
            <th className="text-left p-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {settlements.map(s => (
            <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="p-4 text-sm font-medium text-foreground">{s.id}</td>
              <td className="p-4 text-sm text-muted-foreground">{s.date}</td>
              <td className="p-4 text-sm font-medium text-foreground">{s.amount}</td>
              <td className="p-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  s.status === "settled" ? "bg-pos-available/15 text-pos-available" : "bg-pos-occupied/15 text-pos-occupied"
                }`}>{s.status === "settled" ? "Settled" : "Pending"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminFinance;
