import { ProjectV1 } from '../models/v1/extended-project.model';
import { OrgCategory, OrgCategoryListItem } from '../models/v1/org-category.model';
import { ExtendedProject } from '../models/v2/extended-project.model';

export const apiResponseActiveOnly = [
  {
    id: 257528,
    created_at: new Date('2021-05-12T10:28:40.834Z'),
    updated_at: new Date('2021-07-08T10:28:27.686Z'),
    name: 'Customer Mapped Project',
    sub_project: null,
    code: '1184',
    org_id: 'orFdTTTNcyye',
    description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
    active: true,
    approver1_id: null,
    approver2_id: null,
    org_category_ids: [null, 145429, 122269, 122271],
  },
  {
    id: 257541,
    created_at: new Date('2021-05-12T10:28:40.834Z'),
    updated_at: new Date('2021-07-08T10:28:27.686Z'),
    name: 'Sage Project 8',
    sub_project: null,
    code: '1178',
    org_id: 'orFdTTTNcyye',
    description: 'Sage Intacct Project - Sage Project 8, Id - 1178',
    active: true,
    approver1_id: null,
    approver2_id: null,
    org_category_ids: [null, 145429, 122269, 122271],
  },
  {
    id: 257531,
    created_at: new Date('2021-05-12T10:28:40.834Z'),
    updated_at: new Date('2021-07-08T10:28:27.686Z'),
    name: 'Fyle Team Integrations',
    sub_project: null,
    code: '1183',
    org_id: 'orFdTTTNcyye',
    description: 'Sage Intacct Project - Fyle Team Integrations, Id - 1183',
    active: true,
    approver1_id: null,
    approver2_id: null,
    org_category_ids: null,
  },
];

export const expectedReponseActiveOnly = [
  {
    id: 257528,
    created_at: new Date('2021-05-12T10:28:40.834Z'),
    updated_at: new Date('2021-07-08T10:28:27.686Z'),
    name: 'Customer Mapped Project',
    sub_project: null,
    code: '1184',
    org_id: 'orFdTTTNcyye',
    description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
    active: true,
    approver1_id: null,
    approver2_id: null,
    org_category_ids: [null, 145429, 122269, 122271],
  },
  {
    id: 257541,
    created_at: new Date('2021-05-12T10:28:40.834Z'),
    updated_at: new Date('2021-07-08T10:28:27.686Z'),
    name: 'Sage Project 8',
    sub_project: null,
    code: '1178',
    org_id: 'orFdTTTNcyye',
    description: 'Sage Intacct Project - Sage Project 8, Id - 1178',
    active: true,
    approver1_id: null,
    approver2_id: null,
    org_category_ids: [null, 145429, 122269, 122271],
  },
  {
    id: 257531,
    created_at: new Date('2021-05-12T10:28:40.834Z'),
    updated_at: new Date('2021-07-08T10:28:27.686Z'),
    name: 'Fyle Team Integrations',
    sub_project: null,
    code: '1183',
    org_id: 'orFdTTTNcyye',
    description: 'Sage Intacct Project - Fyle Team Integrations, Id - 1183',
    active: true,
    approver1_id: null,
    approver2_id: null,
    org_category_ids: null,
  },
];

export const apiV2ResponseMultiple = {
  count: 2,
  data: [
    {
      ap1_email: null,
      ap1_full_name: null,
      ap2_email: null,
      ap2_full_name: null,
      project_active: true,
      project_approver1_id: null,
      project_approver2_id: null,
      project_code: '1184',
      project_created_at: new Date('2021-05-12T10:28:40.834844'),
      project_description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      project_id: 257528,
      project_name: 'Customer Mapped Project',
      project_org_category_ids: [122269, 122270, 122271, null],
      project_org_id: 'orFdTTTNcyye',
      project_updated_at: new Date('2021-07-08T10:28:27.686886'),
      projectv2_name: 'Customer Mapped Project',
      sub_project_name: null,
    },
    {
      ap1_email: null,
      ap1_full_name: null,
      ap2_email: null,
      ap2_full_name: null,
      project_active: true,
      project_approver1_id: null,
      project_approver2_id: null,
      project_code: '1182',
      project_created_at: new Date('2021-05-12T10:28:40.834844'),
      project_description: 'Sage Intacct Project - Fyle Engineering, Id - 1182',
      project_id: 257529,
      project_name: 'Fyle Engineering',
      project_org_category_ids: [122269, 122270, 122271],
      project_org_id: 'orFdTTTNcyye',
      project_updated_at: new Date('2021-07-08T10:28:27.686886'),
      projectv2_name: 'Fyle Engineering',
      sub_project_name: null,
    },
  ],
  limit: 4,
  offset: 0,
  url: '/v2/projects',
};

export const apiV2ResponseSingle = {
  count: 1,
  data: [
    {
      ap1_email: null,
      ap1_full_name: null,
      ap2_email: null,
      ap2_full_name: null,
      project_active: true,
      project_approver1_id: null,
      project_approver2_id: null,
      project_code: '1184',
      project_created_at: new Date('2021-05-12T10:28:40.834844'),
      project_description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
      project_id: 257528,
      project_name: 'Customer Mapped Project',
      project_org_category_ids: [122269, 122270, 122271, null],
      project_org_id: 'orFdTTTNcyye',
      project_updated_at: new Date('2021-07-08T10:28:27.686886'),
      projectv2_name: 'Customer Mapped Project',
      sub_project_name: null,
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/projects',
};

export const testActiveCategoryList: OrgCategory[] = [
  {
    code: '4060340',
    created_at: new Date('2018-01-31T23:50:27.215171+00:00'),
    displayName: 'Snacks',
    enabled: true,
    fyle_category: 'Food',
    id: 16560,
    name: 'Snacks',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Snacks',
    updated_at: new Date('2022-11-23T14:25:26.485891+00:00'),
  },
  {
    code: '4060337',
    created_at: new Date('2022-07-05T07:52:00.417939+00:00'),
    displayName: 'Train / Induction',
    enabled: true,
    fyle_category: 'Train',
    id: 201949,
    name: 'Train',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Induction',
    updated_at: new Date('2022-07-05T07:52:00.417939+00:00'),
  },
  {
    code: 'Cell phone',
    created_at: new Date('2021-03-19T04:44:55.627307+00:00'),
    displayName: 'Cell phone',
    enabled: true,
    fyle_category: null,
    id: 130361,
    name: 'Cell phone',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Cell phone',
    updated_at: new Date('2022-05-05T17:46:15.434494+00:00'),
  },
];

export const testActiveCategoryListOptions: OrgCategoryListItem[] = [
  {
    label: 'Snacks',
    value: {
      code: '4060340',
      created_at: new Date('2018-01-31T23:50:27.215171+00:00'),
      displayName: 'Snacks',
      enabled: true,
      fyle_category: 'Food',
      id: 16560,
      name: 'Snacks',
      org_id: 'orNVthTo2Zyo',
      sub_category: 'Snacks',
      updated_at: new Date('2022-11-23T14:25:26.485891+00:00'),
    },
  },
  {
    label: 'Train / Induction',
    value: {
      code: '4060337',
      created_at: new Date('2022-07-05T07:52:00.417939+00:00'),
      displayName: 'Train / Induction',
      enabled: true,
      fyle_category: 'Train',
      id: 201949,
      name: 'Train',
      org_id: 'orNVthTo2Zyo',
      sub_category: 'Induction',
      updated_at: new Date('2022-07-05T07:52:00.417939+00:00'),
    },
  },
  {
    label: 'Cell phone',
    value: {
      code: 'Cell phone',
      created_at: new Date('2021-03-19T04:44:55.627307+00:00'),
      displayName: 'Cell phone',
      enabled: true,
      fyle_category: null,
      id: 130361,
      name: 'Cell phone',
      org_id: 'orNVthTo2Zyo',
      sub_category: 'Cell phone',
      updated_at: new Date('2022-05-05T17:46:15.434494+00:00'),
    },
  },
];

export const allowedActiveCategories: OrgCategory[] = [
  {
    code: '4060340',
    created_at: new Date('2018-01-31T23:50:27.215171+00:00'),
    displayName: 'Snacks',
    enabled: true,
    fyle_category: 'Food',
    id: 16560,
    name: 'Snacks',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Snacks',
    updated_at: new Date('2022-11-23T14:25:26.485891+00:00'),
  },
  {
    code: '4060337',
    created_at: new Date('2022-07-05T07:52:00.417939+00:00'),
    displayName: 'Train / Induction',
    enabled: true,
    fyle_category: 'Train',
    id: 201949,
    name: 'Train',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Induction',
    updated_at: new Date('2022-07-05T07:52:00.417939+00:00'),
  },
];

export const allowedActiveCategoriesListOptions: OrgCategoryListItem[] = [
  {
    label: 'Snacks',
    value: {
      code: '4060340',
      created_at: new Date('2018-01-31T23:50:27.215171+00:00'),
      displayName: 'Snacks',
      enabled: true,
      fyle_category: 'Food',
      id: 16560,
      name: 'Snacks',
      org_id: 'orNVthTo2Zyo',
      sub_category: 'Snacks',
      updated_at: new Date('2022-11-23T14:25:26.485891+00:00'),
    },
  },
  {
    label: 'Train / Induction',
    value: {
      code: '4060337',
      created_at: new Date('2022-07-05T07:52:00.417939+00:00'),
      displayName: 'Train / Induction',
      enabled: true,
      fyle_category: 'Train',
      id: 201949,
      name: 'Train',
      org_id: 'orNVthTo2Zyo',
      sub_category: 'Induction',
      updated_at: new Date('2022-07-05T07:52:00.417939+00:00'),
    },
  },
];

export const expectedProjectsResponse: ExtendedProject[] = [
  {
    ap1_email: null,
    ap1_full_name: null,
    ap2_email: null,
    ap2_full_name: null,
    project_active: true,
    project_approver1_id: null,
    project_approver2_id: null,
    project_code: '1184',
    project_created_at: new Date('2021-05-12T10:28:40.834844'),
    project_description: 'Sage Intacct Project - Customer Mapped Project, Id - 1184',
    project_id: 257528,
    project_name: 'Customer Mapped Project',
    project_org_category_ids: [122269, 122270, 122271, null],
    project_org_id: 'orFdTTTNcyye',
    project_updated_at: new Date('2021-07-08T10:28:27.686886'),
    projectv2_name: 'Customer Mapped Project',
    sub_project_name: null,
  },
  {
    ap1_email: null,
    ap1_full_name: null,
    ap2_email: null,
    ap2_full_name: null,
    project_active: true,
    project_approver1_id: null,
    project_approver2_id: null,
    project_code: '1182',
    project_created_at: new Date('2021-05-12T10:28:40.834844'),
    project_description: 'Sage Intacct Project - Fyle Engineering, Id - 1182',
    project_id: 257529,
    project_name: 'Fyle Engineering',
    project_org_category_ids: [122269, 122270, 122271],
    project_org_id: 'orFdTTTNcyye',
    project_updated_at: new Date('2021-07-08T10:28:27.686886'),
    projectv2_name: 'Fyle Engineering',
    sub_project_name: null,
  },
];

export const testProjectParams = {
  orgId: 'orNVthTo2Zyo',
  active: true,
  sortDirection: 'asc',
  sortOrder: 'project_name',
  orgCategoryIds: [null, 122269, 122270, 122271, 122272, 122273],
  projectIds: [3943, 305792, 148971, 247936],
  offset: 0,
  limit: 10,
  searchNameText: 'search',
};

export const testProjectV2 = {
  ap1_email: null,
  ap1_full_name: null,
  ap2_email: null,
  ap2_full_name: null,
  project_active: true,
  project_approver1_id: null,
  project_approver2_id: null,
  project_code: null,
  project_created_at: new Date('2020-06-26T05:32:00.174Z'),
  project_description: null,
  project_id: 3943,
  project_name: 'Staging Project',
  project_org_category_ids: [16560, 224734, 201949],
  project_org_id: 'orNVthTo2Zyo',
  project_updated_at: new Date('2022-11-23T08:55:29.400Z'),
  projectv2_name: 'Staging Project',
  sub_project_name: null,
};

export const testCategoryIds = ['145429', '140530', '145458', '122269'];

export const params = {
  project_org_id: 'eq.orNVthTo2Zyo',
  order: 'project_name.asc',
  limit: 10,
  offset: 0,
  project_active: 'eq.true',
  project_org_category_ids: 'ov.{,122269,122270,122271,122272,122273}',
  project_id: 'in.(3943,305792,148971,247936)',
  project_name: 'ilike.%search%',
};

export const projectsV1Data: ProjectV1[] = [
  {
    created_at: new Date('2021-05-12T10:28:40.834844'),
    updated_at: new Date('2021-07-08T10:28:27.686886'),
    ...apiResponseActiveOnly[0],
  },
  {
    created_at: new Date('2021-05-12T10:28:40.834844'),
    updated_at: new Date('2021-07-08T10:28:27.686886'),
    ...apiResponseActiveOnly[1],
  },
];

export const projectsV1Data2: ProjectV1[] = [
  {
    created_at: new Date('2021-05-12T10:28:40.834844'),
    updated_at: new Date('2021-07-08T10:28:27.686886'),
    id: 3943,
    name: 'Staging Project',
    ...apiResponseActiveOnly[0],
  },
];
