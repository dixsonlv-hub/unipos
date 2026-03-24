import React, { useState, useCallback } from "react";
import { FloorPanel } from "@/components/tablet/FloorPanel";
import { MenuComposer } from "@/components/tablet/MenuComposer";
import { CheckPanel } from "@/components/tablet/CheckPanel";
import { PaymentSheet } from "@/components/tablet/PaymentSheet";
import { tables as mockTables, sampleOrders, menuItems, categories, modifierGroups, type Table, type Order, type OrderItem, type ServiceMode } from "@/data/mock-data";

const TabletPOS: React.FC = () => {
  const [tables, setTables] = useState(mockTables);
  const [orders, setOrders] = useState(sampleOrders);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const selectedTable = tables.find(t => t.id === selectedTableId);

  const handleSelectTable = useCallback((tableId: string) => {
    setSelectedTableId(tableId);
    const table = tables.find(t => t.id === tableId);
    if (table?.orderId) {
      const order = orders.find(o => o.id === table.orderId);
      setCurrentOrder(order || null);
    } else if (table?.status === "available") {
      // Create new order for this table
      const newOrder: Order = {
        id: `o-${Date.now()}`,
        tableId: tableId,
        tableNumber: table.number,
        serviceMode: "dine-in",
        items: [],
        status: "open",
        guestCount: 1,
        createdAt: new Date().toISOString(),
        subtotal: 0,
        serviceCharge: 0,
        gst: 0,
        total: 0,
      };
      setCurrentOrder(newOrder);
      setOrders(prev => [...prev, newOrder]);
      setTables(prev => prev.map(t =>
        t.id === tableId ? { ...t, status: "occupied" as const, guestCount: 1, orderId: newOrder.id, elapsedMinutes: 0 } : t
      ));
    } else {
      setCurrentOrder(null);
    }
  }, [tables, orders]);

  const handleCreateWalkIn = useCallback((mode: ServiceMode) => {
    const newOrder: Order = {
      id: `o-${Date.now()}`,
      serviceMode: mode,
      items: [],
      status: "open",
      guestCount: 1,
      createdAt: new Date().toISOString(),
      subtotal: 0, serviceCharge: 0, gst: 0, total: 0,
    };
    setCurrentOrder(newOrder);
    setOrders(prev => [...prev, newOrder]);
    setSelectedTableId(null);
  }, []);

  const recalcOrder = (items: OrderItem[]): Pick<Order, "subtotal" | "serviceCharge" | "gst" | "total"> => {
    const subtotal = items.reduce((sum, item) => {
      const modTotal = item.modifiers.reduce((ms, m) => ms + m.price, 0);
      return sum + (item.price + modTotal) * item.quantity;
    }, 0);
    const serviceCharge = subtotal * 0.1;
    const gst = (subtotal + serviceCharge) * 0.09;
    return { subtotal, serviceCharge, gst, total: subtotal + serviceCharge + gst };
  };

  const handleAddItem = useCallback((menuItemId: string, modifiers: { name: string; price: number }[], notes?: string) => {
    if (!currentOrder) return;
    const menuItem = menuItems.find(m => m.id === menuItemId);
    if (!menuItem) return;

    setCurrentOrder(prev => {
      if (!prev) return prev;
      const existing = prev.items.find(i => i.menuItemId === menuItemId && JSON.stringify(i.modifiers) === JSON.stringify(modifiers) && i.notes === notes);
      let newItems: OrderItem[];
      if (existing) {
        newItems = prev.items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        const newItem: OrderItem = {
          id: `oi-${Date.now()}`,
          menuItemId,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          modifiers,
          notes,
          status: "new",
        };
        newItems = [...prev.items, newItem];
      }
      const totals = recalcOrder(newItems);
      return { ...prev, items: newItems, ...totals };
    });
  }, [currentOrder]);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setCurrentOrder(prev => {
      if (!prev) return prev;
      let newItems = prev.items.map(i =>
        i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      ).filter(i => i.quantity > 0);
      const totals = recalcOrder(newItems);
      return { ...prev, items: newItems, ...totals };
    });
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCurrentOrder(prev => {
      if (!prev) return prev;
      const newItems = prev.items.filter(i => i.id !== itemId);
      const totals = recalcOrder(newItems);
      return { ...prev, items: newItems, ...totals };
    });
  }, []);

  const handlePaymentComplete = useCallback(() => {
    setShowPayment(false);
    if (currentOrder?.tableId) {
      setTables(prev => prev.map(t =>
        t.id === currentOrder.tableId ? { ...t, status: "dirty" as const, guestCount: undefined, openAmount: undefined, orderId: undefined, elapsedMinutes: undefined } : t
      ));
    }
    setCurrentOrder(null);
    setSelectedTableId(null);
  }, [currentOrder]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Rail - Floor / Open Checks */}
      <FloorPanel
        tables={tables}
        selectedTableId={selectedTableId}
        onSelectTable={handleSelectTable}
        onCreateWalkIn={handleCreateWalkIn}
      />

      {/* Center - Menu Composer */}
      <MenuComposer
        onAddItem={handleAddItem}
        selectedTable={selectedTable}
        currentOrder={currentOrder}
      />

      {/* Right - Check Panel */}
      <CheckPanel
        order={currentOrder}
        table={selectedTable}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onPay={() => setShowPayment(true)}
      />

      {/* Payment Sheet */}
      {showPayment && currentOrder && (
        <PaymentSheet
          order={currentOrder}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default TabletPOS;
