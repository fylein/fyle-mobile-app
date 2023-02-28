import { RecentlyUsed } from '../models/v1/recently_used.model';
import { ExtendedProject } from '../models/v2/extended-project.model';
import { Currency, CurrencyName } from '../models/currency.model';

export const recentlyUsedRes: RecentlyUsed = {
  recent_project_ids: [168826, 247943, 247946],
  recent_org_category_ids: [89469, 129111, 16576, 106680],
  recent_cost_center_ids: [6671, 6725, 89, 2406],
  recent_currencies: ['ARS', 'INR', 'EUR', 'CLP'],
  recent_vehicle_types: ['two_wheeler'],
  recent_start_locations: [
    'MG Road, Halasuru, Yellappa Chetty Layout, Sivanchetti Gardens, Bengaluru, Karnataka, India',
    'MG Road, Yellappa Chetty Layout, Sivanchetti Gardens, Halasuru, Karnataka, India',
    'Chennai, Tamil Nadu, India',
    'mg road',
  ],
  recent_end_locations: [
    '578, 2nd Main Rd, A Block, Milk Colony, Subramanyanagar,2 State, Rajajinagar, Bengaluru, Karnataka 560010, India',
  ],
  recent_locations: [
    'Maya Race - Bar & Restaurant, MG Road, Haridevpur, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka, India',
    'Cafe Coffee Day - Kolar Highway, Narsapura, Karnataka, India',
    '16/10, 16/10, Mariyamman Kovil St, Vagai Nagar, Ramanathapuram, Tamil Nadu 623504, India',
    'mg road race',
  ],
};

export const recentlyUsedProjectRes: ExtendedProject[] = [
  {
    ap1_email: 'john.d@fyle.in',
    ap1_full_name: 'John Doe',
    ap2_email: 'james.d@fyle.in',
    ap2_full_name: 'James Doe',
    project_active: true,
    project_approver1_id: null,
    project_approver2_id: null,
    project_code: '67',
    project_created_at: new Date('2021-03-11T00:12:31.322Z'),
    project_description: 'Quickbooks Online Customer / Project - Abercrombie International Group, Id - 67',
    project_id: 168826,
    project_name: 'Abercrombie International Group',
    project_org_category_ids: [16557, 16558, 16559, 16560, 16561],
    project_org_id: 'orNVthTo2Zyo',
    project_updated_at: new Date('2023-02-22T04:58:55.727Z'),
    projectv2_name: 'Abercrombie International Group',
    sub_project_name: null,
  },
  {
    ap1_email: 'john.d@fyle.in',
    ap1_full_name: 'John Doe',
    ap2_email: 'james.d@fyle.in',
    ap2_full_name: 'James Doe',
    project_active: true,
    project_approver1_id: null,
    project_approver2_id: null,
    project_code: '1251',
    project_created_at: new Date('2021-04-14T01:59:24.553Z'),
    project_description: 'NetSuite Customer / Project - Acera, Id - 1251',
    project_id: 247943,
    project_name: 'Acera',
    project_org_category_ids: [16558, 16559, 16560, 16561, 16562],
    project_org_id: 'orNVthTo2Zyo',
    project_updated_at: new Date('2023-02-22T04:58:55.727Z'),
    projectv2_name: 'Acera',
    sub_project_name: null,
  },

  {
    ap1_email: 'john.d@fyle.in',
    ap1_full_name: 'John Doe',
    ap2_email: 'james.d@fyle.in',
    ap2_full_name: 'James Doe',
    project_active: true,
    project_approver1_id: null,
    project_approver2_id: null,
    project_code: '1009',
    project_created_at: new Date('2021-04-14T01:59:24.553Z'),
    project_description: 'NetSuite Customer / Project - AcuVision Eye Centre, Id - 1009',
    project_id: 247946,
    project_name: 'AcuVision Eye Centre',
    project_org_category_ids: [16557, 16558, 16559, 16560, 16561],
    project_org_id: 'orNVthTo2Zyo',
    project_updated_at: new Date('2023-02-22T04:58:55.727Z'),
    projectv2_name: 'AcuVision Eye Centre',
    sub_project_name: null,
  },
];

export const recentCurrencyRes: Currency[] = [
  {
    shortCode: 'ARS',
    longName: 'Argentine Peso',
  },
  {
    shortCode: 'INR',
    longName: 'Indian Rupee',
  },
  {
    shortCode: 'EUR',
    longName: 'Euro',
  },
  {
    shortCode: 'CLP',
    longName: 'Chilean Peso',
  },
];

export const currencies: CurrencyName = {
  ARS: 'Argentine Peso',
  INR: 'Indian Rupee',
  EUR: 'Euro',
  CLP: 'Chilean Peso',
};

export const recentlyUsedResWithoutCurr = {
  ...recentlyUsedRes,
  recent_currencies: [],
};
