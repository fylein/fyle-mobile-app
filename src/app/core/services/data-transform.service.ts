import { Injectable } from '@angular/core';
import { CustomField } from '../models/custom_field.model';
import { CustomProperty } from '../models/custom-properties.model';
import { EouPlatformApiResponse } from '../models/employee-response.model';
import { ExtendedOrgUser } from '../models/extended-org-user.model';

@Injectable({
  providedIn: 'root',
})
export class DataTransformService {
  constructor() {}

  unflatten<T, K>(data: K): T {
    const res = {};
    Object.keys(data).forEach((key) => {
      const idx = key.indexOf('_');
      if (idx !== -1) {
        const member = key.substring(0, idx);
        const strippedKey = key.substring(idx + 1, key.length);
        if (!res[member]) {
          res[member] = {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        res[member][strippedKey] = data[key];
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        res[key] = data[key];
      }
    });
    return res as T;
  }

  getStatus(isEnabled: boolean, hasAcceptedInvite: boolean): string {
    if (!isEnabled) return 'DISABLED';
    if (!hasAcceptedInvite) return 'PENDING_INVITE';
    return 'ACTIVE';
  }

  parseBoolean(value: string | boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return false;
  }

  parseNumber(value: string | number): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  transformCustomFields(customFields: CustomField[]): CustomProperty<number | string>[] {
    return (
      customFields.map((field) => ({
        name: field.name,
        value: field.value as number | string,
      })) || []
    );
  }

  transformExtOrgUserResponse(platformRes: EouPlatformApiResponse): ExtendedOrgUser {
    const transformedResponse: ExtendedOrgUser = {
      ou: {
        id: platformRes.id,
        created_at: platformRes.created_at,
        updated_at: platformRes.updated_at,
        joining_dt: platformRes.joined_at,
        org_id: platformRes.org_id,
        user_id: platformRes.user_id,
        employee_id: platformRes.code,
        location: platformRes.location,
        level: platformRes.level.name,
        level_id: platformRes.level_id,
        band: platformRes.level.band,
        business_unit: platformRes.business_unit,
        department_id: platformRes.department_id,
        department: platformRes.department.name,
        sub_department: platformRes.department.sub_department,
        roles: platformRes.roles,

        approver1_id: platformRes.approver_user_ids[0],
        approver2_id: platformRes.approver_user_ids[1],
        approver3_id: platformRes.approver_user_ids[2],

        title: platformRes.title,
        status: this.getStatus(platformRes.is_enabled, platformRes.has_accepted_invite),
        branch_ifsc: platformRes.branch_ifsc,
        branch_account: platformRes.branch_account,
        mobile: platformRes.mobile,
        mobile_verified: this.parseBoolean(platformRes.is_mobile_verified),
        mobile_verification_attempts_left: this.parseNumber(platformRes.mobile_verification_attempts_left),
        is_primary: platformRes.is_primary,
        custom_field_values: this.transformCustomFields(platformRes.custom_fields),
      },
      us: {
        id: platformRes.user_id,
        full_name: platformRes.user.full_name,
        email: platformRes.user.email,
      },
      ap1: {
        full_name: platformRes.approver_users[0]?.full_name,
        email: platformRes.approver_users[0]?.email,
      },
      ap2: {
        full_name: platformRes.approver_users[1]?.full_name,
        email: platformRes.approver_users[1]?.email,
      },
      ap3: {
        full_name: platformRes.approver_users[2]?.full_name,
        email: platformRes.approver_users[2]?.email,
      },
      department: platformRes.department,
      approver_user_ids: platformRes.approver_user_ids,
      approver_users: platformRes.approver_users,
      delegatees: platformRes.delegatees,
      locale: platformRes.locale,
      commute_details: platformRes.commute_details,
      commute_details_id: platformRes.commute_details_id,
      flattened_custom_field: platformRes.flattened_custom_field,
    };

    return transformedResponse;
  }
}
