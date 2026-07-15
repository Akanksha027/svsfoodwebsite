import Footer from "@/components/Footer";
import PolicyPage from "@/components/PolicyPage";
import { policyBySlug } from "@/data/policies";
import type { Metadata } from "next";

const policy = policyBySlug["terms-and-conditions"];
if (!policy) throw new Error("Missing terms-and-conditions content");

export const metadata: Metadata = {
  title: `${policy.title} | SVS Food`,
  description: `${policy.title} for SVS Food online ordering.`,
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <PolicyPage policy={policy} />
      <Footer />
    </>
  );
}
