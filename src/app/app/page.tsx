import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SVS_APP_STORE_URL,
  SVS_PLAY_STORE_URL,
  storeUrlForUserAgent,
} from "@/lib/app-store-links";

export default async function AppDownloadPage() {
  const ua = (await headers()).get("user-agent") || "";
  const target = storeUrlForUserAgent(ua);
  if (target) redirect(target);

  return (
    <main className="min-h-[70svh] pt-24 px-6 pb-16 max-w-md mx-auto text-center">
      <h1 className="text-xl font-extrabold text-gray-900 mb-2">
        Download SVS Food
      </h1>
      <p className="text-sm text-gray-600 mb-8">
        Open this page on your phone, or choose your store below.
      </p>
      <div className="flex flex-col gap-3">
        <a
          href={SVS_PLAY_STORE_URL}
          className="block rounded-xl bg-gray-900 text-white text-sm font-extrabold py-3.5 no-underline"
        >
          Get it on Google Play
        </a>
        <a
          href={SVS_APP_STORE_URL}
          className="block rounded-xl border-2 border-gray-900 text-gray-900 text-sm font-extrabold py-3.5 no-underline"
        >
          Download on the App Store
        </a>
      </div>
      <Link
        href="/menu"
        className="inline-block mt-10 text-sm font-bold text-[#f16a34] no-underline"
      >
        ← Back to menu
      </Link>
    </main>
  );
}
