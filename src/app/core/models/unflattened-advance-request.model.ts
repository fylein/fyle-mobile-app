import { AdvanceRequests } from './advance-requests.model';

export interface UnflattenedAdvanceRequest {
  areq: AdvanceRequests;
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
