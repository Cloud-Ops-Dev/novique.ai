import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import ConsultationForm from "@/components/ConsultationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Free Consultation | Novique.ai",
  description: "Schedule your free AI consultation with Novique.ai. We'll discuss your business challenges and propose tailored solutions. No cost, no pressure.",
};

export default function ConsultationPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <Section background="gradient" className="pt-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-6">
              Book Your Free Consultation
            </h1>
            <p className="text-xl md:text-2xl text-gray-700">
              Zero cost. Zero pressure. Just honest conversation about how AI can help your business thrive.
            </p>
          </div>
        </Section>

        {/* What to Expect Section */}
        <Section background="white">
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-primary-900 mb-8 text-center">
              What to Expect in Your Consultation
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👂</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  We Listen
                </h3>
                <p className="text-gray-700">
                  Tell us about your business, your goals, and your current challenges.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  We Analyze
                </h3>
                <p className="text-gray-700">
                  Identify friction points where AI can make the biggest impact.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  We Propose
                </h3>
                <p className="text-gray-700">
                  Present tailored AI solutions designed specifically for your needs.
                </p>
              </div>
            </div>
          </div>

          {/* Process Details */}
          <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-primary-900 mb-6">
              The Process
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">
                    Book Your Slot
                  </h4>
                  <p className="text-gray-700">
                    Fill out the form below with your preferred date and time.
                    We&apos;ll meet virtually or in-person based on your preference.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">
                    60-Minute Discovery Session
                  </h4>
                  <p className="text-gray-700">
                    We&apos;ll dive deep into your business operations, understand your
                    challenges, and explore opportunities where AI can help.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">
                    Custom Proposal
                  </h4>
                  <p className="text-gray-700">
                    Within 48 hours, receive a detailed proposal outlining recommended
                    AI solutions, timeline, and pricing. No obligation to proceed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">
                    You Decide
                  </h4>
                  <p className="text-gray-700">
                    Take your time to review. If you&apos;re ready to move forward,
                    we&apos;ll begin implementation. If not, no hard feelings!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Booking Form Section */}
        <Section background="gray">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">
                Schedule Your Free Consultation
              </h2>
              <p className="text-lg text-gray-700">
                Fill out the form below and we&apos;ll be in touch within 24 hours to
                confirm your appointment.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <ConsultationForm />
            </div>
          </div>
        </Section>

        {/* FAQ Section */}
        <Section background="white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-primary-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-primary-50 p-6 rounded-xl">
                <h3 className="font-semibold text-primary-900 mb-2">
                  Is the consultation really free?
                </h3>
                <p className="text-gray-700">
                  Yes! Absolutely no cost and no obligation. We believe in demonstrating
                  value before asking for commitment.
                </p>
              </div>

              <div className="bg-primary-50 p-6 rounded-xl">
                <h3 className="font-semibold text-primary-900 mb-2">
                  How long is the consultation?
                </h3>
                <p className="text-gray-700">
                  Typically 60 minutes. We want enough time to really understand your
                  business and provide meaningful recommendations.
                </p>
              </div>

              <div className="bg-primary-50 p-6 rounded-xl">
                <h3 className="font-semibold text-primary-900 mb-2">
                  Do I need to prepare anything?
                </h3>
                <p className="text-gray-700">
                  Just come ready to talk about your business! It helps to think about
                  your biggest pain points and what you wish could be automated or improved.
                </p>
              </div>

              <div className="bg-primary-50 p-6 rounded-xl">
                <h3 className="font-semibold text-primary-900 mb-2">
                  What if I&apos;m not ready to commit after the consultation?
                </h3>
                <p className="text-gray-700">
                  That&apos;s totally fine! There&apos;s zero pressure. Many clients
                  take weeks or months to decide. We&apos;re here when you&apos;re ready.
                </p>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
