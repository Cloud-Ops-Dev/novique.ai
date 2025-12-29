"use client";

import Section from "../Section";
import Image from "next/image";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Novique turned our messy scheduling into smooth sailing. Saved us hours every week!",
      author: "Sarah Martinez",
      role: "Local Shop Owner",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    },
    {
      quote: "The free consult opened our eyes to AI possibilities we never imagined.",
      author: "Mike Jacobs",
      role: "Cafe Entrepreneur",
      image: "/images/testimonials/mike-jacobs.jpg",
    },
    {
      quote: "Finally, AI that makes sense for a small business. No jargon, just results!",
      author: "Emily Rodriguez",
      role: "Retail Store Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    },
  ];

  return (
    <Section background="gradient">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
          What Small Businesses Say About Novique
        </h2>
      </div>

      {/* Testimonial Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Quote Icon */}
            <div className="text-5xl text-primary-300 mb-4">&ldquo;</div>

            {/* Quote */}
            <p className="text-gray-700 text-lg mb-6 italic">
              {testimonial.quote}
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 overflow-hidden relative">
                <Image
                  src={testimonial.image}
                  alt={testimonial.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-semibold text-primary-900">
                  {testimonial.author}
                </div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
