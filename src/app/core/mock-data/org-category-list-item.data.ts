import { OrgCategoryListItem } from '../models/v1/org-category.model';
import { expectedOrgCategoriesPaginated } from './org-category.data';

export const categorieListRes: OrgCategoryListItem[] = [
  {
    label: 'Accounts Payable - Employees',
    value: expectedOrgCategoriesPaginated[0],
  },
  {
    label: 'Capitalized Software Costs',
    value: expectedOrgCategoriesPaginated[1],
  },
  {
    label: 'COGS-Billable Hours',
    value: expectedOrgCategoriesPaginated[2],
  },
  {
    label: 'samp category',
    value: expectedOrgCategoriesPaginated[3],
  },
];

export const recentUsedCategoriesRes: OrgCategoryListItem[] = [
  {
    label: 'Office Supplies',
    value: {
      code: null,
      created_at: new Date('2020-03-04T09:51:01.619958+00:00'),
      displayName: 'Office supplies',
      enabled: true,
      fyle_category: 'Mail',
      id: 89469,
      name: 'Office Supplies',
      org_id: 'orNVthTo2Zyo',
      sub_category: 'Office supplies',
      updated_at: new Date('2022-11-23T13:11:51.771676+00:00'),
    },
  },
  {
    label: 'Accm.Depr. Furniture & Fixtures',
    value: {
      code: '15510',
      created_at: new Date('2021-03-14T06:07:39.652664+00:00'),
      displayName: 'Accm.Depr. Furniture & Fixtures',
      enabled: true,
      fyle_category: null,
      id: 129111,
      name: 'Accm.Depr. Furniture & Fixtures',
      org_id: 'orNVthTo2Zyo',
      sub_category: 'Accm.Depr. Furniture & Fixtures',
      updated_at: new Date('2022-05-05T17:45:11.742874+00:00'),
    },
  },
  {
    label: 'Flight',
    value: {
      code: null,
      created_at: new Date('2018-01-31T23:50:27.268007+00:00'),
      displayName: 'Flight',
      enabled: true,
      fyle_category: 'Airlines',
      id: 16576,
      name: 'Flight',
      org_id: 'orNVthTo2Zyo',
      sub_category: 'Flight',
      updated_at: new Date('2022-11-23T13:11:51.771676+00:00'),
    },
  },
];

export const orgCategoryListItemData1 = [
  {
    label: 'Business',
    value: {
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
  },
  {
    label: 'Marketing outreach',
    value: {
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
  },
  {
    label: 'Pager',
    value: {
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
  },
  {
    label: 'samp category',
    value: {
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
  },
];
