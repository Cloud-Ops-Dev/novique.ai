'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useROICalculator } from '@/hooks/useROICalculator';
import StepIndicator from './steps/StepIndicator';
import IntroStep from './steps/IntroStep';
import CompanyInfoStep from './steps/CompanyInfoStep';
import WorkflowsStep from './steps/WorkflowsStep';
import AdvancedOptionsStep from './steps/AdvancedOptionsStep';
import ROIResultsPanel from './results/ROIResultsPanel';
import SegmentSelector from './SegmentSelector';
import Button from '@/components/Button';
import { ROISegment } from '@/lib/roi/segments';

export default function ROICalculatorForm() {
  const calculator = useROICalculator();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [calculator.currentStep]);

  // Handle segment selection - update URL while preserving other params
  const handleSegmentSelect = useCallback(
    (segment: ROISegment) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('segment', segment);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });

      // Set segment in calculator state
      calculator.setSegment(segment);

      // Apply defaults only if form is pristine
      if (!calculator.isDirty) {
        calculator.applySegmentDefaults(segment);
      }
    },
    [searchParams, pathname, router, calculator]
  );

  // Handle apply defaults button click
  const handleApplyDefaults = useCallback(() => {
    if (calculator.segment) {
      calculator.applySegmentDefaults(calculator.segment, { force: true });
    }
  }, [calculator]);

  // Step 0: Intro/Getting Started - full width, no results panel
  if (calculator.currentStep === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <IntroStep onStart={calculator.nextStep} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Form Steps (3 columns) */}
        <div className="lg:col-span-3">
          <StepIndicator
            currentStep={calculator.currentStep}
            onStepClick={calculator.goToStep}
          />

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {calculator.currentStep === 1 && (
              <>
                <SegmentSelector
                  selectedSegment={calculator.segment}
                  onSelect={handleSegmentSelect}
                  isDirty={calculator.isDirty}
                  onApplyDefaults={handleApplyDefaults}
                />
                <CompanyInfoStep
                  company={calculator.state.company}
                  costs={calculator.state.costs}
                  onUpdateCompany={calculator.updateCompany}
                  onUpdateCosts={calculator.updateCosts}
                  segment={calculator.segment}
                />
              </>
            )}

            {calculator.currentStep === 2 && (
              <WorkflowsStep
                workflows={calculator.state.workflows}
                onToggle={calculator.toggleWorkflow}
                onUpdateWorkflow={calculator.updateWorkflow}
              />
            )}

            {calculator.currentStep === 3 && (
              <AdvancedOptionsStep
                quality={calculator.state.quality}
                revenue={calculator.state.revenue}
                onUpdateQuality={calculator.updateQuality}
                onUpdateRevenue={calculator.updateRevenue}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={calculator.prevStep}>
                Back
              </Button>

              {calculator.currentStep < 3 ? (
                <Button onClick={calculator.nextStep}>
                  Continue
                </Button>
              ) : (
                <Button variant="secondary" onClick={calculator.resetCalculator}>
                  Reset calculator
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Results Panel (2 columns) */}
        <div className="lg:col-span-2">
          <ROIResultsPanel
            results={calculator.results}
            scenario={calculator.state.scenario}
            onSetScenario={calculator.setScenario}
            qualityEnabled={calculator.state.quality.enabled}
            revenueEnabled={calculator.state.revenue.enabled}
            industry={calculator.state.company.industry}
            employeesImpacted={calculator.state.company.employeesImpacted}
            workflows={calculator.state.workflows}
            readiness={calculator.readiness}
            derivedPricing={calculator.derivedPricing}
            segment={calculator.segment}
          />
        </div>
      </div>
    </div>
  );
}
