import { ExtendedAdvance } from '../models/extended_advance.model';
import { ApiV2Response } from '../models/api-v2.model';

export const singleExtendedAdvancesData: ApiV2Response<ExtendedAdvance> = {
  count: 1,
  data: [
    {
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
      adv_purpose: 'New advance-2',
      adv_refcode: null,
      adv_settlement_id: 'setc2r9i3I2xr',
      adv_source: 'WEBAPP',
      areq_id: 'areqmq8cmnd5v4',
      assignee_department_id: 'deptYSONXoGd64',
      assignee_ou_id: 'ourw7Hi4mmpO',
      assignee_ou_org_id: 'orNVthTo2Zyo',
      assignee_us_email: 'dimple.kh@fyle.in',
      assignee_us_full_name: 'Dimple',
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

export const singleExtendedAdvancesData2: ApiV2Response<ExtendedAdvance> = {
  count: 11,
  data: [
    {
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
      adv_purpose: 'New advance-2',
      adv_refcode: null,
      adv_settlement_id: 'setc2r9i3I2xr',
      adv_source: 'WEBAPP',
      areq_id: 'areqmq8cmnd5v4',
      assignee_department_id: 'deptYSONXoGd64',
      assignee_ou_id: 'ourw7Hi4mmpO',
      assignee_ou_org_id: 'orNVthTo2Zyo',
      assignee_us_email: 'dimple.kh@fyle.in',
      assignee_us_full_name: 'Dimple',
      project_code: 'Pc10wqpt',
      project_id: null,
      project_name: null,
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/advances',
};

export const singleExtendedAdvancesData3: ExtendedAdvance = {
  ...singleExtendedAdvancesData.data[0],
  type: 'advance',
  amount: 300,
  orig_amount: null,
  created_at: new Date('2019-10-31T04:36:01.927Z'),
  currency: 'INR',
  orig_currency: null,
  purpose: 'New advance-2',
};
