import React, { useState } from "react";
import { Users, Clock, Phone, Bell, UserX, Check, Plus, BarChart3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useQueue, useQueueHistory, addToQueue, callNext, seatEntry, markNoShow, cancelEntry, getQueueStats, getEstimatedWait,
  type QueueEntry,
} from "@/state/queue-store";
import { zones } from "@/data/mock-data";

const statusStyles: Record<string, { label: string; color: string; dot: string }> = {
  waiting: { label: "Waiting", color: "bg-status-amber-light text-status-amber", dot: "bg-status-amber" },
  called: { label: "Called", color: "bg-status-blue-light text-primary", dot: "bg-primary" },
  seated: { label: "Seated", color: "bg-status-green-light text-status-green", dot: "bg-status-green" },
  "no-show": { label: "No Show", color: "bg-status-red-light text-destructive", dot: "bg-destructive" },
  cancelled: { label: "Cancelled", color: "bg-accent text-muted-foreground", dot: "bg-muted-foreground" },
};

const AdminQueue: React.FC = () => {
  const queue = useQueue();
  const history = useQueueHistory();
  const stats = getQueueStats();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pax, setPax] = useState(2);
  const [notes, setNotes] = useState("");
  const [zone, setZone] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addToQueue(name.trim(), phone, pax, notes, zone || undefined);
    setName(""); setPhone(""); setPax(2); setNotes(""); setZone(""); setShowAdd(false);
  };

  const handleCallNext = () => { callNext(); };

  const formatElapsed = (isoStr: string) => {
    const mins = Math.round((Date.now() - new Date(isoStr).getTime()) / 60000);
    return `${mins}m`;
  };

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Queue Management</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{queue.filter(e => e.status === "waiting").length} waiting · {queue.filter(e => e.status === "called").length} called</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-lg" onClick={handleCallNext} disabled={!queue.some(e => e.status === "waiting")}>
            <Bell className="h-4 w-4 mr-1.5" />Call Next
          </Button>
          <Button className="rounded-lg" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1.5" />Add to Queue
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Currently Waiting", value: stats.waiting, icon: Users, color: "text-status-amber", stripe: "bg-status-amber" },
          { label: "Called / Pending", value: stats.called, icon: Bell, color: "text-primary", stripe: "bg-primary" },
          { label: "Avg Wait Time", value: `${stats.avgWait}m`, icon: Clock, color: "text-status-green", stripe: "bg-status-green" },
          { label: "No-Show Rate", value: `${stats.noShowRate}%`, icon: UserX, color: "text-destructive", stripe: "bg-destructive" },
        ].map((kpi, i) => (
          <div key={i} className="uniweb-card p-4 relative overflow-hidden">
            <div className={cn("kpi-stripe", kpi.stripe)} />
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label mb-1">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground font-mono">{kpi.value}</p>
              </div>
              <kpi.icon className={cn("h-5 w-5", kpi.color)} />
            </div>
          </div>
        ))}
      </div>

      {/* Add to Queue Form */}
      {showAdd && (
        <div className="uniweb-card p-5 mb-6 space-y-3">
          <h3 className="text-[14px] font-bold text-foreground">Add Walk-in to Queue</h3>
          <div className="grid grid-cols-4 gap-3">
            <input placeholder="Customer Name *" value={name} onChange={e => setName(e.target.value)}
              className="h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10" />
            <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)}
              className="h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10" />
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground">Pax:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                  <button key={n} onClick={() => setPax(n)}
                    className={cn("w-8 h-8 rounded-md text-xs font-semibold transition-colors",
                      pax === n ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:bg-secondary"
                    )}>{n}</button>
                ))}
              </div>
            </div>
            <select value={zone} onChange={e => setZone(e.target.value)}
              className="h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground focus:outline-none focus:border-primary">
              <option value="">Any Zone</option>
              {zones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <input placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)}
              className="flex-1 h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10" />
            <div className="text-[12px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />Est. wait: <span className="font-mono font-semibold text-foreground">{getEstimatedWait(pax)}m</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="rounded-lg">Add to Queue</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-lg">Cancel</Button>
          </div>
        </div>
      )}

      {/* Active Queue */}
      <div className="space-y-2 mb-8">
        <div className="section-label mb-3">Active Queue</div>
        {queue.length === 0 ? (
          <div className="uniweb-card p-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">No one in queue</p>
          </div>
        ) : (
          queue.map(entry => {
            const st = statusStyles[entry.status];
            return (
              <div key={entry.id} className={cn("uniweb-card p-4 flex items-center gap-4",
                entry.status === "called" && "border-primary/30 bg-primary/[0.02]"
              )}>
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <span className="text-[15px] font-bold text-foreground">#{entry.queueNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[14px] font-semibold text-foreground">{entry.customerName}</span>
                    <span className={cn("status-badge", st.color)}><span className={cn("status-dot", st.dot)} />{st.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{entry.partySize} pax</span>
                    {entry.customerPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{entry.customerPhone}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatElapsed(entry.joinedAt)} waiting</span>
                    {entry.preferredZone && <span>→ {entry.preferredZone}</span>}
                    {entry.notes && <span className="text-status-amber">📝 {entry.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {entry.status === "called" && (
                    <>
                      <Button size="sm" className="rounded-lg h-8 text-xs" onClick={() => seatEntry(entry.id)}>
                        <Check className="h-3 w-3 mr-1" />Seat
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs text-destructive border-destructive/30" onClick={() => markNoShow(entry.id)}>
                        <UserX className="h-3 w-3 mr-1" />No Show
                      </Button>
                    </>
                  )}
                  {entry.status === "waiting" && (
                    <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs text-muted-foreground" onClick={() => cancelEntry(entry.id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* History */}
      <div>
        <div className="section-label mb-3">Today's History ({history.length})</div>
        <div className="uniweb-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="table-header">
              <th>Name</th><th>Party</th><th>Status</th><th>Wait Time</th><th>Joined</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {history.slice(0, 20).map(entry => {
                const st = statusStyles[entry.status];
                const waitTime = entry.seatedAt
                  ? Math.round((new Date(entry.seatedAt).getTime() - new Date(entry.joinedAt).getTime()) / 60000)
                  : "-";
                return (
                  <tr key={entry.id} className="table-row">
                    <td><span className="text-[13px] text-foreground">{entry.customerName}</span></td>
                    <td><span className="text-[13px] text-muted-foreground">{entry.partySize} pax</span></td>
                    <td><span className={cn("status-badge", st.color)}><span className={cn("status-dot", st.dot)} />{st.label}</span></td>
                    <td><span className="text-[13px] font-mono text-foreground">{waitTime}m</span></td>
                    <td><span className="text-[12px] font-mono text-muted-foreground">
                      {new Date(entry.joinedAt).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" })}
                    </span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminQueue;
