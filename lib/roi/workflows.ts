import { WorkflowDefinition } from './types';

export const DEFAULT_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'lead_followup',
    name: 'Lead Capture + Follow-up',
    description: 'Automated lead capture from web forms with instant email/SMS follow-up',
    defaultEventsPerWeek: 25,
    defaultMinutesBefore: 12,
    defaultMinutesAfter: 3,
    category: 'sales',
  },
  {
    id: 'appointment_scheduling',
    name: 'Appointment Scheduling + Reminders',
    description: 'AI-powered scheduling with automated confirmation and reminder messages',
    defaultEventsPerWeek: 20,
    defaultMinutesBefore: 15,
    defaultMinutesAfter: 2,
    category: 'sales',
  },
  {
    id: 'invoice_generation',
    name: 'Invoice/Quote Generation',
    description: 'Auto-generate invoices and quotes from job data',
    defaultEventsPerWeek: 15,
    defaultMinutesBefore: 20,
    defaultMinutesAfter: 5,
    category: 'operations',
  },
  {
    id: 'customer_intake',
    name: 'Customer Intake Forms',
    description: 'Digital intake forms with auto-populated CRM records',
    defaultEventsPerWeek: 12,
    defaultMinutesBefore: 10,
    defaultMinutesAfter: 2,
    category: 'operations',
  },
  {
    id: 'status_updates',
    name: 'Status Updates + Reporting',
    description: 'Automated status notifications and report generation',
    defaultEventsPerWeek: 30,
    defaultMinutesBefore: 8,
    defaultMinutesAfter: 1,
    category: 'operations',
  },
  {
    id: 'task_routing',
    name: 'Internal Task Routing',
    description: 'Smart assignment of tasks to team members based on availability',
    defaultEventsPerWeek: 18,
    defaultMinutesBefore: 10,
    defaultMinutesAfter: 2,
    category: 'operations',
  },
  {
    id: 'support_triage',
    name: 'Support Triage',
    description: 'AI classification and routing of support requests',
    defaultEventsPerWeek: 20,
    defaultMinutesBefore: 15,
    defaultMinutesAfter: 3,
    category: 'support',
  },
];

export const INDUSTRIES = [
  { value: 'home_services', label: 'Home Services' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'construction', label: 'Construction' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' },
];

export const FULLY_LOADED_MULTIPLIERS = [
  { value: 1.2, label: '1.2x (Basic benefits)' },
  { value: 1.3, label: '1.3x (Standard)' },
  { value: 1.4, label: '1.4x (Good benefits)' },
  { value: 1.5, label: '1.5x (Premium benefits)' },
];
