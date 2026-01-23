import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import ROICalculatorForm from "@/components/roi-calculator/ROICalculatorForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Automation ROI Calculator | Novique.ai",
  description: "Calculate your potential savings from AI automation. See real ROI projections for your small business in under 2 minutes.",
};

export default function ROICalculatorPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <Section background="gradient" className="pt-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-6">
              Calculate your ROI from a Novique solution
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4">
              See how much time and money AI automation could save your business.
            </p>
            <p className="text-lg text-gray-600 mb-4">
              Answer a few questions and get a personalized ROI estimate in under 2 minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span>No email required</span>
              <span className="hidden sm:inline">•</span>
              <span>No obligation</span>
              <span className="hidden sm:inline">•</span>
              <span>Estimate only</span>
            </div>
          </div>
        </Section>

        {/* Calculator Section */}
        <Section background="white">
          <Suspense fallback={<div className="max-w-6xl mx-auto animate-pulse"><div className="h-96 bg-gray-200 rounded-2xl" /></div>}>
            <ROICalculatorForm />
          </Suspense>
        </Section>

        {/* Trust Section */}
        <Section background="gray">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-900 text-center mb-8">
              How We Calculate Your ROI
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-primary-900 mb-2">Time Savings</h3>
                <p className="text-gray-600 text-sm">
                  We calculate hours saved per workflow based on industry benchmarks and your specific inputs.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-primary-900 mb-2">Fully Loaded Costs</h3>
                <p className="text-gray-600 text-sm">
                  We factor in the true cost of labor including benefits, taxes, and overhead.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-primary-900 mb-2">Conservative Defaults</h3>
                <p className="text-gray-600 text-sm">
                  Our projections use conservative estimates. Real results often exceed these numbers.
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
