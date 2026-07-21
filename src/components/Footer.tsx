import Link from "next/link";
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
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/svsf_food/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@svsfood",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/svs_food",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/svsfood",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
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

type FooterProps = {
  /** When set, shows outlet switcher on menu page only. */
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
    "text-[14px] sm:text-[15px] text-svs-ink/50 hover:text-svs-orange transition-colors";

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

export default function Footer({ menuStoreId }: FooterProps = {}) {
  return (
    <footer className="w-full bg-svs-white pt-6 sm:pt-8 md:pt-10 pb-4 sm:pb-6 flex flex-col items-center overflow-hidden font-sans">
      <div className="w-[95%] max-w-[1500px] bg-svs-white rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex flex-col gap-0 mb-4 sm:mb-6 shadow-sm border border-svs-cream">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="text-[13px] sm:text-[15px]">
            <p className="font-bold text-svs-ink mb-0 tracking-tight leading-snug">
              Feel the luxury of premium burgers with SVS Food, fast food done
              right in India
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-5 text-[13px] sm:text-[15px] font-semibold text-svs-ink">
           
            <Link href="/menu" className="hover:text-svs-orange">
              Order now
            </Link>
            <Link href="/locations" className="hover:text-svs-orange">
              Store locator
            </Link>
          </div>
        </div>
        {menuStoreId ? <MenuStorePicker currentStoreId={menuStoreId} /> : null}
      </div>

      <div className="w-[95%] max-w-[1500px] bg-svs-white rounded-2xl sm:rounded-[2rem] px-4 sm:px-8 md:px-10 py-8 sm:py-12 md:py-16 flex flex-col gap-10 relative shadow-sm border border-svs-cream">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-10 lg:gap-8 xl:gap-12 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 lg:gap-x-10 xl:gap-x-14 w-full lg:w-auto shrink-0">
            <div className="flex flex-col gap-2.5 sm:gap-3 min-w-[140px] sm:min-w-[160px]">
              <h4 className="font-bold text-svs-ink mb-1 sm:mb-2 text-[15px] sm:text-[16px] tracking-wide">
                Useful Links
              </h4>
              <FooterLink href="/refund-policy">Refund Policy</FooterLink>
              <FooterLink href="/menu">Order Now</FooterLink>
              <FooterLink href="/shipping-policy">Shipping Policy</FooterLink>
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink href="/terms-and-conditions">
                Terms &amp; Conditions
              </FooterLink>
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-3 min-w-[140px] sm:min-w-[160px]">
              <h4 className="font-bold text-svs-ink mb-1 sm:mb-2 text-[15px] sm:text-[16px] tracking-wide">
                Payment Methods
              </h4>
              <div className="flex flex-wrap gap-2 max-w-[200px]">
                {PAYMENT_METHODS.map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center rounded-md border border-svs-cream bg-svs-cream/40 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-svs-ink/60"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1 min-w-[180px] sm:min-w-[200px]">
              <h4 className="font-bold text-svs-ink mb-0 sm:mb-1 text-[15px] sm:text-[16px] tracking-wide">
                Contact &amp; Connect
              </h4>
              <div className="flex flex-col gap-2">
                {FOOTER_EMAILS.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="text-[14px] sm:text-[15px] text-svs-ink/50 hover:text-svs-orange transition-colors break-all"
                  >
                    {email}
                  </a>
                ))}
                <a
                  href={`tel:+91${FOOTER_PHONE}`}
                  className="text-[14px] sm:text-[15px] text-svs-ink/50 hover:text-svs-orange transition-colors"
                >
                  (+91) {FOOTER_PHONE}
                </a>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-svs-cream bg-svs-cream/30 text-svs-ink/60 hover:border-svs-orange/30 hover:bg-svs-orange/10 hover:text-svs-orange transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 sm:gap-6 lg:gap-12 xl:gap-16 shrink-0 lg:ml-auto lg:pr-2 xl:pr-6 w-full lg:w-auto">
            <h2 className="font-atma text-[clamp(1.75rem,8vw,3.75rem)] text-svs-orange/70 font-bold tracking-wide leading-none text-center sm:text-left">
              SVSFOOD
            </h2>

            <div
              className="w-[90px] h-[115px] sm:w-[150px] sm:h-[190px] md:w-[190px] md:h-[240px] relative mt-0 sm:mt-4 shrink-0"
              style={{ perspective: "900px" }}
            >
              <div className="w-full h-full relative revolving-bag footer-envelope-bag scale-[0.8] sm:scale-100 md:scale-[1.05] origin-center">
                <div className="bag-face bag-front footer-bag-front">
                  <span className="footer-bag-wordmark" aria-hidden>
                    <span className="footer-bag-svs">
                      SVS
                      <span className="footer-bag-star">★</span>
                    </span>
                    <span className="footer-bag-food">FOOD</span>
                  </span>
                </div>
                <div className="bag-face bag-back footer-bag-front">
                  <span className="footer-bag-wordmark" aria-hidden>
                    <span className="footer-bag-svs">
                      SVS
                      <span className="footer-bag-star">★</span>
                    </span>
                    <span className="footer-bag-food">FOOD</span>
                  </span>
                </div>
                <div className="bag-face bag-left" />
                <div className="bag-face bag-right" />
                <div className="bag-face footer-bag-bottom" aria-hidden />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 w-[70px] sm:w-[110px] md:w-[140px] h-[12px] sm:h-[18px] bg-svs-ink/10 rounded-[100%] blur-[8px]" />
            </div>
          </div>
        </div>

        <div className="w-full">
          <p className="text-[13px] sm:text-[14px] text-svs-ink/60 text-center lg:text-left">
            <span className="font-bold text-svs-ink">OUR STORES:</span>{" "}
            <Link href="/locations" className="hover:text-svs-orange">
              Jabalpur
            </Link>
            {" | "}
            <Link href="/locations" className="hover:text-svs-orange">
              Satna
            </Link>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 pt-2 border-t border-svs-cream">
          <a
            href="https://uen.io/svsfood"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-svs-cream bg-svs-cream/30 px-6 py-3 sm:px-8 sm:py-3.5 text-[15px] sm:text-[17px] font-bold text-svs-ink hover:border-svs-orange/40 hover:bg-svs-orange/10 hover:text-svs-orange transition-colors min-w-[200px] sm:min-w-[240px]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 sm:h-6 sm:w-6 shrink-0"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download App
          </a>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px] sm:text-[12px] text-svs-ink/40 font-semibold tracking-wide text-center">
            <span>© Copyright. All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
