import React from "react";
import { Clock, ChefHat, CheckCircle2 } from "lucide-react";
import { sampleOrders } from "@/data/mock-data";

const statusConfig: Record<string, { label: string; border: string; bg: string; text: string; icon: React.FC<{ className?: string }> }> = {
  new: { label: "NEW", border: "border-primary", bg: "bg-status-blue-light", text: "text-primary", icon: Clock },
  preparing: { label: "PREPARING", border: "border-status-amber", bg: "bg-status-amber-light", text: "text-status-amber", icon: ChefHat },
  ready: { label: "READY", border: "border-status-green", bg: "bg-status-green-light", text: "text-status-green", icon: CheckCircle2 },
};

const AdminKDS: React.FC = () => {
  const allTickets = sampleOrders.flatMap(order =>
    order.items.filter(i => i.status !== "served").map(item => ({
      ...item,
      orderId: order.id,
      tableNumber: order.tableNumber,
    }))
  );

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">KDS Monitor</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{allTickets.length} active tickets</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(["new", "preparing", "ready"] as const).map(status => {
          const config = statusConfig[status];
          const tickets = allTickets.filter(t => t.status === status);
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <config.icon className={`h-4 w-4 ${config.text}`} />
                <span className="section-label">{config.label}</span>
                <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-md ${config.bg} ${config.text}`}>
                  {tickets.length}
                </span>
              </div>
              <div className="space-y-3">
                {tickets.map(ticket => (
                  <div key={ticket.id} className={`uniweb-card ${config.border} ${config.bg} p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-foreground text-[13px]">T{ticket.tableNumber}</span>
                      <span className={`text-[10px] font-bold ${config.text}`}>{config.label}</span>
                    </div>
                    <div className="text-[13px] font-medium text-foreground">{ticket.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Qty: {ticket.quantity}</div>
                    {ticket.modifiers.length > 0 && (
                      <div className="text-[11px] text-muted-foreground">{ticket.modifiers.map(m => m.name).join(", ")}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminKDS;
