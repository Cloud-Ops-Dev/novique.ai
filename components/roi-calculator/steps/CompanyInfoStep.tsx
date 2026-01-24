'use client';

import { ROIState } from '@/lib/roi/types';
import { ROISegment, SEGMENT_META } from '@/lib/roi/segments';
import { INDUSTRIES, FULLY_LOADED_MULTIPLIERS } from '@/lib/roi/workflows';

interface CompanyInfoStepProps {
  company: ROIState['company'];
  costs: ROIState['costs'];
  onUpdateCompany: (field: keyof ROIState['company'], value: number | string) => void;
  onUpdateCosts: (field: keyof ROIState['costs'], value: number) => void;
  segment?: ROISegment | null;
}

export default function CompanyInfoStep({
  company,
  costs,
  onUpdateCompany,
  onUpdateCosts,
  segment,
}: CompanyInfoStepProps) {
  // Check if industry matches the selected segment's default
  const isIndustrySyncedWithSegment = segment && SEGMENT_META[segment].industry === company.industry;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-900 mb-2">
          Tell us about your team
          <span className="text-lg font-normal text-gray-500 ml-2">(this drives your ROI)</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="industry" className="block text-sm font-semibold text-gray-700 mb-2">
            Industry
            {isIndustrySyncedWithSegment && (
              <span className="ml-2 text-xs font-normal text-primary-600">
                (matched to {SEGMENT_META[segment].label.split(' ')[0]})
              </span>
            )}
          </label>
          <div className="relative">
            <select
              id="industry"
              value={company.industry}
              onChange={(e) => onUpdateCompany('industry', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isIndustrySyncedWithSegment
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-300'
              }`}
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
            {isIndustrySyncedWithSegment && (
              <span className="absolute right-10 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="employees" className="block text-sm font-semibold text-gray-700 mb-2">
            Employees Impacted
          </label>
          <input
            id="employees"
            type="number"
            min={1}
            max={100}
            value={company.employeesImpacted || ''}
            onChange={(e) => {
              const val = e.target.value;
              onUpdateCompany('employeesImpacted', val === '' ? 0 : parseInt(val));
            }}
            onBlur={(e) => {
              const val = parseInt(e.target.value);
              if (!val || val < 1) onUpdateCompany('employeesImpacted', 1);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">Number of team members who will use automation</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="hourlyRate" className="block text-sm font-semibold text-gray-700 mb-2">
            Average Hourly Rate
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              id="hourlyRate"
              type="number"
              min={10}
              max={200}
              value={costs.hourlyRate || ''}
              onChange={(e) => {
                const val = e.target.value;
                onUpdateCosts('hourlyRate', val === '' ? 0 : parseFloat(val));
              }}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (!val || val < 10) onUpdateCosts('hourlyRate', 10);
              }}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Base hourly wage of impacted employees</p>
        </div>

        <div>
          <label htmlFor="multiplier" className="block text-sm font-semibold text-gray-700 mb-2">
            Fully Loaded Cost Multiplier
          </label>
          <select
            id="multiplier"
            value={costs.fullyLoadedMultiplier}
            onChange={(e) => onUpdateCosts('fullyLoadedMultiplier', parseFloat(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {FULLY_LOADED_MULTIPLIERS.map((mult) => (
              <option key={mult.value} value={mult.value}>
                {mult.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">Includes benefits, taxes, and overhead</p>
        </div>
      </div>

      <div className="bg-primary-50 rounded-lg p-4">
        <p className="text-sm text-primary-900">
          <strong>Effective hourly cost:</strong>{' '}
          ${(costs.hourlyRate * costs.fullyLoadedMultiplier).toFixed(2)}/hour
        </p>
      </div>
    </div>
  );
}
