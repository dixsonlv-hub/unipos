import React from "react";
import { Clock, ChefHat, CheckCircle2 } from "lucide-react";
import { sampleOrders } from "@/data/mock-data";

const statusColors: Record<string, string> = {
  new: "border-pos-reserved bg-pos-reserved/10",
  preparing: "border-pos-occupied bg-pos-occupied/10",
  ready: "border-pos-available bg-pos-available/10",
  served: "border-border bg-muted/30",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "NEW", color: "text-pos-reserved" },
  preparing: { label: "PREPARING", color: "text-pos-occupied" },
  ready: { label: "READY", color: "text-pos-available" },
  served: { label: "SERVED", color: "text-muted-foreground" },
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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">KDS Monitor</h1>
        <p className="text-sm text-muted-foreground">{allTickets.length} active tickets</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {["new", "preparing", "ready"].map(status => (
          <div key={status}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              {status === "new" && <Clock className="h-4 w-4" />}
              {status === "preparing" && <ChefHat className="h-4 w-4" />}
              {status === "ready" && <CheckCircle2 className="h-4 w-4" />}
              {statusLabels[status].label}
              <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                {allTickets.filter(t => t.status === status).length}
              </span>
            </h2>
            <div className="space-y-3">
              {allTickets.filter(t => t.status === status).map(ticket => (
                <div key={ticket.id} className={`p-4 rounded-xl border-2 ${statusColors[status]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-foreground text-sm">T{ticket.tableNumber}</span>
                    <span className={`text-[10px] font-bold ${statusLabels[status].color}`}>{statusLabels[status].label}</span>
                  </div>
                  <div className="text-sm font-medium text-foreground">{ticket.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">Qty: {ticket.quantity}</div>
                  {ticket.modifiers.length > 0 && (
                    <div className="text-xs text-muted-foreground">{ticket.modifiers.map(m => m.name).join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminKDS;
