import Link from "next/link";

const ARROW_PATH =
  "M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z";

type AnimatedOrderButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

export default function AnimatedOrderButton({
  href = "/menu",
  label = "Order now",
  className = "",
}: AnimatedOrderButtonProps) {
  return (
    <Link
      href={href}
      className={`hero-animated-btn ${className}`.trim()}
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        className="hero-animated-btn__arr hero-animated-btn__arr--2"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d={ARROW_PATH} />
      </svg>
      <span className="hero-animated-btn__text">{label}</span>
      <span className="hero-animated-btn__circle" aria-hidden />
      <svg
        viewBox="0 0 24 24"
        className="hero-animated-btn__arr hero-animated-btn__arr--1"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d={ARROW_PATH} />
      </svg>
    </Link>
  );
}
