import { BACKEND_URL, WEB_DEVICE_ID } from "@/lib/config";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  storeId: string;
};

async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": WEB_DEVICE_ID,
      "x-store-id": options.storeId,
      Accept: "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || `Request failed (${res.status}) for ${path}`,
    );
  }
  return payload.data as T;
}

export type WebOrderType = "dine_in" | "takeaway" | "delivery";

export type CreateOrderItem = {
  item_id: string;
  unit_price: number;
  price: number;
  petpooja_item_id?: string | null;
  name: string;
  quantity: number;
  addons?: unknown[];
};

export async function createWebOrder(input: {
  storeId: string;
  orderType: WebOrderType;
  items: CreateOrderItem[];
  subtotal: number;
  gstAmount: number;
  discountAmount?: number;
  grandTotal: number;
  deliveryCharges?: number;
  customerMobile: string;
  customerName?: string;
  customerAddress?: string;
  customerNotes?: string;
}) {
  return apiRequest<{
    order_id: string;
    order_number: string | number;
    grand_total: number;
    status: string;
  }>("/orders/kiosk", {
    method: "POST",
    storeId: input.storeId,
    body: {
      order_type: input.orderType,
      items: input.items,
      subtotal: input.subtotal,
      gst_amount: input.gstAmount,
      discount_amount: input.discountAmount ?? 0,
      grand_total: input.grandTotal,
      delivery_charges: input.deliveryCharges ?? 0,
      customer_mobile: input.customerMobile,
      customer_name: input.customerName || undefined,
      customer_address: input.customerAddress || undefined,
      customer_notes: input.customerNotes || undefined,
    },
  });
}

export async function createPaymentSession(input: {
  storeId: string;
  orderId: string;
  amount: number;
  customerPhone: string;
}) {
  return apiRequest<{
    transaction_id: string;
    payment_session_id: string;
    qr_payload: string;
    amount: string;
    is_mock?: boolean;
    expires_at?: string;
  }>("/payments/session", {
    method: "POST",
    storeId: input.storeId,
    body: {
      order_id: input.orderId,
      amount: input.amount,
      customer_phone: input.customerPhone,
      description: "SVS Food website payment",
    },
  });
}

export async function getPaymentStatus(input: {
  storeId: string;
  transactionId: string;
  orderId: string;
}) {
  const qs = `?order_id=${encodeURIComponent(input.orderId)}`;
  return apiRequest<{
    internal_status: string;
    status: string;
    code: string;
  }>(`/payments/status/${encodeURIComponent(input.transactionId)}${qs}`, {
    storeId: input.storeId,
  });
}

export async function confirmCashPayment(input: {
  storeId: string;
  orderId: string;
}) {
  return apiRequest<{
    order_id: string;
    internal_status: string;
    payment_method: string;
  }>("/payments/cash-confirm", {
    method: "POST",
    storeId: input.storeId,
    body: { order_id: input.orderId },
  });
}

export async function fetchOrder(input: { storeId: string; orderId: string }) {
  return apiRequest<{
    order_id: string;
    order_number: string | number;
    order_type: string;
    status: string;
    grand_total: number;
    subtotal: number;
    gst_amount: number;
    delivery_charges?: number;
    customer_mobile?: string | null;
    customer_name?: string | null;
    customer_address?: string | null;
    petpooja_status?: string | null;
    rider_name?: string | null;
    rider_phone?: string | null;
    channel?: string | null;
    items: unknown;
  }>(`/orders/${encodeURIComponent(input.orderId)}`, {
    storeId: input.storeId,
  });
}
