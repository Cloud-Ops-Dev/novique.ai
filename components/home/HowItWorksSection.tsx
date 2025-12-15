import Section from "../Section";
import Button from "../Button";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Book Free Consultation",
      description: "Chat about your business and challenges.",
      icon: "📅",
    },
    {
      number: "02",
      title: "Discover Opportunities",
      description: "We spot friction and suggest real fixes.",
      icon: "🔍",
    },
    {
      number: "03",
      title: "Choose & Launch",
      description: "Pick your solutions – we build and go live seamlessly.",
      icon: "🎯",
    },
    {
      number: "04",
      title: "Thrive with Support",
      description: "Enjoy results while we handle maintenance.",
      icon: "📈",
    },
  ];

  return (
    <Section id="how-it-works" background="white">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
          Your Simple Path to AI-Powered Growth with Novique
        </h2>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            {/* Step Number */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
              {step.number}
            </div>

            {/* Icon */}
            <div className="text-5xl mb-4 mt-4">{step.icon}</div>

            {/* Content */}
            <h3 className="text-xl font-bold text-primary-900 mb-3">
              {step.title}
            </h3>
            <p className="text-gray-700">{step.description}</p>

            {/* Arrow connector (hidden on last item) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-primary-400 text-3xl">
                →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button href="/consultation" size="lg">
          Start Free Today
        </Button>
      </div>
    </Section>
  );
}
