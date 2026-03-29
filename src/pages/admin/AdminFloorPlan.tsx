import React, { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Trash2, Move, Eye, Edit3, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useFloorTables, useFloorZones, moveTable, addFloorTable, removeFloorTable,
  updateTableShape, addZone, removeZone, renameZone,
  type FloorTableConfig, type TableShape,
} from "@/state/floorplan-store";
import { tables as mockTables, type TableStatus } from "@/data/mock-data";

const shapeLabels: Record<TableShape, string> = {
  round: "Round", square: "Square", rectangle: "Rectangle", booth: "Booth",
};

const statusColors: Record<TableStatus, string> = {
  available: "hsl(145, 55%, 33%)",
  reserved: "hsl(221, 63%, 33%)",
  ordering: "hsl(30, 80%, 32%)",
  ordered: "hsl(24, 80%, 45%)",
  dirty: "hsl(0, 72%, 35%)",
  cleaning: "hsl(0, 0%, 50%)",
};

const AdminFloorPlan: React.FC = () => {
  const floorTables = useFloorTables();
  const zones = useFloorZones();
  const [activeZone, setActiveZone] = useState(zones[0]?.name || "Main Hall");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [newZoneName, setNewZoneName] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  const zoneTables = floorTables.filter(ft => ft.zone === activeZone);
  const selectedConfig = floorTables.find(ft => ft.id === selected);

  const handleMouseDown = useCallback((e: React.MouseEvent, configId: string) => {
    if (mode !== "edit") return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const config = floorTables.find(ft => ft.id === configId);
    if (!config) return;
    setDragging(configId);
    setSelected(configId);
    setDragOffset({ x: e.clientX - rect.left - config.x, y: e.clientY - rect.top - config.y });
  }, [mode, floorTables]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.round((e.clientX - rect.left - dragOffset.x) / 10) * 10);
    const y = Math.max(0, Math.round((e.clientY - rect.top - dragOffset.y) / 10) * 10);
    moveTable(dragging, x, y);
  }, [dragging, dragOffset]);

  const handleMouseUp = useCallback(() => { setDragging(null); }, []);

  const handleAddTable = () => {
    const existingTableIds = floorTables.map(ft => ft.tableId);
    const unplaced = mockTables.filter(t => !existingTableIds.includes(t.id) && t.zone === activeZone);
    if (unplaced.length === 0) return;
    const t = unplaced[0];
    addFloorTable({
      id: `ft-${Date.now()}`, tableId: t.id,
      x: 60, y: 60, width: 80, height: 80,
      shape: t.seats <= 4 ? "square" : "rectangle",
      zone: activeZone, rotation: 0,
    });
  };

  const handleAddZone = () => {
    if (!newZoneName.trim()) return;
    addZone({ id: `z-${Date.now()}`, name: newZoneName.trim(), order: zones.length });
    setNewZoneName("");
  };

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Floor Plan Editor</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{floorTables.length} tables placed across {zones.length} zones</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={mode === "edit" ? "default" : "outline"} size="sm" className="rounded-lg" onClick={() => setMode("edit")}>
            <Edit3 className="h-3.5 w-3.5 mr-1.5" />Edit
          </Button>
          <Button variant={mode === "preview" ? "default" : "outline"} size="sm" className="rounded-lg" onClick={() => setMode("preview")}>
            <Eye className="h-3.5 w-3.5 mr-1.5" />Preview
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0 space-y-4">
          {/* Zones */}
          <div className="uniweb-card p-4">
            <div className="section-label mb-2">Zones</div>
            <div className="space-y-1">
              {zones.map(z => (
                <div key={z.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveZone(z.name)}
                    className={cn("flex-1 text-left px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                      activeZone === z.name ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                    )}>
                    {z.name}
                  </button>
                  {zones.length > 1 && (
                    <button onClick={() => removeZone(z.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <input value={newZoneName} onChange={e => setNewZoneName(e.target.value)} placeholder="New zone..."
                className="flex-1 h-8 px-2.5 rounded-md bg-background border-1.5 border-border text-[12px] text-foreground focus:outline-none focus:border-primary" />
              <button onClick={handleAddZone} className="p-1.5 rounded-md bg-primary text-primary-foreground">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Selected table properties */}
          {selectedConfig && mode === "edit" && (
            <div className="uniweb-card p-4">
              <div className="section-label mb-2">Table Properties</div>
              <div className="space-y-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Table</span>
                  <span className="font-mono text-foreground font-semibold">
                    T{mockTables.find(t => t.id === selectedConfig.tableId)?.number}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Shape</span>
                  <div className="grid grid-cols-2 gap-1">
                    {(["round", "square", "rectangle", "booth"] as TableShape[]).map(s => (
                      <button key={s} onClick={() => updateTableShape(selectedConfig.id, s)}
                        className={cn("py-1.5 rounded-md text-[11px] font-medium transition-colors",
                          selectedConfig.shape === s ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
                        )}>
                        {shapeLabels[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Position</span>
                  <span className="font-mono text-foreground">{selectedConfig.x}, {selectedConfig.y}</span>
                </div>
                <button onClick={() => { removeFloorTable(selectedConfig.id); setSelected(null); }}
                  className="w-full py-1.5 rounded-md bg-status-red-light text-destructive text-[11px] font-semibold hover:bg-destructive/15 transition-colors">
                  Remove Table
                </button>
              </div>
            </div>
          )}

          {mode === "edit" && (
            <Button variant="outline" size="sm" className="w-full rounded-lg" onClick={handleAddTable}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />Place Table
            </Button>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={cn(
              "relative w-full h-[600px] bg-accent/30 rounded-xl border-1.5 border-border overflow-hidden",
              mode === "edit" && "cursor-crosshair"
            )}
            style={{ backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          >
            {zoneTables.map(ft => {
              const mockTable = mockTables.find(t => t.id === ft.tableId);
              if (!mockTable) return null;
              const isSelected = selected === ft.id;
              const statusColor = mode === "preview" ? statusColors[mockTable.status] : undefined;

              return (
                <div
                  key={ft.id}
                  onMouseDown={e => handleMouseDown(e, ft.id)}
                  onClick={() => setSelected(ft.id)}
                  className={cn(
                    "absolute flex flex-col items-center justify-center border-2 transition-shadow select-none",
                    ft.shape === "round" ? "rounded-full" : ft.shape === "booth" ? "rounded-t-xl rounded-b-sm" : "rounded-lg",
                    mode === "edit" ? "cursor-grab active:cursor-grabbing" : "cursor-default",
                    isSelected ? "ring-2 ring-primary ring-offset-2 border-primary" : "border-border",
                    dragging === ft.id && "shadow-lg z-10"
                  )}
                  style={{
                    left: ft.x, top: ft.y, width: ft.width, height: ft.height,
                    backgroundColor: statusColor || "hsl(var(--card))",
                    borderColor: statusColor ? statusColor : undefined,
                  }}
                >
                  <span className="text-[13px] font-bold text-foreground leading-none">T{mockTable.number}</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">{mockTable.seats} pax</span>
                  {mode === "preview" && mockTable.openAmount !== undefined && mockTable.openAmount > 0 && (
                    <span className="text-[10px] font-mono font-semibold text-foreground mt-0.5">${mockTable.openAmount.toFixed(0)}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend (preview mode) */}
          {mode === "preview" && (
            <div className="flex items-center gap-4 mt-3">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-muted-foreground capitalize">{status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFloorPlan;
