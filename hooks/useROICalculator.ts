'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ROIState, ROIResults, WorkflowSelection, Scenario, PlanTier, ReadinessFlags, ResultsState, DerivedPricing, ROIPricingSettings } from '@/lib/roi/types';
import { calculateROI } from '@/lib/roi/calculations';
import { DEFAULT_WORKFLOWS } from '@/lib/roi/workflows';
import { computeDerivedPricing, DEFAULT_PRICING_SETTINGS } from '@/lib/roi/plans';
import { getROIPricingSettings } from '@/lib/roi/settings';

export type Step = 0 | 1 | 2 | 3;

interface UseROICalculatorReturn {
  state: ROIState;
  currentStep: Step;
  results: ROIResults;
  readiness: ReadinessFlags;
  derivedPricing: DerivedPricing | null;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: Step) => void;
  updateCompany: (field: keyof ROIState['company'], value: number | string) => void;
  updateCosts: (field: keyof ROIState['costs'], value: number) => void;
  toggleWorkflow: (id: string) => void;
  updateWorkflow: (id: string, field: keyof WorkflowSelection, value: number | boolean) => void;
  updateQuality: (updates: Partial<ROIState['quality']>) => void;
  updateRevenue: (updates: Partial<ROIState['revenue']>) => void;
  updateNovique: (updates: Partial<ROIState['novique']>) => void;
  setScenario: (scenario: Scenario) => void;
  selectPlan: (plan: PlanTier) => void;
  resetCalculator: () => void;
}

// Initial state starts empty to enable progressive disclosure
const DEFAULT_STATE: ROIState = {
  company: {
    employeesImpacted: 0, // Start at 0 for progressive activation
    industry: 'home_services',
  },
  costs: {
    hourlyRate: 0, // Start at 0 for progressive activation
    fullyLoadedMultiplier: 1.3,
  },
  workflows: DEFAULT_WORKFLOWS.map(w => ({
    id: w.id,
    enabled: false, // All workflows start disabled
    eventsPerWeek: w.defaultEventsPerWeek,
    minutesBefore: w.defaultMinutesBefore,
    minutesAfter: w.defaultMinutesAfter,
  })),
  quality: {
    enabled: false,
    errorRate: 0.05,
    costPerError: 25,
    errorReduction: 0.5,
  },
  revenue: {
    enabled: false, // Start disabled for progressive activation
    leadsPerMonth: 120,
    conversionRate: 0.12,
    conversionLiftRelative: 0.1,
    avgDealValue: 800,
    grossMargin: 0.7,
  },
  novique: {
    monthlyFee: 0,
    oneTimeSetup: 0,
    selectedPlan: null,
  },
  scenario: 'expected',
};

export function useROICalculator(): UseROICalculatorReturn {
  const [state, setState] = useState<ROIState>(DEFAULT_STATE);
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [pricingSettings, setPricingSettings] = useState<ROIPricingSettings>(DEFAULT_PRICING_SETTINGS);
  const searchParams = useSearchParams();

  const results = useMemo(() => calculateROI(state), [state]);

  // Compute readiness flags for progressive UI activation
  const readiness = useMemo((): ReadinessFlags => {
    const hasTeamInfo = state.company.employeesImpacted > 0 && state.costs.hourlyRate > 0;
    const hasWorkflows = state.workflows.some(w => w.enabled);
    const canShowRoi = hasTeamInfo && hasWorkflows;
    const canRecommendPlan = canShowRoi;
    const canShowPricing = canRecommendPlan;

    let resultsState: ResultsState;
    if (!hasTeamInfo) {
      resultsState = 'initial';
    } else if (!hasWorkflows) {
      resultsState = 'team';
    } else {
      resultsState = 'workflows';
    }

    return {
      hasTeamInfo,
      hasWorkflows,
      canShowRoi,
      canRecommendPlan,
      canShowPricing,
      resultsState,
    };
  }, [state.company.employeesImpacted, state.costs.hourlyRate, state.workflows]);

  // Compute derived pricing only when ready
  const derivedPricing = useMemo((): DerivedPricing | null => {
    if (!readiness.canShowPricing) {
      return null;
    }
    return computeDerivedPricing(
      results.totalBenefitPerMonth,
      state.novique.selectedPlan,
      pricingSettings
    );
  }, [readiness.canShowPricing, results.totalBenefitPerMonth, state.novique.selectedPlan, pricingSettings]);

  // Load pricing settings from localStorage on mount
  useEffect(() => {
    setPricingSettings(getROIPricingSettings());
  }, []);

  // Handle plan selection from URL params
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && ['starter', 'growth', 'scale'].includes(planParam)) {
      // Just store the selected plan - pricing will be computed via derivedPricing
      setState(prev => ({
        ...prev,
        novique: {
          ...prev.novique,
          selectedPlan: planParam as PlanTier,
        },
      }));
    }
  }, [searchParams]); // Run on searchParams change

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 3) as Step);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0) as Step);
  }, []);

  const goToStep = useCallback((step: Step) => {
    setCurrentStep(step);
  }, []);

  const updateCompany = useCallback((field: keyof ROIState['company'], value: number | string) => {
    setState(prev => ({
      ...prev,
      company: { ...prev.company, [field]: value },
    }));
  }, []);

  const updateCosts = useCallback((field: keyof ROIState['costs'], value: number) => {
    setState(prev => ({
      ...prev,
      costs: { ...prev.costs, [field]: value },
    }));
  }, []);

  const toggleWorkflow = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === id ? { ...w, enabled: !w.enabled } : w
      ),
    }));
  }, []);

  const updateWorkflow = useCallback((
    id: string,
    field: keyof WorkflowSelection,
    value: number | boolean
  ) => {
    setState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === id ? { ...w, [field]: value } : w
      ),
    }));
  }, []);

  const updateQuality = useCallback((updates: Partial<ROIState['quality']>) => {
    setState(prev => ({
      ...prev,
      quality: { ...prev.quality, ...updates },
    }));
  }, []);

  const updateRevenue = useCallback((updates: Partial<ROIState['revenue']>) => {
    setState(prev => ({
      ...prev,
      revenue: { ...prev.revenue, ...updates },
    }));
  }, []);

  const updateNovique = useCallback((updates: Partial<ROIState['novique']>) => {
    setState(prev => ({
      ...prev,
      novique: { ...prev.novique, ...updates },
    }));
  }, []);

  const setScenario = useCallback((scenario: Scenario) => {
    setState(prev => ({ ...prev, scenario }));
  }, []);

  const selectPlan = useCallback((plan: PlanTier) => {
    // Just store the selected plan - pricing is computed via derivedPricing
    setState(prev => ({
      ...prev,
      novique: {
        ...prev.novique,
        selectedPlan: plan,
      },
    }));
  }, []);

  const resetCalculator = useCallback(() => {
    setState(DEFAULT_STATE);
    setCurrentStep(0);
  }, []);

  return {
    state,
    currentStep,
    results,
    readiness,
    derivedPricing,
    nextStep,
    prevStep,
    goToStep,
    updateCompany,
    updateCosts,
    toggleWorkflow,
    updateWorkflow,
    updateQuality,
    updateRevenue,
    updateNovique,
    setScenario,
    selectPlan,
    resetCalculator,
  };
}
