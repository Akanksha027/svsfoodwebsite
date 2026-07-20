"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PolicyPage as PolicyPageData } from "@/data/policies";

type PolicyPageProps = {
  policy: PolicyPageData;
};

function isEmptySection(
  section: PolicyPageData["sections"][number],
  pageTitle: string,
) {
  const hasContent =
    section.paragraphs.length > 0 || section.bullets.length > 0;
  const isDuplicateTitle =
    section.heading?.toLowerCase() === pageTitle.toLowerCase();
  return !hasContent || (isDuplicateTitle && !hasContent);
}

export default function PolicyPage({ policy }: PolicyPageProps) {
  const router = useRouter();
  const sections = policy.sections.filter(
    (section) => !isEmptySection(section, policy.title),
  );

  return (
    <main className="min-h-screen bg-svs-white pt-24 sm:pt-28 md:pt-32 pb-16 flex flex-col items-center">
      <div className="w-[90%] mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-svs-ink/60 hover:text-svs-orange border-0 bg-transparent cursor-pointer p-0 transition-colors"
        >
          ← Go back
        </button>

        <article className="rounded-2xl sm:rounded-3xl border border-svs-cream bg-svs-white px-5 sm:px-8 md:px-10 py-8 sm:py-10 md:py-12 shadow-sm">
          <header className="mb-8 sm:mb-10 border-b border-svs-cream pb-6 sm:pb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-svs-orange">
              SVS Food
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-svs-ink tracking-tight leading-tight">
              {policy.title}
            </h1>
          </header>

          <div className="flex flex-col gap-8 sm:gap-10">
            {sections.map((section, index) => {
              const showHeading =
                section.heading &&
                section.heading.toLowerCase() !== policy.title.toLowerCase();

              return (
                <section key={`${section.heading ?? "section"}-${index}`}>
                  {showHeading ? (
                    <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-svs-ink">
                      {section.heading}
                    </h2>
                  ) : null}

                  {section.paragraphs.map((paragraph, pIdx) => (
                    <p
                      key={`p-${index}-${pIdx}`}
                      className="mb-3 text-[0.95rem] sm:text-base leading-relaxed text-svs-ink/80 last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets.length > 0 ? (
                    <ul className="mt-3 space-y-2.5">
                      {section.bullets.map((bullet, bulletIdx) => (
                        <li
                          key={`bullet-${index}-${bulletIdx}`}
                          className="flex gap-3 text-[0.95rem] sm:text-base leading-relaxed text-svs-ink/80"
                        >
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-svs-orange"
                            aria-hidden
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              );
            })}
          </div>
        </article>

        <nav
          className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-svs-ink/60"
          aria-label="Other policies"
        >
          <Link href="/refund-policy" className="hover:text-svs-orange no-underline">
            Refund Policy
          </Link>
          <Link href="/shipping-policy" className="hover:text-svs-orange no-underline">
            Shipping Policy
          </Link>
          <Link href="/privacy-policy" className="hover:text-svs-orange no-underline">
            Privacy Policy
          </Link>
          <Link
            href="/terms-and-conditions"
            className="hover:text-svs-orange no-underline"
          >
            Terms &amp; Conditions
          </Link>
        </nav>
      </div>
    </main>
  );
}
