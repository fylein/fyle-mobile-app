import { AbstractControl } from '@angular/forms';

export interface AdvanceRequestsCustomFields {
  id: number;
  org_id: string;
  created_at?: Date;
  updated_at?: Date;
  type?: string;
  name: string;
  options?: string[] | { label: string; value: string }[];
  is_mandatory?: boolean;
  is_enabled: boolean;
  placeholder?: string;
  control?: AbstractControl;
}
