import React, { useState } from "react";
import { Search, Phone, Mail, Star, Users, TrendingUp, Calendar, Tag, ChevronRight, Gift, Award, X, DollarSign, BarChart3, UserPlus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCustomers, addPoints, type Customer, type CustomerSegment, type LoyaltyTier } from "@/state/customer-store";

const segmentStyles: Record<CustomerSegment, { label: string; color: string; dot: string }> = {
  new: { label: "New", color: "bg-status-blue-light text-primary", dot: "bg-primary" },
  regular: { label: "Regular", color: "bg-status-green-light text-status-green", dot: "bg-status-green" },
  vip: { label: "VIP", color: "bg-status-amber-light text-status-amber", dot: "bg-status-amber" },
  "at-risk": { label: "At Risk", color: "bg-[hsl(280,60%,90%)] text-[hsl(280,60%,40%)]", dot: "bg-[hsl(280,60%,40%)]" },
  churned: { label: "Churned", color: "bg-status-red-light text-destructive", dot: "bg-destructive" },
};

const tierStyles: Record<LoyaltyTier, { label: string; color: string }> = {
  bronze: { label: "Bronze", color: "bg-status-amber-light text-status-amber" },
  silver: { label: "Silver", color: "bg-accent text-muted-foreground" },
  gold: { label: "Gold", color: "bg-status-amber-light text-[hsl(40,80%,40%)]" },
  platinum: { label: "Platinum", color: "bg-status-blue-light text-primary" },
};

const AdminCRM: React.FC = () => {
  const customers = useCustomers();
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = customers.filter(c => {
    if (segmentFilter !== "all" && c.segment !== segmentFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const selected = customers.find(c => c.id === selectedId);

  const newThisMonth = customers.filter(c => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const avgSpend = customers.length > 0
    ? Math.round(customers.reduce((s, c) => s + c.averageTicket, 0) / customers.length)
    : 0;

  const retentionRate = customers.length > 0
    ? Math.round(((customers.length - customers.filter(c => c.segment === "churned").length) / customers.length) * 100)
    : 100;

  const upcomingBirthdays = customers.filter(c => {
    if (!c.dateOfBirth) return false;
    const bd = new Date(c.dateOfBirth);
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
    const diff = (thisYear.getTime() - now.getTime()) / 86400000;
    return diff >= 0 && diff <= 30;
  });

  // Detail panel
  if (selected) {
    const seg = segmentStyles[selected.segment];
    const tier = tierStyles[selected.tier];
    return (
      <div className="p-7">
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-4">
          <ChevronRight className="h-3.5 w-3.5 rotate-180" />Back to Customers
        </button>

        <div className="grid grid-cols-3 gap-6">
          {/* Profile */}
          <div className="uniweb-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                {selected.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{selected.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("status-badge", seg.color)}><span className={cn("status-dot", seg.dot)} />{seg.label}</span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", tier.color)}>{tier.label}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{selected.phone}</div>
              {selected.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{selected.email}</div>}
              {selected.dateOfBirth && <div className="flex items-center gap-2 text-muted-foreground"><Gift className="h-3.5 w-3.5" />Birthday: {selected.dateOfBirth}</div>}
              {selected.address && <div className="text-muted-foreground">{selected.address}</div>}
            </div>
            {selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium bg-accent text-muted-foreground px-2 py-0.5 rounded-md">#{tag}</span>
                ))}
              </div>
            )}
            {selected.notes && (
              <div className="p-3 rounded-lg bg-accent/50 text-[12px] text-muted-foreground">{selected.notes}</div>
            )}
          </div>

          {/* Stats + Points */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Visits", value: selected.visits, icon: Users },
                { label: "Total Spend", value: `$${selected.totalSpend.toFixed(0)}`, icon: DollarSign },
                { label: "Avg Ticket", value: `$${selected.averageTicket.toFixed(0)}`, icon: BarChart3 },
                { label: "Points", value: selected.points.toLocaleString(), icon: Award },
              ].map((s, i) => (
                <div key={i} className="uniweb-card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="section-label">{s.label}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground font-mono">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Tier Progress */}
            <div className="uniweb-card p-4">
              <div className="section-label mb-2">Loyalty Tier Progress</div>
              <div className="flex items-center gap-2 mb-2">
                {(["bronze", "silver", "gold", "platinum"] as LoyaltyTier[]).map(t => (
                  <div key={t} className={cn("flex-1 h-2 rounded-full",
                    (t === "bronze" && selected.points >= 0) ||
                    (t === "silver" && selected.points >= 400) ||
                    (t === "gold" && selected.points >= 1000) ||
                    (t === "platinum" && selected.points >= 3000)
                      ? "bg-primary" : "bg-border"
                  )} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Bronze</span><span>Silver (400)</span><span>Gold (1000)</span><span>Platinum (3000)</span>
              </div>
            </div>
          </div>

          {/* Points History */}
          <div className="uniweb-card p-5">
            <div className="section-label mb-3">Points History</div>
            {selected.pointsHistory.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No point activity</p>
            ) : (
              <div className="space-y-2">
                {selected.pointsHistory.map((ph, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px] py-1.5 border-b border-border last:border-0">
                    <div>
                      <span className="text-foreground">{ph.reason}</span>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{ph.date}</div>
                    </div>
                    <span className={cn("font-mono font-semibold", ph.change > 0 ? "text-status-green" : "text-destructive")}>
                      {ph.change > 0 ? "+" : ""}{ph.change}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Customer Management</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{customers.length} customers</p>
        </div>
        <Button className="rounded-lg"><UserPlus className="h-4 w-4 mr-1.5" />Add Customer</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Customers", value: customers.length, icon: Users, stripe: "bg-primary" },
          { label: "New This Month", value: newThisMonth, icon: UserPlus, stripe: "bg-status-green" },
          { label: "Avg Spend", value: `$${avgSpend}`, icon: DollarSign, stripe: "bg-status-amber" },
          { label: "Retention Rate", value: `${retentionRate}%`, icon: TrendingUp, stripe: "bg-primary" },
        ].map((kpi, i) => (
          <div key={i} className="uniweb-card p-4 relative overflow-hidden">
            <div className={cn("kpi-stripe", kpi.stripe)} />
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label mb-1">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground font-mono">{kpi.value}</p>
              </div>
              <kpi.icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex gap-1.5">
          {(["all", "new", "regular", "vip", "at-risk", "churned"] as const).map(seg => (
            <button key={seg} onClick={() => setSegmentFilter(seg)}
              className={cn("px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors",
                segmentFilter === seg ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              )}>
              {seg === "all" ? "All" : segmentStyles[seg].label}
              {seg !== "all" && <span className="ml-1 text-[10px] opacity-70">({customers.filter(c => c.segment === seg).length})</span>}
            </button>
          ))}
        </div>
        <div className="relative w-64 ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search by name, phone, email..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-[9px] bg-card border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all" />
        </div>
      </div>

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div className="uniweb-card p-4 mb-5 flex items-center gap-3 bg-status-amber-light/30 border-status-amber/20">
          <Gift className="h-5 w-5 text-status-amber shrink-0" />
          <div className="text-[13px]">
            <span className="font-semibold text-foreground">Upcoming Birthdays: </span>
            <span className="text-muted-foreground">{upcomingBirthdays.map(c => c.name).join(", ")}</span>
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="uniweb-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="table-header">
            <th>Customer</th><th>Segment</th><th>Tier</th><th>Visits</th><th>Total Spend</th><th>Points</th><th>Last Visit</th><th></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => {
              const seg = segmentStyles[c.segment];
              const tier = tierStyles[c.tier];
              return (
                <tr key={c.id} className="table-row hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setSelectedId(c.id)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                        {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-foreground">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground">{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={cn("status-badge", seg.color)}><span className={cn("status-dot", seg.dot)} />{seg.label}</span></td>
                  <td><span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md", tier.color)}>{tier.label}</span></td>
                  <td><span className="text-[13px] font-mono text-foreground">{c.visits}</span></td>
                  <td><span className="text-[13px] font-mono text-foreground">${c.totalSpend.toFixed(0)}</span></td>
                  <td><span className="text-[13px] font-mono text-foreground">{c.points.toLocaleString()}</span></td>
                  <td><span className="text-[12px] font-mono text-muted-foreground">{c.lastVisit}</span></td>
                  <td><ChevronRight className="h-4 w-4 text-muted-foreground/50" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCRM;
