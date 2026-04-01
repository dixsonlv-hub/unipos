import { useSyncExternalStore } from "react";

export type QRPaymentMode = "pre-pay" | "post-pay" | "choice";
export type ServiceType = "fast-food" | "restaurant";

export interface MerchantSettings {
  qrEnabled: boolean;
  qrPaymentMode: QRPaymentMode;
  kioskEnabled: boolean;
  kioskPaymentMethods: ("card" | "qr")[];
  loyaltyPointsPerDollar: number;
  serviceType: ServiceType;
}

let settings: MerchantSettings = {
  qrEnabled: true,
  qrPaymentMode: "choice",
  kioskEnabled: true,
  kioskPaymentMethods: ["card", "qr"],
  loyaltyPointsPerDollar: 1,
  serviceType: "restaurant",
};

let listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

export function getSettingsSnapshot() { return settings; }

export function updateSettings(updates: Partial<MerchantSettings>) {
  settings = { ...settings, ...updates };
  emit();
}

export function useSettings() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getSettingsSnapshot
  );
}
