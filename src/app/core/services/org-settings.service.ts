import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Cacheable, CacheBuster } from 'ts-cacheable';

const orgSettingsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class OrgSettingsService {
  constructor(private apiService: ApiService) {}

  @Cacheable({
    cacheBusterObserver: orgSettingsCacheBuster$,
  })
  get() {
    return this.apiService.get('/org/settings').pipe(map((incoming) => this.processIncoming(incoming)));
  }

  @CacheBuster({
    cacheBusterNotifier: orgSettingsCacheBuster$,
  })
  post(settings) {
    const data = this.processOutgoing(settings);
    return this.apiService.post('/org/settings', data);
  }

  getDefaultLimitAmount() {
    const defaultLimitAmount = 75;
    return defaultLimitAmount;
  }

  getIncomingAccountingObject(incomingAccountExport) {
    // setting allowed to true here as this field will be removed within a month
    // TODO: Remove this hack latest by end of April 2020 - If you find this code after the deadline, @arun will buy you petrol
    // Petrol claimed by @Dhar - bike trip to himachal pradesh once corona ends
    const accounting: any = {
      allowed: true,
      enabled: false,
      type: null,
      settings: null,
    };

    if (incomingAccountExport) {
      const quickBooks = incomingAccountExport.quick_books_settings;
      const tally = incomingAccountExport.tally_settings;
      const accountingSettings = incomingAccountExport.accounting_settings;

      if (quickBooks && quickBooks.enabled) {
        accounting.enabled = true;
        accounting.type = 'QUICKBOOKS';
        accounting.settings = quickBooks;

        accounting.settings.collapse_expenses = !!accounting.settings.collapse_expenses; // To make sure this is always true/false
      } else if (tally && tally.enabled) {
        accounting.enabled = true;
        accounting.type = 'TALLY';
        accounting.settings = tally;

        accounting.settings.collapse_expenses = !!accounting.settings.collapse_expenses; // To make sure this is always true/false
        accounting.settings.separate_org_user_advance_ledger = !!accounting.settings.separate_org_user_advance_ledger; // To make sure this is always true/false
      } else if (accountingSettings && accountingSettings.enabled) {
        accounting.enabled = true;
        accounting.type = accountingSettings.export_name;
        accounting.settings = accountingSettings;
      }
    }

    accounting.integration_exports_enabled = incomingAccountExport.integration_exports_enabled;

    return accounting;
  }

  setOutgoingAccountingObject(accounting) {
    const accountingSettings: any = {};

    accountingSettings.allowed = accounting && accounting.allowed;

    if (accounting.type === 'TALLY') {
      accountingSettings.tally_settings = accounting.settings || {};
      accountingSettings.tally_settings.enabled = accounting.enabled;
      accountingSettings.tally_settings.blocked_payment_types = [];
    } else if (accounting.type === 'QUICKBOOKS') {
      accountingSettings.quick_books_settings = accounting.settings || {};
      accountingSettings.quick_books_settings.enabled = accounting.enabled;
    } else {
      accountingSettings.accounting_settings = accounting.settings;
    }

    accountingSettings.integration_exports_enabled = accounting.integration_exports_enabled;

    return accountingSettings;
  }

  // unavoidable here
  // eslint-disable-next-line complexity
  processIncoming(incoming) {
    const orgSettings = {
      org_id: incoming.org_id,
      mileage: {
        allowed: incoming.org_mileage_settings && incoming.org_mileage_settings.allowed,
        enabled: incoming.org_mileage_settings && incoming.org_mileage_settings.enabled,
        location_mandatory: incoming.org_mileage_settings && incoming.org_mileage_settings.mileage_location_enabled,
        unit: incoming.mileage_details && incoming.mileage_details.unit,
        fiscal_year_start_date: incoming.mileage_details && incoming.mileage_details.fiscal_year_start_date,
        fiscal_year_end_date: incoming.mileage_details && incoming.mileage_details.fiscal_year_end_date,
        two_wheeler: incoming.mileage_details && incoming.mileage_details.two_wheeler,
        four_wheeler: incoming.mileage_details && incoming.mileage_details.four_wheeler,
        four_wheeler1: incoming.mileage_details && incoming.mileage_details.four_wheeler1,
        four_wheeler3: incoming.mileage_details && incoming.mileage_details.four_wheeler3,
        four_wheeler4: incoming.mileage_details && incoming.mileage_details.four_wheeler4,
        bicycle: incoming.mileage_details && incoming.mileage_details.bicycle,
        electric_car: incoming.mileage_details && incoming.mileage_details.electric_car,
        two_wheeler_slabbed_rate: incoming.mileage_details && incoming.mileage_details.two_wheeler_slabbed_rate,
        four_wheeler_slabbed_rate: incoming.mileage_details && incoming.mileage_details.four_wheeler_slabbed_rate,
        four_wheeler1_slabbed_rate: incoming.mileage_details && incoming.mileage_details.four_wheeler1_slabbed_rate,
        four_wheeler3_slabbed_rate: incoming.mileage_details && incoming.mileage_details.four_wheeler3_slabbed_rate,
        four_wheeler4_slabbed_rate: incoming.mileage_details && incoming.mileage_details.four_wheeler4_slabbed_rate,
        bicycle_slabbed_rate: incoming.mileage_details && incoming.mileage_details.bicycle_slabbed_rate,
        electric_car_slabbed_rate: incoming.mileage_details && incoming.mileage_details.electric_car_slabbed_rate,
        two_wheeler_distance_limit: incoming.mileage_details && incoming.mileage_details.two_wheeler_distance_limit,
        four_wheeler_distance_limit: incoming.mileage_details && incoming.mileage_details.four_wheeler_distance_limit,
        four_wheeler1_distance_limit: incoming.mileage_details && incoming.mileage_details.four_wheeler1_distance_limit,
        four_wheeler3_distance_limit: incoming.mileage_details && incoming.mileage_details.four_wheeler3_distance_limit,
        four_wheeler4_distance_limit: incoming.mileage_details && incoming.mileage_details.four_wheeler4_distance_limit,
        bicycle_distance_limit: incoming.mileage_details && incoming.mileage_details.bicycle_distance_limit,
        electric_car_distance_limit: incoming.mileage_details && incoming.mileage_details.electric_car_distance_limit,
        enable_individual_mileage_rates:
          incoming.mileage_details && incoming.mileage_details.enable_individual_mileage_rates,
      },
      advances: {
        allowed: incoming.advances_settings && incoming.advances_settings.allowed,
        enabled: incoming.advances_settings && incoming.advances_settings.enabled,
      },
      projects: {
        allowed: incoming.project_settings && incoming.project_settings.allowed,
        enabled: incoming.project_settings && incoming.project_settings.enabled,
      },
      advanced_projects: {
        allowed: incoming.advanced_project_settings && incoming.advanced_project_settings.allowed,
        enabled: incoming.advanced_project_settings && incoming.advanced_project_settings.enabled,
        enable_individual_projects:
          incoming.advanced_project_settings && incoming.advanced_project_settings.enable_individual_projects,
      },
      trip_requests: {
        allowed: incoming.trip_request_settings && incoming.trip_request_settings.allowed,
        enabled: incoming.trip_request_settings && incoming.trip_request_settings.enable_trip_requests,
        enable_for_certain_employee:
          incoming.trip_request_settings &&
          incoming.trip_request_settings.allowed &&
          incoming.trip_request_settings.enable_trip_requests_for_certain_employees,
        enabled_hotel_requests:
          incoming.trip_request_settings &&
          incoming.trip_request_settings.allowed &&
          incoming.trip_request_settings.enable_hotel_requests,
        enabled_transportation_requests:
          incoming.trip_request_settings &&
          incoming.trip_request_settings.allowed &&
          incoming.trip_request_settings.enable_transportation_requests,
      },
      advance_requests: {
        allowed: incoming.advances_settings && incoming.advances_settings.allowed,
        enabled: incoming.advances_settings && incoming.advances_settings.advance_requests_enabled,
      },
      cost_centers: {
        allowed: incoming.org_cost_center_settings && incoming.org_cost_center_settings.allowed,
        enabled: incoming.org_cost_center_settings && incoming.org_cost_center_settings.enabled,
      },
      policies: {
        allowed: incoming.policy_settings && incoming.policy_settings.allowed,
        enabled: incoming.policy_settings && incoming.policy_settings.is_enabled,
        self_serve_enabled:
          incoming.policy_settings &&
          incoming.policy_settings.allowed &&
          incoming.policy_settings.is_self_serve_enabled,
        trip_request_policy_enabled:
          incoming.policy_settings &&
          incoming.policy_settings.allowed &&
          incoming.policy_settings.is_trip_request_policy_enabled,
        advance_request_policy_enabled:
          incoming.policy_settings &&
          incoming.policy_settings.allowed &&
          incoming.policy_settings.is_advance_request_policy_enabled,
        duplicate_detection_enabled:
          incoming.duplicate_detection_settings &&
          incoming.duplicate_detection_settings.allowed &&
          incoming.duplicate_detection_settings.enabled,
      },
      org_creation: {
        allowed: incoming.multi_org_settings && incoming.multi_org_settings.allowed,
        enabled: incoming.multi_org_settings && incoming.multi_org_settings.enabled,
      },
      org_expense_form_autofills: {
        allowed: incoming.org_expense_form_autofills.allowed,
        enabled: incoming.org_expense_form_autofills.enabled,
      },
      admin_allowed_ip_settings: {
        allowed: incoming.admin_allowed_ip_settings && incoming.admin_allowed_ip_settings.allowed,
        enabled: incoming.admin_allowed_ip_settings && incoming.admin_allowed_ip_settings.enabled,
        allowed_cidrs: incoming.admin_allowed_ip_settings && incoming.admin_allowed_ip_settings.allowed_cidrs,
      },
      admin_email_settings: {
        allowed: incoming.admin_email_settings && incoming.admin_email_settings.allowed,
        enabled: incoming.admin_email_settings && incoming.admin_email_settings.enabled,
        unsubscribed_events: incoming.admin_email_settings && incoming.admin_email_settings.unsubscribed_events,
      },
      bank_accounts: incoming.bank_account_settings,
      receipt_settings: incoming.receipt_settings,
      corporate_credit_card_settings: incoming.corporate_credit_card_settings,
      bank_feed_request_settings: incoming.bank_feed_request_settings,
      ach_settings: incoming.ach_settings,
      per_diem: incoming.per_diem_settings,
      access_delegation: incoming.org_access_delegation_settings,
      activity: incoming.activity_settings,
      tax_settings: incoming.tax_settings,
      integrations_settings: incoming.integrations_settings,
      taxi_settings: incoming.taxi_settings,
      expense_limit_settings: incoming.expense_limit_settings,
      approval_settings: {
        allowed: incoming.approval_settings && incoming.approval_settings.allowed,
        admin_approve_own_report:
          incoming.approval_settings &&
          incoming.approval_settings.allowed &&
          incoming.approval_settings.admin_approve_own_report,
        enable_secondary_approvers:
          incoming.approval_settings &&
          incoming.approval_settings.allowed &&
          incoming.approval_settings.enable_secondary_approvers,
        enable_sequential_approvers:
          incoming.approval_settings &&
          incoming.approval_settings.allowed &&
          incoming.approval_settings.enable_sequential_approvers,
        allow_user_add_trip_request_approvers:
          incoming.approval_settings &&
          incoming.approval_settings.allowed &&
          incoming.approval_settings.allow_user_add_trip_request_approvers,
      },
      accounting: this.getIncomingAccountingObject(incoming.accounting_export_settings),
      transaction_fields_settings: incoming.transaction_fields_settings,
      org_user_fields_settings: incoming.org_user_fields_settings,
      advance_request_fields_settings: incoming.advance_request_fields_settings,
      trip_request_fields_settings: incoming.trip_request_fields_settings,
      org_logo_settings: incoming.org_logo_settings,
      org_branding_settings: {
        allowed: incoming.org_branding_settings && incoming.org_branding_settings.allowed,
        enabled: incoming.org_branding_settings && incoming.org_branding_settings.enabled,
      },
      verification: {
        allowed: incoming.verification_settings && incoming.verification_settings.allowed,
        mandatory:
          incoming.verification_settings &&
          incoming.verification_settings.allowed &&
          incoming.verification_settings.mandatory,
        late_mode_enabled:
          incoming.verification_settings &&
          incoming.verification_settings.allowed &&
          incoming.verification_settings.late_mode_enabled,
      },
      data_extraction_settings: incoming.data_extraction_settings,
      data_extractor_settings: incoming.data_extractor_settings,
      advance_account_settings: incoming.advance_account_settings,
      settlements_excel_settings: incoming.settlements_excel_settings,
      bank_payment_file_settings: incoming.bank_payment_file_settings,
      expense_settings: incoming.expense_settings,
      exchange_rate_settings: incoming.exchange_rate_settings,
      currencylayer_provider_settings: {
        allowed: incoming.currencylayer_provider_settings && incoming.currencylayer_provider_settings.allowed,
        enabled: incoming.currencylayer_provider_settings && incoming.currencylayer_provider_settings.enabled,
        id: 'CURRENCYLAYER',
        name: 'Currency Layer',
      },
      fixer_provider_settings: {
        allowed: incoming.fixer_provider_settings && incoming.fixer_provider_settings.allowed,
        enabled: incoming.fixer_provider_settings && incoming.fixer_provider_settings.enabled,
        id: 'FIXER',
        name: 'Fixer',
      },
      openexchangerates_provider_settings: {
        allowed: incoming.openexchangerates_provider_settings && incoming.openexchangerates_provider_settings.allowed,
        enabled: incoming.openexchangerates_provider_settings && incoming.openexchangerates_provider_settings.enabled,
        id: 'OPENEXCHANGERATES',
        name: 'Open Exchange Rates',
      },
      oanda_provider_settings: {
        allowed: incoming.oanda_provider_settings && incoming.oanda_provider_settings.allowed,
        enabled: incoming.oanda_provider_settings && incoming.oanda_provider_settings.enabled,
        id: 'OANDA',
        name: 'Oanda',
      },
      xe_provider_settings: {
        allowed: incoming.xe_provider_settings && incoming.xe_provider_settings.allowed,
        enabled: incoming.xe_provider_settings && incoming.xe_provider_settings.enabled,
        id: 'XE',
        name: 'XE',
      },
      gmail_addon_settings: incoming.gmail_addon_settings,
      duplicate_detection_settings: {
        allowed: incoming.duplicate_detection_settings && incoming.duplicate_detection_settings.allowed,
        enabled: incoming.duplicate_detection_settings && incoming.duplicate_detection_settings.enabled,
      },
      custom_category_settings: {
        allowed: incoming.custom_category_settings && incoming.custom_category_settings.allowed,
        enabled: incoming.custom_category_settings && incoming.custom_category_settings.enabled,
      },
      bulk_fyle_settings: {
        allowed: incoming.org_bulk_fyle_settings && incoming.org_bulk_fyle_settings.allowed,
        enabled: incoming.org_bulk_fyle_settings && incoming.org_bulk_fyle_settings.enabled,
      },
      auto_reminder_settings: {
        allowed: incoming.auto_reminder_settings && incoming.auto_reminder_settings.allowed,
        enabled: incoming.auto_reminder_settings && incoming.auto_reminder_settings.enabled,
      },
      analytics_settings: {
        allowed: incoming.analytics_settings && incoming.analytics_settings.allowed,
        enabled: incoming.analytics_settings && incoming.analytics_settings.enabled,
      },
      advanced_rbac_settings: {
        allowed: incoming.advanced_rbac_settings && incoming.advanced_rbac_settings.allowed,
        enabled: incoming.advanced_rbac_settings && incoming.advanced_rbac_settings.enabled,
      },
      sso_integration_settings: {
        allowed: incoming.sso_integration_settings && incoming.sso_integration_settings.allowed,
        enabled: incoming.sso_integration_settings && incoming.sso_integration_settings.enabled,
        idp_name: incoming.sso_integration_settings && incoming.sso_integration_settings.idp_name,
        meta_data_file_id: incoming.sso_integration_settings && incoming.sso_integration_settings.meta_data_file_id,
      },
      advanced_access_delegation_settings: {
        allowed: incoming.advanced_access_delegation_settings && incoming.advanced_access_delegation_settings.allowed,
        enabled: incoming.advanced_access_delegation_settings && incoming.advanced_access_delegation_settings.enabled,
      },
      dynamic_form_settings: {
        allowed: incoming.dynamic_form_settings && incoming.dynamic_form_settings.allowed,
        enabled: incoming.dynamic_form_settings && incoming.dynamic_form_settings.enabled,
      },
      budget_settings: {
        allowed: incoming.budget_settings && incoming.budget_settings.allowed,
        enabled: incoming.budget_settings && incoming.budget_settings.enabled,
      },
      saved_filters_settings: {
        allowed: incoming.saved_filters_settings && incoming.saved_filters_settings.allowed,
        enabled: incoming.saved_filters_settings && incoming.saved_filters_settings.enabled,
      },
      org_currency_settings: {
        allowed: incoming.org_currency_settings && incoming.org_currency_settings.allowed,
        enabled: incoming.org_currency_settings && incoming.org_currency_settings.enabled,
      },
      recurrences_settings: {
        allowed: incoming.recurrences_settings && incoming.recurrences_settings.allowed,
        enabled: incoming.recurrences_settings && incoming.recurrences_settings.enabled,
      },
      mis_reporting_settings: {
        allowed: incoming.mis_reporting_settings && incoming.mis_reporting_settings.allowed,
        enabled: incoming.mis_reporting_settings && incoming.mis_reporting_settings.enabled,
      },
      risk_score_settings: {
        allowed: incoming.risk_score_settings && incoming.risk_score_settings.allowed,
        enabled: incoming.risk_score_settings && incoming.risk_score_settings.enabled,
      },
      workflow_settings: {
        allowed: incoming.workflow_settings && incoming.workflow_settings.allowed,
        enabled: incoming.workflow_settings && incoming.workflow_settings.enabled,
      },
      org_personal_cards_settings: {
        allowed: incoming.org_personal_cards_settings && incoming.org_personal_cards_settings.allowed,
        enabled: incoming.org_personal_cards_settings && incoming.org_personal_cards_settings.enabled,
      },
      unify_ccce_expenses_settings: {
        allowed: incoming.unify_ccce_expenses_settings && incoming.unify_ccce_expenses_settings.allowed,
        enabled: incoming.unify_ccce_expenses_settings && incoming.unify_ccce_expenses_settings.enabled,
      },
    };

    Object.keys(orgSettings).forEach((settingsType) => {
      const settings = orgSettings[settingsType];
      const isSettingsAnObject = typeof settings === 'object';
      if (settings && isSettingsAnObject && settings.hasOwnProperty('allowed') && settings.hasOwnProperty('enabled')) {
        settings.enabled = settings.allowed && settings.enabled;
        orgSettings[settingsType] = settings;
      }
    });
    return orgSettings;
  }

  processOutgoing(outgoing) {
    return {
      project_settings: {
        allowed: outgoing.projects.allowed,
        enabled: outgoing.projects.enabled,
      },
      advanced_project_settings: {
        allowed: outgoing.advanced_projects.allowed,
        enabled: outgoing.advanced_projects.enabled,
        enable_individual_projects: outgoing.advanced_projects.enable_individual_projects,
      },
      org_cost_center_settings: {
        allowed: outgoing.cost_centers.allowed,
        enabled: outgoing.cost_centers.enabled,
      },
      exchange_rate_settings: {
        allowed: outgoing.exchange_rate_settings.allowed,
        enabled: outgoing.exchange_rate_settings.enabled,
      },
      currencylayer_provider_settings: {
        allowed: outgoing.currencylayer_provider_settings.allowed,
        enabled: outgoing.currencylayer_provider_settings.enabled,
      },
      fixer_provider_settings: {
        allowed: outgoing.fixer_provider_settings.allowed,
        enabled: outgoing.fixer_provider_settings.enabled,
      },
      openexchangerates_provider_settings: {
        allowed: outgoing.openexchangerates_provider_settings.allowed,
        enabled: outgoing.openexchangerates_provider_settings.enabled,
      },
      oanda_provider_settings: {
        allowed: outgoing.oanda_provider_settings.allowed,
        enabled: outgoing.oanda_provider_settings.enabled,
      },
      xe_provider_settings: {
        allowed: outgoing.xe_provider_settings.allowed,
        enabled: outgoing.xe_provider_settings.enabled,
      },
      trip_request_settings: {
        allowed: outgoing.trip_requests.allowed,
        enable_trip_requests: outgoing.trip_requests.enabled,
        enable_trip_requests_for_certain_employees: outgoing.trip_requests.enable_for_certain_employee,
        enable_hotel_requests: outgoing.trip_requests.enabled_hotel_requests,
        enable_transportation_requests: outgoing.trip_requests.enabled_transportation_requests,
      },
      advances_settings: {
        allowed: outgoing.advances.allowed,
        enabled: outgoing.advances.enabled,
        advance_requests_enabled: outgoing.advance_requests.enabled,
      },
      org_mileage_settings: {
        allowed: outgoing.mileage.allowed,
        enabled: outgoing.mileage.enabled,
        mileage_location_enabled: outgoing.mileage.location_mandatory,
      },
      org_expense_form_autofills: {
        allowed: outgoing.org_expense_form_autofills.allowed,
        enabled: outgoing.org_expense_form_autofills.enabled,
      },
      multi_org_settings: {
        allowed: outgoing.org_creation.allowed,
        enabled: outgoing.org_creation.enabled,
      },
      admin_allowed_ip_settings: {
        allowed: outgoing.admin_allowed_ip_settings.allowed,
        enabled: outgoing.admin_allowed_ip_settings.enabled,
        allowed_cidrs: outgoing.admin_allowed_ip_settings.allowed_cidrs,
      },
      admin_email_settings: {
        allowed: outgoing.admin_email_settings.allowed,
        enabled: outgoing.admin_email_settings.enabled,
        unsubscribed_events: outgoing.admin_email_settings.unsubscribed_events,
      },
      org_access_delegation_settings: outgoing.access_delegation,
      bank_account_settings: outgoing.bank_accounts,
      per_diem_settings: outgoing.per_diem,
      mileage_details: {
        unit: outgoing.mileage.unit,
        fiscal_year_start_date: outgoing.mileage.fiscal_year_start_date,
        fiscal_year_end_date: outgoing.mileage.fiscal_year_end_date,
        two_wheeler: outgoing.mileage.two_wheeler,
        four_wheeler: outgoing.mileage.four_wheeler,
        four_wheeler1: outgoing.mileage.four_wheeler1,
        four_wheeler3: outgoing.mileage.four_wheeler3,
        four_wheeler4: outgoing.mileage.four_wheeler4,
        bicycle: outgoing.mileage.bicycle,
        electric_car: outgoing.mileage.electric_car,
        two_wheeler_slabbed_rate: outgoing.mileage.two_wheeler_slabbed_rate,
        four_wheeler_slabbed_rate: outgoing.mileage.four_wheeler_slabbed_rate,
        four_wheeler1_slabbed_rate: outgoing.mileage.four_wheeler1_slabbed_rate,
        four_wheeler3_slabbed_rate: outgoing.mileage.four_wheeler3_slabbed_rate,
        four_wheeler4_slabbed_rate: outgoing.mileage.four_wheeler4_slabbed_rate,
        bicycle_slabbed_rate: outgoing.mileage.bicycle_slabbed_rate,
        electric_car_slabbed_rate: outgoing.mileage.electric_car_slabbed_rate,
        two_wheeler_distance_limit: outgoing.mileage.two_wheeler_distance_limit,
        four_wheeler_distance_limit: outgoing.mileage.four_wheeler_distance_limit,
        four_wheeler1_distance_limit: outgoing.mileage.four_wheeler1_distance_limit,
        four_wheeler3_distance_limit: outgoing.mileage.four_wheeler3_distance_limit,
        four_wheeler4_distance_limit: outgoing.mileage.four_wheeler4_distance_limit,
        bicycle_distance_limit: outgoing.mileage.bicycle_distance_limit,
        electric_car_distance_limit: outgoing.mileage.electric_car_distance_limit,
        vehicle_type_for_rate_slabs: outgoing.mileage.vehicle_type_for_rate_slabs,
        location_mandatory: outgoing.mileage.location_mandatory,
        enable_individual_mileage_rates: outgoing.mileage.enable_individual_mileage_rates,
      },
      tax_settings: outgoing.tax_settings,
      receipt_settings: outgoing.receipt_settings,
      corporate_credit_card_settings: outgoing.corporate_credit_card_settings,
      bank_feed_request_settings: outgoing.bank_feed_request_settings,
      ach_settings: outgoing.ach_settings,
      taxi_settings: outgoing.taxi_settings,
      integrations_settings: outgoing.integrations_settings,
      approval_settings: outgoing.approval_settings,
      accounting_export_settings: this.setOutgoingAccountingObject(outgoing.accounting),
      transaction_fields_settings: outgoing.transaction_fields_settings,
      org_user_fields_settings: outgoing.org_user_fields_settings,
      advance_request_fields_settings: outgoing.advance_request_fields_settings,
      trip_request_fields_settings: outgoing.trip_request_fields_settings,
      org_logo_settings: outgoing.org_logo_settings,
      org_branding_settings: outgoing.org_branding_settings,
      advance_account_settings: outgoing.advance_account_settings,
      verification_settings: outgoing.verification,
      bank_payment_file_settings: outgoing.bank_payment_file_settings,
      expense_settings: outgoing.expense_settings,
      gmail_addon_settings: outgoing.gmail_addon_settings,
      duplicate_detection_settings: outgoing.duplicate_detection_settings,
      custom_category_settings: outgoing.custom_category_settings,
      org_bulk_fyle_settings: outgoing.bulk_fyle_settings,
      auto_reminder_settings: outgoing.auto_reminder_settings,
      analytics_settings: outgoing.analytics_settings,
      advanced_rbac_settings: outgoing.advanced_rbac_settings,
      sso_integration_settings: outgoing.sso_integration_settings,
      advanced_access_delegation_settings: outgoing.advanced_access_delegation_settings,
      dynamic_form_settings: outgoing.dynamic_form_settings,
      budget_settings: outgoing.budget_settings,
      org_currency_settings: outgoing.org_currency_settings,
      expense_limit_settings: outgoing.expense_limit_settings,
      recurrences_settings: outgoing.recurrences_settings,
      workflow_settings: outgoing.workflow_settings,
      unify_ccce_expenses_settings: outgoing.unify_ccce_expenses_settings,
    };
  }
}
