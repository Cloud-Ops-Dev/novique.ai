import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import { Metadata } from "next";

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">Email</h3>
                    <a href="mailto:hello@novique.ai" className="text-primary-600 hover:underline">
                      hello@novique.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">Phone</h3>
                    <a href="tel:+15551234567" className="text-primary-600 hover:underline">
                      (555) 123-4567
                    </a>
                    <p className="text-sm text-gray-600">Mon-Fri, 9am-6pm EST</p>
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

              {/* Social Links */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-primary-900 mb-4">Connect With Us</h3>
                <div className="flex gap-4">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                  </a>
                </div>
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
