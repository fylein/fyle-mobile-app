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
