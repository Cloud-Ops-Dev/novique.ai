'use client';

import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  description,
  enabled,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(enabled);

  const handleToggle = () => {
    const newEnabled = !enabled;
    onToggle(newEnabled);
    if (newEnabled) {
      setIsExpanded(true);
    }
  };

  return (
    <div className={`
      border rounded-lg transition-all
      ${enabled ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white'}
    `}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          <label className="flex items-center cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleToggle}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${enabled ? 'text-primary-900' : 'text-gray-700'}`}>
                {title}
              </h3>
              {enabled && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                  <svg
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </div>

      {enabled && isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-primary-200 bg-white rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
}
