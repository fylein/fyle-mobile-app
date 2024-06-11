import deepFreeze from 'deep-freeze-strict';

import { PlatformCategory } from '../models/platform/platform-category.model';
import { OrgCategory } from '../models/v1/org-category.model';

export const orgCategoryData: OrgCategory = deepFreeze({
  code: null,
  created_at: new Date('2018-01-31T23:50:27.235056+00:00'),
  displayName: 'Food',
  enabled: true,
  fyle_category: 'Food',
  id: 16566,
  name: 'Food',
  org_id: 'orNVthTo2Zyo',
  sub_category: 'Food',
  updated_at: new Date('2022-05-05T17:45:42.092507+00:00'),
});

export const mileagePerDiemPlatformCategoryData: PlatformCategory[] = deepFreeze([
  {
    code: null,
    created_at: new Date('2018-01-31T23:50:27.235056+00:00'),
    display_name: 'Mileage',
    is_enabled: true,
    system_category: 'Mileage',
    id: 16566,
    name: 'Mileage',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Mileage',
    updated_at: new Date('2022-05-05T17:45:42.092507+00:00'),
  },
  {
    code: null,
    created_at: new Date('2018-01-31T23:50:27.235056+00:00'),
    display_name: 'Per Diem',
    is_enabled: true,
    system_category: 'Per Diem',
    id: 16566,
    name: 'Per Diem',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Per Diem',
    updated_at: new Date('2022-05-05T17:45:42.092507+00:00'),
  },
]);

export const transformedOrgCategories: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const sortedCategory: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const sortedOrgCategories: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const filterOrgCategoryParam: OrgCategory[] = deepFreeze([
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'activity',
    enabled: true,
    fyle_category: 'activity',
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const expectedFilterOrgCategory: OrgCategory[] = deepFreeze([
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const expectedAllOrgCategories: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const orgCategoryWoDisplayName: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const orgCategoryWithDisplayName: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business / Marketing',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const orgCategoryPaginated1: OrgCategory[] = deepFreeze([
  {
    code: '20300',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    displayName: 'Accounts Payable - Employees',
    enabled: true,
    fyle_category: null,
    id: 129140,
    name: 'Accounts Payable - Employees',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Accounts Payable - Employees',
    updated_at: new Date('2022-05-05T17:45:12.393241+00:00'),
  },
  {
    code: '16300',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    displayName: 'Capitalized Software Costs',
    enabled: true,
    fyle_category: null,
    id: 129112,
    name: 'Capitalized Software Costs',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Capitalized Software Costs',
    updated_at: new Date('2022-05-05T17:45:11.742874+00:00'),
  },
]);

export const categoryIds: string[] = deepFreeze(['129140']);

export const orgCategoryPaginated2: OrgCategory[] = deepFreeze([
  {
    code: '51708',
    created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
    displayName: 'COGS-Billable Hours',
    enabled: true,
    fyle_category: null,
    id: 129100,
    name: 'COGS-Billable Hours',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'COGS-Billable Hours',
    updated_at: new Date('2022-05-05T17:45:11.742874+00:00'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const expectedOrgCategoriesPaginated: OrgCategory[] = deepFreeze([
  {
    code: '20300',
    created_at: new Date('2021-03-14T06:07:39.652Z'),
    displayName: 'Accounts Payable - Employees',
    enabled: true,
    fyle_category: null,
    id: 129140,
    name: 'Accounts Payable - Employees',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Accounts Payable - Employees',
    updated_at: new Date('2022-05-05T17:45:12.393Z'),
  },
  {
    code: '16300',
    created_at: new Date('2021-03-14T06:07:39.652Z'),
    displayName: 'Capitalized Software Costs',
    enabled: true,
    fyle_category: null,
    id: 129112,
    name: 'Capitalized Software Costs',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Capitalized Software Costs',
    updated_at: new Date('2022-05-05T17:45:11.742Z'),
  },
  {
    code: '51708',
    created_at: new Date('2021-03-14T06:07:39.652Z'),
    displayName: 'COGS-Billable Hours',
    enabled: true,
    fyle_category: null,
    id: 129100,
    name: 'COGS-Billable Hours',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'COGS-Billable Hours',
    updated_at: new Date('2022-05-05T17:45:11.742Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const orgCategoryData1: OrgCategory[] = deepFreeze([
  { ...expectedOrgCategoriesPaginated[0] },
  { ...expectedOrgCategoriesPaginated[1] },
  {
    code: '4060344',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Hotel',
    enabled: true,
    fyle_category: 'Others',
    id: 16582,
    name: 'Hotel',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Hotel',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: null,
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Food',
    enabled: true,
    fyle_category: 'Others',
    id: 201952,
    name: 'Food',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Food',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const expectedTransformedCategories: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const unsortedCategories1: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: null,
    created_at: new Date('2022-02-07T10:36:23.916017+00:00'),
    displayName: '11 / 5665',
    enabled: true,
    fyle_category: 'Airlines',
    id: 174487,
    name: '11',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Airlines',
    updated_at: new Date('2022-11-23T13:11:51.771676+00:00'),
  },
  {
    code: null,
    created_at: new Date('2022-02-07T10:36:23.916017+00:00'),
    displayName: '11 / 5665',
    enabled: true,
    fyle_category: 'Airlines',
    id: 174485,
    name: '11',
    org_id: 'orNVthTo2Zyo',
    sub_category: '5665',
    updated_at: new Date('2022-11-23T13:11:51.771676+00:00'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: '4060332',
    created_at: new Date('2022-07-05T07:52:00.417939+00:00'),
    displayName: 'Hotel / Business Review',
    enabled: true,
    fyle_category: 'Lodging',
    id: 201957,
    name: 'Hotel',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Business Review',
    updated_at: new Date('2022-11-23T13:11:51.771676+00:00'),
  },
  {
    code: '4060337',
    created_at: new Date('2022-07-05T07:52:00.417939+00:00'),
    displayName: 'Hotel / Induction',
    enabled: true,
    fyle_category: 'Lodging',
    id: 201958,
    name: 'Hotel',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Induction',
    updated_at: new Date('2022-11-23T13:11:51.771676+00:00'),
  },
  {
    code: '4060331',
    created_at: new Date('2022-07-05T07:52:00.417939+00:00'),
    displayName: 'Hotel / Induction',
    enabled: true,
    fyle_category: 'Lodging',
    id: 201952,
    name: 'Hotel',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Induction',
    updated_at: new Date('2022-11-23T13:11:51.771676+00:00'),
  },
  {
    code: '4060332',
    created_at: new Date('2022-07-05T07:52:00.417939+00:00'),
    displayName: 'Hotel / Induction',
    enabled: true,
    fyle_category: 'Lodging',
    id: 201954,
    name: 'Hotel',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Induction',
    updated_at: new Date('2022-11-23T13:11:51.771676+00:00'),
  },
]);

export const sortedCategories1: OrgCategory[] = deepFreeze([
  {
    code: null,
    created_at: new Date('2022-02-07T10:36:23.916Z'),
    displayName: '11 / 5665',
    enabled: true,
    fyle_category: 'Airlines',
    id: 174485,
    name: '11',
    org_id: 'orNVthTo2Zyo',
    sub_category: '5665',
    updated_at: new Date('2022-11-23T13:11:51.771Z'),
  },
  {
    code: null,
    created_at: new Date('2022-02-07T10:36:23.916Z'),
    displayName: '11 / 5665',
    enabled: true,
    fyle_category: 'Airlines',
    id: 174487,
    name: '11',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Airlines',
    updated_at: new Date('2022-11-23T13:11:51.771Z'),
  },
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: '4060332',
    created_at: new Date('2022-07-05T07:52:00.417Z'),
    displayName: 'Hotel / Business Review',
    enabled: true,
    fyle_category: 'Lodging',
    id: 201957,
    name: 'Hotel',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Business Review',
    updated_at: new Date('2022-11-23T13:11:51.771Z'),
  },
  {
    code: '4060337',
    created_at: new Date('2022-07-05T07:52:00.417Z'),
    displayName: 'Hotel / Induction',
    enabled: true,
    fyle_category: 'Lodging',
    id: 201958,
    name: 'Hotel',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Induction',
    updated_at: new Date('2022-11-23T13:11:51.771Z'),
  },
  {
    code: '4060331',
    created_at: new Date('2022-07-05T07:52:00.417Z'),
    displayName: 'Hotel / Induction',
    enabled: true,
    fyle_category: 'Lodging',
    id: 201952,
    name: 'Hotel',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Induction',
    updated_at: new Date('2022-11-23T13:11:51.771Z'),
  },
  {
    code: '4060332',
    created_at: new Date('2022-07-05T07:52:00.417Z'),
    displayName: 'Hotel / Induction',
    enabled: true,
    fyle_category: 'Lodging',
    id: 201954,
    name: 'Hotel',
    org_id: 'orNVthTo2Zyo',
    sub_category: 'Induction',
    updated_at: new Date('2022-11-23T13:11:51.771Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
]);

export const transformedOrgCategoryById: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const displayOrgCategoryById: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '43',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'samp category',
    enabled: true,
    fyle_category: null,
    id: 226646,
    name: 'samp category',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'samp category',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const expectedOrgCategoryById: OrgCategory = deepFreeze({
  code: '93',
  created_at: new Date('2021-05-18T11:40:38.576Z'),
  displayName: 'Business',
  enabled: true,
  fyle_category: null,
  id: 141295,
  name: 'Business',
  org_id: 'orrjqbDbeP9p',
  sub_category: 'Business',
  updated_at: new Date('2022-07-01T05:51:31.800Z'),
});

export const transformedOrgCategoriesByName: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const displayOrgCategoriesByName: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: null,
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: null,
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const expectedOrgCategoryByName: OrgCategory = deepFreeze({
  code: '93',
  created_at: new Date('2021-05-18T11:40:38.576Z'),
  displayName: 'Business',
  enabled: true,
  fyle_category: null,
  id: 141295,
  name: 'Business',
  org_id: 'orrjqbDbeP9p',
  sub_category: 'Business',
  updated_at: new Date('2022-07-01T05:51:31.800Z'),
});

export const filteredCategoriesData = deepFreeze([
  {
    value: orgCategoryData,
  },
  {
    value: transformedOrgCategories[0],
  },
]);

export const expectedAutoFillCategory: OrgCategory = deepFreeze({
  code: null,
  created_at: new Date('2018-01-31T23:50:27.235Z'),
  displayName: 'Food',
  enabled: true,
  fyle_category: 'Food',
  id: 16566,
  name: 'Food',
  org_id: 'orNVthTo2Zyo',
  sub_category: 'Food',
  updated_at: new Date('2022-05-05T17:45:42.092Z'),
});

export const expectedAutoFillCategory2: OrgCategory = deepFreeze({
  code: null,
  created_at: new Date('2020-03-04T09:51:01.619Z'),
  displayName: 'Office supplies',
  enabled: true,
  fyle_category: 'Mail',
  id: 89469,
  name: 'Office Supplies',
  org_id: 'orNVthTo2Zyo',
  sub_category: 'Office supplies',
  updated_at: new Date('2022-11-23T13:11:51.771Z'),
});

export const TaxiCategory: OrgCategory = deepFreeze({
  code: null,
  created_at: new Date('2020-03-04T09:51:01.619Z'),
  displayName: 'Office supplies',
  enabled: true,
  fyle_category: 'Taxi',
  id: 89469,
  name: 'UBER',
  org_id: 'orNVthTo2Zyo',
  sub_category: 'TRAVEL',
  updated_at: new Date('2022-11-23T13:11:51.771Z'),
});

export const expectedAutoFillCategory3: OrgCategory = deepFreeze({
  code: null,
  created_at: new Date('2018-01-31T23:50:27.235Z'),
  displayName: 'Food',
  enabled: true,
  fyle_category: 'Food',
  id: 16566,
  name: 'Food',
  org_id: 'orNVthTo2Zyo',
  sub_category: 'Food',
  updated_at: new Date('2022-05-05T17:45:42.092Z'),
});

export const perDiemCategory: OrgCategory = deepFreeze({
  code: null,
  created_at: new Date('2018-07-27T08:52:38.938006+00:00'),
  displayName: 'Per Diem',
  enabled: true,
  fyle_category: 'Per Diem',
  id: 38912,
  name: 'Per Diem',
  org_id: 'orrb8EW1zZsy',
  sub_category: 'Per Diem',
  updated_at: new Date('2022-09-13T17:16:56.232081+00:00'),
});
export const perDiemCategories2: OrgCategory[] = deepFreeze([
  {
    code: null,
    created_at: new Date('2018-07-27T08:52:38.938006+00:00'),
    displayName: 'Per Diem',
    enabled: true,
    fyle_category: 'Per Diem',
    id: 38912,
    name: 'Per Diem',
    org_id: 'orrb8EW1zZsy',
    sub_category: 'Per Diem',
    updated_at: new Date('2022-09-13T17:16:56.232081+00:00'),
  },
  {
    code: null,
    created_at: new Date('2018-07-27T08:52:38.938006+00:00'),
    displayName: 'Per Diem',
    enabled: true,
    fyle_category: 'Per Diem',
    id: 38912,
    name: 'Per Diem',
    org_id: 'orrb8EW1zZsy',
    sub_category: 'Per Diem',
    updated_at: new Date('2022-09-13T17:16:56.232081+00:00'),
  },
]);

export const mileageCategories: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: 'Mileage',
    id: 141295,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: 'Mileage',
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const mileageCategories2: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'mileage',
    enabled: true,
    fyle_category: 'Food',
    id: 141295,
    name: 'mileage',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: 'Mileage',
    id: 141300,
    name: 'Pager',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Pager',
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
  {
    code: '42',
    created_at: new Date('2023-01-09T16:54:09.929Z'),
    displayName: 'Marketing outreach',
    enabled: true,
    fyle_category: null,
    id: 226659,
    name: 'Marketing outreach',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Marketing outreach',
    updated_at: new Date('2023-01-09T16:54:09.929Z'),
  },
]);

export const mileageCategories3: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'mileage',
    enabled: true,
    fyle_category: 'Food',
    id: 141295,
    name: null,
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: 'Mileage',
    id: 141300,
    name: 'Mileage',
    org_id: 'orrjqbDbeP9p',
    sub_category: null,
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
]);

export const expectedMileageCategoriesData: OrgCategory[] = deepFreeze([
  {
    code: '98',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Pager',
    enabled: true,
    fyle_category: 'Mileage',
    id: 141300,
    name: 'Mileage',
    org_id: 'orrjqbDbeP9p',
    sub_category: null,
    updated_at: new Date('2022-05-05T17:47:06.951Z'),
  },
]);

export const expectedOrgCategoryByName2: OrgCategory = deepFreeze({
  code: '93',
  created_at: new Date('2021-05-18T11:40:38.576Z'),
  displayName: 'Business',
  enabled: true,
  fyle_category: undefined,
  id: undefined,
  name: 'Business',
  org_id: 'orrjqbDbeP9p',
  sub_category: 'Business',
  updated_at: new Date('2022-07-01T05:51:31.800Z'),
});

export const unspecifiedCategory: OrgCategory = deepFreeze({
  code: null,
  created_at: new Date('2018-01-31T23:50:27.235056+00:00'),
  displayName: 'Unspecified',
  enabled: true,
  fyle_category: 'Unspecified',
  id: 16569,
  name: 'Unspecified',
  org_id: 'orNVthTo2Zyo',
  sub_category: 'Unspecified',
  updated_at: new Date('2022-05-05T17:45:42.092507+00:00'),
});

export const mileageCategoryWithoutId: OrgCategory[] = deepFreeze([
  {
    code: '93',
    created_at: new Date('2021-05-18T11:40:38.576Z'),
    displayName: 'Business',
    enabled: true,
    fyle_category: 'Mileage',
    id: undefined,
    name: 'Business',
    org_id: 'orrjqbDbeP9p',
    sub_category: 'Business',
    updated_at: new Date('2022-07-01T05:51:31.800Z'),
  },
]);
