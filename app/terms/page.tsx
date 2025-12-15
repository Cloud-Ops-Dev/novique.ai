import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Novique.ai",
  description: "Novique.ai terms of service. Read our terms and conditions.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main>
        <Section background="white" className="pt-32">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h1 className="text-4xl font-bold text-primary-900 mb-8">Terms of Service</h1>
            <p className="text-gray-600 mb-8">Last updated: December 13, 2025</p>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using novique.ai, you agree to be bound by these Terms of Service.
              If you disagree with any part of these terms, you may not access our services.
            </p>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Services</h2>
            <p className="text-gray-700 mb-4">
              Novique.ai provides AI consulting and implementation services for small businesses.
              Our services include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Free initial consultations</li>
              <li>Custom AI solution design and implementation</li>
              <li>Ongoing support and maintenance</li>
              <li>Training and documentation</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">User Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of any account credentials</li>
              <li>Use our services only for lawful purposes</li>
              <li>Not interfere with or disrupt our services</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All content, features, and functionality on novique.ai are owned by Novique.ai
              and are protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              Novique.ai shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages resulting from your use or inability to use our services.
            </p>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of
              any material changes via email or website notice.
            </p>

            <h2 className="text-2xl font-bold text-primary-900 mt-8 mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: <a href="mailto:legal@novique.ai" className="text-primary-600 hover:underline">legal@novique.ai</a><br />
              Phone: (555) 123-4567
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
