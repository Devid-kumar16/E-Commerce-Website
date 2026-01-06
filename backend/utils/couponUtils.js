export function calculateDiscount(coupon, cartTotal) {
  if (!coupon) return 0;

  const total = Number(cartTotal) || 0;

  if (coupon.type === "FLAT") {
    return Math.min(Number(coupon.value) || 0, total);
  }

  if (coupon.type === "PERCENT") {
    const percentValue = (total * Number(coupon.value || 0)) / 100;
    return Math.min(percentValue, Number(coupon.max_discount || percentValue));
  }

  return 0;
}

