"use client";

import Image from "next/image";
import Button from "../Button";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Headline */}
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-6">
            From This Chaos... To This Freedom.
          </h1>

          {/* Hero Image */}
          <div className="mb-6">
            <Image
              src="/images/newhhero1.jpg"
              alt="From chaos to freedom - AI workflow automation for small businesses"
              width={1198}
              height={505}
              className="w-full h-auto rounded-lg shadow-xl mx-auto"
              priority
            />
          </div>

          {/* Tagline */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-6">
            Imagine reclaiming your day...
          </h2>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
            No more endless data entry, scheduling headaches, or customer follow-ups eating your time. At Novique, we build custom AI tools that automate the boring stuff, boost your efficiency, and help you snag more customers—without you needing a PhD in tech. Start with a free chat and watch your workflow transform.{" "}
            <span className="italic">(We handle the setup, you handle the high-fives.)</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button href="/consultation" size="lg">
              Book Your Free Consultation
            </Button>
            <Button href="/#how-it-works" variant="outline" size="lg">
              See How It Works
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary-400 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-primary-400 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
