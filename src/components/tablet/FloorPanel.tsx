import React, { useState } from "react";
import { Search, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Table, type ServiceMode, zones } from "@/data/mock-data";

interface FloorPanelProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onCreateWalkIn: (mode: ServiceMode) => void;
}

const statusColors: Record<string, string> = {
  available: "bg-status-green-light border-status-green/30",
  occupied: "bg-status-amber-light border-status-amber/30",
  reserved: "bg-status-blue-light border-primary/30",
  dirty: "bg-status-red-light border-status-red/30",
};

const statusDot: Record<string, string> = {
  available: "bg-status-green",
  occupied: "bg-status-amber",
  reserved: "bg-primary",
  dirty: "bg-status-red",
};

export const FloorPanel: React.FC<FloorPanelProps> = ({ tables, selectedTableId, onSelectTable, onCreateWalkIn }) => {
  const [activeZone, setActiveZone] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTables = tables.filter(t => {
    if (activeZone !== "All" && t.zone !== activeZone) return false;
    if (searchQuery && !t.number.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground text-[13px] mb-2">Floor</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search table..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-[9px] bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Zone Tabs */}
      <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-border">
        {["All", ...zones].map(zone => (
          <button
            key={zone}
            onClick={() => setActiveZone(zone)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
              activeZone === zone
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {zone}
          </button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto pos-scrollbar p-3">
        <div className="grid grid-cols-2 gap-2">
          {filteredTables.map(table => (
            <button
              key={table.id}
              onClick={() => onSelectTable(table.id)}
              className={cn(
                "relative p-2.5 rounded-lg border-1.5 text-left transition-all",
                statusColors[table.status],
                selectedTableId === table.id && "ring-2 ring-primary ring-offset-1"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground text-[13px]">T{table.number}</span>
                <span className={cn("w-[6px] h-[6px] rounded-full", statusDot[table.status])} />
              </div>
              <div className="text-[10px] text-muted-foreground">{table.seats} seats</div>
              {table.openAmount && (
                <div className="text-xs font-semibold text-foreground mt-1 font-mono">${table.openAmount.toFixed(2)}</div>
              )}
              {table.elapsedMinutes && (
                <div className="text-[10px] text-muted-foreground">{table.elapsedMinutes}m</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-border space-y-1.5">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs rounded-lg" onClick={() => onCreateWalkIn("takeaway")}>
          <ShoppingBag className="h-3.5 w-3.5" />Takeaway Order
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs rounded-lg" onClick={() => onCreateWalkIn("delivery")}>
          <Truck className="h-3.5 w-3.5" />Delivery Order
        </Button>
      </div>
    </div>
  );
};
