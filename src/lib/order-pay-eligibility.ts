/** Shared rules for when an order may show online/COD pay UI. */

export function isOrderCancelled(order: {
  status?: string | null;
  petpooja_status?: string | null;
}): boolean {
  return (
    order.status === "cancelled" || order.petpooja_status === "cancelled"
  );
}

export function canShowCodOnlinePay(order: {
  status?: string | null;
  petpooja_status?: string | null;
  cod_unpaid?: boolean | null;
  can_pay_online?: boolean | null;
}): boolean {
  if (isOrderCancelled(order)) return false;
  const status = String(order.status || "").toLowerCase();
  if (
    status === "cancelled" ||
    status === "completed" ||
    status === "failed" ||
    status === "pending_payment" ||
    status === "paid"
  ) {
    return false;
  }
  return !!(order.cod_unpaid && order.can_pay_online !== false);
}
