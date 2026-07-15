import Footer from "@/components/Footer";
import PolicyPage from "@/components/PolicyPage";
import { policyBySlug } from "@/data/policies";
import type { Metadata } from "next";

const policy = policyBySlug["refund-policy"];
if (!policy) throw new Error("Missing refund-policy content");

export const metadata: Metadata = {
  title: `${policy.title} | SVS Food`,
  description: `${policy.title} for SVS Food online ordering.`,
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <>
      <PolicyPage policy={policy} />
      <Footer />
    </>
  );
}
