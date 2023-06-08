export interface UnflattenedAdvanceRequest {
  areq: {
    advance_id: string;
    advance_request_number: string;
    amount: number;
    approval_state?: string[];
    approved_at: Date;
    approvers_ids?: string[];
    created_at: Date;
    currency: string;
    custom_field_values: string;
    id: string;
    is_pulled_back: boolean;
    is_sent_back: boolean;
    last_updated_by?: string;
    updated_by?: string;
    notes: string;
    org_user_id: string;
    policy_amount: number;
    policy_flag: boolean;
    policy_state: string;
    project_id: string;
    purpose: string;
    source: string;
    state: string;
    updated_at: Date;
  };
  ou: {
    business_unit: string;
    department: string;
    department_id: string;
    employee_id: string;
    id: string;
    level: string;
    level_id?: string;
    location: string;
    mobile: string;
    org_id: string;
    org_name: string;
    sub_department: string;
    title: string;
  };
  us: {
    full_name: string;
    email: string;
    name: string;
  };
  project: {
    code: string;
    name: string;
  };
  advance?: {
    id: string;
  };
  policy: {
    amount?: number;
    flag: boolean;
    state: string;
  };
  new?: {
    state: string;
  };
}
