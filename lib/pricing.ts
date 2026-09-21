export const PLATFORM_FEE_BPS = 1800;
export function calculatePrice(hourlyPriceKurus: number, durationMinutes: 30 | 60 | 90) {
  const subtotal = Math.round(hourlyPriceKurus * (durationMinutes / 60));
  const platformFee = Math.round((subtotal * PLATFORM_FEE_BPS) / 10000);
  return { subtotal, platformFee, hostGross: subtotal - platformFee };
}
