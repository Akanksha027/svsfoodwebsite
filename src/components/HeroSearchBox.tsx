"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const LOCATION_KEY = "svs_user_location";

type SavedLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
  savedAt: string;
};

type LocationState =
  | { status: "idle" }
  | { status: "prompting" }
  | { status: "ready"; location: SavedLocation }
  | { status: "denied" }
  | { status: "unavailable" };

function readSavedLocation(): SavedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedLocation;
    if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
      return parsed;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

function saveLocation(coords: GeolocationCoordinates): SavedLocation {
  const location: SavedLocation = {
    lat: coords.latitude,
    lng: coords.longitude,
    accuracy: coords.accuracy,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  localStorage.removeItem(`${LOCATION_KEY}_denied`);
  return location;
}

function markDenied() {
  localStorage.setItem(`${LOCATION_KEY}_denied`, "1");
}

function wasDeniedBefore(): boolean {
  return localStorage.getItem(`${LOCATION_KEY}_denied`) === "1";
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
    const saved = readSavedLocation();
    if (saved) {
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

    const saved = readSavedLocation();
    if (saved) {
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
    const q = query.trim();
    router.push(q ? `/menu?q=${encodeURIComponent(q)}` : "/menu");
  };

  const locationHint =
    locationState.status === "prompting"
      ? "Getting your location…"
      : locationState.status === "ready"
        ? "Delivering near you"
        : locationState.status === "denied"
          ? "Location off · you can still search"
          : "Tap to set your location";

  return (
    <div className="w-full max-w-[560px] mx-auto" id="hero-search">
      <form
        className="flex items-stretch rounded-2xl sm:rounded-[1.25rem] overflow-hidden bg-white shadow-[0_8px_30px_rgba(241,106,53,0.18)] border-2 border-[#f16a35] focus-within:shadow-[0_10px_36px_rgba(241,106,53,0.28)] transition-shadow"
        onSubmit={(e) => {
          e.preventDefault();
          goToMenu();
        }}
        onClick={handleActivate}
      >
        <div className="flex items-center pl-3 sm:pl-4 text-[#f16a35] shrink-0 pointer-events-none">
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
          className="flex-1 min-w-0 h-12 sm:h-[56px] md:h-[60px] px-3 sm:px-4 text-[15px] sm:text-[17px] text-[#1a1a1a] placeholder:text-gray-400 bg-transparent border-none outline-none"
          aria-label="Search menu"
        />

        <button
          type="submit"
          className="shrink-0 px-4 sm:px-6 md:px-8 bg-[#f16a35] hover:bg-[#d45a2b] text-white text-[13px] sm:text-[15px] font-bold tracking-wide uppercase transition-colors"
        >
          Find Food
        </button>
      </form>

      <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#6b7280] font-medium">
        {locationHint}
      </p>
    </div>
  );
}
