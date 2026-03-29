import { useSyncExternalStore } from "react";

export type TableShape = "round" | "square" | "rectangle" | "booth";

export interface FloorTableConfig {
  id: string;
  tableId: string; // links to mock-data Table.id
  x: number;
  y: number;
  width: number;
  height: number;
  shape: TableShape;
  zone: string;
  rotation: number;
}

export interface FloorZone {
  id: string;
  name: string;
  order: number;
}

const defaultZones: FloorZone[] = [
  { id: "z1", name: "Main Hall", order: 0 },
  { id: "z2", name: "Patio", order: 1 },
  { id: "z3", name: "Private", order: 2 },
  { id: "z4", name: "Bar", order: 3 },
];

// Generate default positions in a grid for existing tables
const defaultTableConfigs: FloorTableConfig[] = [
  { id: "ft1", tableId: "t1", x: 60, y: 60, width: 80, height: 80, shape: "square", zone: "Main Hall", rotation: 0 },
  { id: "ft2", tableId: "t2", x: 180, y: 60, width: 80, height: 80, shape: "square", zone: "Main Hall", rotation: 0 },
  { id: "ft3", tableId: "t3", x: 300, y: 60, width: 80, height: 80, shape: "square", zone: "Main Hall", rotation: 0 },
  { id: "ft4", tableId: "t4", x: 420, y: 60, width: 100, height: 60, shape: "rectangle", zone: "Main Hall", rotation: 0 },
  { id: "ft5", tableId: "t5", x: 60, y: 180, width: 70, height: 70, shape: "round", zone: "Main Hall", rotation: 0 },
  { id: "ft6", tableId: "t6", x: 180, y: 180, width: 80, height: 80, shape: "square", zone: "Main Hall", rotation: 0 },
  { id: "ft15", tableId: "t15", x: 300, y: 180, width: 120, height: 60, shape: "rectangle", zone: "Main Hall", rotation: 0 },
  { id: "ft16", tableId: "t16", x: 460, y: 180, width: 70, height: 70, shape: "round", zone: "Main Hall", rotation: 0 },
  { id: "ft7", tableId: "t7", x: 60, y: 60, width: 70, height: 70, shape: "round", zone: "Patio", rotation: 0 },
  { id: "ft8", tableId: "t8", x: 180, y: 60, width: 80, height: 80, shape: "square", zone: "Patio", rotation: 0 },
  { id: "ft9", tableId: "t9", x: 300, y: 60, width: 100, height: 60, shape: "rectangle", zone: "Patio", rotation: 0 },
  { id: "ft17", tableId: "t17", x: 60, y: 180, width: 80, height: 80, shape: "square", zone: "Patio", rotation: 0 },
  { id: "ft10", tableId: "t10", x: 60, y: 60, width: 120, height: 60, shape: "rectangle", zone: "Private", rotation: 0 },
  { id: "ft11", tableId: "t11", x: 220, y: 60, width: 130, height: 60, shape: "rectangle", zone: "Private", rotation: 0 },
  { id: "ft18", tableId: "t18", x: 60, y: 160, width: 140, height: 60, shape: "booth", zone: "Private", rotation: 0 },
  { id: "ft12", tableId: "t12", x: 60, y: 60, width: 60, height: 60, shape: "round", zone: "Bar", rotation: 0 },
  { id: "ft13", tableId: "t13", x: 160, y: 60, width: 60, height: 60, shape: "round", zone: "Bar", rotation: 0 },
  { id: "ft14", tableId: "t14", x: 260, y: 60, width: 60, height: 60, shape: "round", zone: "Bar", rotation: 0 },
];

let tableConfigs = [...defaultTableConfigs];
let zones = [...defaultZones];
let listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

export function getFloorTablesSnapshot() { return tableConfigs; }
export function getFloorZonesSnapshot() { return zones; }

export function moveTable(configId: string, x: number, y: number) {
  tableConfigs = tableConfigs.map(t => t.id === configId ? { ...t, x, y } : t);
  emit();
}

export function resizeTable(configId: string, width: number, height: number) {
  tableConfigs = tableConfigs.map(t => t.id === configId ? { ...t, width, height } : t);
  emit();
}

export function updateTableShape(configId: string, shape: TableShape) {
  tableConfigs = tableConfigs.map(t => t.id === configId ? { ...t, shape } : t);
  emit();
}

export function addFloorTable(config: FloorTableConfig) {
  tableConfigs = [...tableConfigs, config];
  emit();
}

export function removeFloorTable(configId: string) {
  tableConfigs = tableConfigs.filter(t => t.id !== configId);
  emit();
}

export function addZone(zone: FloorZone) {
  zones = [...zones, zone];
  emit();
}

export function renameZone(id: string, name: string) {
  zones = zones.map(z => z.id === id ? { ...z, name } : z);
  emit();
}

export function removeZone(id: string) {
  zones = zones.filter(z => z.id !== id);
  emit();
}

export function useFloorTables() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getFloorTablesSnapshot
  );
}

export function useFloorZones() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getFloorZonesSnapshot
  );
}
