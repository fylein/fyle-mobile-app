import { NameValuePair } from 'src/app/core/models/name-value-pair.model';
import { Department } from 'src/app/core/models/platform/v1/department.model';
import { Level } from 'src/app/core/models/platform/v1/level.model';
import { User } from 'src/app/core/models/platform/v1/user.model';

export interface ExpenseEmployee {
  business_unit: string;
  code: string;
  custom_fields: NameValuePair[];
  department: Pick<Department, 'id' | 'code' | 'display_name' | 'sub_department' | 'name'>;
  department_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flattened_custom_field: Record<string, any>;
  has_accepted_invite: boolean;
  id: string;
  is_enabled: boolean;
  joined_at?: Date;
  mobile?: string;
  level: Pick<Level, 'id' | 'name' | 'band'>;
  location: string;
  org_id: string;
  org_name: string;
  title: string;
  user: User;
  user_id: string;
}
