"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchCustomerMe,
  isCustomerAuthError,
  logoutCustomer,
  persistCustomerToken,
  verifyLoginOtp,
  type WebsiteCustomer,
} from "@/lib/website-customer-api";
import { WEBSITE_CUSTOMER_TOKEN_KEY } from "@/lib/config";

type WebsiteAuthContextValue = {
  customer: WebsiteCustomer | null;
  token: string | null;
  loading: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  accountMenuOpen: boolean;
  openAccountMenu: () => void;
  closeAccountMenu: () => void;
  refreshCustomer: () => Promise<void>;
  completeLogin: (input: {
    phone: string;
    otp: string;
    name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setCustomer: (c: WebsiteCustomer | null) => void;
};

const WebsiteAuthContext = createContext<WebsiteAuthContextValue | null>(null);

export function WebsiteAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<WebsiteCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const refreshCustomer = useCallback(async () => {
    const t =
      typeof window !== "undefined"
        ? localStorage.getItem(WEBSITE_CUSTOMER_TOKEN_KEY)
        : null;
    if (!t) {
      setToken(null);
      setCustomer(null);
      return;
    }
    try {
      const { customer: c, expires_at } = await fetchCustomerMe(t);
      setToken(t);
      setCustomer(c);
      if (expires_at) persistCustomerToken(t, expires_at);
    } catch (e) {
      if (isCustomerAuthError(e)) {
        persistCustomerToken(null);
        setToken(null);
        setCustomer(null);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = localStorage.getItem(WEBSITE_CUSTOMER_TOKEN_KEY);
      if (!t) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const { customer: c, expires_at } = await fetchCustomerMe(t);
        if (!cancelled) {
          setToken(t);
          setCustomer(c);
          if (expires_at) persistCustomerToken(t, expires_at);
        }
      } catch (e) {
        if (!cancelled) {
          if (isCustomerAuthError(e)) {
            persistCustomerToken(null);
          } else {
            setToken(t);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const completeLogin = useCallback(
    async (input: { phone: string; otp: string; name?: string }) => {
      const result = await verifyLoginOtp(input);
      persistCustomerToken(result.token, result.expires_at);
      setToken(result.token);
      setCustomer(result.customer);
      setLoginOpen(false);
    },
    [],
  );

  const openAccountMenu = useCallback(() => setAccountMenuOpen(true), []);
  const closeAccountMenu = useCallback(() => setAccountMenuOpen(false), []);

  const logout = useCallback(async () => {
    await logoutCustomer();
    setToken(null);
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({
      customer,
      token,
      loading,
      loginOpen,
      openLogin: () => setLoginOpen(true),
      closeLogin: () => setLoginOpen(false),
      accountMenuOpen,
      openAccountMenu,
      closeAccountMenu,
      refreshCustomer,
      completeLogin,
      logout,
      setCustomer,
    }),
    [
      customer,
      token,
      loading,
      loginOpen,
      accountMenuOpen,
      refreshCustomer,
      completeLogin,
      logout,
      openAccountMenu,
      closeAccountMenu,
    ],
  );

  return (
    <WebsiteAuthContext.Provider value={value}>
      {children}
    </WebsiteAuthContext.Provider>
  );
}

export function useWebsiteAuth() {
  const ctx = useContext(WebsiteAuthContext);
  if (!ctx) {
    throw new Error("useWebsiteAuth must be used within WebsiteAuthProvider");
  }
  return ctx;
}
