import Section from "../Section";
import Image from "next/image";
import Button from "../Button";

export default function AboutSection() {
  return (
    <Section background="white">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">
            Welcome to Novique – AI for Small Business Success
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            We&apos;re passionate AI experts dedicated to making cutting-edge tech
            simple and profitable for small businesses.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            No corporate jargon, just practical, turn-key solutions that deliver
            real results. We believe every small business deserves access to the
            same powerful tools that big companies use – without the complexity
            or the enterprise price tag.
          </p>
          <Button href="/about" variant="outline" size="lg">
            Learn More About Us
          </Button>
        </div>

        {/* Image */}
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
            alt="Novique team collaborating"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </Section>
  );
}
