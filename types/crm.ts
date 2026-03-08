export type CrmPhase =
  | 'consultation'
  | 'proposal'
  | 'agreement'
  | 'delivery'
  | 'implementation'
  | 'signoff'

export interface Interaction {
  id: string
  customer_id: string
  interaction_type: string
  subject?: string
  notes?: string
  interaction_date: string
  phase?: CrmPhase | null
  created_by?: string
  created_at: string
  created_by_profile?: {
    id: string
    full_name: string | null
    email?: string
  }
}

export interface ActionItem {
  id: string
  customer_id: string
  phase: CrmPhase
  title: string
  description?: string
  due_date?: string
  status: 'open' | 'completed'
  assigned_to?: string
  source_interaction_id?: string
  created_by?: string
  created_at: string
  completed_at?: string
  assigned_to_profile?: {
    id: string
    full_name: string | null
    email?: string
  }
}

export interface AdminUser {
  id: string
  full_name: string | null
  email: string
  role: string
}
