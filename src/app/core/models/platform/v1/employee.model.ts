import { NameValuePair } from '../../name-value-pair.model';
import { Locale, MileageSettings } from '../../org_user_settings.model';
import { UserRole } from '../../user-role.model';
import { PlatformCostCenter } from '../platform-cost-center.model';
import { Department } from './department.model';
import { Level } from './level.model';
import { PlatformMileageRates } from '../platform-mileage-rates.model';
import { PlatformPerDiemRates } from '../platform-per-diem-rates.model';
import { Project } from './project.model';
import { User } from './user.model';

export interface Employee {
  id: string;
  org_id: string;
  org_name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user: User;
  business_unit: string;
  code: string;
  department: Pick<Department, 'id' | 'code' | 'display_name' | 'sub_department' | 'name'>;
  department_id: string;
  is_enabled: boolean;
  joined_at: string;
  level_id: string;
  level: Pick<Level, 'id' | 'name' | 'band'>;
  location: string;
  roles: UserRole[];
  special_email: string;
  title: string;
  custom_fields: NameValuePair[];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  flattened_custom_field: Record<string, any>;
  project_ids: number[];
  projects: Pick<Project, 'id' | 'name' | 'code' | 'display_name' | 'sub_project'>[];
  cost_center_ids: number[];
  cost_centers: Pick<PlatformCostCenter, 'id' | 'name' | 'code'>[];
  per_diem_rate_ids: number[];
  per_diem_rates: Pick<PlatformPerDiemRates, 'id' | 'code' | 'name'>[];
  mileage_rate_ids: number[];
  mileage_rates: Pick<PlatformMileageRates, 'id' | 'code' | 'vehicle_type'>[];
  approver_user_ids: string[];
  approver_users: User[];
  has_accepted_invite: boolean;
  branch_account: string;
  branch_ifsc: string;
  mobile: string;
  locale: Locale;
  mileage_settings: MileageSettings;
  ach_account: {
    added: boolean;
    verified: boolean;
  };
  delegatees: Delegatee[];
}

interface Delegatee {
  user_id: string;
  start_at: string;
  end_at: string;
}
