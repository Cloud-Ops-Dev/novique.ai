'use client';

import { useState } from 'react';
import { WorkflowSelection } from '@/lib/roi/types';
import { DEFAULT_WORKFLOWS } from '@/lib/roi/workflows';

interface WorkflowsStepProps {
  workflows: WorkflowSelection[];
  onToggle: (id: string) => void;
  onUpdateWorkflow: (id: string, field: keyof WorkflowSelection, value: number | boolean) => void;
}

export default function WorkflowsStep({
  workflows,
  onToggle,
  onUpdateWorkflow,
}: WorkflowsStepProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getWorkflowDefinition = (id: string) =>
    DEFAULT_WORKFLOWS.find(w => w.id === id);

  const enabledCount = workflows.filter(w => w.enabled).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-900 mb-2">What do you want to automate?</h2>
        <p className="text-gray-600">
          Select the workflows you&apos;d like to automate.{' '}
          <span className="font-medium text-primary-600">{enabledCount} selected</span>
        </p>
      </div>

      <div className="space-y-3">
        {workflows.map((workflow) => {
          const definition = getWorkflowDefinition(workflow.id);
          if (!definition) return null;

          const isExpanded = expandedId === workflow.id;
          const minutesSaved = workflow.minutesBefore - workflow.minutesAfter;
          const weeklySaved = workflow.eventsPerWeek * minutesSaved;

          return (
            <div
              key={workflow.id}
              className={`
                border rounded-lg transition-all
                ${workflow.enabled ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white'}
              `}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workflow.enabled}
                      onChange={() => onToggle(workflow.id)}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${workflow.enabled ? 'text-primary-900' : 'text-gray-700'}`}>
                        {definition.name}
                      </h3>
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${definition.category === 'sales' ? 'bg-blue-100 text-blue-700' :
                          definition.category === 'operations' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'}
                      `}>
                        {definition.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{definition.description}</p>
                    {workflow.enabled && (
                      <p className="text-sm text-primary-700 mt-2">
                        ~{Math.round(weeklySaved)} min/week saved ({workflow.eventsPerWeek} events x {minutesSaved} min)
                      </p>
                    )}
                  </div>
                </div>

                {workflow.enabled && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : workflow.id)}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    {isExpanded ? 'Hide' : 'Adjust'} assumptions
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

              {isExpanded && workflow.enabled && (
                <div className="px-4 pb-4 pt-2 border-t border-primary-200 bg-white rounded-b-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Events/week
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={workflow.eventsPerWeek}
                        onChange={(e) => onUpdateWorkflow(workflow.id, 'eventsPerWeek', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Min before
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={workflow.minutesBefore}
                        onChange={(e) => onUpdateWorkflow(workflow.id, 'minutesBefore', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Min after
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={workflow.minutesAfter}
                        onChange={(e) => onUpdateWorkflow(workflow.id, 'minutesAfter', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
