// ============================================================
// Purchase seam — the ONLY place real payments plug in.
// When App Store Connect is set up, replace the bodies with a real
// IAP integration (RevenueCat or StoreKit 2 via a Capacitor plugin)
// and keep the return shapes identical. Until then purchases grant
// instantly so the full Pro flow can be developed and demoed.
// ============================================================

export const PRO_PRODUCT = {
  id: "com.ricchaado.academy.pro",
  price: "$4.99",
  title: "Keiro Pro",
};

export async function purchasePro() {
  // TODO(StoreKit): real purchase. Dev scaffold grants immediately.
  return { success: true, provider: "dev" };
}

export async function restorePurchases() {
  // TODO(StoreKit): query past purchases. Dev scaffold has nothing to restore.
  return { success: false, provider: "dev" };
}
