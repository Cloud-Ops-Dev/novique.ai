'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PLAN_DEFINITIONS } from '@/lib/roi/plans';
import { PlanTier } from '@/lib/roi/types';

export default function ComparePlansPage() {
  const router = useRouter();

  const handleSelectPlan = (planId: PlanTier) => {
    router.push(`/roi?plan=${planId}`);
  };

  const planColorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      borderSelected: 'border-green-500',
      dot: 'bg-green-500',
      text: 'text-green-700',
      button: 'bg-green-600 hover:bg-green-700',
      buttonOutline: 'border-green-600 text-green-600 hover:bg-green-50',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      borderSelected: 'border-blue-500',
      dot: 'bg-blue-500',
      text: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      buttonOutline: 'border-blue-600 text-blue-600 hover:bg-blue-50',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      borderSelected: 'border-purple-500',
      dot: 'bg-purple-500',
      text: 'text-purple-700',
      button: 'bg-purple-600 hover:bg-purple-700',
      buttonOutline: 'border-purple-600 text-purple-600 hover:bg-purple-50',
    },
  };

  const formatPrice = (min: number, max: number | null) => {
    if (max === null) {
      return `$${min.toLocaleString()}+`;
    }
    return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/roi"
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to ROI Calculator
          </Link>
          <h1 className="text-4xl font-bold text-primary-900 mb-4">Compare Novique Plans</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that matches your automation needs. All plans include dedicated support and custom implementation.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PLAN_DEFINITIONS.map((plan) => {
            const colors = planColorClasses[plan.color as keyof typeof planColorClasses];

            return (
              <div
                key={plan.id}
                className={`
                  rounded-2xl border-2 p-6 transition-all hover:shadow-md
                  ${colors.bg} ${colors.border}
                `}
              >
                {/* Plan Header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-4 h-4 rounded-full ${colors.dot}`} />
                  <h2 className={`text-xl font-bold ${colors.text}`}>{plan.name}</h2>
                </div>
                <p className="text-sm text-gray-500 italic mb-4">— {plan.tagline}</p>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-6">{plan.description}</p>

                {/* Pricing */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Applies when</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    <span className="font-medium">Monthly value created:</span>{' '}
                    {plan.maxMonthlyValue
                      ? `$${plan.minMonthlyValue.toLocaleString()} – $${plan.maxMonthlyValue.toLocaleString()}`
                      : `$${plan.minMonthlyValue.toLocaleString()}+`}
                  </p>

                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Typical pricing</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly:</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(plan.monthlyFeeRange.min, plan.monthlyFeeRange.max)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">One-time setup:</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(plan.setupFeeRange.min, plan.setupFeeRange.max)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors border-2 ${colors.buttonOutline}`}
                >
                  Select Plan
                </button>
              </div>
            );
          })}
        </div>

        {/* Features Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">What&apos;s Included</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Feature</th>
                  {PLAN_DEFINITIONS.map((plan) => (
                    <th key={plan.id} className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Custom Workflow Development</td>
                  <td className="px-6 py-4 text-center text-sm">1-2 workflows</td>
                  <td className="px-6 py-4 text-center text-sm">3-5 workflows</td>
                  <td className="px-6 py-4 text-center text-sm">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Dedicated Support</td>
                  <td className="px-6 py-4 text-center">
                    <CheckIcon />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckIcon />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckIcon />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Priority Response Time</td>
                  <td className="px-6 py-4 text-center text-sm">48 hours</td>
                  <td className="px-6 py-4 text-center text-sm">24 hours</td>
                  <td className="px-6 py-4 text-center text-sm">Same day</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Monthly Strategy Call</td>
                  <td className="px-6 py-4 text-center">
                    <MinusIcon />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckIcon />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckIcon />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Custom Integrations</td>
                  <td className="px-6 py-4 text-center text-sm">Standard only</td>
                  <td className="px-6 py-4 text-center">
                    <CheckIcon />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckIcon />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Dedicated Success Manager</td>
                  <td className="px-6 py-4 text-center">
                    <MinusIcon />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <MinusIcon />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckIcon />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">ROI Reporting Dashboard</td>
                  <td className="px-6 py-4 text-center">
                    <MinusIcon />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckIcon />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckIcon />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Not sure which plan is right for you? We&apos;ll help you figure it out.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Get a Free Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}
