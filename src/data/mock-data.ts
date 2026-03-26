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
  image?: string;
  available: boolean;
  popular?: boolean;
  modifierGroups?: string[];
  isCombo?: boolean;
  comboGroups?: ComboGroup[];
}

export interface ComboGroup {
  id: string;
  name: string;
  required: boolean;
  allowedItems: string[]; // menuItem IDs
  maxSelect: number;
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
  firedAt?: string;
  comboItems?: { name: string; groupName: string }[];
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
  "Popular", "All", "Combos", "Starters", "Mains", "Noodles", "Rice", "Sides", "Desserts", "Beverages", "Alcohol"
];

// Image imports
import chickenRiceImg from "@/assets/food/chicken-rice.jpg";
import laksaImg from "@/assets/food/laksa.jpg";
import charKwayTeowImg from "@/assets/food/char-kway-teow.jpg";
import chilliCrabImg from "@/assets/food/chilli-crab.jpg";
import nasiLemakImg from "@/assets/food/nasi-lemak.jpg";
import satayImg from "@/assets/food/satay.jpg";
import hokkienMeeImg from "@/assets/food/hokkien-mee.jpg";
import bakKutTehImg from "@/assets/food/bak-kut-teh.jpg";
import tehTarikImg from "@/assets/food/teh-tarik.jpg";
import iceKachangImg from "@/assets/food/ice-kachang.jpg";
import tigerBeerImg from "@/assets/food/tiger-beer.jpg";
import claypotRiceImg from "@/assets/food/claypot-rice.jpg";
import springRollsImg from "@/assets/food/spring-rolls.jpg";
import miloDinosaurImg from "@/assets/food/milo-dinosaur.jpg";
import kangkongImg from "@/assets/food/kangkong.jpg";
import wontonNoodlesImg from "@/assets/food/wonton-noodles.jpg";

export const menuItems: MenuItem[] = [
  // Popular
  { id: "m1", name: "Chicken Rice", price: 5.50, category: "Popular", available: true, popular: true, modifierGroups: ["mg1", "mg3"], image: chickenRiceImg },
  { id: "m2", name: "Laksa", price: 7.00, category: "Popular", available: true, popular: true, modifierGroups: ["mg1"], image: laksaImg },
  { id: "m3", name: "Char Kway Teow", price: 6.50, category: "Popular", available: true, popular: true, modifierGroups: ["mg1"], image: charKwayTeowImg },
  { id: "m8", name: "Chilli Crab", price: 38.00, category: "Popular", available: true, popular: true, modifierGroups: ["mg1"], image: chilliCrabImg },
  { id: "m15", name: "Nasi Lemak", price: 6.50, category: "Popular", available: true, popular: true, modifierGroups: ["mg1", "mg3"], image: nasiLemakImg },
  { id: "m22", name: "Teh Tarik", price: 2.50, category: "Popular", available: true, popular: true, image: tehTarikImg },
  { id: "m12", name: "Hokkien Mee", price: 7.50, category: "Popular", available: true, popular: true, modifierGroups: ["mg1"], image: hokkienMeeImg },
  { id: "m60", name: "Bak Kut Teh", price: 9.80, category: "Popular", available: true, popular: true, modifierGroups: ["mg1", "mg3"], image: bakKutTehImg },

  // Starters
  { id: "m4", name: "Satay (10pc)", price: 12.00, category: "Starters", available: true, modifierGroups: ["mg2"], image: satayImg },
  { id: "m5", name: "Prawn Crackers", price: 4.50, category: "Starters", available: true },
  { id: "m6", name: "Spring Rolls (4pc)", price: 6.00, category: "Starters", available: true, image: springRollsImg },
  { id: "m7", name: "Popiah", price: 3.50, category: "Starters", available: true },
  { id: "m30", name: "Otak-Otak (3pc)", price: 5.50, category: "Starters", available: true },
  { id: "m31", name: "Ngoh Hiang (5pc)", price: 8.00, category: "Starters", available: true },
  { id: "m32", name: "Rojak", price: 6.50, category: "Starters", available: true },
  { id: "m33", name: "Kueh Pie Tee (5pc)", price: 7.00, category: "Starters", available: true },
  { id: "m34", name: "Tau Huay Soup", price: 3.00, category: "Starters", available: true },
  { id: "m35", name: "You Tiao (Pair)", price: 2.50, category: "Starters", available: true },

  // Mains
  { id: "m8b", name: "Chilli Crab", price: 38.00, category: "Mains", available: true, popular: true, modifierGroups: ["mg1"], image: chilliCrabImg },
  { id: "m9", name: "Black Pepper Crab", price: 38.00, category: "Mains", available: true, modifierGroups: ["mg1"] },
  { id: "m10", name: "Cereal Prawn", price: 22.00, category: "Mains", available: true },
  { id: "m11", name: "Sambal Stingray", price: 15.00, category: "Mains", available: false },
  { id: "m36", name: "Salted Egg Fish Skin", price: 16.00, category: "Mains", available: true },
  { id: "m37", name: "Steamed Sea Bass", price: 28.00, category: "Mains", available: true, modifierGroups: ["mg1"] },
  { id: "m38", name: "Har Cheong Gai", price: 14.00, category: "Mains", available: true },
  { id: "m39", name: "Ayam Penyet", price: 10.50, category: "Mains", available: true, modifierGroups: ["mg1"] },
  { id: "m40", name: "Rendang Beef", price: 13.00, category: "Mains", available: true, modifierGroups: ["mg1"] },
  { id: "m41", name: "Curry Fish Head", price: 32.00, category: "Mains", available: true, modifierGroups: ["mg1"] },
  { id: "m42", name: "Salted Egg Chicken", price: 12.00, category: "Mains", available: true },

  // Noodles
  { id: "m12b", name: "Hokkien Mee", price: 7.50, category: "Noodles", available: true, modifierGroups: ["mg1"], image: hokkienMeeImg },
  { id: "m13", name: "Bak Chor Mee", price: 6.00, category: "Noodles", available: true, modifierGroups: ["mg1", "mg4"] },
  { id: "m14", name: "Wonton Noodles", price: 5.50, category: "Noodles", available: true, modifierGroups: ["mg4"], image: wontonNoodlesImg },
  { id: "m43", name: "Mee Siam", price: 5.00, category: "Noodles", available: true, modifierGroups: ["mg1"] },
  { id: "m44", name: "Mee Rebus", price: 5.50, category: "Noodles", available: true, modifierGroups: ["mg1"] },
  { id: "m45", name: "Lor Mee", price: 6.00, category: "Noodles", available: true },
  { id: "m46", name: "Prawn Noodle Soup", price: 7.00, category: "Noodles", available: true, modifierGroups: ["mg1"] },
  { id: "m47", name: "Kway Chap", price: 6.50, category: "Noodles", available: true },
  { id: "m48", name: "Bee Hoon Goreng", price: 5.00, category: "Noodles", available: true, modifierGroups: ["mg1"] },

  // Rice
  { id: "m15b", name: "Nasi Lemak", price: 6.50, category: "Rice", available: true, popular: true, modifierGroups: ["mg1", "mg3"], image: nasiLemakImg },
  { id: "m16", name: "Nasi Goreng", price: 7.00, category: "Rice", available: true, modifierGroups: ["mg1"] },
  { id: "m17", name: "Claypot Rice", price: 9.50, category: "Rice", available: true, image: claypotRiceImg },
  { id: "m49", name: "Thunder Tea Rice", price: 6.50, category: "Rice", available: true },
  { id: "m50", name: "Yong Tau Foo Rice", price: 7.50, category: "Rice", available: true, modifierGroups: ["mg3"] },
  { id: "m51", name: "Nasi Briyani", price: 9.00, category: "Rice", available: true, modifierGroups: ["mg1"] },
  { id: "m52", name: "Economy Rice (2 veg 1 meat)", price: 5.00, category: "Rice", available: true },
  { id: "m53", name: "Duck Rice", price: 6.00, category: "Rice", available: true },

  // Sides
  { id: "m18", name: "Kangkong Belacan", price: 8.00, category: "Sides", available: true, modifierGroups: ["mg1"], image: kangkongImg },
  { id: "m19", name: "Sambal Petai", price: 10.00, category: "Sides", available: true },
  { id: "m54", name: "Fried Tofu", price: 5.00, category: "Sides", available: true },
  { id: "m55", name: "Steamed Egg", price: 4.50, category: "Sides", available: true },
  { id: "m56", name: "Sayur Lodeh", price: 6.00, category: "Sides", available: true },
  { id: "m57", name: "Achar", price: 3.50, category: "Sides", available: true },
  { id: "m58", name: "Fried Mantou (4pc)", price: 5.00, category: "Sides", available: true },
  { id: "m59", name: "Garlic Spinach", price: 7.00, category: "Sides", available: true },

  // Desserts
  { id: "m20", name: "Ice Kachang", price: 4.00, category: "Desserts", available: true, image: iceKachangImg },
  { id: "m21", name: "Chendol", price: 3.50, category: "Desserts", available: true },
  { id: "m61", name: "Pulut Hitam", price: 3.50, category: "Desserts", available: true },
  { id: "m62", name: "Bubur Cha Cha", price: 4.00, category: "Desserts", available: true },
  { id: "m63", name: "Kueh Lapis", price: 5.00, category: "Desserts", available: true },
  { id: "m64", name: "Ondeh Ondeh (6pc)", price: 4.50, category: "Desserts", available: true },
  { id: "m65", name: "Mango Sago", price: 5.50, category: "Desserts", available: true },
  { id: "m66", name: "Pandan Cake", price: 5.00, category: "Desserts", available: true },

  // Beverages
  { id: "m22b", name: "Teh Tarik", price: 2.50, category: "Beverages", available: true, popular: true, image: tehTarikImg },
  { id: "m23", name: "Kopi O", price: 1.80, category: "Beverages", available: true },
  { id: "m24", name: "Milo Dinosaur", price: 4.00, category: "Beverages", available: true, image: miloDinosaurImg },
  { id: "m25", name: "Lime Juice", price: 2.50, category: "Beverages", available: true },
  { id: "m67", name: "Kopi C Peng", price: 2.20, category: "Beverages", available: true },
  { id: "m68", name: "Teh O Peng", price: 2.00, category: "Beverages", available: true },
  { id: "m69", name: "Bandung", price: 2.50, category: "Beverages", available: true },
  { id: "m70", name: "Barley Water", price: 2.00, category: "Beverages", available: true },
  { id: "m71", name: "Sugarcane Juice", price: 3.00, category: "Beverages", available: true },
  { id: "m72", name: "Coconut Water", price: 3.50, category: "Beverages", available: true },
  { id: "m73", name: "Chrysanthemum Tea", price: 2.00, category: "Beverages", available: true },
  { id: "m74", name: "Iced Lemon Tea", price: 2.50, category: "Beverages", available: true },

  // Alcohol
  { id: "m26", name: "Tiger Beer", price: 10.00, category: "Alcohol", available: true, image: tigerBeerImg },
  { id: "m27", name: "Singha Beer", price: 10.00, category: "Alcohol", available: true },
  { id: "m28", name: "House Wine (Glass)", price: 14.00, category: "Alcohol", available: true },
  { id: "m75", name: "Asahi Draft", price: 12.00, category: "Alcohol", available: true },
  { id: "m76", name: "Heineken", price: 11.00, category: "Alcohol", available: true },
  { id: "m77", name: "Sake (Carafe)", price: 18.00, category: "Alcohol", available: true },
  { id: "m78", name: "Soju", price: 15.00, category: "Alcohol", available: true },
  { id: "m79", name: "Whisky Highball", price: 16.00, category: "Alcohol", available: true },

  // Combos
  {
    id: "combo1", name: "Lunch Set A", price: 12.90, category: "Combos", available: true, popular: true, isCombo: true,
    image: chickenRiceImg,
    comboGroups: [
      { id: "cg1", name: "Main", required: true, maxSelect: 1, allowedItems: ["m1", "m15", "m13", "m14"] },
      { id: "cg2", name: "Side", required: true, maxSelect: 1, allowedItems: ["m54", "m55", "m57", "m5"] },
      { id: "cg3", name: "Drink", required: true, maxSelect: 1, allowedItems: ["m22", "m23", "m68", "m70"] },
    ],
  },
  {
    id: "combo2", name: "Lunch Set B", price: 16.90, category: "Combos", available: true, isCombo: true,
    image: nasiLemakImg,
    comboGroups: [
      { id: "cg4", name: "Main", required: true, maxSelect: 1, allowedItems: ["m15b", "m16", "m39", "m40"] },
      { id: "cg5", name: "Side", required: true, maxSelect: 1, allowedItems: ["m18", "m54", "m58", "m59"] },
      { id: "cg6", name: "Drink", required: true, maxSelect: 1, allowedItems: ["m22b", "m24", "m25", "m69"] },
    ],
  },
  {
    id: "combo3", name: "Family Feast (4 pax)", price: 68.00, category: "Combos", available: true, isCombo: true,
    image: chilliCrabImg,
    comboGroups: [
      { id: "cg7", name: "Mains (pick 2)", required: true, maxSelect: 2, allowedItems: ["m8b", "m9", "m41", "m37", "m42"] },
      { id: "cg8", name: "Rice / Noodle", required: true, maxSelect: 1, allowedItems: ["m1", "m15b", "m12b", "m16"] },
      { id: "cg9", name: "Sides (pick 2)", required: true, maxSelect: 2, allowedItems: ["m18", "m19", "m59", "m56", "m58"] },
      { id: "cg10", name: "Drinks (pick 4)", required: true, maxSelect: 4, allowedItems: ["m22b", "m23", "m25", "m70", "m74"] },
    ],
  },
  {
    id: "combo4", name: "Tea Time Set", price: 8.90, category: "Combos", available: true, isCombo: true,
    image: tehTarikImg,
    comboGroups: [
      { id: "cg11", name: "Snack", required: true, maxSelect: 1, allowedItems: ["m35", "m58", "m63", "m66"] },
      { id: "cg12", name: "Drink", required: true, maxSelect: 1, allowedItems: ["m22b", "m23", "m67", "m73"] },
    ],
  },
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
      { id: "oi1", menuItemId: "m1", name: "Chicken Rice", price: 5.50, quantity: 2, modifiers: [{ name: "Mild", price: 0 }], seat: 1, status: "served", firedAt: "2024-01-15T12:32:00" },
      { id: "oi2", menuItemId: "m2", name: "Laksa", price: 7.00, quantity: 1, modifiers: [{ name: "Spicy", price: 0 }], notes: "Extra sambal on side", seat: 2, status: "served", firedAt: "2024-01-15T12:32:00" },
      { id: "oi3", menuItemId: "m22", name: "Teh Tarik", price: 2.50, quantity: 3, modifiers: [], status: "ready", firedAt: "2024-01-15T12:35:00" },
      { id: "oi4", menuItemId: "m5", name: "Prawn Crackers", price: 4.50, quantity: 1, modifiers: [], seat: 3, status: "preparing", firedAt: "2024-01-15T12:40:00" },
    ],
    subtotal: 40.00, serviceCharge: 4.00, gst: 3.52, total: 47.52,
  },
  {
    id: "o2", tableId: "t3", tableNumber: "3", serviceMode: "dine-in",
    guestCount: 4, status: "open", createdAt: "2024-01-15T12:15:00",
    items: [
      { id: "oi5", menuItemId: "m8", name: "Chilli Crab", price: 38.00, quantity: 1, modifiers: [{ name: "Medium", price: 0 }], notes: "No mantou, allergic to gluten", status: "preparing", firedAt: "2024-01-15T12:20:00" },
      { id: "oi6", menuItemId: "m15", name: "Nasi Lemak", price: 6.50, quantity: 2, modifiers: [{ name: "Mild", price: 0 }, { name: "Extra Rice", price: 1.00 }], notes: "Less sambal for 1 portion", status: "ready", firedAt: "2024-01-15T12:18:00" },
      { id: "oi7", menuItemId: "m26", name: "Tiger Beer", price: 10.00, quantity: 3, modifiers: [], status: "served", firedAt: "2024-01-15T12:16:00" },
      { id: "oi12", menuItemId: "m18", name: "Kangkong Belacan", price: 8.00, quantity: 1, modifiers: [{ name: "Spicy", price: 0 }], status: "new", firedAt: "2024-01-15T12:50:00" },
    ],
    subtotal: 81.00, serviceCharge: 8.10, gst: 7.13, total: 96.23,
  },
  {
    id: "o3", tableId: "t8", tableNumber: "8", serviceMode: "dine-in",
    guestCount: 2, status: "open", createdAt: "2024-01-15T12:45:00",
    items: [
      { id: "oi8", menuItemId: "m22", name: "Teh Tarik", price: 2.50, quantity: 2, modifiers: [], status: "served", firedAt: "2024-01-15T12:46:00" },
      { id: "oi9", menuItemId: "m3", name: "Char Kway Teow", price: 6.50, quantity: 2, modifiers: [{ name: "Medium", price: 0 }], notes: "No cockles", status: "new", firedAt: "2024-01-15T12:48:00" },
      { id: "oi13", menuItemId: "combo1", name: "Lunch Set A", price: 12.90, quantity: 1, modifiers: [], status: "new", firedAt: "2024-01-15T12:49:00", comboItems: [
        { name: "Chicken Rice", groupName: "Main" },
        { name: "Prawn Crackers", groupName: "Side" },
        { name: "Teh Tarik", groupName: "Drink" },
      ]},
    ],
    subtotal: 30.90, serviceCharge: 3.09, gst: 2.72, total: 36.71,
  },
  {
    id: "o4", tableId: "t12", tableNumber: "12", serviceMode: "dine-in",
    guestCount: 1, status: "open", createdAt: "2024-01-15T12:50:00",
    items: [
      { id: "oi10", menuItemId: "m26", name: "Tiger Beer", price: 10.00, quantity: 1, modifiers: [], status: "served", firedAt: "2024-01-15T12:51:00" },
      { id: "oi11", menuItemId: "m4", name: "Satay (10pc)", price: 12.00, quantity: 1, modifiers: [{ name: "Peanut Sauce", price: 0 }], notes: "Extra peanut sauce pls", status: "preparing", firedAt: "2024-01-15T12:52:00" },
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
