import React, { useState } from "react";
import { Search, ShoppingBag, Truck, ArrowRightLeft, Merge, Split, X, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Table, type TableStatus, type ServiceMode, zones } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

type TableAction = "transfer" | "merge" | "split" | null;

interface FloorPanelProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onCreateWalkIn: (mode: ServiceMode) => void;
  onTransferTable?: (fromId: string, toId: string) => void;
  onMergeTables?: (tableIds: string[]) => void;
  onSplitTable?: (tableId: string, count: number) => void;
}

const statusConfig: Record<TableStatus, { dot: string; bg: string; border: string; label: string }> = {
  available:  { dot: "bg-status-green",  bg: "bg-status-green/[0.06]",  border: "border-status-green/20",  label: "available" },
  reserved:   { dot: "bg-primary",       bg: "bg-primary/[0.06]",       border: "border-primary/20",       label: "reserved" },
  ordering:   { dot: "bg-status-amber",  bg: "bg-status-amber/[0.06]",  border: "border-status-amber/20",  label: "ordering" },
  ordered:    { dot: "bg-[hsl(24,80%,45%)]", bg: "bg-[hsl(24,80%,45%)]/[0.06]", border: "border-[hsl(24,80%,45%)]/20", label: "ordered" },
  dirty:      { dot: "bg-status-red",    bg: "bg-status-red/[0.06]",    border: "border-status-red/20",    label: "dirty" },
  cleaning:   { dot: "bg-muted-foreground", bg: "bg-muted/50",          border: "border-border",           label: "cleaning" },
};

export const FloorPanel: React.FC<FloorPanelProps> = ({ tables, selectedTableId, onSelectTable, onCreateWalkIn, onTransferTable, onMergeTables, onSplitTable }) => {
  const { t } = useLanguage();
  const [activeZone, setActiveZone] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableAction, setTableAction] = useState<TableAction>(null);
  const [mergeTargets, setMergeTargets] = useState<string[]>([]);
  const [splitCount, setSplitCount] = useState(2);

  const filteredTables = tables.filter(t => {
    if (activeZone !== "All" && t.zone !== activeZone) return false;
    if (searchQuery && !t.number.includes(searchQuery)) return false;
    return true;
  });

  const handleTableClick = (tableId: string) => {
    if (tableAction === "transfer" && selectedTableId) {
      if (tableId !== selectedTableId) {
        onTransferTable?.(selectedTableId, tableId);
        setTableAction(null);
      }
      return;
    }
    if (tableAction === "merge") {
      setMergeTargets(prev =>
        prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
      );
      return;
    }
    onSelectTable(tableId);
  };

  const handleConfirmMerge = () => {
    if (mergeTargets.length >= 2) {
      onMergeTables?.(mergeTargets);
    }
    setMergeTargets([]);
    setTableAction(null);
  };

  const handleConfirmSplit = () => {
    if (selectedTableId && splitCount >= 2) {
      onSplitTable?.(selectedTableId, splitCount);
    }
    setTableAction(null);
  };

  const cancelAction = () => {
    setTableAction(null);
    setMergeTargets([]);
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const showActions = selectedTable && !tableAction && (selectedTable.status === "ordering" || selectedTable.status === "ordered" || selectedTable.status === "available");

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground text-[13px] mb-2">{t("floor")}</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search_table")}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-[9px] bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Zone Tabs — flex wrap, no scroll */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-border">
        {[t("all"), ...zones].map((zone, idx) => {
          const rawZone = idx === 0 ? "All" : zones[idx - 1];
          return (
            <button
              key={rawZone}
              onClick={() => setActiveZone(rawZone)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                activeZone === rawZone
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {zone}
            </button>
          );
        })}
      </div>

      {/* Action mode banner */}
      {tableAction && (
        <div className="px-3 py-2 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-primary">
              {tableAction === "transfer" && t("select_target")}
              {tableAction === "merge" && `${t("select_tables_to_merge")} (${mergeTargets.length})`}
              {tableAction === "split" && t("split_table")}
            </span>
            <button onClick={cancelAction} className="p-0.5 rounded hover:bg-accent">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          {tableAction === "split" && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-foreground">{t("split_into")}</span>
              <div className="flex items-center gap-1">
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setSplitCount(n)}
                    className={cn(
                      "w-7 h-7 rounded-md text-xs font-bold transition-colors",
                      splitCount === n ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button onClick={handleConfirmSplit} className="ml-auto p-1 rounded-md bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {tableAction === "merge" && mergeTargets.length >= 2 && (
            <Button size="sm" className="w-full mt-2 h-7 text-xs rounded-md" onClick={handleConfirmMerge}>
              {t("merge_confirm")} ({mergeTargets.length} {t("tables")})
            </Button>
          )}
        </div>
      )}

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto pos-scrollbar p-3">
        <div className="grid grid-cols-2 gap-2">
          {filteredTables.map(table => {
            const cfg = statusConfig[table.status];
            const isSelected = selectedTableId === table.id;
            const isMergeTarget = mergeTargets.includes(table.id);
            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={cn(
                  "relative p-2.5 rounded-lg border-1.5 text-left transition-all",
                  cfg.bg, cfg.border,
                  isSelected && "ring-2 ring-primary ring-offset-1",
                  isMergeTarget && "ring-2 ring-primary ring-offset-1 bg-primary/10",
                  tableAction === "transfer" && table.status !== "available" && table.id !== selectedTableId && "opacity-40 pointer-events-none"
                )}
              >
                {/* Status stripe */}
                <div className={cn("absolute top-0 left-0 w-1 h-full rounded-l-lg", cfg.dot)} />
                
                <div className="pl-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-foreground text-[13px]">T{table.number}</span>
                    <span className={cn("w-[6px] h-[6px] rounded-full", cfg.dot)} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="h-2.5 w-2.5" />
                    <span>{table.guestCount || 0}/{table.seats}</span>
                  </div>
                  {table.openAmount !== undefined && table.openAmount > 0 && (
                    <div className="text-xs font-semibold text-foreground mt-1 font-mono">${table.openAmount.toFixed(2)}</div>
                  )}
                  {table.elapsedMinutes !== undefined && table.elapsedMinutes > 0 && (
                    <div className="text-[10px] text-muted-foreground">{table.elapsedMinutes}m</div>
                  )}
                  {table.mergedWith && table.mergedWith.length > 0 && (
                    <div className="text-[9px] text-primary font-medium mt-0.5">
                      +T{table.mergedWith.map(id => tables.find(t => t.id === id)?.number).join(",T")}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Actions (shown when a table is selected) */}
      {showActions && (
        <div className="px-3 py-2 border-t border-border">
          <div className="flex gap-1">
            <button
              onClick={() => setTableAction("transfer")}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              {t("transfer_table")}
            </button>
            <button
              onClick={() => { setTableAction("merge"); setMergeTargets(selectedTableId ? [selectedTableId] : []); }}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Merge className="h-3.5 w-3.5" />
              {t("merge_tables")}
            </button>
            <button
              onClick={() => setTableAction("split")}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Split className="h-3.5 w-3.5" />
              {t("split_table")}
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-3 border-t border-border space-y-1.5">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs rounded-lg" onClick={() => onCreateWalkIn("takeaway")}>
          <ShoppingBag className="h-3.5 w-3.5" />{t("takeaway_order")}
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs rounded-lg" onClick={() => onCreateWalkIn("delivery")}>
          <Truck className="h-3.5 w-3.5" />{t("delivery_order")}
        </Button>
      </div>
    </div>
  );
};
