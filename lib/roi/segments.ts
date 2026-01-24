import { ROIState, WorkflowSelection } from './types';
import { DEFAULT_WORKFLOWS } from './workflows';

// Segment type definition
export type ROISegment = 'financial' | 'healthcare' | 'logistics' | 'realestate';

// Segment metadata for display
export interface SegmentMeta {
  id: ROISegment;
  label: string;
  subtitle: string;
  industry: string;
  narrative: string;
  reframing: string;
}

// Segment defaults - logical keys that map to calculator state
export interface SegmentDefaults {
  employeesImpacted: number;
  hourlyRate: number;
  industry: string;
  enabledWorkflows: string[];
  workflowOverrides?: Record<string, Partial<WorkflowSelection>>;
}

// Segment metadata with display info and copy
export const SEGMENT_META: Record<ROISegment, SegmentMeta> = {
  financial: {
    id: 'financial',
    label: 'Financial & Professional Services',
    subtitle: 'Law, accounting, consulting, agencies',
    industry: 'professional_services',
    narrative:
      'Professional services teams lose margin to non-billable admin work—scheduling, reminders, document handoffs, and follow-ups. Automation typically reclaims meaningful time each month without changing how you serve clients.',
    reframing:
      'This is like adding billable capacity—without hiring another employee.',
  },
  healthcare: {
    id: 'healthcare',
    label: 'Healthcare & Health Services',
    subtitle: 'Clinics, dental, therapy, wellness',
    industry: 'healthcare',
    narrative:
      'Healthcare businesses lose revenue through missed appointments, delayed intake, and manual coordination between staff and patients. Automation reduces no-shows and frees staff to focus on care instead of coordination.',
    reframing:
      'This usually means fewer no-shows and smoother patient flow—without adding front-desk staff.',
  },
  logistics: {
    id: 'logistics',
    label: 'Logistics & Transportation',
    subtitle: 'Freight, delivery, dispatch, fleet',
    industry: 'manufacturing',
    narrative:
      'Logistics operations run on tight timelines where manual updates and dispatch coordination create delays and errors. Automation saves time daily while improving response speed and consistency.',
    reframing:
      'Often the difference between keeping up with demand and needing another coordinator.',
  },
  realestate: {
    id: 'realestate',
    label: 'Real Estate & Construction',
    subtitle: 'Brokerages, property management, contractors',
    industry: 'real_estate',
    narrative:
      'Real estate and construction teams lose momentum when follow-ups, scheduling, and project updates fall through the cracks. Automation improves response time, keeps stakeholders aligned, and reduces delays caused by manual coordination.',
    reframing:
      'Typically translates to faster deal movement and fewer stalled projects.',
  },
};

// Segment defaults that map to calculator state
export const SEGMENT_DEFAULTS: Record<ROISegment, SegmentDefaults> = {
  financial: {
    employeesImpacted: 3,
    hourlyRate: 50,
    industry: 'professional_services',
    enabledWorkflows: [
      'lead_followup',
      'appointment_scheduling',
      'invoice_generation',
      'customer_intake',
    ],
    workflowOverrides: {
      lead_followup: { eventsPerWeek: 40 }, // 40 clients/month ≈ 10/week, but form/followup events higher
      appointment_scheduling: { eventsPerWeek: 25 },
      invoice_generation: { eventsPerWeek: 40 }, // ~10/week billable touchpoints
      customer_intake: { eventsPerWeek: 10 },
    },
  },
  healthcare: {
    employeesImpacted: 4,
    hourlyRate: 30,
    industry: 'healthcare',
    enabledWorkflows: [
      'appointment_scheduling',
      'customer_intake',
      'status_updates',
    ],
    workflowOverrides: {
      appointment_scheduling: { eventsPerWeek: 60, minutesBefore: 12 }, // 60 appointments/week
      customer_intake: { eventsPerWeek: 60, minutesBefore: 12 }, // intake per appointment
      status_updates: { eventsPerWeek: 30 },
    },
  },
  logistics: {
    employeesImpacted: 3,
    hourlyRate: 40,
    industry: 'manufacturing',
    enabledWorkflows: ['status_updates', 'task_routing', 'support_triage'],
    workflowOverrides: {
      status_updates: { eventsPerWeek: 50, minutesBefore: 15 }, // 50 shipments/week
      task_routing: { eventsPerWeek: 50, minutesBefore: 15 }, // coordination per shipment
      support_triage: { eventsPerWeek: 30 },
    },
  },
  realestate: {
    employeesImpacted: 3,
    hourlyRate: 40,
    industry: 'real_estate',
    enabledWorkflows: [
      'lead_followup',
      'appointment_scheduling',
      'status_updates',
      'customer_intake',
    ],
    workflowOverrides: {
      lead_followup: { eventsPerWeek: 30 }, // 30 weekly inquiries
      appointment_scheduling: { eventsPerWeek: 15, minutesBefore: 15 },
      status_updates: { eventsPerWeek: 12 }, // 12 active projects
      customer_intake: { eventsPerWeek: 15 },
    },
  },
};

// List of all segments for iteration
export const ALL_SEGMENTS: ROISegment[] = [
  'financial',
  'healthcare',
  'logistics',
  'realestate',
];

// Parse and validate segment from URL param
export function parseSegment(value: string | null): ROISegment | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (ALL_SEGMENTS.includes(normalized as ROISegment)) {
    return normalized as ROISegment;
  }
  return null;
}

// Map segment defaults to ROI calculator state
export function mapSegmentToState(
  segment: ROISegment,
  currentState: ROIState
): Partial<ROIState> {
  const defaults = SEGMENT_DEFAULTS[segment];
  const meta = SEGMENT_META[segment];

  // Build workflows array with defaults applied
  const workflows: WorkflowSelection[] = DEFAULT_WORKFLOWS.map((wDef) => {
    const existing = currentState.workflows.find((w) => w.id === wDef.id);
    const isEnabled = defaults.enabledWorkflows.includes(wDef.id);
    const overrides = defaults.workflowOverrides?.[wDef.id] || {};

    return {
      id: wDef.id,
      enabled: isEnabled,
      eventsPerWeek: overrides.eventsPerWeek ?? wDef.defaultEventsPerWeek,
      minutesBefore: overrides.minutesBefore ?? wDef.defaultMinutesBefore,
      minutesAfter: overrides.minutesAfter ?? wDef.defaultMinutesAfter,
    };
  });

  return {
    company: {
      employeesImpacted: defaults.employeesImpacted,
      industry: meta.industry,
    },
    costs: {
      ...currentState.costs,
      hourlyRate: defaults.hourlyRate,
    },
    workflows,
  };
}
