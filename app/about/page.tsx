import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import Button from "@/components/Button";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Novique.ai | AI Experts for Small Business",
  description: "Learn about Novique.ai's mission to make AI accessible and profitable for small businesses. No jargon, just practical solutions.",
};

export default function AboutPage() {
  const values = [
    {
      title: "Simplicity First",
      description: "We translate complex AI into simple, actionable solutions. You don't need a tech degree to work with us.",
      icon: "🎯",
    },
    {
      title: "Results-Driven",
      description: "We measure success by your ROI, not by buzzwords. Every solution is designed to deliver tangible business value.",
      icon: "📈",
    },
    {
      title: "Turn-Key Service",
      description: "From consultation to deployment to maintenance, we handle everything. You focus on running your business.",
      icon: "🔑",
    },
    {
      title: "Small Business Focus",
      description: "We specialize in small businesses because we believe you deserve the same advantages as enterprise companies.",
      icon: "💼",
    },
  ];

  const team = [
    {
      name: "Mark Howell",
      role: "Founder & CTO",
      bio: "Former IBM tech leader bringing enterprise AI solutions to small businesses.",
      image: "/images/Team/CTO.png",
    },
    {
      name: "Michael Chen",
      role: "Lead AI Engineer",
      bio: "15+ years building machine learning systems that actually work in the real world.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    },
    {
      name: "Elena Rodriguez",
      role: "Customer Success Lead",
      bio: "Dedicated to ensuring every client sees measurable results and ROI.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
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
              AI for Small Business Success
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              We&apos;re passionate AI experts dedicated to making cutting-edge tech
              simple and profitable for small businesses.
            </p>
          </div>
        </Section>

        {/* Founder Note Section */}
        <Section background="white" className="pt-8">
          <div className="max-w-4xl mx-auto">
            {/* CTO Image */}
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-xl">
                <Image
                  src="/images/Team/CTO.png"
                  alt="Mark Howell - Founder and CTO"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-8 text-center">
              A note from our founder Mark Howell
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Welcome to Novique.AI, where cutting-edge AI meets the everyday hustle of small and medium-sized businesses! I&apos;m Mark Howell, your Chief Technology Officer and the guy who&apos;s basically traded in my corporate suit for a superhero cape (okay, it&apos;s more like a comfy hoodie, but you get the idea).
              </p>
              <p>
                After spending the last 10 years at IBM, diving deep into complex tech challenges for Fortune 500 giants, I hit what I like to call my &quot;inflection point&quot;—you know, that moment when you realize your work is solving big problems for big companies, but maybe not making the dent in the world you dreamed of. Picture this: me, pacing my office, pondering life&apos;s mysteries over a lukewarm coffee. That&apos;s when I started chatting with some trusted friends and industry leaders who nodded vigorously and said, &quot;Mark, why not flip the script?&quot;
              </p>
              <p>
                And flip it I did! I envisioned a world where powerhouse AI solutions aren&apos;t just for the NASDAQ elite with seven-figure IT budgets. Nope—modern AI can be engineered to be both ridiculously cost-effective and downright game-changing for the rest of us: the mom-and-pop shops, the local innovators, and the ambitious startups ready to level up. That&apos;s the spark that ignited Novique.AI. We&apos;re here to democratize AI, turning &quot;what if&quot; ideas into &quot;wow, that works!&quot; realities for businesses like yours.
              </p>
              <p>
                Whether you&apos;re looking to streamline operations, supercharge customer insights, or just outsmart your competition without breaking the bank, we&apos;ve got your back. Let&apos;s chat about how we can tailor AI magic to your unique needs—because every business deserves a shot at the big leagues!
              </p>
            </div>
          </div>
        </Section>

        {/* Mission Section */}
        <Section background="gray">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Big companies have been using AI to gain unfair advantages for years.
                Meanwhile, small businesses – the backbone of our economy – have been
                locked out by complexity, cost, and corporate jargon.
              </p>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                We started Novique to level the playing field. Every small business
                owner deserves access to the same powerful tools that Fortune 500
                companies use, without needing a tech team or enterprise budget.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                <span className="font-semibold text-primary-600">No corporate jargon.</span>{" "}
                <span className="font-semibold text-primary-600">No hidden costs.</span>{" "}
                Just practical, turn-key AI solutions that deliver real results.
              </p>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                alt="Team collaboration"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </Section>

        {/* Values Section */}
        <Section background="gray">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do at Novique.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-primary-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-700">{value.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Team Section */}
        <Section background="white">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI experts who speak human, not tech-speak.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-primary-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <h3 className="text-xl font-bold text-primary-900 text-center mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 text-center font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-700 text-center">{member.bio}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* How We're Different */}
        <Section background="gradient">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-8 text-center">
              How We&apos;re Different
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-red-600 mb-2">❌ Traditional AI Consultants</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Confusing technical jargon</li>
                  <li>• Enterprise-only pricing</li>
                  <li>• Long implementation timelines</li>
                  <li>• Leave you to maintain it yourself</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-2 border-primary-500">
                <h3 className="text-lg font-bold text-green-600 mb-2">✓ Novique Approach</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Plain English explanations</li>
                  <li>• Small business-friendly pricing</li>
                  <li>• Fast, turn-key deployment</li>
                  <li>• Ongoing support and maintenance</li>
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* CTA Section */}
        <Section background="white">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Let&apos;s talk about how AI can solve your specific challenges.
              First consultation is always free, no strings attached.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/consultation" size="lg">
                Book Your Free Consultation
              </Button>
              <Button href="/solutions" variant="outline" size="lg">
                Explore Solutions
              </Button>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
