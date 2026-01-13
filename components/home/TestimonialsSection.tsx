"use client";

import Section from "../Section";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  return (
    <Section background="gradient">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
          What Small Businesses Say About Novique
        </h2>
      </div>

      {/* Coming Soon Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="bg-white p-12 rounded-2xl shadow-lg text-center max-w-2xl mx-auto"
      >
        <div className="text-6xl text-primary-300 mb-6">&ldquo;</div>
        <p className="text-gray-600 text-xl mb-4">
          Real testimonials coming soon
        </p>
        <p className="text-gray-500">
          We&apos;re gathering feedback from businesses we&apos;ve helped. Check back soon to hear their stories.
        </p>
      </motion.div>
    </Section>
  );
}
