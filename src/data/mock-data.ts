// Mock data for POS prototype

export type TableStatus = "available" | "occupied" | "reserved" | "dirty";
export type ServiceMode = "dine-in" | "takeaway" | "delivery" | "pickup";
export type OrderStatus = "open" | "sent" | "preparing" | "ready" | "served" | "paid" | "void";
export type KDSStatus = "new" | "preparing" | "ready" | "served";

export interface Table {
  id: string;
  number: string;
  zone: string;
  seats: number;
  status: TableStatus;
  guestCount?: number;
  server?: string;
  openAmount?: number;
  elapsedMinutes?: number;
  orderId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  available: boolean;
  popular?: boolean;
  modifierGroups?: string[];
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: { name: string; price: number }[];
  notes?: string;
  seat?: number;
  status: KDSStatus;
}

export interface Order {
  id: string;
  tableId?: string;
  tableNumber?: string;
  serviceMode: ServiceMode;
  items: OrderItem[];
  status: OrderStatus;
  guestCount: number;
  createdAt: string;
  subtotal: number;
  serviceCharge: number;
  gst: number;
  total: number;
  customerId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  points: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  lastVisit: string;
}

export const zones = ["Main Hall", "Patio", "Private", "Bar"];

export const tables: Table[] = [
  { id: "t1", number: "1", zone: "Main Hall", seats: 2, status: "available" },
  { id: "t2", number: "2", zone: "Main Hall", seats: 4, status: "occupied", guestCount: 3, server: "Sarah", openAmount: 45.80, elapsedMinutes: 25, orderId: "o1" },
  { id: "t3", number: "3", zone: "Main Hall", seats: 4, status: "occupied", guestCount: 4, server: "Mike", openAmount: 78.50, elapsedMinutes: 42, orderId: "o2" },
  { id: "t4", number: "4", zone: "Main Hall", seats: 6, status: "reserved", guestCount: 5 },
  { id: "t5", number: "5", zone: "Main Hall", seats: 2, status: "available" },
  { id: "t6", number: "6", zone: "Main Hall", seats: 4, status: "dirty" },
  { id: "t7", number: "7", zone: "Patio", seats: 2, status: "available" },
  { id: "t8", number: "8", zone: "Patio", seats: 4, status: "occupied", guestCount: 2, server: "Sarah", openAmount: 32.00, elapsedMinutes: 15, orderId: "o3" },
  { id: "t9", number: "9", zone: "Patio", seats: 6, status: "available" },
  { id: "t10", number: "10", zone: "Private", seats: 8, status: "reserved", guestCount: 8 },
  { id: "t11", number: "11", zone: "Private", seats: 10, status: "available" },
  { id: "t12", number: "12", zone: "Bar", seats: 2, status: "occupied", guestCount: 1, server: "Mike", openAmount: 18.00, elapsedMinutes: 10, orderId: "o4" },
  { id: "t13", number: "13", zone: "Bar", seats: 2, status: "available" },
  { id: "t14", number: "14", zone: "Bar", seats: 2, status: "dirty" },
];

export const categories = [
  "Popular", "Starters", "Mains", "Noodles", "Rice", "Sides", "Desserts", "Beverages", "Alcohol"
];

export const menuItems: MenuItem[] = [
  { id: "m1", name: "Chicken Rice", price: 5.50, category: "Popular", available: true, popular: true, modifierGroups: ["mg1", "mg3"] },
  { id: "m2", name: "Laksa", price: 7.00, category: "Popular", available: true, popular: true, modifierGroups: ["mg1"] },
  { id: "m3", name: "Char Kway Teow", price: 6.50, category: "Popular", available: true, popular: true, modifierGroups: ["mg1"] },
  { id: "m4", name: "Satay (10pc)", price: 12.00, category: "Starters", available: true, modifierGroups: ["mg2"] },
  { id: "m5", name: "Prawn Crackers", price: 4.50, category: "Starters", available: true },
  { id: "m6", name: "Spring Rolls (4pc)", price: 6.00, category: "Starters", available: true },
  { id: "m7", name: "Popiah", price: 3.50, category: "Starters", available: true },
  { id: "m8", name: "Chilli Crab", price: 38.00, category: "Mains", available: true, popular: true, modifierGroups: ["mg1"] },
  { id: "m9", name: "Black Pepper Crab", price: 38.00, category: "Mains", available: true, modifierGroups: ["mg1"] },
  { id: "m10", name: "Cereal Prawn", price: 22.00, category: "Mains", available: true },
  { id: "m11", name: "Sambal Stingray", price: 15.00, category: "Mains", available: false },
  { id: "m12", name: "Hokkien Mee", price: 7.50, category: "Noodles", available: true, modifierGroups: ["mg1"] },
  { id: "m13", name: "Bak Chor Mee", price: 6.00, category: "Noodles", available: true, modifierGroups: ["mg1", "mg4"] },
  { id: "m14", name: "Wonton Noodles", price: 5.50, category: "Noodles", available: true, modifierGroups: ["mg4"] },
  { id: "m15", name: "Nasi Lemak", price: 6.50, category: "Rice", available: true, popular: true, modifierGroups: ["mg1", "mg3"] },
  { id: "m16", name: "Nasi Goreng", price: 7.00, category: "Rice", available: true, modifierGroups: ["mg1"] },
  { id: "m17", name: "Claypot Rice", price: 9.50, category: "Rice", available: true },
  { id: "m18", name: "Kangkong Belacan", price: 8.00, category: "Sides", available: true, modifierGroups: ["mg1"] },
  { id: "m19", name: "Sambal Petai", price: 10.00, category: "Sides", available: true },
  { id: "m20", name: "Ice Kachang", price: 4.00, category: "Desserts", available: true },
  { id: "m21", name: "Chendol", price: 3.50, category: "Desserts", available: true },
  { id: "m22", name: "Teh Tarik", price: 2.50, category: "Beverages", available: true, popular: true },
  { id: "m23", name: "Kopi O", price: 1.80, category: "Beverages", available: true },
  { id: "m24", name: "Milo Dinosaur", price: 4.00, category: "Beverages", available: true },
  { id: "m25", name: "Lime Juice", price: 2.50, category: "Beverages", available: true },
  { id: "m26", name: "Tiger Beer", price: 10.00, category: "Alcohol", available: true },
  { id: "m27", name: "Singha Beer", price: 10.00, category: "Alcohol", available: true },
  { id: "m28", name: "House Wine (Glass)", price: 14.00, category: "Alcohol", available: true },
];

export const modifierGroups: ModifierGroup[] = [
  {
    id: "mg1",
    name: "Spice Level",
    required: true,
    multiSelect: false,
    options: [
      { id: "mo1", name: "Mild", price: 0 },
      { id: "mo2", name: "Medium", price: 0 },
      { id: "mo3", name: "Spicy", price: 0 },
      { id: "mo4", name: "Extra Spicy", price: 0.50 },
    ],
  },
  {
    id: "mg2",
    name: "Sauce",
    required: false,
    multiSelect: true,
    options: [
      { id: "mo5", name: "Peanut Sauce", price: 0 },
      { id: "mo6", name: "Chilli Sauce", price: 0 },
      { id: "mo7", name: "Extra Sauce", price: 1.00 },
    ],
  },
  {
    id: "mg3",
    name: "Add-ons",
    required: false,
    multiSelect: true,
    options: [
      { id: "mo8", name: "Extra Rice", price: 1.00 },
      { id: "mo9", name: "Egg", price: 1.50 },
      { id: "mo10", name: "Extra Meat", price: 3.00 },
    ],
  },
  {
    id: "mg4",
    name: "Noodle Type",
    required: true,
    multiSelect: false,
    options: [
      { id: "mo11", name: "Dry", price: 0 },
      { id: "mo12", name: "Soup", price: 0 },
    ],
  },
];

export const sampleOrders: Order[] = [
  {
    id: "o1", tableId: "t2", tableNumber: "2", serviceMode: "dine-in",
    guestCount: 3, status: "open", createdAt: "2024-01-15T12:30:00",
    items: [
      { id: "oi1", menuItemId: "m1", name: "Chicken Rice", price: 5.50, quantity: 2, modifiers: [{ name: "Mild", price: 0 }], seat: 1, status: "served" },
      { id: "oi2", menuItemId: "m2", name: "Laksa", price: 7.00, quantity: 1, modifiers: [{ name: "Spicy", price: 0 }], seat: 2, status: "served" },
      { id: "oi3", menuItemId: "m22", name: "Teh Tarik", price: 2.50, quantity: 3, modifiers: [], status: "ready" },
      { id: "oi4", menuItemId: "m5", name: "Prawn Crackers", price: 4.50, quantity: 1, modifiers: [], seat: 3, status: "preparing" },
    ],
    subtotal: 40.00, serviceCharge: 4.00, gst: 3.52, total: 47.52,
  },
  {
    id: "o2", tableId: "t3", tableNumber: "3", serviceMode: "dine-in",
    guestCount: 4, status: "open", createdAt: "2024-01-15T12:15:00",
    items: [
      { id: "oi5", menuItemId: "m8", name: "Chilli Crab", price: 38.00, quantity: 1, modifiers: [{ name: "Medium", price: 0 }], status: "preparing" },
      { id: "oi6", menuItemId: "m15", name: "Nasi Lemak", price: 6.50, quantity: 2, modifiers: [{ name: "Mild", price: 0 }], status: "ready" },
      { id: "oi7", menuItemId: "m26", name: "Tiger Beer", price: 10.00, quantity: 3, modifiers: [], status: "served" },
    ],
    subtotal: 81.00, serviceCharge: 8.10, gst: 7.13, total: 96.23,
  },
  {
    id: "o3", tableId: "t8", tableNumber: "8", serviceMode: "dine-in",
    guestCount: 2, status: "open", createdAt: "2024-01-15T12:45:00",
    items: [
      { id: "oi8", menuItemId: "m22", name: "Teh Tarik", price: 2.50, quantity: 2, modifiers: [], status: "served" },
      { id: "oi9", menuItemId: "m3", name: "Char Kway Teow", price: 6.50, quantity: 2, modifiers: [{ name: "Medium", price: 0 }], status: "new" },
    ],
    subtotal: 18.00, serviceCharge: 1.80, gst: 1.58, total: 21.38,
  },
  {
    id: "o4", tableId: "t12", tableNumber: "12", serviceMode: "dine-in",
    guestCount: 1, status: "open", createdAt: "2024-01-15T12:50:00",
    items: [
      { id: "oi10", menuItemId: "m26", name: "Tiger Beer", price: 10.00, quantity: 1, modifiers: [], status: "served" },
      { id: "oi11", menuItemId: "m4", name: "Satay (10pc)", price: 12.00, quantity: 1, modifiers: [{ name: "Peanut Sauce", price: 0 }], status: "preparing" },
    ],
    subtotal: 22.00, serviceCharge: 2.20, gst: 1.94, total: 26.14,
  },
];

export const customers: Customer[] = [
  { id: "c1", name: "Tan Wei Ming", phone: "+65 9123 4567", email: "weiming@email.com", visits: 24, points: 1250, tier: "gold", lastVisit: "2024-01-14" },
  { id: "c2", name: "Sarah Lim", phone: "+65 8234 5678", visits: 8, points: 420, tier: "silver", lastVisit: "2024-01-12" },
  { id: "c3", name: "Ahmad bin Hassan", phone: "+65 9345 6789", visits: 3, points: 150, tier: "bronze", lastVisit: "2024-01-10" },
  { id: "c4", name: "Priya Sharma", phone: "+65 8456 7890", email: "priya@email.com", visits: 45, points: 3200, tier: "platinum", lastVisit: "2024-01-15" },
];

export const staffMembers = [
  { id: "s1", name: "Sarah Chen", role: "server" as const, pin: "1234" },
  { id: "s2", name: "Mike Tan", role: "server" as const, pin: "5678" },
  { id: "s3", name: "Jenny Lim", role: "cashier" as const, pin: "9012" },
  { id: "s4", name: "David Wong", role: "manager" as const, pin: "3456" },
  { id: "s5", name: "Chef Ahmad", role: "kitchen" as const, pin: "7890" },
];
