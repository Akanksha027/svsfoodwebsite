import { BACKEND_URL, WEBSITE_CUSTOMER_EXPIRES_KEY, WEBSITE_CUSTOMER_TOKEN_KEY } from "@/lib/config";

export type WebsiteCustomerAddress = {
  id: string;
  label: string;
  flat: string;
  street: string;
  area: string;
  landmark: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  formatted_address: string;
  is_default: boolean;
};

export type WebsiteCustomerNotificationPreferences = {
  channels: {
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
  };
  orders: {
    placed: boolean;
    confirmed_paid: boolean;
    preparing: boolean;
    ready: boolean;
    out_for_delivery: boolean;
    delivered: boolean;
    cancelled: boolean;
    payment_receipt: boolean;
  };
  marketing: {
    offers_promos: boolean;
    new_menu_items: boolean;
    feedback_requests: boolean;
  };
  account: {
    login_otp: boolean;
    security_alerts: boolean;
  };
};

export type WebsiteCustomer = {
  id: string;
  phone: string;
  alternate_phone?: string | null;
  name: string;
  email?: string | null;
  photo_url?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  notification_preferences?: WebsiteCustomerNotificationPreferences;
  addresses: WebsiteCustomerAddress[];
};

export type CustomerOrderSummary = {
  id: string;
  store_id: string;
  status: string;
  payment_status: string | null;
  is_cod?: boolean;
  cod_unpaid?: boolean;
  can_pay_online?: boolean;
  total_amount: number | null;
  created_at: string;
  order_type: string;
  customer_name: string | null;
  delivery_address: string | null;
};

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WEBSITE_CUSTOMER_TOKEN_KEY);
}

export function persistCustomerToken(
  token: string | null,
  expiresAt?: string | null,
) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(WEBSITE_CUSTOMER_TOKEN_KEY, token);
    if (expiresAt) {
      localStorage.setItem(WEBSITE_CUSTOMER_EXPIRES_KEY, expiresAt);
    }
  } else {
    localStorage.removeItem(WEBSITE_CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(WEBSITE_CUSTOMER_EXPIRES_KEY);
  }
}

export function isCustomerAuthError(err: unknown): boolean {
  const e = err as Error & { status?: number; code?: string };
  return e.status === 401 || e.code === "CUSTOMER_UNAUTHORIZED";
}

async function customerRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string | null;
    query?: Record<string, string>;
  } = {},
): Promise<T> {
  const token = options.token !== undefined ? options.token : readToken();
  const qs = options.query
    ? `?${new URLSearchParams(options.query).toString()}`
    : "";
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody) headers["Content-Type"] = "application/json";
  if (token) headers["x-customer-token"] = token;

  const res = await fetch(`${BACKEND_URL}${path}${qs}`, {
    method: options.method || "GET",
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.success) {
    const retry = payload?.error?.details?.retry_after_seconds;
    const message =
      payload?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message) as Error & {
      retryAfterSeconds?: number;
      status?: number;
      code?: string;
    };
    if (typeof retry === "number") err.retryAfterSeconds = retry;
    err.status = res.status;
    err.code = payload?.error?.code;
    throw err;
  }
  return payload.data as T;
}

export async function sendLoginOtp(phone: string) {
  return customerRequest<{
    ok: boolean;
    expires_in_seconds: number;
    resend_after_seconds: number;
  }>("/website-customer/otp/send", { method: "POST", body: { phone }, token: null });
}

export async function verifyLoginOtp(input: {
  phone: string;
  otp: string;
  name?: string;
}) {
  return customerRequest<{
    token: string;
    expires_at: string;
    customer: WebsiteCustomer;
  }>("/website-customer/otp/verify", {
    method: "POST",
    body: input,
    token: null,
  });
}

export async function fetchCustomerMe(token?: string | null) {
  return customerRequest<{
    customer: WebsiteCustomer;
    expires_at?: string;
    session_days?: number;
  }>("/website-customer/me", { token });
}

export async function updateCustomerProfile(body: {
  name?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
}) {
  return customerRequest<{ customer: WebsiteCustomer }>(
    "/website-customer/me",
    { method: "PATCH", body },
  );
}

export async function uploadCustomerPhoto(input: {
  imageBase64: string;
  contentType?: string;
}) {
  return customerRequest<{ customer: WebsiteCustomer }>(
    "/website-customer/me/photo",
    {
      method: "POST",
      body: {
        image_base64: input.imageBase64,
        content_type: input.contentType || "image/jpeg",
      },
    },
  );
}

export async function updateNotificationPreferences(
  patch: Partial<WebsiteCustomerNotificationPreferences>,
) {
  return customerRequest<{
    customer: WebsiteCustomer;
    notification_preferences: WebsiteCustomerNotificationPreferences;
  }>("/website-customer/me/notifications", {
    method: "PATCH",
    body: patch,
  });
}

export async function logoutCustomer() {
  const token = readToken();
  if (token) {
    await customerRequest("/website-customer/logout", {
      method: "POST",
      token,
    }).catch(() => null);
  }
  persistCustomerToken(null);
}

export async function fetchCustomerOrders(storeId?: string) {
  return customerRequest<{ active: CustomerOrderSummary[]; past: CustomerOrderSummary[] }>(
    "/website-customer/orders",
    { query: storeId ? { store_id: storeId } : undefined },
  );
}

export async function createCustomerAddress(
  body: Omit<
    WebsiteCustomerAddress,
    "id" | "is_default" | "formatted_address"
  > & {
    is_default?: boolean;
    formatted_address?: string;
    latitude?: number | null;
    longitude?: number | null;
  },
) {
  return customerRequest<{ address: WebsiteCustomerAddress }>(
    "/website-customer/addresses",
    { method: "POST", body },
  );
}

export async function deleteCustomerAddress(addressId: string) {
  return customerRequest<{ ok: boolean }>(
    `/website-customer/addresses/${encodeURIComponent(addressId)}`,
    { method: "DELETE" },
  );
}

export async function setDefaultCustomerAddress(addressId: string) {
  return customerRequest<{ address: WebsiteCustomerAddress }>(
    `/website-customer/addresses/${encodeURIComponent(addressId)}/default`,
    { method: "POST", body: {} },
  );
}

export function addressMatchesCheckout(
  addr: WebsiteCustomerAddress,
  fields: {
    flat: string;
    street: string;
    area: string;
    landmark: string;
    pincode: string;
  },
) {
  const norm = (s: string) => s.trim().toLowerCase();
  return (
    norm(addr.flat) === norm(fields.flat) &&
    norm(addr.street) === norm(fields.street) &&
    norm(addr.area) === norm(fields.area) &&
    norm(addr.landmark || "") === norm(fields.landmark) &&
    norm(addr.pincode || "") === norm(fields.pincode)
  );
}

export async function createCustomerCodPaySession(orderId: string) {
  return customerRequest<{
    transaction_id: string;
    qr_payload: string;
    amount: string;
    payment_attempt_id: string;
    order_id: string;
    expires_at?: string;
    is_mock?: boolean;
  }>(`/website-customer/orders/${encodeURIComponent(orderId)}/cod-pay/session`, {
    method: "POST",
    body: {},
  });
}

export async function getCustomerCodPayStatus(
  orderId: string,
  transactionId: string,
) {
  return customerRequest<{
    internal_status: string;
    code: string;
  }>(
    `/website-customer/orders/${encodeURIComponent(orderId)}/cod-pay/status/${encodeURIComponent(transactionId)}`,
  );
}

/** Save delivery fields after a successful order if not already stored. */
export async function persistCheckoutDeliveryAddress(input: {
  customer: WebsiteCustomer;
  flat: string;
  street: string;
  area: string;
  landmark: string;
  pincode: string;
  label?: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const fields = {
    flat: input.flat,
    street: input.street,
    area: input.area,
    landmark: input.landmark,
    pincode: input.pincode,
  };
  if (input.customer.addresses.some((a) => addressMatchesCheckout(a, fields))) {
    return;
  }
  const label = String(input.label || "Home").trim().slice(0, 40) || "Home";
  await createCustomerAddress({
    label,
    flat: fields.flat.trim(),
    street: fields.street.trim(),
    area: fields.area.trim(),
    landmark: fields.landmark.trim(),
    pincode: fields.pincode.trim(),
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    is_default: input.customer.addresses.length === 0,
  });
}
