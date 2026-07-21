"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MENU_DELIVERY_LOCATION_EVENT,
  readMenuDeliveryLocation,
} from "@/lib/menu-delivery-location";
import { fetchDeliveryAddressHint } from "@/lib/reverse-geocode";

/** Navbar subtitle: selected delivery location → GPS hint → fallback store line. */
export function useMenuDeliveryLocationLine(fallback: string): string {
  const [line, setLine] = useState(fallback);

  const refresh = useCallback(async () => {
    const selected = readMenuDeliveryLocation();
    if (selected?.displayLine) {
      setLine(selected.displayLine);
      return;
    }
    const hint = await fetchDeliveryAddressHint();
    if (hint?.formatted) {
      setLine(hint.formatted);
      return;
    }
    setLine(fallback);
  }, [fallback]);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener(MENU_DELIVERY_LOCATION_EVENT, onChange);
    return () => window.removeEventListener(MENU_DELIVERY_LOCATION_EVENT, onChange);
  }, [refresh]);

  return line;
}
