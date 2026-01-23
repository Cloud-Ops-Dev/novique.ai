'use client';

import { ROIPricingSettings } from './types';
import { DEFAULT_PRICING_SETTINGS } from './plans';

const SETTINGS_KEY = 'novique_roi_pricing_settings';

/**
 * Get ROI pricing settings from localStorage
 * Falls back to defaults if not set
 */
export function getROIPricingSettings(): ROIPricingSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_PRICING_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the stored settings
      if (
        typeof parsed.monthlyValueMultiplier === 'number' &&
        typeof parsed.oneTimeChargeMultiplier === 'number'
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading ROI settings:', e);
  }

  return DEFAULT_PRICING_SETTINGS;
}

/**
 * Save ROI pricing settings to localStorage
 */
export function saveROIPricingSettings(settings: ROIPricingSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving ROI settings:', e);
  }
}

/**
 * Reset ROI pricing settings to defaults
 */
export function resetROIPricingSettings(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (e) {
    console.error('Error resetting ROI settings:', e);
  }
}
