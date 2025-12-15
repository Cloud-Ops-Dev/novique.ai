"use client";

import Button from "../Button";
import Logo from "../Logo";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-200 via-gray-100 to-blue-100">
      {/* Abstract AI Background */}
      <div className="absolute inset-0 overflow-hidden opacity-15">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo - Centered above headline */}
          <div className="flex justify-center mb-8">
            <Logo className="h-48 w-auto md:h-72 lg:h-84" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-primary-900 mb-6 leading-tight">
            Unlock AI for Your Small Business{" "}
            <span className="text-primary-600">– Without the Headache</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            At Novique, we make powerful AI simple and accessible. You know it can transform your business – we&apos;ll show you how, starting with a{" "}
            <span className="font-semibold text-primary-600">free consultation</span>.
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

          {/* Small note */}
          <p className="text-sm text-gray-600 italic">
            No tech expertise required. We handle everything at novique.ai.
          </p>
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
