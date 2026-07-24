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
  addons?: Array<{
    id: string;
    group_id?: string;
    group_name?: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  variation_name?: string | null;
  variation_group_name?: string | null;
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
  customerLatitude?: number;
  customerLongitude?: number;
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
      customer_latitude: input.customerLatitude,
      customer_longitude: input.customerLongitude,
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

/** PhonePe PG hosted checkout — cards / netbanking (not UPI QR). */
export async function createPgPaymentSession(input: {
  storeId: string;
  orderId: string;
  amount: number;
  redirectUrl: string;
}) {
  return apiRequest<{
    order_id: string;
    merchant_order_id: string;
    pg_order_id: string;
    redirect_url: string;
    state: string;
    amount_paise: number;
    amount?: string;
    mode?: string;
  }>("/payments/pg/session", {
    method: "POST",
    storeId: input.storeId,
    body: {
      order_id: input.orderId,
      amount: input.amount,
      redirect_url: input.redirectUrl,
    },
  });
}

export async function getPgPaymentStatus(input: {
  storeId: string;
  orderId: string;
}) {
  return apiRequest<{
    merchant_order_id: string;
    pg_order_id?: string | null;
    state?: string;
    internal_status: string;
    payment_details?: unknown;
    txn_id?: string | null;
  }>(`/payments/pg/status/${encodeURIComponent(input.orderId)}`, {
    storeId: input.storeId,
  });
}

export async function fetchPgPaymentsAvailable(input: { storeId: string }) {
  return apiRequest<{ available: boolean }>("/payments/pg/available", {
    storeId: input.storeId,
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

export async function confirmCodPlace(input: {
  storeId: string;
  orderId: string;
}) {
  return apiRequest<{
    order_id: string;
    status: string;
    payment_method: string;
  }>("/payments/cod-place", {
    method: "POST",
    storeId: input.storeId,
    body: { order_id: input.orderId },
  });
}

/** Cancel unpaid checkout after customer backs out of UPI. */
export async function abandonCheckoutPayment(input: {
  storeId: string;
  orderId: string;
  transactionId?: string;
}) {
  return apiRequest<{
    order_id: string;
    cancelled: boolean;
    status: string;
  }>("/payments/abandon", {
    method: "POST",
    storeId: input.storeId,
    body: {
      order_id: input.orderId,
      payment_session_id: input.transactionId || undefined,
    },
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
    customer_mobile_changed?: boolean;
    can_change_customer_mobile?: boolean;
    customer_name?: string | null;
    customer_address?: string | null;
    customer_latitude?: number | null;
    customer_longitude?: number | null;
    petpooja_status?: string | null;
    rider_name?: string | null;
    rider_phone?: string | null;
    rider_status?: string | null;
    channel?: string | null;
    created_at?: string;
    paid_at?: string | null;
    is_cod?: boolean;
    cod_unpaid?: boolean;
    can_pay_online?: boolean;
    items: unknown;
  }>(`/orders/${encodeURIComponent(input.orderId)}`, {
    storeId: input.storeId,
  });
}

/** One-time contact number change; also saved as customer's alternate_phone. */
export async function changeOrderCustomerMobile(input: {
  storeId: string;
  orderId: string;
  mobile: string;
}) {
  return apiRequest<{
    order_id: string;
    customer_mobile: string;
    customer_mobile_changed: boolean;
    can_change_customer_mobile: boolean;
    alternate_phone_saved: boolean;
  }>(`/orders/${encodeURIComponent(input.orderId)}/customer-mobile`, {
    method: "POST",
    storeId: input.storeId,
    body: { mobile: input.mobile },
  });
}
