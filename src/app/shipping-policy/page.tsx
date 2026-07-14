import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PolicyPage from "@/components/PolicyPage";
import { policyBySlug } from "@/data/policies";
import type { Metadata } from "next";

const policy = policyBySlug["shipping-policy"];
if (!policy) throw new Error("Missing shipping-policy content");

export const metadata: Metadata = {
  title: `${policy.title} | SVS Food`,
  description: `${policy.title} for SVS Food online ordering.`,
  alternates: { canonical: "/shipping-policy" },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <Navbar />
      <PolicyPage policy={policy} />
      <Footer />
    </>
  );
}
