import React, { useState, useEffect } from "react";
import {
  ChefHat, CheckCircle2, Clock, AlertCircle, MessageSquare, Package,
  PlayCircle, Check, XCircle, UtensilsCrossed, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useKDSTickets, getTicketUrgency, getElapsedMin, getGroupedTickets, isGroupedOrder,
  startPreparing, markReady, markServed, cancelTicket,
  type KDSTicket, type KDSTicketStatus, type KDSGroupedOrder
} from "@/state/kds-store";

const urgencyColors: Record<string, { border: string; bg: string }> = {
  green: { border: "border-status-green", bg: "bg-status-green/5" },
  amber: { border: "border-status-amber", bg: "bg-status-amber/5" },
  red:   { border: "border-destructive",  bg: "bg-destructive/5" },
};

const statusLabels: Record<string, string> = {
  new: "NEW", preparing: "PREPARING", ready: "READY", cancelled: "CANCELLED",
};

function TicketCard({ ticket, mode }: { ticket: KDSTicket; mode: "kitchen" | "server" }) {
  const urgency = getTicketUrgency(ticket);
  const elapsed = getElapsedMin(ticket.startedAt || ticket.firedAt);
  const uc = urgencyColors[urgency];
  const isCancelled = ticket.status === "cancelled";

  return (
    <div className={`uniweb-card border-l-4 ${isCancelled ? "border-destructive opacity-60" : uc.border} p-4 relative ${urgency === "red" && !isCancelled ? "animate-pulse" : ""}`}>
      {isCancelled && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-destructive/10 rounded-lg">
          <span className="text-destructive font-black text-lg tracking-widest rotate-[-6deg]">CANCELLED</span>
        </div>
      )}

      {/* Header */}
      <div className={`flex items-center justify-between mb-2 ${isCancelled ? "line-through opacity-50" : ""}`}>
        <div className="flex items-center gap-2">
          {ticket.tableNumber ? (
            <span className="font-bold text-foreground text-base">T{ticket.tableNumber}</span>
          ) : ticket.collectionNumber ? (
            <span className="font-bold text-primary text-base">{ticket.collectionNumber}</span>
          ) : (
            <span className="text-xs text-muted-foreground font-mono uppercase">{ticket.serviceMode}</span>
          )}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            ticket.status === "new" ? "bg-primary/10 text-primary" :
            ticket.status === "preparing" ? "bg-status-amber/10 text-status-amber" :
            ticket.status === "ready" ? "bg-status-green/10 text-status-green" :
            "bg-destructive/10 text-destructive"
          }`}>{statusLabels[ticket.status]}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {urgency === "red" && !isCancelled && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
          <span className={`text-[11px] font-bold font-mono ${urgency === "red" ? "text-destructive" : "text-muted-foreground"}`}>
            {elapsed}m
          </span>
        </div>
      </div>

      {/* Item */}
      <div className={`flex items-start justify-between mb-1 ${isCancelled ? "line-through opacity-50" : ""}`}>
        <div className="text-sm font-semibold text-foreground leading-tight">{ticket.name}</div>
        <span className="text-sm font-bold text-foreground bg-accent px-2 py-0.5 rounded-md ml-2 shrink-0">×{ticket.quantity}</span>
      </div>

      {/* Combo items */}
      {ticket.comboItems && ticket.comboItems.length > 0 && (
        <div className="mt-2 mb-1 pl-2 border-l-2 border-primary/20 space-y-0.5">
          <div className="flex items-center gap-1 mb-1">
            <Package className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Combo</span>
          </div>
          {ticket.comboItems.map((ci, idx) => (
            <div key={idx} className="text-xs text-foreground">
              <span className="text-muted-foreground">{ci.groupName}:</span>{" "}
              <span className="font-medium">{ci.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Modifiers */}
      {ticket.modifiers.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {ticket.modifiers.map((m, idx) => (
            <span key={idx} className="text-[11px] bg-accent text-foreground px-2 py-0.5 rounded-md font-medium">
              {m.name}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {ticket.notes && (
        <div className="mt-2 flex items-start gap-1.5 bg-status-amber/5 rounded-md px-2.5 py-1.5">
          <MessageSquare className="h-3 w-3 text-status-amber mt-0.5 shrink-0" />
          <span className="text-[11px] text-foreground font-medium leading-snug">{ticket.notes}</span>
        </div>
      )}

      {/* Actions */}
      {!isCancelled && (
        <div className="mt-3 flex gap-2">
          {mode === "kitchen" && ticket.status === "new" && (
            <Button size="sm" className="flex-1 rounded-lg text-xs h-8" onClick={() => startPreparing(ticket.id)}>
              <PlayCircle className="h-3.5 w-3.5 mr-1" />Start
            </Button>
          )}
          {mode === "kitchen" && ticket.status === "preparing" && (
            <Button size="sm" className="flex-1 rounded-lg text-xs h-8 bg-status-green hover:bg-status-green/90 text-white" onClick={() => markReady(ticket.id)}>
              <Check className="h-3.5 w-3.5 mr-1" />Done
            </Button>
          )}
          {mode === "server" && ticket.status === "ready" && (
            <Button size="sm" className="flex-1 rounded-lg text-xs h-8 bg-status-green hover:bg-status-green/90 text-white" onClick={() => markServed(ticket.id)}>
              <UtensilsCrossed className="h-3.5 w-3.5 mr-1" />Served
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** Grouped order card for serveTogether */
function GroupedOrderCard({ group, mode }: { group: KDSGroupedOrder; mode: "kitchen" | "server" }) {
  const elapsed = getElapsedMin(group.earliestFired);
  const uc = urgencyColors[group.worstUrgency];

  return (
    <div className={`uniweb-card border-l-4 ${uc.border} p-4 ${group.worstUrgency === "red" ? "animate-pulse" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {group.tableNumber ? (
            <span className="font-bold text-foreground text-base">T{group.tableNumber}</span>
          ) : (
            <span className="text-xs text-muted-foreground font-mono uppercase">{group.serviceMode}</span>
          )}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">SERVE TOGETHER</span>
        </div>
        <span className={`text-[11px] font-bold font-mono ${group.worstUrgency === "red" ? "text-destructive" : "text-muted-foreground"}`}>
          {elapsed}m
        </span>
      </div>
      <div className="space-y-2">
        {group.tickets.map(t => (
          <div key={t.id} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-accent/50">
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">{t.name}</span>
              {t.modifiers.length > 0 && (
                <span className="text-[10px] text-muted-foreground ml-2">{t.modifiers.map(m => m.name).join(", ")}</span>
              )}
              {t.notes && <span className="text-[10px] text-status-amber ml-2">📝 {t.notes}</span>}
            </div>
            <span className="text-xs font-bold bg-accent px-2 py-0.5 rounded-md">×{t.quantity}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {mode === "kitchen" && group.tickets.some(t => t.status === "new") && (
          <Button size="sm" className="flex-1 rounded-lg text-xs h-8" onClick={() => group.tickets.filter(t => t.status === "new").forEach(t => startPreparing(t.id))}>
            <PlayCircle className="h-3.5 w-3.5 mr-1" />Start All
          </Button>
        )}
        {mode === "kitchen" && group.tickets.every(t => t.status === "preparing") && (
          <Button size="sm" className="flex-1 rounded-lg text-xs h-8 bg-status-green hover:bg-status-green/90 text-white" onClick={() => group.tickets.forEach(t => markReady(t.id))}>
            <Check className="h-3.5 w-3.5 mr-1" />All Done
          </Button>
        )}
        {mode === "server" && group.tickets.every(t => t.status === "ready") && (
          <Button size="sm" className="flex-1 rounded-lg text-xs h-8 bg-status-green hover:bg-status-green/90 text-white" onClick={() => group.tickets.forEach(t => markServed(t.id))}>
            <UtensilsCrossed className="h-3.5 w-3.5 mr-1" />Served
          </Button>
        )}
      </div>
    </div>
  );
}

const KDSDisplay: React.FC = () => {
  const tickets = useKDSTickets();
  const [mode, setMode] = useState<"kitchen" | "server">("kitchen");
  const [, setTick] = useState(0);

  // Refresh every 30s for elapsed time updates
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  const kitchenStatuses: KDSTicketStatus[] = ["new", "preparing", "ready"];
  const kitchenTickets = tickets.filter(t => kitchenStatuses.includes(t.status) || t.status === "cancelled");
  const serverTickets = tickets.filter(t => t.status === "ready");
  const groupedKitchen = getGroupedTickets(kitchenTickets);
  const groupedServer = getGroupedTickets(serverTickets);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Monitor className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">KDS</h1>
          <span className="text-sm text-muted-foreground">
            {mode === "kitchen" ? `${kitchenTickets.length} active` : `${serverTickets.length} ready`}
          </span>
        </div>
        <Tabs value={mode} onValueChange={v => setMode(v as typeof mode)}>
          <TabsList className="bg-accent rounded-lg">
            <TabsTrigger value="kitchen" className="text-xs rounded-md gap-1.5">
              <ChefHat className="h-3.5 w-3.5" />Kitchen
            </TabsTrigger>
            <TabsTrigger value="server" className="text-xs rounded-md gap-1.5">
              <UtensilsCrossed className="h-3.5 w-3.5" />Collection
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === "kitchen" ? (
        <div className="grid grid-cols-3 gap-4">
          {(["new", "preparing", "ready"] as const).map(status => {
            const statusTickets = kitchenTickets.filter(t => t.status === status || (status === "new" && t.status === "cancelled"));
            const icon = status === "new" ? Clock : status === "preparing" ? ChefHat : CheckCircle2;
            const Icon = icon;
            const color = status === "new" ? "text-primary" : status === "preparing" ? "text-status-amber" : "text-status-green";
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{status}</span>
                  <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    status === "new" ? "bg-primary/10 text-primary" :
                    status === "preparing" ? "bg-status-amber/10 text-status-amber" :
                    "bg-status-green/10 text-status-green"
                  }`}>{statusTickets.filter(t => t.status === status).length}</span>
                </div>
                <div className="space-y-3">
                  {statusTickets.map(t => {
                    // Check if this ticket is part of a grouped order
                    const grouped = groupedKitchen.find(g => isGroupedOrder(g) && g.tickets.some(gt => gt.id === t.id));
                    if (grouped && isGroupedOrder(grouped)) {
                      // Only render the grouped card once (for first ticket)
                      if (grouped.tickets[0].id !== t.id) return null;
                      return <GroupedOrderCard key={grouped.orderId} group={grouped} mode="kitchen" />;
                    }
                    return <TicketCard key={t.id} ticket={t} mode="kitchen" />;
                  })}
                  {statusTickets.length === 0 && (
                    <div className="uniweb-card p-8 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No tickets</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {serverTickets.length === 0 ? (
            <div className="col-span-full uniweb-card p-12 flex flex-col items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-status-green mb-2" />
              <span className="text-sm text-muted-foreground">All orders served</span>
            </div>
          ) : (
            serverTickets.map(t => <TicketCard key={t.id} ticket={t} mode="server" />)
          )}
        </div>
      )}
    </div>
  );
};

export default KDSDisplay;
