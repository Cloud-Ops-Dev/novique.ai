'use client';

import { formatCurrency } from '@/lib/roi/calculations';

interface SavingsBreakdownBarsProps {
  laborSavings: number;
  errorSavings: number;
  revenueUplift: number;
  qualityEnabled: boolean;
  revenueEnabled: boolean;
}

export default function SavingsBreakdownBars({
  laborSavings,
  errorSavings,
  revenueUplift,
  qualityEnabled,
  revenueEnabled,
}: SavingsBreakdownBarsProps) {
  const total = laborSavings + errorSavings + revenueUplift;
  if (total <= 0) return null;

  const bars = [
    {
      label: 'Labor Savings',
      value: laborSavings,
      color: 'bg-primary-500',
      show: true,
    },
    {
      label: 'Error Savings',
      value: errorSavings,
      color: 'bg-secondary-500',
      show: qualityEnabled && errorSavings > 0,
    },
    {
      label: 'Revenue Uplift',
      value: revenueUplift,
      color: 'bg-amber-500',
      show: revenueEnabled && revenueUplift > 0,
    },
  ].filter(bar => bar.show);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Monthly Benefit Breakdown</h4>
      {bars.map((bar) => {
        const percentage = (bar.value / total) * 100;
        return (
          <div key={bar.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{bar.label}</span>
              <span className="font-medium text-gray-900">{formatCurrency(bar.value)}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${bar.color} rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
