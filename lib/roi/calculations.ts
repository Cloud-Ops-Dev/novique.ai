import { ROIState, ROIResults, WorkflowSelection, Scenario } from './types';

const SCENARIO_MULTIPLIERS: Record<Scenario, number> = {
  conservative: 0.6,
  expected: 1.0,
  aggressive: 1.3,
};

const WEEKS_PER_MONTH = 4.33;

export function calculateROI(state: ROIState): ROIResults {
  const multiplier = SCENARIO_MULTIPLIERS[state.scenario];

  // Calculate hours saved per month from enabled workflows
  const baseHoursSaved = calculateHoursSaved(state.workflows);
  const hoursSavedPerMonth = baseHoursSaved * multiplier * state.company.employeesImpacted;

  // Labor cost savings
  const fullyLoadedHourlyRate = state.costs.hourlyRate * state.costs.fullyLoadedMultiplier;
  const laborSavingsPerMonth = hoursSavedPerMonth * fullyLoadedHourlyRate;

  // Error savings (if enabled)
  let errorSavingsPerMonth = 0;
  if (state.quality.enabled) {
    const totalEventsPerMonth = state.workflows
      .filter(w => w.enabled)
      .reduce((sum, w) => sum + w.eventsPerWeek * WEEKS_PER_MONTH, 0);

    const errorsPerMonth = totalEventsPerMonth * state.quality.errorRate;
    const errorsAvoided = errorsPerMonth * state.quality.errorReduction;
    errorSavingsPerMonth = errorsAvoided * state.quality.costPerError * multiplier;
  }

  // Revenue uplift (if enabled)
  let revenueUpliftPerMonth = 0;
  if (state.revenue.enabled) {
    const extraDeals = (
      state.revenue.leadsPerMonth *
      state.revenue.conversionRate *
      state.revenue.conversionLiftRelative
    );
    revenueUpliftPerMonth = (
      extraDeals *
      state.revenue.avgDealValue *
      state.revenue.grossMargin
    ) * multiplier;
  }

  // Total and net benefit
  const totalBenefitPerMonth = laborSavingsPerMonth + errorSavingsPerMonth + revenueUpliftPerMonth;
  const netBenefitPerMonth = totalBenefitPerMonth - state.novique.monthlyFee;

  // ROI and payback
  const roiPercent = state.novique.monthlyFee > 0
    ? ((netBenefitPerMonth / state.novique.monthlyFee) * 100)
    : 0;

  const paybackMonths = netBenefitPerMonth > 0
    ? state.novique.oneTimeSetup / netBenefitPerMonth
    : Infinity;

  return {
    hoursSavedPerMonth: Math.round(hoursSavedPerMonth * 10) / 10,
    laborSavingsPerMonth: Math.round(laborSavingsPerMonth),
    errorSavingsPerMonth: Math.round(errorSavingsPerMonth),
    revenueUpliftPerMonth: Math.round(revenueUpliftPerMonth),
    totalBenefitPerMonth: Math.round(totalBenefitPerMonth),
    netBenefitPerMonth: Math.round(netBenefitPerMonth),
    roiPercent: Math.round(roiPercent),
    paybackMonths: paybackMonths === Infinity ? Infinity : Math.round(paybackMonths * 10) / 10,
  };
}

function calculateHoursSaved(workflows: WorkflowSelection[]): number {
  return workflows
    .filter(w => w.enabled)
    .reduce((total, w) => {
      const eventsPerMonth = w.eventsPerWeek * WEEKS_PER_MONTH;
      const minutesSavedPerEvent = Math.max(0, w.minutesBefore - w.minutesAfter);
      return total + (eventsPerMonth * minutesSavedPerEvent / 60);
    }, 0);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString()}%`;
}

export function formatHours(value: number): string {
  return `${value.toLocaleString()} hrs`;
}

export function formatMonths(value: number): string {
  if (value === Infinity || value > 100) {
    return 'N/A';
  }
  if (value < 1) {
    const weeks = Math.round(value * 4.33);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  return `${value} month${value !== 1 ? 's' : ''}`;
}
