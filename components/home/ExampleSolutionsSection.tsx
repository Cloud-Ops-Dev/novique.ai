import Section from "../Section";

export default function ExampleSolutionsSection() {
  const solutions = [
    {
      title: "Customer Service",
      description: "24/7 AI chatbots that wow customers and free up your time.",
      icon: "💬",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Marketing Magic",
      description: "Personalized campaigns that convert more sales.",
      icon: "✨",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Operations Boost",
      description: "Automate inventory, scheduling, and data entry.",
      icon: "⚡",
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Growth Insights",
      description: "Tools that crunch your data for smart decisions.",
      icon: "📊",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <Section background="gray">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
          Real-World AI Wins for Businesses Like Yours
        </h2>
        <p className="text-xl text-gray-600">
          Customized just for you by the Novique team.
        </p>
      </div>

      {/* Solution Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {solutions.map((solution, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden group"
          >
            {/* Gradient Header */}
            <div className={`bg-gradient-to-r ${solution.gradient} p-8 text-center`}>
              <div className="text-6xl mb-2 transform group-hover:scale-110 transition-transform">
                {solution.icon}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-primary-900 mb-3">
                {solution.title}
              </h3>
              <p className="text-gray-700">{solution.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
