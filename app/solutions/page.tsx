import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import Button from "@/components/Button";
import { Metadata } from "next";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "AI Solutions for Small Business | Novique.ai",
  description: "Explore our turn-key AI solutions: chatbots, predictive analytics, automated workflows, and more. Custom-tailored for your small business.",
};

export default function SolutionsPage() {
  const solutions = [
    {
      title: "AI Customer Service Chatbots",
      problem: "Customers need help 24/7, but you can't staff around the clock.",
      solution: "Our intelligent chatbots handle FAQs, bookings, and support inquiries automatically – freeing up your team for complex issues.",
      features: [
        "24/7 availability for customer inquiries",
        "Natural language understanding",
        "Integration with your existing systems",
        "Escalation to human agents when needed",
      ],
      icon: "💬",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Predictive Analytics for Sales",
      problem: "You're guessing what inventory to stock and which customers to target.",
      solution: "AI-powered analytics predict trends, optimize inventory, and identify your most valuable customers before your competitors do.",
      features: [
        "Sales forecasting based on historical data",
        "Customer behavior prediction",
        "Inventory optimization",
        "Revenue opportunity identification",
      ],
      icon: "📊",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Automated Workflow Operations",
      problem: "Admin tasks eat up hours that should go to growing your business.",
      solution: "We automate repetitive tasks like data entry, scheduling, invoicing, and reporting so you can focus on what matters.",
      features: [
        "Automated data entry and processing",
        "Smart scheduling and calendar management",
        "Invoice generation and tracking",
        "Custom workflow automation",
      ],
      icon: "⚡",
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Personalized Marketing Campaigns",
      problem: "Generic marketing wastes money and doesn't convert.",
      solution: "AI creates personalized campaigns tailored to each customer segment, boosting engagement and sales.",
      features: [
        "Customer segmentation and targeting",
        "Personalized email campaigns",
        "Content recommendation engines",
        "A/B testing and optimization",
      ],
      icon: "✨",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Smart Document Processing",
      problem: "Manually processing invoices, receipts, and forms is slow and error-prone.",
      solution: "AI extracts, categorizes, and processes documents automatically with near-perfect accuracy.",
      features: [
        "Automated data extraction from documents",
        "Invoice and receipt processing",
        "Form digitization and filing",
        "OCR and handwriting recognition",
      ],
      icon: "📄",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <Section background="gradient" className="pt-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-6">
              Turn-Key AI Solutions for Your Business
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              We design, implement, deploy, and maintain everything. You just enjoy the results.
            </p>
            <Button href="/consultation" size="lg">
              Get Your Free Consultation
            </Button>
          </div>
        </Section>

        {/* Solutions Grid */}
        <Section background="white">
          <div className="space-y-16">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`text-5xl bg-gradient-to-r ${solution.gradient} p-4 rounded-2xl text-white`}>
                      {solution.icon}
                    </div>
                    <h2 className="text-3xl font-bold text-primary-900">
                      {solution.title}
                    </h2>
                  </div>

                  {/* Problem */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">
                      The Problem:
                    </h3>
                    <p className="text-gray-700">{solution.problem}</p>
                  </div>

                  {/* Solution */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-green-600 mb-2">
                      Our Solution:
                    </h3>
                    <p className="text-gray-700">{solution.solution}</p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-primary-900 mb-3">
                      Key Features:
                    </h3>
                    <ul className="space-y-2">
                      {solution.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary-600 mt-1">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button href="/consultation" variant="outline">
                    Get Started →
                  </Button>
                </div>

                {/* Visual Element */}
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  <div className={`bg-gradient-to-br ${solution.gradient} rounded-2xl p-12 shadow-2xl`}>
                    <div className="text-9xl text-white text-center opacity-80">
                      {solution.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA Section */}
        <Section background="gradient">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">
              Don&apos;t See Exactly What You Need?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Every business is unique. That&apos;s why we create custom AI solutions
              tailored specifically to your challenges and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/consultation" size="lg">
                Schedule Free Consultation
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                Contact Us
              </Button>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
