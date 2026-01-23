'use client';

import { useState } from 'react';
import { formatCurrency, formatPercent, formatHours, formatMonths } from '@/lib/roi/calculations';

type FormatType = 'currency' | 'percent' | 'hours' | 'months';

interface MetricCardProps {
  label: string;
  value: number;
  format: FormatType;
  variant?: 'default' | 'primary' | 'success' | 'highlight';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

const formatters: Record<FormatType, (value: number) => string> = {
  currency: formatCurrency,
  percent: formatPercent,
  hours: formatHours,
  months: formatMonths,
};

const variantStyles = {
  default: 'bg-white border-gray-200',
  primary: 'bg-primary-50 border-primary-200',
  success: 'bg-green-50 border-green-200',
  highlight: 'bg-gradient-to-br from-primary-500 to-primary-700 border-primary-600 text-white',
};

const valueStyles = {
  default: 'text-gray-900',
  primary: 'text-primary-900',
  success: 'text-green-700',
  highlight: 'text-white',
};

const labelStyles = {
  default: 'text-gray-600',
  primary: 'text-primary-700',
  success: 'text-green-600',
  highlight: 'text-primary-100',
};

const sizeStyles = {
  sm: { value: 'text-xl', label: 'text-xs' },
  md: { value: 'text-2xl', label: 'text-sm' },
  lg: { value: 'text-3xl md:text-4xl', label: 'text-sm' },
};

export default function MetricCard({
  label,
  value,
  format,
  variant = 'default',
  size = 'md',
  tooltip,
}: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const formattedValue = formatters[format](value);

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]}`}>
      <p className={`font-bold ${sizeStyles[size].value} ${valueStyles[variant]}`}>
        {formattedValue}
      </p>
      <div className={`${sizeStyles[size].label} ${labelStyles[variant]} mt-1 flex items-center gap-1`}>
        <span>{label}</span>
        {tooltip && (
          <div className="relative inline-block">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
              aria-label="How this is calculated"
            >
              ⓘ
            </button>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
