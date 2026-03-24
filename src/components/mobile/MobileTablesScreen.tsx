import React, { useState } from "react";
import { Search, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Table, zones } from "@/data/mock-data";

const statusColors: Record<string, string> = {
  available: "bg-pos-available/15 border-pos-available/50",
  occupied: "bg-pos-occupied/15 border-pos-occupied/50",
  reserved: "bg-pos-reserved/15 border-pos-reserved/50",
  dirty: "bg-pos-dirty/15 border-pos-dirty/50",
};

const statusDot: Record<string, string> = {
  available: "bg-pos-available",
  occupied: "bg-pos-occupied",
  reserved: "bg-pos-reserved",
  dirty: "bg-pos-dirty",
};

interface Props {
  tables: Table[];
  onSelectTable: (table: Table) => void;
}

export const MobileTablesScreen: React.FC<Props> = ({ tables, onSelectTable }) => {
  const [zone, setZone] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = tables.filter(t => {
    if (zone !== "All" && t.zone !== zone) return false;
    if (search && !t.number.includes(search)) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Nav Bar */}
      <div className="bg-card border-b border-border px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-foreground">Tables</h1>
          <span className="text-xs text-muted-foreground">Hawker House · Main Outlet</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search table..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Zone Filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {["All", ...zones].map(z => (
          <button
            key={z}
            onClick={() => setZone(z)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              zone === z
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            )}
          >
            {z}
          </button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(table => (
            <button
              key={table.id}
              onClick={() => onSelectTable(table)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all active:scale-[0.97]",
                statusColors[table.status]
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-foreground">T{table.number}</span>
                <span className={cn("w-2.5 h-2.5 rounded-full", statusDot[table.status])} />
              </div>
              <div className="text-xs text-muted-foreground mb-1">{table.seats} seats</div>
              {table.openAmount && (
                <div className="text-sm font-semibold text-foreground">${table.openAmount.toFixed(2)}</div>
              )}
              {table.elapsedMinutes !== undefined && table.elapsedMinutes > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {table.elapsedMinutes}m
                </div>
              )}
              {table.server && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <User className="h-3 w-3" />
                  {table.server}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
