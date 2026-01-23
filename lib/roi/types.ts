export type Scenario = 'conservative' | 'expected' | 'aggressive';

export type PlanTier = 'starter' | 'growth' | 'scale';

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  tagline: string;
  description: string;
  minMonthlyValue: number;
  maxMonthlyValue: number | null; // null for unlimited
  monthlyFeeRange: { min: number; max: number | null };
  setupFeeRange: { min: number; max: number | null };
  color: string;
}

export interface WorkflowSelection {
  id: string;
  enabled: boolean;
  eventsPerWeek: number;
  minutesBefore: number;
  minutesAfter: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  defaultEventsPerWeek: number;
  defaultMinutesBefore: number;
  defaultMinutesAfter: number;
  category: 'sales' | 'operations' | 'support';
}

export interface ROIState {
  company: {
    employeesImpacted: number;
    industry: string;
  };
  costs: {
    hourlyRate: number;
    fullyLoadedMultiplier: number;
  };
  workflows: WorkflowSelection[];
  quality: {
    enabled: boolean;
    errorRate: number;
    costPerError: number;
    errorReduction: number;
  };
  revenue: {
    enabled: boolean;
    leadsPerMonth: number;
    conversionRate: number;
    conversionLiftRelative: number;
    avgDealValue: number;
    grossMargin: number;
  };
  novique: {
    monthlyFee: number;
    oneTimeSetup: number;
    selectedPlan: PlanTier | null;
  };
  scenario: Scenario;
}

export interface ROIResults {
  hoursSavedPerMonth: number;
  laborSavingsPerMonth: number;
  errorSavingsPerMonth: number;
  revenueUpliftPerMonth: number;
  totalBenefitPerMonth: number;
  netBenefitPerMonth: number;
  roiPercent: number;
  paybackMonths: number;
}

export interface ROIPricingSettings {
  monthlyValueMultiplier: number; // e.g., 0.15 for 15%
  oneTimeChargeMultiplier: number; // e.g., 3 for 3x monthly
}

// Readiness state for progressive UI activation
export type ResultsState = 'initial' | 'team' | 'workflows';

export interface ReadinessFlags {
  hasTeamInfo: boolean;
  hasWorkflows: boolean;
  canShowRoi: boolean;
  canRecommendPlan: boolean;
  canShowPricing: boolean;
  resultsState: ResultsState;
}

export interface DerivedPricing {
  monthlyFee: number;
  setupFee: number;
  customerSelectedTier: PlanTier | null;
  recommendedTier: PlanTier;
  finalTier: PlanTier;
  isBelowRecommended: boolean;
}
