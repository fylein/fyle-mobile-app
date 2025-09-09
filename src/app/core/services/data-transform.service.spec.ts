import { TestBed } from '@angular/core/testing';
import { DataTransformService } from './data-transform.service';
import { flattenedData, unflattenedData } from '../mock-data/data-transform.data';
import { CustomField } from '../models/custom_field.model';
import { EouPlatformApiResponse } from '../models/eou-platform-api-response.model';

describe('DataTransformService', () => {
  let dataTransformService: DataTransformService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataTransformService],
    });
    dataTransformService = TestBed.inject(DataTransformService);
  });

  it('should be created', () => {
    expect(dataTransformService).toBeTruthy();
  });

  describe('unflatten():', () => {
    it('should unflatten the data', () => {
      const actualOutput = dataTransformService.unflatten(flattenedData);
      expect(actualOutput).toEqual(unflattenedData);
    });

    it('should return an empty object if input is empty', () => {
      const input = {};
      const expectedOutput = {};
      const actualOutput = dataTransformService.unflatten(input);
      expect(actualOutput).toEqual(expectedOutput);
    });
  });

  describe('getStatus():', () => {
    it('should return DISABLED when user is not enabled', () => {
      expect(dataTransformService.getStatus(false, true)).toBe('DISABLED');
      expect(dataTransformService.getStatus(false, false)).toBe('DISABLED');
    });

    it('should return PENDING_INVITE when user is enabled but has not accepted invite', () => {
      expect(dataTransformService.getStatus(true, false)).toBe('PENDING_INVITE');
    });

    it('should return ACTIVE when user is enabled and has accepted invite', () => {
      expect(dataTransformService.getStatus(true, true)).toBe('ACTIVE');
    });
  });

  describe('parseBoolean():', () => {
    it('should return boolean value as is', () => {
      expect(dataTransformService.parseBoolean(true)).toBeTrue();
      expect(dataTransformService.parseBoolean(false)).toBeFalse();
    });

    it('should parse string "true" as true', () => {
      expect(dataTransformService.parseBoolean('true')).toBeTrue();
      expect(dataTransformService.parseBoolean('TRUE')).toBeTrue();
      expect(dataTransformService.parseBoolean('True')).toBeTrue();
    });

    it('should parse string "false" as false', () => {
      expect(dataTransformService.parseBoolean('false')).toBeFalse();
      expect(dataTransformService.parseBoolean('FALSE')).toBeFalse();
      expect(dataTransformService.parseBoolean('False')).toBeFalse();
    });

    it('should return false for invalid string values', () => {
      expect(dataTransformService.parseBoolean('invalid')).toBeFalse();
      expect(dataTransformService.parseBoolean('1')).toBeFalse();
      expect(dataTransformService.parseBoolean('0')).toBeFalse();
    });
  });

  describe('parseNumber():', () => {
    it('should return number value as is', () => {
      expect(dataTransformService.parseNumber(123)).toBe(123);
      expect(dataTransformService.parseNumber(0)).toBe(0);
      expect(dataTransformService.parseNumber(-456)).toBe(-456);
    });

    it('should parse valid string numbers', () => {
      expect(dataTransformService.parseNumber('123')).toBe(123);
      expect(dataTransformService.parseNumber('0')).toBe(0);
      expect(dataTransformService.parseNumber('-456')).toBe(-456);
    });

    it('should return 0 for invalid string values', () => {
      expect(dataTransformService.parseNumber('invalid')).toBe(0);
      expect(dataTransformService.parseNumber('abc123')).toBe(0);
      expect(dataTransformService.parseNumber('')).toBe(0);
    });
  });

  describe('transformCustomFields():', () => {
    it('should transform custom fields array', () => {
      const customFields: CustomField[] = [
        { name: 'field1', value: 'value1' },
        { name: 'field2', value: 123 },
        { name: 'field3', value: 'value3' },
      ];

      const result = dataTransformService.transformCustomFields(customFields);

      expect(result).toEqual([
        { name: 'field1', value: 'value1' },
        { name: 'field2', value: 123 },
        { name: 'field3', value: 'value3' },
      ]);
    });

    it('should return empty array for empty input', () => {
      const result = dataTransformService.transformCustomFields([]);
      expect(result).toEqual([]);
    });
  });

  describe('transformExtOrgUserResponse():', () => {
    it('should transform platform API response to ExtendedOrgUser', () => {
      const platformRes: EouPlatformApiResponse = {
        id: 'ou123',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-02T00:00:00.000Z',
        joined_at: '2023-01-01T00:00:00.000Z',
        org_id: 'org123',
        user_id: 'user123',
        code: 'EMP001',
        location: 'Mumbai',
        level: { id: 'lvl123', name: 'Senior', band: 'L5' },
        level_id: 'lvl123',
        business_unit: 'Engineering',
        department_id: 'dept123',
        department: {
          id: 'dept123',
          code: 'ENG',
          name: 'Engineering',
          sub_department: 'Backend',
          display_name: 'Engineering - Backend',
        },
        roles: ['EMPLOYEE'],
        approver_user_ids: ['ap1', 'ap2', 'ap3'],
        title: 'Software Engineer',
        special_email: 'special@example.com',
        is_enabled: true,
        has_accepted_invite: true,
        branch_ifsc: 'IFSC001',
        branch_account: 'ACC001',
        mobile: '+1234567890',
        is_mobile_verified: 'true',
        mobile_verification_attempts_left: '3',
        is_primary: true,
        custom_fields: [
          { name: 'field1', value: 'value1' },
          { name: 'field2', value: 123 },
        ],
        user: {
          id: 'user123',
          full_name: 'John Doe',
          email: 'john@example.com',
        },
        approver_users: [
          { id: 'ap1', full_name: 'Approver 1', email: 'ap1@example.com' },
          { id: 'ap2', full_name: 'Approver 2', email: 'ap2@example.com' },
          { id: 'ap3', full_name: 'Approver 3', email: 'ap3@example.com' },
        ],
        delegatees: [],
        locale: {
          timezone: 'Asia/Kolkata',
          abbreviation: 'IST',
          offset: '+05:30',
        },
        commute_details: {
          id: 123,
          distance: 10.5,
          distance_unit: 'km',
          home_location: {
            city: 'Mumbai',
            country: 'India',
            formatted_address: 'Mumbai, Maharashtra, India',
            latitude: 19.076,
            longitude: 72.8777,
            state: 'Maharashtra',
          },
          work_location: {
            city: 'Mumbai',
            country: 'India',
            formatted_address: 'Mumbai, Maharashtra, India',
            latitude: 19.076,
            longitude: 72.8777,
            state: 'Maharashtra',
          },
        },
        commute_details_id: 'commute123',
        flattened_custom_field: {},
      };

      const result = dataTransformService.transformExtOrgUserResponse(platformRes);

      expect(result.ou.id).toBe('ou123');
      expect(result.ou.created_at).toBe(platformRes.created_at);
      expect(result.ou.updated_at).toBe(platformRes.updated_at);
      expect(result.ou.joining_dt).toBe(platformRes.joined_at);
      expect(result.ou.org_id).toBe('org123');
      expect(result.ou.user_id).toBe('user123');
      expect(result.ou.employee_id).toBe('EMP001');
      expect(result.ou.location).toBe('Mumbai');
      expect(result.ou.level).toBe('Senior');
      expect(result.ou.level_id).toBe('lvl123');
      expect(result.ou.band).toBe('L5');
      expect(result.ou.business_unit).toBe('Engineering');
      expect(result.ou.department_id).toBe('dept123');
      expect(result.ou.department).toBe('Engineering');
      expect(result.ou.sub_department).toBe('Backend');
      expect(result.ou.roles).toEqual(['EMPLOYEE']);
      expect(result.ou.approver1_id).toBe('ap1');
      expect(result.ou.approver2_id).toBe('ap2');
      expect(result.ou.approver3_id).toBe('ap3');
      expect(result.ou.title).toBe('Software Engineer');
      expect(result.ou.status).toBe('ACTIVE');
      expect(result.ou.branch_ifsc).toBe('IFSC001');
      expect(result.ou.branch_account).toBe('ACC001');
      expect(result.ou.mobile).toBe('+1234567890');
      expect(result.ou.mobile_verified).toBeTrue();
      expect(result.ou.mobile_verification_attempts_left).toBe(3);
      expect(result.ou.is_primary).toBeTrue();
      expect(result.ou.custom_field_values).toEqual([
        { name: 'field1', value: 'value1' },
        { name: 'field2', value: 123 },
      ]);

      expect(result.us.id).toBe('user123');
      expect(result.us.full_name).toBe('John Doe');
      expect(result.us.email).toBe('john@example.com');

      expect(result.ap1.full_name).toBe('Approver 1');
      expect(result.ap1.email).toBe('ap1@example.com');
      expect(result.ap2.full_name).toBe('Approver 2');
      expect(result.ap2.email).toBe('ap2@example.com');
      expect(result.ap3.full_name).toBe('Approver 3');
      expect(result.ap3.email).toBe('ap3@example.com');

      expect(result.department).toBe(platformRes.department);
      expect(result.approver_user_ids).toBe(platformRes.approver_user_ids);
      expect(result.approver_users).toBe(platformRes.approver_users);
      expect(result.delegatees).toBe(platformRes.delegatees);
      expect(result.locale).toBe(platformRes.locale);
      expect(result.commute_details).toBe(platformRes.commute_details);
      expect(result.commute_details_id).toBe(platformRes.commute_details_id);
      expect(result.flattened_custom_field).toBe(platformRes.flattened_custom_field);
    });
  });
});
