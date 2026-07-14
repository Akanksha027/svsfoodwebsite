import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PolicyPage from "@/components/PolicyPage";
import { policyBySlug } from "@/data/policies";
import type { Metadata } from "next";

const policy = policyBySlug["privacy-policy"];
if (!policy) throw new Error("Missing privacy-policy content");

export const metadata: Metadata = {
  title: `${policy.title} | SVS Food`,
  description: `${policy.title} for SVS Food online ordering.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <PolicyPage policy={policy} />
      <Footer />
    </>
  );
}
