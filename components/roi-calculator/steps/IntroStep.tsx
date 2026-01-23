'use client';

import Button from '@/components/Button';

interface IntroStepProps {
  onStart: () => void;
}

export default function IntroStep({ onStart }: IntroStepProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Progress indicator */}
      <div className="text-sm text-gray-500 mb-6">
        Step 0 of 3 — Getting Started
      </div>

      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-primary-900 mb-4">
        Get a clear picture of your automation ROI
      </h2>

      {/* Supporting copy */}
      <div className="text-gray-600 mb-8 space-y-4">
        <p>
          This short assessment estimates how much time and money your business could save by automating repetitive work with AI.
        </p>
        <p>
          You&apos;ll answer a few high-level questions about your team and workflows — no exact numbers required.
        </p>
      </div>

      {/* What we'll look at */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
        <h3 className="font-semibold text-primary-900 mb-4">What We&apos;ll Look At</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-xl">⏱</span>
            <span className="text-gray-700">Time currently spent on manual or repetitive tasks</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">💰</span>
            <span className="text-gray-700">Labor cost tied to that work</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">📈</span>
            <span className="text-gray-700">Where automation could realistically improve efficiency or revenue</span>
          </li>
        </ul>
      </div>

      {/* What you'll get */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
        <h3 className="font-semibold text-primary-900 mb-4">What You&apos;ll Get</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-secondary-500">✓</span>
            <span>A personalized ROI estimate based on your inputs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary-500">✓</span>
            <span>A breakdown of time savings, cost reduction, and opportunity impact</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary-500">✓</span>
            <span>Clear assumptions you can review or challenge</span>
          </li>
        </ul>
      </div>

      {/* What this is not */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-left">
        <h3 className="font-semibold text-amber-800 mb-2">What This Is Not</h3>
        <p className="text-amber-700">
          This is not a sales quote and not a commitment. It&apos;s a transparent estimate to help you decide if automation is worth exploring.
        </p>
      </div>

      {/* Primary button */}
      <Button onClick={onStart} size="lg" className="mb-3">
        Start the ROI Assessment
      </Button>

      {/* Secondary reassurance */}
      <p className="text-sm text-gray-500">
        No email required • Takes ~2 minutes
      </p>
    </div>
  );
}
