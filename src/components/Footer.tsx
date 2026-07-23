import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import MenuStorePicker from "@/components/MenuStorePicker";

const FOOTER_EMAILS = [
  "helpdesk@svsfood.com",
  "info@svsfood.com",
  "career@svsfood.com",
] as const;

const FOOTER_PHONE = "7869717041";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/svsfoodveg/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/svsf_food/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@svsfood",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/svs_food",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/svsfood",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
] as const;

const PAYMENT_METHODS = [
  "Cash",
  "Mastercard",
  "Google Pay",
  "Paytm",
  "Visa",
  "UPI",
] as const;

const USEFUL_LINKS = [
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/menu", label: "Order Now" },
  { href: "/account?tab=svs-cash", label: "SVS Cash" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "https://connect.svsfood.com", label: "Partner", external: true },
  { href: "https://careers.svsfood.com", label: "Career", external: true },
] as const;

const TOP_NAV = [
  { href: "/menu", label: "Order now", external: false },
  { href: "/locations", label: "Store locator", external: false },
  { href: "https://connect.svsfood.com", label: "Partner", external: true },
  { href: "https://careers.svsfood.com", label: "Career", external: true },
] as const;

type FooterProps = {
  menuStoreId?: string;
};

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "text-[13px] sm:text-[14px] text-svs-ink/55 hover:text-svs-orange transition-colors leading-snug";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function FooterSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 ${className}`}>
      <h4 className="font-bold text-svs-ink text-[14px] mb-3 tracking-wide">
        {title}
      </h4>
      {children}
    </section>
  );
}

function FooterBag({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-[84px] h-[108px] sm:w-[96px] sm:h-[122px] lg:w-[100px] lg:h-[128px] relative shrink-0 ${className}`}
      style={{ perspective: "900px" }}
      aria-hidden
    >
      <div className="w-full h-full relative revolving-bag footer-envelope-bag origin-center">
        <div className="bag-face bag-front footer-bag-front">
          <span className="footer-bag-wordmark">
            <span className="footer-bag-svs">
              SVS
              <span className="footer-bag-star">★</span>
            </span>
            <span className="footer-bag-food">FOOD</span>
          </span>
        </div>
        <div className="bag-face bag-back footer-bag-front">
          <span className="footer-bag-wordmark">
            <span className="footer-bag-svs">
              SVS
              <span className="footer-bag-star">★</span>
            </span>
            <span className="footer-bag-food">FOOD</span>
          </span>
        </div>
        <div className="bag-face bag-left" />
        <div className="bag-face bag-right" />
        <div className="bag-face footer-bag-bottom" />
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[58px] sm:w-[68px] h-[9px] bg-svs-ink/10 rounded-[100%] blur-[5px]" />
    </div>
  );
}

export default function Footer({ menuStoreId }: FooterProps = {}) {
  return (
    <footer className="w-full bg-svs-cream/40 pt-5 sm:pt-6 md:pt-7 pb-4 sm:pb-5 md:pb-6 flex flex-col items-center overflow-hidden font-sans px-4 sm:px-5">
      {/* Top strip */}
      <div className="w-full max-w-[1280px] bg-svs-white rounded-xl px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 mb-3 sm:mb-4 border border-svs-cream/80">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <p className="text-[13px] sm:text-[14px] font-semibold text-svs-ink tracking-tight leading-snug md:max-w-[55%] lg:max-w-xl">
            Feel the luxury of premium burgers with SVS Food, fast food done
            right in India
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] sm:text-[14px] font-semibold text-svs-ink md:justify-end shrink-0">
            {TOP_NAV.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-svs-orange transition-colors whitespace-nowrap"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-svs-orange transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>
        {menuStoreId ? (
          <div className="mt-3 pt-3 border-t border-svs-cream/80">
            <MenuStorePicker currentStoreId={menuStoreId} />
          </div>
        ) : null}
      </div>

      {/* Main footer */}
      <div className="w-full max-w-[1280px] bg-svs-white rounded-xl sm:rounded-2xl px-4 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-7 md:py-8 border border-svs-cream/80">
        {/*
          Mobile: 1 col stack
          Mid (sm–md): 2 cols per row
            Brand | Links
            Payments | Contact
            Bag (centered)
          lg+: 5 cols — Brand | Links | Payments | Contact | Bag
        */}
        <div
          className="
            grid items-start gap-x-8 gap-y-8 md:gap-x-10 md:gap-y-9
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,1.15fr)_auto]
            xl:gap-x-12
          "
        >
          {/* Brand */}
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex no-underline"
              aria-label="SVS Food home"
            >
              <BrandLogo variant="on-mark" height={48} />
            </Link>
            <p className="mt-2.5 text-[13px] font-bold text-svs-ink tracking-wide">
              SVS FOOD Private Limited
            </p>
            {/* 
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex flex-col items-center justify-center shrink-0 w-fit">
                <div className="h-[2px] w-full bg-[#E3792E]" />
                <span className="font-serif font-bold italic text-[#25397E] text-[12px] leading-[1.15] tracking-tighter px-0.5">
                  fssa<span className="text-[#E3792E]">i</span>
                </span>
                <div className="h-[2px] w-full bg-[#1F7E41]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-svs-ink/55 tracking-wide leading-snug">
                FSSAI LICENSE NO. 1142145000031
              </span>
            </div>
            */}
            <div className="mt-4 pt-3 border-t border-svs-cream max-w-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-svs-ink mb-1.5">
                Corporate Address
              </p>
              <address className="not-italic text-[12px] sm:text-[13px] text-svs-ink/55 leading-relaxed">
                Shop No. 200, Mezanine Floor,
                <br />
                Ojas Imperia, Bandariya Tiraha,
                <br />
                Narmada Road, Jabalpur,
                <br />
                Madhya Pradesh 482001
              </address>
            </div>
          </div>

          {/* Useful Links */}
          <FooterSection title="Useful Links" className="min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-3 gap-y-2">
              {USEFUL_LINKS.map((link) => (
                <FooterLink
                  key={link.href}
                  href={link.href}
                  external={"external" in link ? link.external : false}
                >
                  {link.label}
                </FooterLink>
              ))}
            </div>
          </FooterSection>

          {/* Payments */}
          <FooterSection title="Payments" className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center rounded-md border border-svs-cream bg-svs-cream/50 px-2 py-1 text-[11px] font-semibold text-svs-ink/60 whitespace-nowrap"
                >
                  {method}
                </span>
              ))}
            </div>
          </FooterSection>

          {/* Contact */}
          <FooterSection title="Contact &amp; Connect" className="min-w-0">
            <div className="flex flex-col gap-1.5">
              {FOOTER_EMAILS.map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="text-[13px] text-svs-ink/55 hover:text-svs-orange transition-colors break-all"
                >
                  {email}
                </a>
              ))}
              <a
                href={`tel:+91${FOOTER_PHONE}`}
                className="text-[13px] text-svs-ink/55 hover:text-svs-orange transition-colors"
              >
                (+91) {FOOTER_PHONE}
              </a>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-svs-cream bg-svs-cream/40 text-svs-ink/55 hover:border-svs-orange/35 hover:bg-svs-orange/10 hover:text-svs-orange transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </FooterSection>

          {/* Bag — mid: full-width centered row; desktop: 5th column */}
          <div className="flex items-start justify-center sm:col-span-2 lg:col-span-1 lg:justify-center pt-1 sm:pt-2 lg:pt-0.5">
            <FooterBag />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-7 sm:mt-8 md:mt-9 pt-4 sm:pt-5 border-t border-svs-cream flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[11px] sm:text-[12px] text-svs-ink/40 font-semibold tracking-wide text-center sm:text-left leading-relaxed">
            © 2026 SVS FOOD Private Limited. All Rights Reserved.
          </p>
          <a
            href="https://uen.io/svsfood"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-svs-cream bg-svs-cream/40 px-5 py-2.5 text-[13px] sm:text-[14px] font-bold text-svs-ink hover:border-svs-orange/40 hover:bg-svs-orange/10 hover:text-svs-orange transition-colors w-full sm:w-auto"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download App
          </a>
        </div>
      </div>
    </footer>
  );
}
