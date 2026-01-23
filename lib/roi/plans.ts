import { PlanDefinition, PlanTier, ROIPricingSettings, DerivedPricing } from './types';

// Default pricing settings - can be overridden via admin dashboard
export const DEFAULT_PRICING_SETTINGS: ROIPricingSettings = {
  monthlyValueMultiplier: 0.15, // 15% of monthly value
  oneTimeChargeMultiplier: 3,   // 3x monthly fee
};

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Get out of the weeds',
    description: 'Best for small teams automating their first critical workflows. Focused on eliminating repetitive admin and follow-up work.',
    minMonthlyValue: 0,
    maxMonthlyValue: 5000,
    monthlyFeeRange: { min: 225, max: 749 }, // Max 749 to avoid overlap with Growth
    setupFeeRange: { min: 675, max: 2247 },
    color: 'green',
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Run smoother, scale smarter',
    description: 'For growing teams with multiple workflows across sales and operations. Automation becomes part of how the business runs.',
    minMonthlyValue: 5000,
    maxMonthlyValue: 15000,
    monthlyFeeRange: { min: 750, max: 2499 }, // Max 2499 to avoid overlap with Scale
    setupFeeRange: { min: 2250, max: 7497 },
    color: 'blue',
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'Automation as infrastructure',
    description: 'Designed for high-volume operations where automation is a core system, not a side project.',
    minMonthlyValue: 15000,
    maxMonthlyValue: null,
    monthlyFeeRange: { min: 2500, max: 5000 }, // Hard cap at $5,000
    setupFeeRange: { min: 7500, max: 15000 },
    color: 'purple',
  },
];

export function getRecommendedPlan(monthlyValue: number): PlanDefinition {
  if (monthlyValue < 5000) {
    return PLAN_DEFINITIONS[0]; // Starter
  } else if (monthlyValue < 15000) {
    return PLAN_DEFINITIONS[1]; // Growth
  } else {
    return PLAN_DEFINITIONS[2]; // Scale
  }
}

/**
 * Round a number to the nearest $50
 */
function roundToNearest50(value: number): number {
  return Math.round(value / 50) * 50;
}

/**
 * Calculate pricing for a plan based on monthly value and optional settings
 */
export function calculatePlanPricing(
  plan: PlanTier,
  monthlyValue: number,
  settings: ROIPricingSettings = DEFAULT_PRICING_SETTINGS
): { monthlyFee: number; setupFee: number } {
  const planDef = PLAN_DEFINITIONS.find(p => p.id === plan)!;

  // Step 1: Calculate raw monthly fee
  const rawMonthlyFee = monthlyValue * settings.monthlyValueMultiplier;

  // Step 2: Round to nearest $50
  const roundedMonthlyFee = roundToNearest50(rawMonthlyFee);

  // Step 3: Clamp by tier min/max
  let monthlyFee: number;
  if (roundedMonthlyFee < planDef.monthlyFeeRange.min) {
    monthlyFee = planDef.monthlyFeeRange.min;
  } else if (planDef.monthlyFeeRange.max && roundedMonthlyFee > planDef.monthlyFeeRange.max) {
    monthlyFee = planDef.monthlyFeeRange.max;
  } else {
    monthlyFee = roundedMonthlyFee;
  }

  // Step 4: Calculate one-time setup fee
  const setupFee = monthlyFee * settings.oneTimeChargeMultiplier;

  return { monthlyFee, setupFee };
}

export function getPlanById(id: PlanTier): PlanDefinition {
  return PLAN_DEFINITIONS.find(p => p.id === id)!;
}

/**
 * Determine the recommended tier based on total monthly value
 */
export function determineRecommendedTier(totalMonthlyValue: number): PlanTier {
  if (totalMonthlyValue < 5000) {
    return 'starter';
  } else if (totalMonthlyValue < 15000) {
    return 'growth';
  } else {
    return 'scale';
  }
}

/**
 * Get numerical rank for a tier (for comparison)
 */
export function tierRank(tier: PlanTier): number {
  const ranks: Record<PlanTier, number> = {
    starter: 0,
    growth: 1,
    scale: 2,
  };
  return ranks[tier];
}

/**
 * Enforce minimum tier - returns the higher tier between customer selection and recommended
 */
export function enforceMinimumTier(customerSelectedTier: PlanTier | null, recommendedTier: PlanTier): PlanTier {
  if (!customerSelectedTier) {
    return recommendedTier;
  }
  return tierRank(customerSelectedTier) >= tierRank(recommendedTier)
    ? customerSelectedTier
    : recommendedTier;
}

/**
 * Compute derived pricing with tier enforcement
 * Returns full pricing info including whether customer selection was below recommended
 */
export function computeDerivedPricing(
  totalMonthlyValue: number,
  customerSelectedTier: PlanTier | null,
  settings: ROIPricingSettings = DEFAULT_PRICING_SETTINGS
): DerivedPricing {
  const recommendedTier = determineRecommendedTier(totalMonthlyValue);
  const finalTier = enforceMinimumTier(customerSelectedTier, recommendedTier);
  const isBelowRecommended = customerSelectedTier !== null && tierRank(customerSelectedTier) < tierRank(recommendedTier);

  const planDef = getPlanById(finalTier);

  // Step 1: Calculate raw monthly fee
  const rawMonthlyFee = totalMonthlyValue * settings.monthlyValueMultiplier;

  // Step 2: Round to nearest $50
  const roundedMonthlyFee = roundToNearest50(rawMonthlyFee);

  // Step 3: Clamp by tier min/max
  let monthlyFee: number;
  if (roundedMonthlyFee < planDef.monthlyFeeRange.min) {
    monthlyFee = planDef.monthlyFeeRange.min;
  } else if (planDef.monthlyFeeRange.max && roundedMonthlyFee > planDef.monthlyFeeRange.max) {
    monthlyFee = planDef.monthlyFeeRange.max;
  } else {
    monthlyFee = roundedMonthlyFee;
  }

  // Step 4: Calculate one-time setup fee
  const setupFee = monthlyFee * settings.oneTimeChargeMultiplier;

  return {
    monthlyFee,
    setupFee,
    customerSelectedTier,
    recommendedTier,
    finalTier,
    isBelowRecommended,
  };
}
