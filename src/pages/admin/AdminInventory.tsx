import React, { useState } from "react";
import { Package, Search, AlertTriangle, TrendingDown, Clock, Plus, ArrowUpDown, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  useInventory, useStockMovements, usePurchaseOrders,
  getStockStatus, adjustStock, getOverstockItems, getDailyCOGS,
  type InventoryItem, type StockStatus as StockStatusType,
} from "@/state/inventory-store";

const statusStyles: Record<StockStatusType, { label: string; color: string; dot: string }> = {
  "in-stock": { label: "In Stock", color: "bg-status-green-light text-status-green", dot: "bg-status-green" },
  low: { label: "Low Stock", color: "bg-status-amber-light text-status-amber", dot: "bg-status-amber" },
  "out-of-stock": { label: "Out of Stock", color: "bg-status-red-light text-status-red", dot: "bg-status-red" },
  expiring: { label: "Expiring Soon", color: "bg-[hsl(280,60%,90%)] text-[hsl(280,60%,40%)]", dot: "bg-[hsl(280,60%,40%)]" },
};

const AdminInventory: React.FC = () => {
  const items = useInventory();
  const movements = useStockMovements();
  const purchaseOrders = usePurchaseOrders();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("stock");
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustType, setAdjustType] = useState<"receive" | "waste" | "adjustment">("receive");
  const [adjustReason, setAdjustReason] = useState("");

  const filtered = search
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()))
    : items;

  const lowStock = items.filter(i => getStockStatus(i) === "low" || getStockStatus(i) === "out-of-stock");
  const expiringSoon = items.filter(i => getStockStatus(i) === "expiring");
  const totalValue = items.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0);
  const overstockItems = getOverstockItems();
  const dailyCOGS = getDailyCOGS();

  const handleAdjust = () => {
    if (!adjustItem || !adjustQty) return;
    const qty = adjustType === "waste" ? -Math.abs(Number(adjustQty)) : Math.abs(Number(adjustQty));
    adjustStock(adjustItem.id, qty, adjustType, adjustReason || adjustType, "Current User");
    setAdjustItem(null);
    setAdjustQty("");
    setAdjustReason("");
  };

  // Supplier comparison data
  const supplierItems = items.filter(i => i.supplierPrices && i.supplierPrices.length > 1);

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Inventory Management</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{items.length} SKUs tracked</p>
        </div>
        <Button className="rounded-lg"><Plus className="h-4 w-4 mr-1.5" />Add Item</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total SKUs", value: items.length, icon: Package, color: "text-primary" },
          { label: "Low Stock Alerts", value: lowStock.length, icon: AlertTriangle, color: "text-status-amber" },
          { label: "Total Value", value: `$${totalValue.toFixed(0)}`, icon: TrendingDown, color: "text-status-green" },
          { label: "Expiring Soon", value: expiringSoon.length, icon: Clock, color: "text-destructive" },
        ].map((kpi, i) => (
          <div key={i} className="uniweb-card p-4 relative overflow-hidden">
            <div className={cn("kpi-stripe", i === 0 ? "bg-primary" : i === 1 ? "bg-status-amber" : i === 2 ? "bg-status-green" : "bg-destructive")} />
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

      {/* Overstock alert */}
      {overstockItems.length > 0 && (
        <div className="uniweb-card p-4 mb-6 border-l-4 border-status-amber">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-status-amber" />
            <span className="text-sm font-semibold text-foreground">Overstock Alert — Consider Promotions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {overstockItems.map(item => (
              <span key={item.id} className="text-xs bg-status-amber/10 text-status-amber px-2 py-1 rounded-md font-medium">
                {item.name}: {item.currentStock} {item.unit} (reorder: {item.reorderPoint})
              </span>
            ))}
          </div>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex items-center gap-4 mb-5">
          <TabsList className="bg-accent rounded-lg">
            <TabsTrigger value="stock" className="text-[13px] rounded-md">Stock List</TabsTrigger>
            <TabsTrigger value="suppliers" className="text-[13px] rounded-md">Suppliers</TabsTrigger>
            <TabsTrigger value="cogs" className="text-[13px] rounded-md">Daily COGS</TabsTrigger>
            <TabsTrigger value="orders" className="text-[13px] rounded-md">Purchase Orders</TabsTrigger>
            <TabsTrigger value="log" className="text-[13px] rounded-md">Movement Log</TabsTrigger>
          </TabsList>
          <div className="relative w-64 ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-[9px] bg-card border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all" />
          </div>
        </div>

        {/* Stock adjust dialog */}
        {adjustItem && (
          <div className="uniweb-card p-5 mb-4 space-y-3">
            <h3 className="text-[14px] font-bold text-foreground">Adjust Stock: {adjustItem.name}</h3>
            <div className="grid grid-cols-4 gap-3">
              <select value={adjustType} onChange={e => setAdjustType(e.target.value as typeof adjustType)}
                className="h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground focus:outline-none focus:border-primary">
                <option value="receive">Receive</option>
                <option value="waste">Waste</option>
                <option value="adjustment">Adjustment</option>
              </select>
              <input type="number" placeholder="Quantity" value={adjustQty} onChange={e => setAdjustQty(e.target.value)}
                className="h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground focus:outline-none focus:border-primary font-mono" />
              <input placeholder="Reason..." value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                className="h-10 px-3 rounded-lg bg-background border-1.5 border-border text-[13px] text-foreground focus:outline-none focus:border-primary" />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdjust} className="rounded-lg flex-1">Confirm</Button>
                <Button size="sm" variant="outline" onClick={() => setAdjustItem(null)} className="rounded-lg">Cancel</Button>
              </div>
            </div>
          </div>
        )}

        <TabsContent value="stock">
          <div className="uniweb-card overflow-hidden">
            <table className="w-full">
              <thead><tr className="table-header">
                <th>Item</th><th>SKU</th><th>Category</th><th>Stock Level</th><th>Status</th><th>Cost</th><th>Supplier</th><th></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => {
                  const status = getStockStatus(item);
                  const st = statusStyles[status];
                  const stockPct = Math.min(100, (item.currentStock / Math.max(item.reorderPoint * 2, 1)) * 100);
                  return (
                    <tr key={item.id} className="table-row hover:bg-accent/50 transition-colors">
                      <td>
                        <div className="text-[13px] font-medium text-foreground">{item.name}</div>
                        {item.nameZh && <div className="text-[11px] text-muted-foreground">{item.nameZh}</div>}
                      </td>
                      <td><span className="text-[12px] font-mono text-muted-foreground">{item.sku}</span></td>
                      <td><span className="text-[12px] text-muted-foreground">{item.category}</span></td>
                      <td className="w-40">
                        <div className="flex items-center gap-2">
                          <Progress value={stockPct} className="h-2 flex-1" />
                          <span className="text-[12px] font-mono text-foreground font-semibold w-16 text-right">
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Reorder: {item.reorderPoint}</div>
                      </td>
                      <td><span className={cn("status-badge", st.color)}><span className={cn("status-dot", st.dot)} />{st.label}</span></td>
                      <td><span className="text-[13px] font-mono text-foreground">${item.costPerUnit.toFixed(2)}/{item.unit}</span></td>
                      <td><span className="text-[12px] text-muted-foreground">{item.supplier}</span></td>
                      <td>
                        <button onClick={() => setAdjustItem(item)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" title="Adjust Stock">
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Suppliers tab */}
        <TabsContent value="suppliers">
          <div className="uniweb-card overflow-hidden">
            <table className="w-full">
              <thead><tr className="table-header">
                <th>Item</th><th>Current Supplier</th><th>Current Cost</th><th>Alternative Suppliers</th><th>Best Price</th><th>Savings</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {supplierItems.map(item => {
                  const prices = item.supplierPrices!;
                  const cheapest = prices.reduce((a, b) => a.unitCost < b.unitCost ? a : b);
                  const savings = item.costPerUnit - cheapest.unitCost;
                  return (
                    <tr key={item.id} className="table-row hover:bg-accent/50 transition-colors">
                      <td>
                        <div className="text-[13px] font-medium text-foreground">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{item.sku}</div>
                      </td>
                      <td><span className="text-[12px] text-foreground">{item.supplier}</span></td>
                      <td><span className="text-[13px] font-mono text-foreground">${item.costPerUnit.toFixed(2)}/{item.unit}</span></td>
                      <td>
                        <div className="space-y-1">
                          {prices.map((sp, idx) => (
                            <div key={idx} className={cn("flex items-center gap-2 text-[12px]", sp.unitCost === cheapest.unitCost ? "font-semibold text-status-green" : "text-muted-foreground")}>
                              <span>{sp.supplier}</span>
                              <span className="font-mono">${sp.unitCost.toFixed(2)}</span>
                              {sp.unitCost === cheapest.unitCost && <span className="text-[10px] bg-status-green/10 text-status-green px-1.5 py-0.5 rounded">BEST</span>}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td><span className="text-[13px] font-mono font-semibold text-status-green">${cheapest.unitCost.toFixed(2)}</span></td>
                      <td>
                        {savings > 0 ? (
                          <span className="text-[13px] font-mono font-semibold text-status-green">-${savings.toFixed(2)}</span>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {supplierItems.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">No multi-supplier items</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Daily COGS tab */}
        <TabsContent value="cogs">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="uniweb-card p-5 relative overflow-hidden">
              <div className="kpi-stripe bg-primary" />
              <p className="section-label mb-1">Today's COGS</p>
              <p className="text-2xl font-bold text-foreground font-mono">${dailyCOGS.totalCOGS.toFixed(2)}</p>
            </div>
            <div className="uniweb-card p-5 relative overflow-hidden">
              <div className="kpi-stripe bg-status-green" />
              <p className="section-label mb-1">Estimated Revenue</p>
              <p className="text-2xl font-bold text-foreground font-mono">$1,280.00</p>
              <p className="text-[11px] text-muted-foreground mt-1">From today's orders</p>
            </div>
            <div className="uniweb-card p-5 relative overflow-hidden">
              <div className="kpi-stripe bg-status-amber" />
              <p className="section-label mb-1">COGS %</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {dailyCOGS.totalCOGS > 0 ? ((dailyCOGS.totalCOGS / 1280) * 100).toFixed(1) : "0.0"}%
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Target: 30-35%</p>
            </div>
          </div>

          {dailyCOGS.breakdown.length > 0 ? (
            <div className="uniweb-card overflow-hidden">
              <table className="w-full">
                <thead><tr className="table-header">
                  <th>Ingredient</th><th>Qty Used</th><th>Unit Cost</th><th>Total Cost</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {dailyCOGS.breakdown.map((b, i) => (
                    <tr key={i} className="table-row">
                      <td><span className="text-[13px] text-foreground">{b.itemName}</span></td>
                      <td><span className="text-[13px] font-mono text-foreground">{b.qty}</span></td>
                      <td><span className="text-[13px] font-mono text-muted-foreground">${(b.cost / b.qty).toFixed(2)}</span></td>
                      <td><span className="text-[13px] font-mono font-semibold text-foreground">${b.cost.toFixed(2)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="uniweb-card p-8 text-center">
              <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No sales movements recorded today</p>
              <p className="text-xs text-muted-foreground mt-1">COGS data will populate as orders are processed</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-3">
            {purchaseOrders.map(po => (
              <div key={po.id} className="uniweb-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[14px] font-semibold text-foreground">{po.supplier}</h3>
                    <span className="text-[11px] text-muted-foreground font-mono">PO-{po.id.slice(-6)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-foreground font-mono">${po.totalCost.toFixed(2)}</span>
                    <span className={cn("status-badge",
                      po.status === "received" ? "bg-status-green-light text-status-green" :
                      po.status === "submitted" ? "bg-status-blue-light text-primary" :
                      po.status === "cancelled" ? "bg-status-red-light text-destructive" :
                      "bg-accent text-muted-foreground"
                    )}>
                      <span className={cn("status-dot",
                        po.status === "received" ? "bg-status-green" :
                        po.status === "submitted" ? "bg-primary" :
                        po.status === "cancelled" ? "bg-destructive" : "bg-muted-foreground"
                      )} />
                      {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {po.items.length} items · Expected: {po.expectedDelivery}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="log">
          <div className="uniweb-card overflow-hidden">
            <table className="w-full">
              <thead><tr className="table-header">
                <th>Timestamp</th><th>Item</th><th>Type</th><th>Qty</th><th>Reason</th><th>By</th><th>Balance</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {movements.map(m => {
                  const item = items.find(i => i.id === m.inventoryItemId);
                  return (
                    <tr key={m.id} className="table-row">
                      <td><span className="text-[12px] font-mono text-muted-foreground">{new Date(m.timestamp).toLocaleString("en-SG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></td>
                      <td><span className="text-[13px] text-foreground">{item?.name || m.inventoryItemId}</span></td>
                      <td>
                        <span className={cn("status-badge",
                          m.type === "receive" ? "bg-status-green-light text-status-green" :
                          m.type === "waste" ? "bg-status-red-light text-destructive" :
                          m.type === "sale" ? "bg-status-blue-light text-primary" :
                          "bg-accent text-muted-foreground"
                        )}>
                          {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
                        </span>
                      </td>
                      <td><span className={cn("text-[13px] font-mono font-semibold", m.quantity > 0 ? "text-status-green" : "text-destructive")}>
                        {m.quantity > 0 ? "+" : ""}{m.quantity}
                      </span></td>
                      <td><span className="text-[12px] text-muted-foreground">{m.reason}</span></td>
                      <td><span className="text-[12px] text-muted-foreground">{m.performedBy}</span></td>
                      <td><span className="text-[13px] font-mono text-foreground">{m.balanceAfter} {item?.unit}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInventory;
