"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[72px] md:h-[88px] lg:h-[100px] bg-white border-b border-gray-100"
      id="main-navbar"
    >
      <Link
        href="/"
        className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-[1.5px] sm:tracking-[2px] uppercase text-gray-900 no-underline"
        id="navbar-brand"
        onClick={closeMenu}
      >
        SVSFOOD
      </Link>

      <div className="flex items-center gap-2 sm:gap-4 lg:gap-10" id="navbar-icons">
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          <Link
            href="/"
            className="text-sm lg:text-base font-medium text-gray-700 no-underline hover:text-gray-900 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/menu"
            className="text-sm lg:text-base font-medium text-gray-700 no-underline hover:text-gray-900 transition-colors duration-200"
          >
            Menu
          </Link>
          <Link
            href="/contact"
            className="text-sm lg:text-base font-medium text-gray-700 no-underline hover:text-gray-900 transition-colors duration-200"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-2 lg:gap-3">
          <button
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-none bg-transparent cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-100 relative"
            id="btn-cart"
            aria-label="Cart"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none scale-[0.14] sm:scale-[0.16] lg:scale-[0.2]">
              <div className="w-[120px] h-[150px] relative" style={{ perspective: "800px" }}>
                <div className="w-full h-full relative revolving-bag">
                  <div className="bag-top-handle bag-front-handle !border-gray-500"></div>
                  <div className="bag-top-handle bag-back-handle !border-gray-500"></div>
                  <div className="bag-face bag-front !bg-gray-300 !border-gray-400">
                    <span className="text-[14px] font-black tracking-widest text-gray-900">SVS</span>
                  </div>
                  <div className="bag-face bag-back !bg-gray-300 !border-gray-400">
                    <span className="text-[14px] font-black tracking-widest text-gray-900 transform rotate-y-180">
                      SVS
                    </span>
                  </div>
                  <div className="bag-face bag-left !bg-gray-400 !border-gray-400"></div>
                  <div className="bag-face bag-right !bg-gray-400 !border-gray-400"></div>
                </div>
              </div>
            </div>
          </button>

          <button
            className="hidden sm:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-none bg-transparent text-gray-700 cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-100 hover:text-gray-900"
            id="btn-location"
            aria-label="Location"
          >
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </button>

          <button
            className="hidden sm:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-none bg-transparent text-gray-700 cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-100 hover:text-gray-900"
            id="btn-search"
            aria-label="Search"
          >
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <button
            className="hidden md:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-none bg-transparent text-gray-700 cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-100 hover:text-gray-900"
            id="btn-account"
            aria-label="Account"
          >
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          <button
            className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full border-none bg-transparent text-gray-700 cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-100 hover:text-gray-900"
            id="btn-bookmark"
            aria-label="Saved"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <div className="w-px h-6 bg-gray-200 mx-0.5" />
          <button
            className="flex flex-col items-center justify-center gap-1.5 w-10 h-10 border-none bg-transparent cursor-pointer p-2"
            id="btn-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span
              className={`block w-5 h-0.5 bg-gray-700 rounded-sm transition-all duration-300 ease-in-out ${
                menuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-gray-700 rounded-sm transition-all duration-300 ease-in-out ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-gray-700 rounded-sm transition-all duration-300 ease-in-out ${
                menuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg transition-all duration-300 ease-in-out origin-top ${
          menuOpen
            ? "opacity-100 scale-y-100 visible"
            : "opacity-0 scale-y-95 invisible pointer-events-none"
        }`}
        id="mobile-menu"
      >
        <div className="flex flex-col px-6 py-4 gap-1">
          <Link
            href="/"
            onClick={closeMenu}
            className="py-3 text-base font-medium text-gray-800 no-underline border-b border-gray-100 hover:text-[#FF003C]"
          >
            Home
          </Link>
          <Link
            href="/menu"
            onClick={closeMenu}
            className="py-3 text-base font-medium text-gray-800 no-underline border-b border-gray-100 hover:text-[#FF003C]"
          >
            Menu
          </Link>
          <Link
            href="/contact"
            onClick={closeMenu}
            className="py-3 text-base font-medium text-gray-800 no-underline border-b border-gray-100 hover:text-[#FF003C]"
          >
            Contact
          </Link>
          <Link
            href="/account"
            onClick={closeMenu}
            className="py-3 text-base font-medium text-gray-800 no-underline hover:text-[#FF003C] flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
