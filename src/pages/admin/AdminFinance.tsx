import React, { useState } from "react";
import {
  AlertCircle, CheckCircle2, Download, Filter, CreditCard, Smartphone,
  QrCode, TrendingUp, TrendingDown, DollarSign, ArrowUpDown, Globe, FileText,
  BarChart3, Calendar
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts";

// ────── Mock Data ──────
const kpiCards = [
  { label: "Total GMV", value: "$284,750.00", change: "+12.5%", up: true, stripe: "bg-status-green" },
  { label: "Transactions", value: "4,832", change: "+8.2%", up: true, stripe: "bg-primary" },
  { label: "Total Refunds", value: "$1,240.00", change: "-3.1%", up: true, stripe: "bg-status-amber" },
  { label: "Net Settled", value: "$280,163.50", change: "+11.8%", up: true, stripe: "bg-status-green" },
];

const salesTrend = [
  { date: "Jan 1", amount: 8200 }, { date: "Jan 2", amount: 9400 }, { date: "Jan 3", amount: 7800 },
  { date: "Jan 4", amount: 10200 }, { date: "Jan 5", amount: 11500 }, { date: "Jan 6", amount: 9800 },
  { date: "Jan 7", amount: 12000 }, { date: "Jan 8", amount: 10500 }, { date: "Jan 9", amount: 11800 },
  { date: "Jan 10", amount: 13200 }, { date: "Jan 11", amount: 12500 }, { date: "Jan 12", amount: 14000 },
  { date: "Jan 13", amount: 11000 }, { date: "Jan 14", amount: 12800 },
];

const paymentMethods = [
  { method: "Visa / Mastercard", amount: 168050, pct: 59, icon: CreditCard, color: "bg-primary" },
  { method: "Alipay+ / WeChat Pay", amount: 54120, pct: 19, icon: Smartphone, color: "bg-status-green" },
  { method: "PayNow / SGQR", amount: 34700, pct: 12, icon: QrCode, color: "bg-status-amber" },
  { method: "Cash", amount: 27880, pct: 10, icon: DollarSign, color: "bg-warm-500" },
];

const cardCountries = [
  { country: "Singapore", pct: 62, flag: "🇸🇬" },
  { country: "China", pct: 15, flag: "🇨🇳" },
  { country: "Malaysia", pct: 8, flag: "🇲🇾" },
  { country: "Indonesia", pct: 6, flag: "🇮🇩" },
  { country: "Others", pct: 9, flag: "🌍" },
];

const recentTransactions = [
  { id: "TXN-20240115-001", outlet: "Chinatown Point", amount: "$96.23", method: "Visa", scheme: "Visa", country: "🇸🇬 SG", status: "captured", time: "15 Jan, 12:15 PM", net: "$93.84" },
  { id: "TXN-20240115-002", outlet: "Chinatown Point", amount: "$47.52", method: "Alipay+", scheme: "Alipay", country: "🇨🇳 CN", status: "captured", time: "15 Jan, 12:30 PM", net: "$46.33" },
  { id: "TXN-20240115-003", outlet: "Junction 8", amount: "$21.38", method: "PayNow", scheme: "SGQR", country: "🇸🇬 SG", status: "captured", time: "15 Jan, 12:45 PM", net: "$21.17" },
  { id: "TXN-20240115-004", outlet: "Chinatown Point", amount: "$35.20", method: "Mastercard", scheme: "MC", country: "🇲🇾 MY", status: "captured", time: "15 Jan, 12:00 PM", net: "$34.32" },
  { id: "TXN-20240115-005", outlet: "Junction 8", amount: "$18.50", method: "WeChat Pay", scheme: "WeChat", country: "🇨🇳 CN", status: "refunded", time: "15 Jan, 11:45 AM", net: "-$18.50" },
  { id: "TXN-20240114-006", outlet: "Chinatown Point", amount: "$62.80", method: "Visa", scheme: "Visa", country: "🇮🇩 ID", status: "captured", time: "14 Jan, 18:20 PM", net: "$61.23" },
  { id: "TXN-20240114-007", outlet: "Junction 8", amount: "$44.90", method: "Cash", scheme: "—", country: "—", status: "captured", time: "14 Jan, 17:45 PM", net: "$44.90" },
  { id: "TXN-20240114-008", outlet: "Chinatown Point", amount: "$88.60", method: "Mastercard", scheme: "MC", country: "🇸🇬 SG", status: "captured", time: "14 Jan, 16:30 PM", net: "$86.39" },
];

const settlements = [
  { id: "STL-2024-0115", date: "15 Jan 2024", gross: "$12,847.50", fees: "$346.88", net: "$12,500.62", bank: "DBS ****4821" },
  { id: "STL-2024-0114", date: "14 Jan 2024", gross: "$11,420.00", fees: "$308.34", net: "$11,111.66", bank: "DBS ****4821" },
  { id: "STL-2024-0113", date: "13 Jan 2024", gross: "$10,950.30", fees: "$295.66", net: "$10,654.64", bank: "DBS ****4821" },
  { id: "STL-2024-0112", date: "12 Jan 2024", gross: "$13,320.80", fees: "$359.66", net: "$12,961.14", bank: "DBS ****4821" },
  { id: "STL-2024-0111", date: "11 Jan 2024", gross: "$9,870.40", fees: "$266.50", net: "$9,603.90", bank: "DBS ****4821" },
];

const reports = [
  { name: "Monthly Summary", desc: "Revenue, transactions, and settlement summary for the month", icon: BarChart3, date: "Jan 2024" },
  { name: "Payment Breakdown", desc: "Detailed breakdown by payment method, card scheme, and issuing country", icon: CreditCard, date: "Jan 2024" },
  { name: "Settlement Summary", desc: "All settlement batches with fees deducted and net payout", icon: FileText, date: "Jan 2024" },
];

const reportHistory = [
  { name: "December 2023 Summary", type: "Monthly", date: "01 Jan 2024", size: "2.4 MB" },
  { name: "November 2023 Summary", type: "Monthly", date: "01 Dec 2023", size: "2.1 MB" },
  { name: "Q4 2023 Settlement", type: "Quarterly", date: "01 Jan 2024", size: "4.8 MB" },
  { name: "October 2023 Summary", type: "Monthly", date: "01 Nov 2023", size: "1.9 MB" },
];

const chartConfig = {
  amount: { label: "GMV", color: "hsl(var(--primary))" },
};

// ────── Component ──────
const AdminFinance: React.FC = () => {
  const [tab, setTab] = useState("overview");
  const [txnPage, setTxnPage] = useState(1);

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Finance & Reconciliation</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Payment acquirer dashboard · Song Fa Bak Kut Teh</p>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-accent rounded-lg">
            <TabsTrigger value="overview" className="text-xs rounded-md">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs rounded-md">Transactions</TabsTrigger>
            <TabsTrigger value="settlements" className="text-xs rounded-md">Settlements</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs rounded-md">Reports</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "transactions" && <TransactionsTab page={txnPage} setPage={setTxnPage} />}
      {tab === "settlements" && <SettlementsTab />}
      {tab === "reports" && <ReportsTab />}
    </div>
  );
};

// ────── Overview Tab ──────
function OverviewTab() {
  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpiCards.map(s => (
          <div key={s.label} className="uniweb-card relative overflow-hidden p-5">
            <div className={`kpi-stripe ${s.stripe}`} />
            <div className="section-label mt-1.5 mb-2.5">{s.label}</div>
            <div className="text-[26px] font-bold text-foreground tracking-tighter leading-none mb-2">{s.value}</div>
            <div className="flex items-center gap-1.5">
              <span className={`status-badge ${s.up ? "bg-status-green-light text-status-green" : "bg-status-red-light text-status-red"}`}>
                {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {s.change}
              </span>
              <span className="text-[12px] text-muted-foreground">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Sales Trend */}
        <div className="col-span-2 uniweb-card p-5">
          <div className="section-label mb-4">Daily GMV Trend</div>
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-[10px]" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis className="text-[10px]" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gmvGradient)" />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Card Issuing Countries */}
        <div className="uniweb-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span className="section-label">Card Issuing Countries</span>
          </div>
          <div className="space-y-3">
            {cardCountries.map(c => (
              <div key={c.country}>
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-foreground font-medium">{c.flag} {c.country}</span>
                  <span className="text-muted-foreground font-mono text-xs">{c.pct}%</span>
                </div>
                <div className="h-1 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-600" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Payment Methods */}
        <div className="uniweb-card p-5">
          <div className="section-label mb-4">Payment Methods</div>
          <div className="space-y-3.5">
            {paymentMethods.map(t => (
              <div key={t.method}>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <div className="flex items-center gap-2">
                    <t.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground font-medium">{t.method}</span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">${(t.amount / 1000).toFixed(1)}k ({t.pct}%)</span>
                </div>
                <div className="h-1 bg-accent rounded-full overflow-hidden">
                  <div className={`h-full ${t.color} rounded-full transition-all duration-600`} style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="uniweb-card">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <span className="section-label">Recent Transactions</span>
            <button onClick={() => {}} className="text-[11px] text-primary font-medium hover:underline">View All →</button>
          </div>
          <div className="divide-y divide-border">
            {recentTransactions.slice(0, 5).map(t => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors">
                <div>
                  <div className="text-[12px] font-mono text-muted-foreground">{t.id}</div>
                  <div className="text-[13px] font-medium text-foreground mt-0.5">{t.method} · {t.country}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-foreground font-mono">{t.amount}</div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    t.status === "captured" ? "bg-status-green-light text-status-green" : "bg-status-red-light text-status-red"
                  }`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ────── Transactions Tab ──────
function TransactionsTab({ page, setPage }: { page: number; setPage: (p: number) => void }) {
  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent px-3 py-2 rounded-lg">
          <Filter className="h-3.5 w-3.5" />
          <select className="bg-transparent outline-none text-foreground font-medium">
            <option>All Outlets</option>
            <option>Chinatown Point</option>
            <option>Junction 8</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent px-3 py-2 rounded-lg">
          <CreditCard className="h-3.5 w-3.5" />
          <select className="bg-transparent outline-none text-foreground font-medium">
            <option>All Methods</option>
            <option>Visa</option>
            <option>Mastercard</option>
            <option>Alipay+</option>
            <option>WeChat Pay</option>
            <option>PayNow</option>
            <option>Cash</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent px-3 py-2 rounded-lg">
          <Calendar className="h-3.5 w-3.5" />
          <select className="bg-transparent outline-none text-foreground font-medium">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
          </select>
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="text-xs gap-1.5">
          <Download className="h-3.5 w-3.5" />Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="uniweb-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th>Transaction ID</th>
                <th>Outlet</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Scheme</th>
                <th>Country</th>
                <th>Status</th>
                <th>Date/Time</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(t => (
                <tr key={t.id} className="table-row border-b border-border last:border-0 hover:bg-accent transition-colors cursor-pointer">
                  <td className="font-medium text-foreground font-mono text-xs">{t.id}</td>
                  <td className="text-muted-foreground text-xs">{t.outlet}</td>
                  <td className="font-semibold text-foreground font-mono">{t.amount}</td>
                  <td className="text-muted-foreground text-xs">{t.method}</td>
                  <td><span className="text-[10px] bg-accent px-2 py-0.5 rounded font-medium">{t.scheme}</span></td>
                  <td className="text-xs">{t.country}</td>
                  <td>
                    <span className={`status-badge ${
                      t.status === "captured" ? "bg-status-green-light text-status-green" : "bg-status-red-light text-status-red"
                    }`}>
                      <span className={`status-dot ${t.status === "captured" ? "bg-status-green" : "bg-status-red"}`} />
                      {t.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground text-xs">{t.time}</td>
                  <td className={`font-mono text-xs font-semibold ${t.net.startsWith("-") ? "text-status-red" : "text-foreground"}`}>{t.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Showing 1-8 of 4,832 transactions</span>
          <div className="flex gap-1">
            {[1, 2, 3, "...", 604].map((p, i) => (
              <button key={i} onClick={() => typeof p === "number" && setPage(p)}
                className={`px-2.5 py-1 text-[11px] rounded-md ${p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
              >{p}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ────── Settlements Tab ──────
function SettlementsTab() {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Settled (MTD)", value: "$280,163.50", stripe: "bg-status-green" },
          { label: "Fees Deducted", value: "$4,586.50", stripe: "bg-status-amber" },
          { label: "Settlement Bank", value: "DBS ****4821", stripe: "bg-primary" },
        ].map(s => (
          <div key={s.label} className="uniweb-card relative overflow-hidden p-5">
            <div className={`kpi-stripe ${s.stripe}`} />
            <div className="section-label mt-1.5 mb-2.5">{s.label}</div>
            <div className="text-[26px] font-bold text-foreground tracking-tighter leading-none">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="uniweb-card">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Settlement Batches</h2>
          <span className="text-[11px] text-muted-foreground">T+1 settlement cycle</span>
        </div>
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th>Date</th>
              <th>Batch ID</th>
              <th>Gross</th>
              <th>Fees</th>
              <th>Net Payout</th>
              <th>Bank</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map(s => (
              <tr key={s.id} className="table-row border-b border-border last:border-0 hover:bg-accent transition-colors">
                <td className="text-muted-foreground text-xs">{s.date}</td>
                <td className="font-medium text-foreground font-mono text-xs">{s.id}</td>
                <td className="font-mono text-foreground">{s.gross}</td>
                <td className="font-mono text-status-red text-xs">{s.fees}</td>
                <td className="font-bold text-foreground font-mono">{s.net}</td>
                <td className="text-muted-foreground text-xs font-mono">{s.bank}</td>
                <td>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary h-7">
                    <Download className="h-3 w-3" />PDF
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ────── Reports Tab ──────
function ReportsTab() {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {reports.map(r => (
          <div key={r.name} className="uniweb-card p-5 hover:border-primary/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <r.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-foreground">{r.name}</div>
                <div className="text-[11px] text-muted-foreground">{r.date}</div>
              </div>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">{r.desc}</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs gap-1.5 w-full">
              <Download className="h-3 w-3" />Generate Report
            </Button>
          </div>
        ))}
      </div>

      <div className="uniweb-card">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Report History</h2>
        </div>
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th>Report Name</th>
              <th>Type</th>
              <th>Generated</th>
              <th>Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reportHistory.map(r => (
              <tr key={r.name} className="table-row border-b border-border last:border-0 hover:bg-accent transition-colors">
                <td className="font-medium text-foreground text-xs">{r.name}</td>
                <td><span className="text-[10px] bg-accent px-2 py-0.5 rounded font-medium text-muted-foreground">{r.type}</span></td>
                <td className="text-muted-foreground text-xs">{r.date}</td>
                <td className="text-muted-foreground text-xs font-mono">{r.size}</td>
                <td>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary h-7">
                    <Download className="h-3 w-3" />Download
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminFinance;
