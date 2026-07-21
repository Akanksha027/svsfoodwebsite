"use client";

import { useEffect, useRef, useState } from "react";
import { useMenuSearch } from "@/context/MenuSearchContext";

/** Menu search pill — docked (mobile sticky stack) or centered (desktop navbar). */
export default function MenuNavSearch({ docked = false }: { docked?: boolean }) {
  const { query, setQuery } = useMenuSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [entered, setEntered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <form
      className={`menu-nav-search ${docked ? "menu-nav-search--docked" : ""} ${
        entered ? "menu-nav-search--visible" : ""
      } ${focused || query ? "menu-nav-search--active" : ""}`}
      onSubmit={(e) => e.preventDefault()}
      id={docked ? "menu-nav-search-mobile" : "menu-nav-search"}
    >
      <span className="menu-nav-search__icon-wrap" aria-hidden>
        <svg
          className="menu-nav-search__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={
          docked
            ? "Search for food, burgers, or pizza…"
            : "Search burgers, pizza, desserts…"
        }
        autoComplete="off"
        enterKeyHint="search"
        className="menu-nav-search__input"
        aria-label="Search menu items"
      />

      <span
        className={`menu-nav-search__clear-wrap ${
          query.trim() ? "menu-nav-search__clear-wrap--visible" : ""
        }`}
        aria-hidden={!query.trim()}
      >
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="menu-nav-search__clear"
          aria-label="Clear search"
          tabIndex={query.trim() ? 0 : -1}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            aria-hidden
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </span>
    </form>
  );
}
