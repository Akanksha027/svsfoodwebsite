import type { ReactNode } from "react";
import "@/styles/bagoss.css";

type BagossScopeProps = {
  children: ReactNode;
  className?: string;
};

/** Applies Bagoss typeface to home + locations pages. */
export default function BagossScope({ children, className = "" }: BagossScopeProps) {
  return <div className={`font-bagoss ${className}`.trim()}>{children}</div>;
}
