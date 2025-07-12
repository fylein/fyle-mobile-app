import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlatformEmployeeSettingsService } from './employee-settings.service';
import { SpenderService } from './spender.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import {
  employeeSettingsData,
  employeeSettingsData2,
  employeeSettingsWoPaymentModes,
} from 'src/app/core/mock-data/employee-settings.data';
import { globalCacheBusterNotifier } from 'ts-cacheable';

describe('PlatformEmployeeSettingsService', () => {
  let service: PlatformEmployeeSettingsService;
  let spenderService: jasmine.SpyObj<SpenderService>;

  beforeEach(() => {
    globalCacheBusterNotifier.next();

    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        PlatformEmployeeSettingsService,
        {
          provide: SpenderService,
          useValue: spenderServiceSpy,
        },
      ],
    });

    service = TestBed.inject(PlatformEmployeeSettingsService);
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should return employee settings when data exists with payment modes', (done) => {
      const mutableEmployeeSettings1 = JSON.parse(JSON.stringify(employeeSettingsData));
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [mutableEmployeeSettings1],
      };

      spenderService.get.and.returnValue(of(mockResponse));

      service.get().subscribe((result) => {
        expect(result).toEqual(mutableEmployeeSettings1);
        expect(spenderService.get).toHaveBeenCalledTimes(1);
        expect(spenderService.get).toHaveBeenCalledWith('/employee_settings', {});
        done();
      });
    });

    it('should return null when no employee settings data exists', (done) => {
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [],
      };

      spenderService.get.and.returnValue(of(mockResponse));

      service.get().subscribe((result) => {
        expect(result).toBeNull();
        expect(spenderService.get).toHaveBeenCalledTimes(1);
        expect(spenderService.get).toHaveBeenCalledWith('/employee_settings', {});
        done();
      });
    });

    it('should return first employee settings when multiple exist', (done) => {
      const mutableEmployeeSettings1 = JSON.parse(JSON.stringify(employeeSettingsData));
      const mutableEmployeeSettings2 = JSON.parse(JSON.stringify(employeeSettingsData2));
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [mutableEmployeeSettings1, mutableEmployeeSettings2],
      };

      spenderService.get.and.returnValue(of(mockResponse));

      service.get().subscribe((result) => {
        expect(result).toEqual(mutableEmployeeSettings1);
        expect(spenderService.get).toHaveBeenCalledTimes(1);
        expect(spenderService.get).toHaveBeenCalledWith('/employee_settings', {});
        done();
      });
    });

    it('should handle employee settings without payment_mode_settings', (done) => {
      const employeeSettingsWithoutPaymentModes = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        payment_mode_settings: undefined,
      };
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithoutPaymentModes],
      };

      spenderService.get.and.returnValue(of(mockResponse));

      service.get().subscribe((result) => {
        expect(result.payment_mode_settings).toBeUndefined();
        expect(spenderService.get).toHaveBeenCalledTimes(1);
        expect(spenderService.get).toHaveBeenCalledWith('/employee_settings', {});
        done();
      });
    });

    it('should handle employee settings with empty allowed_payment_modes', (done) => {
      const employeeSettingsWithEmptyPaymentModes = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        payment_mode_settings: {
          allowed: true,
          enabled: true,
          allowed_payment_modes: [],
        },
      };
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithEmptyPaymentModes],
      };

      spenderService.get.and.returnValue(of(mockResponse));

      service.get().subscribe((result) => {
        expect(result.payment_mode_settings.allowed_payment_modes).toEqual([]);
        expect(spenderService.get).toHaveBeenCalledTimes(1);
        expect(spenderService.get).toHaveBeenCalledWith('/employee_settings', {});
        done();
      });
    });
  });

  describe('post()', () => {
    it('should post employee settings and return the response', (done) => {
      const mutableEmployeeSettings = JSON.parse(JSON.stringify(employeeSettingsData));
      const mockResponse: PlatformApiResponse<EmployeeSettings> = {
        data: mutableEmployeeSettings,
      };

      spenderService.post.and.returnValue(of(mockResponse));

      service.post(mutableEmployeeSettings).subscribe((result) => {
        expect(result).toEqual(mutableEmployeeSettings);
        expect(spenderService.post).toHaveBeenCalledTimes(1);
        expect(spenderService.post).toHaveBeenCalledWith('/employee_settings', {
          data: mutableEmployeeSettings,
        });
        done();
      });
    });

    it('should handle posting different employee settings data', (done) => {
      const mutableEmployeeSettings2 = JSON.parse(JSON.stringify(employeeSettingsData2));
      const mockResponse: PlatformApiResponse<EmployeeSettings> = {
        data: mutableEmployeeSettings2,
      };

      spenderService.post.and.returnValue(of(mockResponse));

      service.post(mutableEmployeeSettings2).subscribe((result) => {
        expect(result).toEqual(mutableEmployeeSettings2);
        expect(spenderService.post).toHaveBeenCalledTimes(1);
        expect(spenderService.post).toHaveBeenCalledWith('/employee_settings', {
          data: mutableEmployeeSettings2,
        });
        done();
      });
    });

    it('should handle posting employee settings with payment modes', (done) => {
      const mutableEmployeeSettingsWoPaymentModes = JSON.parse(JSON.stringify(employeeSettingsWoPaymentModes));
      const mockResponse: PlatformApiResponse<EmployeeSettings> = {
        data: mutableEmployeeSettingsWoPaymentModes,
      };

      spenderService.post.and.returnValue(of(mockResponse));

      service.post(mutableEmployeeSettingsWoPaymentModes).subscribe((result) => {
        expect(result).toEqual(mutableEmployeeSettingsWoPaymentModes);
        expect(spenderService.post).toHaveBeenCalledTimes(1);
        expect(spenderService.post).toHaveBeenCalledWith('/employee_settings', {
          data: mutableEmployeeSettingsWoPaymentModes,
        });
        done();
      });
    });
  });

  describe('clearEmployeeSettings()', () => {
    it('should return null observable', (done) => {
      service.clearEmployeeSettings().subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('getAllowedPaymentModes()', () => {
    it('should return allowed payment modes from employee settings', (done) => {
      const mutableEmployeeSettings = JSON.parse(JSON.stringify(employeeSettingsData));
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [mutableEmployeeSettings],
      };

      spenderService.get.and.returnValue(of(mockResponse));

      service.getAllowedPaymentModes().subscribe((result) => {
        expect(result).toEqual(mutableEmployeeSettings.payment_mode_settings.allowed_payment_modes);
        expect(spenderService.get).toHaveBeenCalledTimes(1);
        expect(spenderService.get).toHaveBeenCalledWith('/employee_settings', {});
        done();
      });
    });

    it('should return payment modes when employee settings has payment modes', (done) => {
      const mutableEmployeeSettingsWoPaymentModes = JSON.parse(JSON.stringify(employeeSettingsWoPaymentModes));
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [mutableEmployeeSettingsWoPaymentModes],
      };

      spenderService.get.and.returnValue(of(mockResponse));

      service.getAllowedPaymentModes().subscribe((result) => {
        expect(result).toEqual(mutableEmployeeSettingsWoPaymentModes.payment_mode_settings.allowed_payment_modes);
        expect(spenderService.get).toHaveBeenCalledTimes(1);
        expect(spenderService.get).toHaveBeenCalledWith('/employee_settings', {});
        done();
      });
    });

    it('should handle employee settings without payment mode settings', (done) => {
      const employeeSettingsWithoutPaymentModes = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        payment_mode_settings: null,
      };

      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithoutPaymentModes],
      };

      spenderService.get.and.returnValue(of(mockResponse));

      service.getAllowedPaymentModes().subscribe((result) => {
        expect(result).toBeUndefined();
        expect(spenderService.get).toHaveBeenCalledTimes(1);
        expect(spenderService.get).toHaveBeenCalledWith('/employee_settings', {});
        done();
      });
    });

    it('should handle employee settings with undefined payment mode settings', (done) => {
      const employeeSettingsWithUndefinedPaymentModes = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        payment_mode_settings: undefined,
      };

      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithUndefinedPaymentModes],
      };

      spenderService.get.and.returnValue(of(mockResponse));

      service.getAllowedPaymentModes().subscribe((result) => {
        expect(result).toBeUndefined();
        expect(spenderService.get).toHaveBeenCalledTimes(1);
        expect(spenderService.get).toHaveBeenCalledWith('/employee_settings', {});
        done();
      });
    });

    it('should handle employee settings with null employee settings', (done) => {
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [],
      };

      spenderService.get.and.returnValue(of(mockResponse));

      service.getAllowedPaymentModes().subscribe((result) => {
        expect(result).toBeUndefined();
        expect(spenderService.get).toHaveBeenCalledTimes(1);
        expect(spenderService.get).toHaveBeenCalledWith('/employee_settings', {});
        done();
      });
    });
  });

  describe('getEmailEvents()', () => {
    it('should return email events object with correct structure', () => {
      const result = service.getEmailEvents();

      expect(result).toBeDefined();
      expect(result.features).toBeDefined();
      expect(result.features.expensesAndReports).toBeDefined();
      expect(result.features.advances).toBeDefined();
      expect(result.expensesAndReports).toBeDefined();
      expect(result.advances).toBeDefined();

      // Check specific events
      expect(result.expensesAndReports.eous_forward_email_to_user).toBeDefined();
      expect(result.expensesAndReports.erpts_submitted).toBeDefined();
      expect(result.expensesAndReports.estatuses_created_txn).toBeDefined();
      expect(result.advances.eadvance_requests_created).toBeDefined();
      expect(result.advances.eadvances_created).toBeDefined();
    });

    it('should return email events with correct text labels', () => {
      const result = service.getEmailEvents();

      expect(result.expensesAndReports.eous_forward_email_to_user.textLabel).toBe(
        'When an expense is created via email'
      );
      expect(result.expensesAndReports.erpts_submitted.textLabel).toBe('On submission of expense report');
      expect(result.expensesAndReports.estatuses_created_txn.textLabel).toBe('When a comment is left on an expense');
      expect(result.advances.eadvance_requests_created.textLabel).toBe('When an advance request is submitted');
      expect(result.advances.eadvances_created.textLabel).toBe('When an advance is assigned');
    });

    it('should return email events with correct default selections', () => {
      const result = service.getEmailEvents();

      // Check that all events have selected: true by default
      expect(result.expensesAndReports.eous_forward_email_to_user.selected).toBeTrue();
      expect(result.expensesAndReports.erpts_submitted.selected).toBeTrue();
      expect(result.expensesAndReports.estatuses_created_txn.selected).toBeTrue();
      expect(result.advances.eadvance_requests_created.selected).toBeTrue();
      expect(result.advances.eadvances_created.selected).toBeTrue();
    });

    it('should return email events with correct email and push settings', () => {
      const result = service.getEmailEvents();

      // Check email and push settings for each event
      expect(result.expensesAndReports.eous_forward_email_to_user.email.selected).toBeTrue();
      expect(result.expensesAndReports.eous_forward_email_to_user.push.selected).toBeTrue();
      expect(result.advances.eadvance_requests_created.email.selected).toBeTrue();
      expect(result.advances.eadvance_requests_created.push.selected).toBeTrue();
    });

    it('should return all required email events', () => {
      const result = service.getEmailEvents();

      // Check expenses and reports events
      expect(result.expensesAndReports.eous_forward_email_to_user).toBeDefined();
      expect(result.expensesAndReports.erpts_submitted).toBeDefined();
      expect(result.expensesAndReports.estatuses_created_txn).toBeDefined();
      expect(result.expensesAndReports.estatuses_created_rpt).toBeDefined();
      expect(result.expensesAndReports.etxns_admin_removed).toBeDefined();
      expect(result.expensesAndReports.etxns_admin_updated).toBeDefined();
      expect(result.expensesAndReports.erpts_inquiry).toBeDefined();
      expect(result.expensesAndReports.erpts_approved).toBeDefined();
      expect(result.expensesAndReports.ereimbursements_completed).toBeDefined();

      // Check advances events
      expect(result.advances.eadvance_requests_created).toBeDefined();
      expect(result.advances.eadvance_requests_updated).toBeDefined();
      expect(result.advances.eadvance_requests_inquiry).toBeDefined();
      expect(result.advances.eadvance_requests_approved).toBeDefined();
      expect(result.advances.eadvances_created).toBeDefined();
    });
  });

  describe('getNotificationEvents()', () => {
    it('should return notification events observable with correct structure', (done) => {
      service.getNotificationEvents().subscribe((result) => {
        expect(result).toBeDefined();
        expect(result.features).toBeDefined();
        expect(result.events).toBeDefined();
        expect(Array.isArray(result.events)).toBeTrue();
        done();
      });
    });

    it('should return notification events with correct features', (done) => {
      service.getNotificationEvents().subscribe((result) => {
        expect(result.features.expensesAndReports).toBeDefined();
        expect(result.features.expensesAndReports.textLabel).toBe('Expenses and reports');
        expect(result.features.expensesAndReports.selected).toBeTrue();

        expect(result.features.advances).toBeDefined();
        expect(result.features.advances.textLabel).toBe('Advances');
        expect(result.features.advances.selected).toBeTrue();
        done();
      });
    });

    it('should return notification events with correct event structure', (done) => {
      service.getNotificationEvents().subscribe((result) => {
        expect(result.events.length).toBeGreaterThan(0);

        // Check that each event has the required properties
        result.events.forEach((event) => {
          expect(event.feature).toBeDefined();
          expect(event.eventType).toBeDefined();
          expect(event.textLabel).toBeDefined();
          expect(event.selected).toBeDefined();
          expect(event.email).toBeDefined();
          expect(event.push).toBeDefined();
        });
        done();
      });
    });

    it('should return notification events with correct feature mapping', (done) => {
      service.getNotificationEvents().subscribe((result) => {
        // Check that events are properly mapped to their features
        const expensesAndReportsEvents = result.events.filter((event) => event.feature === 'expensesAndReports');
        const advancesEvents = result.events.filter((event) => event.feature === 'advances');

        expect(expensesAndReportsEvents.length).toBeGreaterThan(0);
        expect(advancesEvents.length).toBeGreaterThan(0);

        // Check specific event types
        const hasExpenseCreatedEvent = expensesAndReportsEvents.some(
          (event) => event.eventType === 'eous_forward_email_to_user'
        );
        const hasAdvanceCreatedEvent = advancesEvents.some((event) => event.eventType === 'eadvances_created');

        expect(hasExpenseCreatedEvent).toBeTrue();
        expect(hasAdvanceCreatedEvent).toBeTrue();
        done();
      });
    });

    it('should return notification events with correct default values', (done) => {
      service.getNotificationEvents().subscribe((result) => {
        // Check that all events have correct default values
        result.events.forEach((event) => {
          expect(event.selected).toBeTrue();
          expect(event.email.selected).toBeTrue();
          expect(event.push.selected).toBeTrue();
        });
        done();
      });
    });

    it('should return all required notification events', (done) => {
      service.getNotificationEvents().subscribe((result) => {
        // Check that we have events for both features
        const expensesAndReportsEvents = result.events.filter((event) => event.feature === 'expensesAndReports');
        const advancesEvents = result.events.filter((event) => event.feature === 'advances');

        expect(expensesAndReportsEvents.length).toBeGreaterThan(0);
        expect(advancesEvents.length).toBeGreaterThan(0);

        // Check that we have the expected number of events
        expect(result.events.length).toBeGreaterThan(10); // Should have multiple events
        done();
      });
    });
  });
});
