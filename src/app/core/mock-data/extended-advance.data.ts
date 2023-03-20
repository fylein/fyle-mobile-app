import { ExtendedAdvance } from '../models/extended_advance.model';
import { ApiV2Response } from '../models/api-v2.model';

export const singleExtendedAdvancesData: ApiV2Response<ExtendedAdvance> = {
  count: 1,
  data: [
    {
      account_current_balance_amount: -12928.33,
      account_id: 'acc37LwFcAIpg',
      account_name: 'Advance Account',
      account_target_balance_amount: 0,
      account_tentative_balance_amount: -14948.33,
      account_type: 'PERSONAL_ADVANCE_ACCOUNT',
      adv_advance_number: 'A/2019/10/T/49',
      adv_amount: 300,
      adv_card_number: null,
      adv_created_at: new Date('2019-10-31T04:36:01.927Z'),
      adv_currency: 'INR',
      adv_exported: false,
      adv_id: 'advETmi3eePvQ',
      adv_issued_at: new Date('2019-10-31T04:35:10.391Z'),
      adv_mode: 'BANK_TRANSFER',
      adv_orig_amount: null,
      adv_orig_currency: null,
      adv_payment_id: 'payoMxfqFQXCO',
      adv_purpose: 'New advance-2',
      adv_refcode: null,
      adv_settlement_id: 'setc2r9i3I2xr',
      adv_source: 'WEBAPP',
      areq_approved_at: new Date('2019-10-31T04:35:46.866Z'),
      areq_custom_field_values: '[{"id:64,"name:"test","value:null,"type:"NUMBER"}]',
      areq_id: 'areqmq8cmnd5v4',
      assignee_business_unit: null,
      assignee_department_id: 'deptYSONXoGd64',
      assignee_level_id: 'lvl7Lme2OI5FH',
      assignee_ou_id: 'ourw7Hi4mmpO',
      assignee_ou_org_id: 'orNVthTo2Zyo',
      assignee_us_email: 'dimple.kh@fyle.in',
      assignee_us_full_name: 'Dimple',
      creator_ou_id: 'ouyrZ3cROTxu',
      creator_ou_org_id: 'orNVthTo2Zyo',
      creator_us_email: 'madhav.mansuriya@fyle.in',
      creator_us_full_name: 'Madhav M',
      custom_properties: {
        test: null,
      },
      ou_assignee_employee_id: 'abc',
      ou_location: 'Mumbai',
      ou_title: 'Outitle1',
      project_code: 'Pc10wqpt',
      project_id: null,
      project_name: null,
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/advances',
};

export const extendedAdvWithDates = {
  ...singleExtendedAdvancesData,
  adv_created_at: new Date('2019-10-31T04:36:01.927Z'),
  adv_issued_at: new Date('2019-10-31T04:35:10.391Z'),
  areq_approved_at: new Date('2019-10-31T04:35:46.866Z'),
};

export const extendedAdvWithoutDates = {
  ...singleExtendedAdvancesData,
  adv_created_at: '2019-10-31T04:36:01.927Z',
  adv_issued_at: '2019-10-31T04:35:10.391Z',
  areq_approved_at: '2019-10-31T04:35:46.866Z',
};
