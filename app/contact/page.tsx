import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import { Metadata } from "next";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Contact Novique.ai | Get in Touch",
  description: "Have questions about AI for your small business? Contact Novique.ai today. We're here to help!",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <Section background="gradient" className="pt-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-6">
              Let&apos;s Talk About Your Business
            </h1>
            <p className="text-xl md:text-2xl text-gray-700">
              Have questions? Want to learn more? We&apos;re here to help.
            </p>
          </div>
        </Section>

        {/* Contact Content */}
        <Section background="white">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-primary-900 mb-6">
                Get In Touch
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                Whether you have questions about our services, want to discuss your
                specific needs, or are ready to book your free consultation, we&apos;d
                love to hear from you.
              </p>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">Phone</h3>
                    <a href="tel:+18334560671" className="text-primary-600 hover:underline">
                      1 (833) 456-0671
                    </a>
                    <p className="text-sm text-gray-500 mt-1">Toll-free, leave a voicemail anytime</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">Email</h3>
                    <a href="mailto:sales@novique.ai" className="text-primary-600 hover:underline">
                      sales@novique.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">Response Time</h3>
                    <p className="text-gray-700">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-primary-900 mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="/roi" className="text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Novique Solution ROI Calculator
                    </a>
                  </li>
                  <li>
                    <a href="/consultation" className="text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book a Consultation
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-primary-900 mb-6">
                Send Us a Message
              </h2>
              <ContactForm />
            </div>
          </div>
        </Section>

        {/* FAQ Section */}
        <Section background="gray">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-primary-900 mb-8 text-center">
              Quick Answers
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-primary-900 mb-2">
                  How long does it take to get started?
                </h3>
                <p className="text-gray-700">
                  After your free consultation, most projects can begin within 1-2 weeks,
                  depending on complexity and your schedule.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-primary-900 mb-2">
                  What does the free consultation include?
                </h3>
                <p className="text-gray-700">
                  A 60-minute meeting (virtual or in-person) where we discuss your business,
                  identify pain points, and propose tailored AI solutions – with zero obligation.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-primary-900 mb-2">
                  Do you work with all industries?
                </h3>
                <p className="text-gray-700">
                  Yes! We&apos;ve worked with retail, restaurants, professional services,
                  healthcare, and many other industries. Every solution is custom-tailored.
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
