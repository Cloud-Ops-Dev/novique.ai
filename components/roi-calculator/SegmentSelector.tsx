'use client';

import { ROISegment, SEGMENT_META, ALL_SEGMENTS } from '@/lib/roi/segments';

interface SegmentSelectorProps {
  selectedSegment: ROISegment | null;
  onSelect: (segment: ROISegment) => void;
  isDirty: boolean;
  onApplyDefaults: () => void;
}

// Icon components for each segment
function FinancialIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function HealthcareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function LogisticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

function RealEstateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

const SEGMENT_ICONS: Record<ROISegment, React.ComponentType<{ className?: string }>> = {
  financial: FinancialIcon,
  healthcare: HealthcareIcon,
  logistics: LogisticsIcon,
  realestate: RealEstateIcon,
};

export default function SegmentSelector({
  selectedSegment,
  onSelect,
  isDirty,
  onApplyDefaults,
}: SegmentSelectorProps) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary-900 mb-1">
          What best describes your business?
        </h3>
        <p className="text-sm text-gray-600">
          Select an industry to pre-fill with typical values, or skip to enter your own.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ALL_SEGMENTS.map((segmentId) => {
          const meta = SEGMENT_META[segmentId];
          const Icon = SEGMENT_ICONS[segmentId];
          const isSelected = selectedSegment === segmentId;

          return (
            <button
              key={segmentId}
              type="button"
              onClick={() => onSelect(segmentId)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                }
              `}
            >
              {/* Selected checkmark badge */}
              {isSelected ? (
                <span className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500 text-white">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Selected
                </span>
              ) : (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                  Example
                </span>
              )}

              <Icon
                className={`w-6 h-6 mb-2 ${
                  isSelected ? 'text-primary-600' : 'text-gray-400'
                }`}
              />

              <h4
                className={`font-medium text-sm leading-tight mb-1 ${
                  isSelected ? 'text-primary-900' : 'text-gray-800'
                }`}
              >
                {meta.label}
              </h4>

              <p className="text-xs text-gray-500 leading-tight">{meta.subtitle}</p>

              {/* Using example values micro-label when selected and not dirty */}
              {isSelected && !isDirty && (
                <p className="mt-2 text-xs text-primary-600 font-medium">
                  Using example values
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Reassurance text */}
      <p className="mt-3 text-xs text-gray-500 text-center">
        You can edit all values — these are just starting points.
      </p>

      {/* Apply defaults button - show when segment selected and form is dirty */}
      {selectedSegment && isDirty && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-amber-800">
            You&apos;ve made changes. Want to use the {SEGMENT_META[selectedSegment].label.toLowerCase()} example values?
          </p>
          <button
            type="button"
            onClick={onApplyDefaults}
            className="ml-4 px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap"
          >
            Apply example values
          </button>
        </div>
      )}
    </div>
  );
}
