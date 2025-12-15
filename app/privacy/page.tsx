import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Novique.ai",
  description: "Novique.ai privacy policy. Learn how we protect and handle your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <Section background="white" className="pt-32">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h1 className="text-4xl font-bold text-primary-900 mb-8">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">Last updated: December 13, 2025</p>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Introduction</h2>
            <p className="text-gray-700 mb-4">
              At Novique.ai, we take your privacy seriously. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you visit our website
              or use our services.
            </p>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Name, email address, phone number, and business information when you contact us or book a consultation</li>
              <li>Communication preferences and feedback</li>
              <li>Any other information you choose to provide</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Respond to your inquiries and schedule consultations</li>
              <li>Send you updates, marketing communications, and other information (with your consent)</li>
              <li>Analyze usage patterns and improve our website</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your personal data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: <a href="mailto:privacy@novique.ai" className="text-primary-600 hover:underline">privacy@novique.ai</a><br />
              Phone: (555) 123-4567
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
