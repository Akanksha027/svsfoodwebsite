"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SELECTED_STORE_KEY } from "@/lib/config";
import {
  readSavedUserLocation,
  rememberNearestStoreFromCoords,
  rememberNearestStoreFromSavedLocation,
  USER_LOCATION_KEY,
  type SavedUserLocation,
} from "@/lib/user-location";
import { prefetchStoreMenu } from "@/lib/menu-api";

type LocationState =
  | { status: "idle" }
  | { status: "prompting" }
  | { status: "ready"; location: SavedUserLocation }
  | { status: "denied" }
  | { status: "unavailable" };

function saveLocation(coords: GeolocationCoordinates): SavedUserLocation {
  const location: SavedUserLocation = {
    lat: coords.latitude,
    lng: coords.longitude,
    accuracy: coords.accuracy,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
  localStorage.removeItem(`${USER_LOCATION_KEY}_denied`);
  const nearest = rememberNearestStoreFromCoords(location.lat, location.lng);
  prefetchStoreMenu(nearest.backendStoreId);
  return location;
}

function markDenied() {
  localStorage.setItem(`${USER_LOCATION_KEY}_denied`, "1");
}

function wasDeniedBefore(): boolean {
  return localStorage.getItem(`${USER_LOCATION_KEY}_denied`) === "1";
}

export default function HeroSearchBox() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const askingRef = useRef(false);
  const [query, setQuery] = useState("");
  const [locationState, setLocationState] = useState<LocationState>({
    status: "idle",
  });

  useEffect(() => {
    const saved = readSavedUserLocation();
    if (saved) {
      const nearest = rememberNearestStoreFromSavedLocation();
      if (nearest) prefetchStoreMenu(nearest.backendStoreId);
      setLocationState({ status: "ready", location: saved });
      return;
    }
    if (wasDeniedBefore()) {
      setLocationState({ status: "denied" });
    }
  }, []);

  const focusInput = () => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const requestLocationThenFocus = () => {
    if (askingRef.current) return;

    const saved = readSavedUserLocation();
    if (saved) {
      const nearest = rememberNearestStoreFromSavedLocation();
      if (nearest) prefetchStoreMenu(nearest.backendStoreId);
      setLocationState({ status: "ready", location: saved });
      focusInput();
      return;
    }

    if (wasDeniedBefore() || !navigator.geolocation) {
      setLocationState(
        navigator.geolocation ? { status: "denied" } : { status: "unavailable" },
      );
      focusInput();
      return;
    }

    askingRef.current = true;
    setLocationState({ status: "prompting" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = saveLocation(pos.coords);
        setLocationState({ status: "ready", location });
        askingRef.current = false;
        focusInput();
      },
      () => {
        markDenied();
        setLocationState({ status: "denied" });
        askingRef.current = false;
        focusInput();
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  };

  const handleActivate = () => {
    requestLocationThenFocus();
  };

  const goToMenu = () => {
    const params = new URLSearchParams();
    const q = query.trim();
    if (q) params.set("q", q);

    // Prefer nearest store from GPS; fall back to any previously selected store.
    const nearest = rememberNearestStoreFromSavedLocation();
    if (nearest) {
      params.set("store", nearest.id);
    } else {
      try {
        const stored = localStorage.getItem(SELECTED_STORE_KEY);
        if (stored) params.set("store", stored);
      } catch {
        /* ignore */
      }
    }

    const qs = params.toString();
    router.push(qs ? `/menu?${qs}` : "/menu");
  };

  const locationHint =
    locationState.status === "prompting"
      ? "Getting your location..."
      : locationState.status === "ready"
        ? "Delivering near you"
        : locationState.status === "denied"
          ? "Location off · you can still search"
          : "Tap to set your location";

  return (
    <div className="w-full max-w-[560px] mx-auto" id="hero-search">
      <form
        className="flex items-stretch rounded-2xl sm:rounded-[1.25rem] overflow-hidden bg-svs-white shadow-[0_8px_30px_rgba(241,106,52,0.18)] border-2 border-svs-orange focus-within:shadow-[0_10px_36px_rgba(241,106,52,0.28)] transition-shadow"
        onSubmit={(e) => {
          e.preventDefault();
          goToMenu();
        }}
        onClick={handleActivate}
      >
        <div className="flex items-center pl-3 sm:pl-4 text-svs-orange shrink-0 pointer-events-none">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleActivate}
          placeholder="What do you want to eat?"
          autoComplete="off"
          enterKeyHint="search"
          className="flex-1 min-w-0 h-12 sm:h-[56px] md:h-[60px] px-3 sm:px-4 text-[15px] sm:text-[17px] text-svs-ink placeholder:text-svs-ink/40 bg-transparent border-none outline-none"
          aria-label="Search menu"
        />

        <button
          type="submit"
          className="shrink-0 px-4 sm:px-6 md:px-8 bg-svs-orange hover:bg-svs-orange-dark text-white text-[13px] sm:text-[15px] font-bold tracking-wide uppercase transition-colors"
        >
          Find Food
        </button>
      </form>

      <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-svs-ink/55 font-medium">
        {locationHint}
      </p>
    </div>
  );
}
