import Image from "next/image";
import Link from "next/link";

/** Bottom-of-page credit — used sitewide via root layout. */
export default function PoweredBy() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-4 px-4 bg-transparent">
      <span className="text-[13px] sm:text-sm font-semibold text-svs-ink/55">
        Powered by
      </span>
      <Link
        href="/"
        className="inline-flex items-baseline no-underline"
        aria-label="SVS Food home"
      >
        <Image
          src="/svslogo.png"
          alt="SVS"
          width={112}
          height={40}
          className="h-auto w-[112px] object-contain align-middle"
        />
        <span className="text-[13px] sm:text-sm font-semibold text-svs-ink/55 ml-0.5">
          .
        </span>
      </Link>
    </div>
  );
}
