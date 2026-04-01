import React, { useState, useEffect } from "react";
import {
  ChefHat, CheckCircle2, Clock, AlertCircle, MessageSquare, Package,
  PlayCircle, Check, XCircle, UtensilsCrossed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useKDSTickets, getTicketUrgency, getElapsedMin,
  startPreparing, markReady, markServed, cancelTicket,
  type KDSTicket, type KDSTicketStatus
} from "@/state/kds-store";

function TicketCard({ ticket, mode }: { ticket: KDSTicket; mode: "kitchen" | "server" }) {
  const urgency = getTicketUrgency(ticket);
  const elapsed = getElapsedMin(ticket.startedAt || ticket.firedAt);
  const isCancelled = ticket.status === "cancelled";

  const borderColor = isCancelled ? "border-destructive" :
    urgency === "red" ? "border-destructive" :
    urgency === "amber" ? "border-status-amber" : "border-status-green";

  return (
    <div className={`uniweb-card border-l-4 ${borderColor} p-4 relative ${urgency === "red" && !isCancelled ? "animate-pulse" : ""}`}>
      {isCancelled && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-destructive/10 rounded-lg">
          <span className="text-destructive font-black text-lg tracking-widest rotate-[-6deg]">CANCELLED</span>
        </div>
      )}

      <div className={`${isCancelled ? "line-through opacity-50" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {ticket.tableNumber ? (
              <span className="font-bold text-foreground text-sm">T{ticket.tableNumber}</span>
            ) : ticket.collectionNumber ? (
              <span className="font-bold text-primary text-sm">{ticket.collectionNumber}</span>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono uppercase">{ticket.serviceMode}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {urgency === "red" && !isCancelled && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
            <span className={`text-[11px] font-bold font-mono ${urgency === "red" ? "text-destructive" : urgency === "amber" ? "text-status-amber" : "text-muted-foreground"}`}>
              {elapsed}m
            </span>
          </div>
        </div>

        {/* Item */}
        <div className="flex items-start justify-between mb-1">
          <div className="text-sm font-semibold text-foreground leading-tight">{ticket.name}</div>
          <span className="text-sm font-bold text-foreground bg-accent px-2 py-0.5 rounded-md ml-2 shrink-0">×{ticket.quantity}</span>
        </div>

        {/* Combo */}
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
                {m.name}{m.price > 0 && <span className="text-muted-foreground ml-0.5">(+${m.price.toFixed(2)})</span>}
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

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-1">
          {(["new", "preparing", "ready", "served"] as const).map((step, idx) => {
            const stepOrder = ["new", "preparing", "ready", "served"];
            const currentIdx = stepOrder.indexOf(ticket.status === "cancelled" ? "new" : ticket.status);
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={step} className={`h-1.5 flex-1 rounded-full transition-colors ${
                isDone ? "bg-status-green" : isCurrent ? (
                  ticket.status === "new" ? "bg-primary" :
                  ticket.status === "preparing" ? "bg-status-amber" :
                  "bg-status-green"
                ) : "bg-border"
              }`} />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-muted-foreground">FIRED</span>
          <span className="text-[9px] text-muted-foreground">PREP</span>
          <span className="text-[9px] text-muted-foreground">READY</span>
          <span className="text-[9px] text-muted-foreground">SERVED</span>
        </div>
      </div>

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

const AdminKDS: React.FC = () => {
  const tickets = useKDSTickets();
  const [mode, setMode] = useState<"kitchen" | "server">("kitchen");
  const [, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  const kitchenStatuses: KDSTicketStatus[] = ["new", "preparing", "ready"];
  const activeTickets = tickets.filter(t => kitchenStatuses.includes(t.status) || t.status === "cancelled");
  const serverTickets = tickets.filter(t => t.status === "ready");

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">KDS Monitor</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {mode === "kitchen" ? `${activeTickets.length} active tickets` : `${serverTickets.length} ready for collection`}
          </p>
        </div>
        <Tabs value={mode} onValueChange={v => setMode(v as typeof mode)}>
          <TabsList className="bg-accent rounded-lg">
            <TabsTrigger value="kitchen" className="text-[13px] rounded-md gap-1.5">
              <ChefHat className="h-3.5 w-3.5" />Kitchen
            </TabsTrigger>
            <TabsTrigger value="server" className="text-[13px] rounded-md gap-1.5">
              <UtensilsCrossed className="h-3.5 w-3.5" />Collection
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Urgency legend */}
      <div className="flex gap-4 mb-4">
        {[
          { label: "< 5 min", color: "bg-status-green" },
          { label: "5–10 min", color: "bg-status-amber" },
          { label: "> 10 min", color: "bg-destructive" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className={`w-3 h-3 rounded-sm ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {mode === "kitchen" ? (
        <div className="grid grid-cols-3 gap-5">
          {(["new", "preparing", "ready"] as const).map(status => {
            const statusTickets = activeTickets.filter(t => t.status === status || (status === "new" && t.status === "cancelled"));
            const Icon = status === "new" ? Clock : status === "preparing" ? ChefHat : CheckCircle2;
            const color = status === "new" ? "text-primary" : status === "preparing" ? "text-status-amber" : "text-status-green";
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="section-label">{status.toUpperCase()}</span>
                  <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    status === "new" ? "bg-primary/10 text-primary" :
                    status === "preparing" ? "bg-status-amber/10 text-status-amber" :
                    "bg-status-green/10 text-status-green"
                  }`}>{statusTickets.filter(t => t.status === status).length}</span>
                </div>
                <div className="space-y-3">
                  {statusTickets.map(t => <TicketCard key={t.id} ticket={t} mode="kitchen" />)}
                  {statusTickets.length === 0 && (
                    <div className="uniweb-card p-6 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No tickets</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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

export default AdminKDS;
