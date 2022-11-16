import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EmailEvents, OrgSettings } from '../models/org-settings.model';
import { ApiService } from './api.service';

import { OrgSettingsService } from './org-settings.service';

const apiResponse: OrgSettings = {
  org_id: 'orNVthTo2Zyo',
  mileage: {
    allowed: true,
    enabled: true,
    location_mandatory: false,
    unit: 'KM',
    fiscal_year_start_date: '05-2',
    fiscal_year_end_date: '05-1',
    two_wheeler: 221,
    four_wheeler: 11,
    four_wheeler1: 89,
    four_wheeler3: 12,
    four_wheeler4: 14,
    bicycle: null,
    electric_car: 15.001,
    two_wheeler_slabbed_rate: 0.92,
    four_wheeler_slabbed_rate: 1000,
    four_wheeler1_slabbed_rate: 12,
    four_wheeler3_slabbed_rate: 11,
    four_wheeler4_slabbed_rate: 122,
    bicycle_slabbed_rate: null,
    electric_car_slabbed_rate: null,
    two_wheeler_distance_limit: 10,
    four_wheeler_distance_limit: 2000,
    four_wheeler1_distance_limit: 12212,
    four_wheeler3_distance_limit: 111111,
    four_wheeler4_distance_limit: 22,
    bicycle_distance_limit: null,
    electric_car_distance_limit: null,
    enable_individual_mileage_rates: false,
  },
  advances: {
    allowed: true,
    enabled: false,
  },
  projects: {
    allowed: true,
    enabled: false,
  },
  advanced_projects: {
    allowed: true,
    enabled: true,
    enable_individual_projects: false,
  },
  advance_requests: {
    allowed: true,
    enabled: true,
  },
  cost_centers: {
    allowed: true,
    enabled: true,
  },
  policies: {
    allowed: true,
    enabled: true,
    self_serve_enabled: true,
    advance_request_policy_enabled: true,
    duplicate_detection_enabled: true,
  },
  org_creation: {
    allowed: true,
    enabled: true,
  },
  org_expense_form_autofills: {
    allowed: true,
    enabled: true,
  },
  admin_allowed_ip_settings: {
    allowed: true,
    enabled: false,
    allowed_cidrs: [],
  },
  admin_email_settings: {
    allowed: true,
    enabled: true,
    unsubscribed_events: [EmailEvents.ERPTS_SUBMITTED],
  },
  receipt_settings: {
    enabled: false,
    allowed: true,
    enable_magnifier: true,
  },
  corporate_credit_card_settings: {
    allowed: true,
    enabled: true,
    bank_statement_upload_settings: {
      enabled: true,
      generic_statement_parser_enabled: true,
      bank_statement_parser_endpoint_settings: [],
    },
    bank_data_aggregation_settings: {
      enabled: false,
      aggregator: null,
      auto_assign: null,
    },
    auto_match_allowed: true,
    enable_auto_match: true,
    allow_approved_plus_states: true,
  },
  bank_feed_request_settings: {
    allowed: true,
    enabled: true,
    bank_name: 'asdf',
    card_provider: 'asdfasdf',
    number_of_cards: 32,
    status: 'SUCCESS',
    last_updated_at: '2022-04-04T00:00:00.000Z',
    secret_key: 'bank-feed-request22XwcjgnSH',
  },
  ach_settings: {
    enabled: true,
    allowed: true,
    provider: 'dwolla',
    expedite_source: false,
    expedite_destination: false,
    pipeline_amount_limit: null,
  },
  per_diem: {
    allowed: true,
    enabled: true,
    enable_individual_per_diem_rates: true,
  },
  access_delegation: {
    allowed: true,
    enabled: true,
  },
  tax_settings: {
    allowed: true,
    enabled: true,
    name: 'Tax Amount',
    groups: [
      {
        name: 'sdds',
        percentage: 0.01,
      },
      {
        name: 'Services Standard Purchase',
        percentage: 0.2,
      },
      {
        name: 'GST',
        percentage: 0.05,
      },
      {
        name: 'Services Standard Purchase (20%)',
        percentage: 0.2,
      },
      {
        name: 'This is a very long tax group',
        percentage: 0.01,
      },
      {
        name: 'Tax group name',
        percentage: 0.02,
      },
    ],
  },
  integrations_settings: {
    allowed: false,
    enabled: false,
    integrations: [],
  },
  taxi_settings: {
    allowed: true,
    distance_mandatory: false,
  },
  expense_limit_settings: {
    policy_ids: ['tpr0QmbaymHDz', 'tprG2mAS2ec16', 'tprdM5DcCNsZD'],
  },
  approval_settings: {
    allowed: true,
    admin_approve_own_report: true,
    enable_secondary_approvers: true,
    enable_sequential_approvers: true,
  },
  accounting: {
    allowed: true,
    enabled: false,
    type: null,
    settings: null,
    integration_exports_enabled: false,
  },
  transaction_fields_settings: {
    allowed: true,
    enabled: true,
    transaction_mandatory_fields: {
      category: true,
      purpose: null,
      vendor: null,
      project: false,
      cost_center: null,
      flight_travel_class: null,
      train_travel_class: null,
      hotel_city: null,
      hotel_check_in: null,
      hotel_check_out: null,
    },
  },
  org_user_fields_settings: {
    allowed: true,
    enabled: true,
    org_user_mandatory_fields: {
      employee_id: false,
      title: false,
      level: null,
      business_unit: false,
      department: null,
      sub_department: null,
      mobile: null,
      location: null,
      bank_details: true,
      approver1: false,
      approver2: false,
      approver3: false,
      joining_dt: true,
    },
  },
  advance_request_fields_settings: {
    allowed: true,
    enabled: true,
    advance_request_mandatory_fields: null,
  },
  org_logo_settings: {
    allowed: true,
    enabled: true,
    file_id: null,
  },
  org_branding_settings: {
    allowed: true,
    enabled: true,
  },
  verification: {
    allowed: true,
    mandatory: true,
    late_mode_enabled: false,
  },
  data_extractor_settings: {
    allowed: true,
    enabled: true,
    web_app_pdf: null,
  },
  advance_account_settings: {
    allowed: true,
    multiple_accounts: true,
  },
  settlements_excel_settings: {
    allowed: true,
    cost_center_wise_split: false,
  },
  bank_payment_file_settings: {
    allowed: true,
    enabled: false,
  },
  expense_settings: {
    allowed: true,
    split_expense_settings: {
      enabled: false,
    },
  },
  exchange_rate_settings: {
    allowed: true,
    enabled: true,
  },
  currencylayer_provider_settings: {
    allowed: true,
    enabled: true,
    id: 'CURRENCYLAYER',
    name: 'Currency Layer',
  },
  gmail_addon_settings: {
    allowed: false,
    enabled: false,
  },
  duplicate_detection_settings: {
    allowed: true,
    enabled: true,
  },
  custom_category_settings: {
    allowed: true,
    enabled: true,
  },
  bulk_fyle_settings: {
    allowed: true,
    enabled: true,
  },
  auto_reminder_settings: {
    allowed: true,
    enabled: true,
  },
  analytics_settings: {
    allowed: true,
    enabled: true,
  },
  advanced_rbac_settings: {
    allowed: true,
    enabled: true,
  },
  sso_integration_settings: {
    allowed: false,
    enabled: false,
    idp_name: null,
    meta_data_file_id: null,
    email_regex: null,
  },
  advanced_access_delegation_settings: {
    allowed: true,
    enabled: true,
  },
  dynamic_form_settings: {
    allowed: true,
    enabled: true,
  },
  budget_settings: {
    allowed: true,
    enabled: true,
  },
  saved_filters_settings: {
    allowed: true,
    enabled: true,
  },
  org_currency_settings: {
    allowed: true,
    enabled: true,
  },
  recurrences_settings: {
    allowed: true,
    enabled: true,
  },
  mis_reporting_settings: {
    allowed: true,
    enabled: true,
  },
  risk_score_settings: {
    allowed: false,
    enabled: false,
  },
  workflow_settings: {
    allowed: true,
    enabled: true,
  },
  org_personal_cards_settings: {
    allowed: true,
    enabled: false,
  },
  unify_ccce_expenses_settings: {
    allowed: true,
    enabled: true,
  },
  ccc_draft_expense_settings: {
    allowed: true,
    enabled: true,
  },
  expense_widget_settings: {
    allowed: true,
    enabled: true,
  },
  payment_mode_settings: {
    allowed: null,
    enabled: null,
    payment_modes_order: null,
  },
  activity: {
    allowed: null,
    enabled: null,
    keys: null,
  },
  advanced_project_settings: {
    allowed: null,
    enabled: null,
    enable_individual_projects: null,
  },
};

describe('OrgSettingsService', () => {
  let orgSettingsService: OrgSettingsService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        OrgSettingsService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
      ],
    });
    orgSettingsService = TestBed.inject(OrgSettingsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(orgSettingsService).toBeTruthy();
  });

  it('should be able to fetch the org settings', (done) => {
    apiService.get.and.returnValue(of(apiResponse));
    orgSettingsService.get().subscribe((res) => {
      expect(res).toBeTruthy(apiResponse);
      done();
    });
  });
});
