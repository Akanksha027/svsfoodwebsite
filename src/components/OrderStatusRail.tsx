"use client";

export type OrderStatusStep = {
  id: string;
  title: string;
  subtitle: string;
};

export type OrderStatusRider = {
  name?: string | null;
  phone?: string | null;
  status?: string | null;
};

type OrderStatusRailProps = {
  steps: OrderStatusStep[];
  activeIndex: number;
  cancelled?: boolean;
  /** Shown inside the "On the way" box (not as a separate card above). */
  rider?: OrderStatusRider | null;
  /** Visual tone — account live card uses dark surface. */
  tone?: "light" | "dark";
};

function StepIcon({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const cn = className ?? "h-5 w-5";
  const common = {
    className: cn,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (id) {
    case "placed":
      return (
        <svg {...common}>
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M9 14l2 2 4-4" />
        </svg>
      );
    case "preparing":
      return (
        <svg {...common}>
          <path d="M2 12h20" />
          <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
          <path d="M4 8h16v4H4z" />
          <path d="M10 4v2" />
          <path d="M14 4v2" />
        </svg>
      );
    case "ready":
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.3 7L12 12l8.7-5" />
          <path d="M12 22V12" />
        </svg>
      );
    case "onway":
      return (
        <svg {...common}>
          <circle cx="18.5" cy="17.5" r="3.5" />
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="15" cy="5" r="1" />
          <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
        </svg>
      );
    case "done":
      return (
        <svg {...common}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4 12 14.01l-3-3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "h-5 w-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function RiderInsideBox({
  rider,
  tone,
}: {
  rider: OrderStatusRider;
  tone: "light" | "dark";
}) {
  const isDark = tone === "dark";
  const initial = (rider.name || "R").charAt(0).toUpperCase();
  const statusLabel = rider.status
    ? rider.status.replace(/_/g, " ")
    : null;

  return (
    <div
      className={[
        "mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5",
        isDark
          ? "bg-white/10 border border-white/10"
          : "bg-white/80 border border-orange-100",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-extrabold",
          isDark ? "bg-[#f16a34] text-white" : "bg-[#f16a34] text-white",
        ].join(" ")}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-[10px] font-bold uppercase tracking-wider",
            isDark ? "text-white/45" : "text-gray-400",
          ].join(" ")}
        >
          Your rider
        </p>
        <p
          className={[
            "truncate text-sm font-extrabold",
            isDark ? "text-white" : "text-gray-900",
          ].join(" ")}
        >
          {rider.name || "Assigned"}
        </p>
        {statusLabel ? (
          <p
            className={[
              "truncate text-xs capitalize mt-0.5",
              isDark ? "text-white/50" : "text-gray-500",
            ].join(" ")}
          >
            {statusLabel}
          </p>
        ) : null}
      </div>
      {rider.phone ? (
        <a
          href={`tel:${rider.phone}`}
          className={[
            "inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-extrabold no-underline",
            isDark
              ? "bg-white text-gray-900"
              : "bg-gray-900 text-white",
          ].join(" ")}
        >
          Call
        </a>
      ) : null}
    </div>
  );
}

/**
 * Boxed order-progress steps with icons.
 * Rider details render inside the "On the way" box when provided.
 */
export default function OrderStatusRail({
  steps,
  activeIndex,
  cancelled = false,
  rider = null,
  tone = "light",
}: OrderStatusRailProps) {
  const isDark = tone === "dark";
  const hasRider =
    !!rider && !!(rider.name || rider.phone || rider.status);

  return (
    <ol className="space-y-2.5">
      {steps.map((step, i) => {
        const done = !cancelled && activeIndex > i;
        const current = !cancelled && activeIndex === i;
        const muted = cancelled || activeIndex < i;
        const showRiderHere =
          step.id === "onway" && hasRider && !cancelled && activeIndex >= i;

        const box = done
          ? isDark
            ? "border-emerald-500/40 bg-emerald-500/10"
            : "border-emerald-200 bg-emerald-50/80"
          : current
            ? isDark
              ? "border-[#f16a34]/50 bg-[#f16a34]/15 shadow-[0_0_0_1px_rgba(241,106,52,0.2)]"
              : "border-[#f16a34] bg-[#fff4ee] shadow-[0_4px_16px_rgba(241,106,52,0.12)]"
              : isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-gray-200 bg-white";

        const iconWrap = done
          ? isDark
            ? "bg-emerald-500 text-white"
            : "bg-svs-green text-white"
          : current
            ? "bg-[#f16a34] text-white"
            : isDark
              ? "bg-white/10 text-white/40"
              : "bg-gray-100 text-gray-400";

        const title = current
          ? "text-[#f16a34]"
          : done
            ? isDark
              ? "text-emerald-300"
              : "text-emerald-800"
            : isDark
              ? "text-white"
              : "text-gray-900";

        const sub = isDark ? "text-white/45" : "text-gray-500";

        return (
          <li key={step.id}>
            <div
              className={[
                "rounded-2xl border px-3.5 py-3 transition-all duration-300",
                box,
                current ? "scale-[1.01]" : "",
                muted && !showRiderHere ? "opacity-45" : "",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <span
                  className={[
                    "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    iconWrap,
                  ].join(" ")}
                  aria-hidden
                >
                  {current ? (
                    <span
                      className="absolute inset-0 animate-ping rounded-xl bg-[#f16a34]/35"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-[1]">
                    {done ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <StepIcon id={step.id} className="h-5 w-5" />
                    )}
                  </span>
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className={["text-sm font-extrabold leading-tight", title].join(" ")}>
                    {step.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${sub}`}>{step.subtitle}</p>
                </div>
              </div>

              {showRiderHere ? (
                <RiderInsideBox rider={rider!} tone={tone} />
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
