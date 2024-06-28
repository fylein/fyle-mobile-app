export interface ExtendedAdvance {
  adv_advance_number: string;
  adv_amount: number;
  adv_card_number: string;
  adv_created_at: Date;
  adv_currency: string;
  adv_exported: boolean;
  adv_id: string;
  adv_issued_at: Date;
  adv_mode: string;
  adv_orig_amount: number;
  adv_orig_currency: string;
  adv_purpose: string;
  adv_refcode: string;
  adv_source: string;
  areq_id: string;
  assignee_department_id: string;
  assignee_ou_id: string;
  assignee_ou_org_id: string;
  assignee_us_email: string;
  assignee_us_full_name: string;
  project_code: string;
  project_id: number;
  project_name: string;
  type?: string;
  created_at?: Date;
  amount?: number;
  orig_amount?: number;
  currency?: string;
  orig_currency?: string;
  purpose?: string;
  creator_us_full_name: string;
  areq_approved_at: Date;
}
