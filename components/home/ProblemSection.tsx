import Section from "../Section";
import Image from "next/image";

export default function ProblemSection() {
  return (
    <Section background="white">
      <div className="grid md:grid-cols-2 gap-12 items-center md:items-start">
        {/* Image */}
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
            alt="Small business owner working on multiple tasks"
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">
            Running a small business is tough enough...
          </h2>
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              Customers, inventory, marketing, endless admin – it all piles up.
              You&apos;ve heard AI can automate the grind and boost your bottom line,
              but it feels <span className="font-semibold text-primary-600">complicated</span>,
              <span className="font-semibold text-primary-600"> pricey</span>, and
              <span className="font-semibold text-primary-600"> out of reach</span>.
            </p>

            <p>
              As the owner or manager, your real superpower lies in the unique knowledge
              and skills that make your business thrive in its market – whether that&apos;s
              crafting the perfect latte, nailing custom designs, or knowing your customers
              inside out. But let&apos;s be real: diving into AI on top of that? It&apos;s like
              trying to learn quantum physics while running a marathon. The world of AI is
              evolving at warp speed – new tools, updates, and breakthroughs popping up
              faster than you can say &quot;algorithm.&quot; Keeping up solo, without a big IT team
              or in-house experts, is practically impossible, and it pulls you away from
              what you do best.
            </p>

            <p>
              Meanwhile, the tech giants are busy catering to massive corporations with deep
              pockets, overlooking folks like you – the small and medium-sized businesses that
              could gain the most from a little intelligent automation. Imagine ditching those
              cumbersome, soul-sucking tasks like manual data entry, repetitive scheduling, or
              sifting through customer feedback. AI can handle the boring bits, freeing you to
              focus on growth, innovation, and what lights your fire. But where do you even start?
            </p>

            <p className="font-semibold text-primary-600">
              That&apos;s where we come in – with a free consultation to cut through the hype
              and tailor AI solutions that fit your world, not some Fortune 500 playbook.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
