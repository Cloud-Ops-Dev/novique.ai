import Section from "../Section";
import Image from "next/image";

export default function SolutionSection() {
  const solutions = [
    {
      title: "Free First Consultation",
      description: "We'll meet (virtual or in-person) to dive into your business, uncover friction points, and propose tailored AI solutions – zero cost, zero pressure.",
      icon: "🎯",
    },
    {
      title: "Custom-Tailored AI",
      description: "Chatbots, smart marketing, inventory predictors – whatever fits your needs.",
      icon: "⚙️",
    },
    {
      title: "Turn-Key Done-For-You",
      description: "You choose – we design, implement, deploy, and maintain it all.",
      icon: "🚀",
    },
    {
      title: "Ongoing Peace of Mind",
      description: "We keep your AI running smoothly so you can focus on growing.",
      icon: "🛡️",
    },
  ];

  return (
    <Section background="gradient">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div className="order-2 md:order-1">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-8">
            Novique Makes AI Easy and Risk-Free
          </h2>

          <div className="space-y-6">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="flex gap-4 items-start bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl flex-shrink-0">{solution.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-2">
                    {solution.title}
                  </h3>
                  <p className="text-gray-700">{solution.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative h-64 md:h-[600px] rounded-2xl overflow-hidden shadow-xl order-1 md:order-2">
          <Image
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
            alt="Team collaborating on AI solutions"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </Section>
  );
}
