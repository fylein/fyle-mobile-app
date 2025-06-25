import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlatformEmployeeSettingsService } from './employee-settings.service';
import { ApproverService } from './approver.service';
import { CostCentersService } from 'src/app/core/services/cost-centers.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { employeeSettingsData, employeeSettingsData2 } from 'src/app/core/mock-data/employee-settings.data';
import { costCentersData, costCentersData2 } from 'src/app/core/mock-data/cost-centers.data';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import { AccountType } from 'src/app/core/enums/account-type.enum';

describe('PlatformEmployeeSettingsService', () => {
  let service: PlatformEmployeeSettingsService;
  let approverService: jasmine.SpyObj<ApproverService>;
  let costCentersService: jasmine.SpyObj<CostCentersService>;

  beforeEach(() => {
    globalCacheBusterNotifier.next();

    const approverServiceSpy = jasmine.createSpyObj('ApproverService', ['get']);
    const costCentersServiceSpy = jasmine.createSpyObj('CostCentersService', ['getAllActive']);

    TestBed.configureTestingModule({
      providers: [
        PlatformEmployeeSettingsService,
        {
          provide: ApproverService,
          useValue: approverServiceSpy,
        },
        {
          provide: CostCentersService,
          useValue: costCentersServiceSpy,
        },
      ],
    });

    service = TestBed.inject(PlatformEmployeeSettingsService);
    approverService = TestBed.inject(ApproverService) as jasmine.SpyObj<ApproverService>;
    costCentersService = TestBed.inject(CostCentersService) as jasmine.SpyObj<CostCentersService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getByEmployeeId()', () => {
    const testEmployeeId = 'test-employee-id';

    it('should return employee settings when data exists', (done) => {
      const mutableEmployeeSettings = JSON.parse(JSON.stringify(employeeSettingsData));
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [mutableEmployeeSettings],
      };

      approverService.get.and.returnValue(of(mockResponse));

      service.getByEmployeeId(testEmployeeId).subscribe((result) => {
        const expectedResult = {
          ...mutableEmployeeSettings,
          default_payment_mode:
            mutableEmployeeSettings.default_payment_mode === AccountType.PERSONAL_ACCOUNT
              ? AccountType.PERSONAL
              : mutableEmployeeSettings.default_payment_mode,
          payment_mode_settings: mutableEmployeeSettings.payment_mode_settings
            ? {
                ...mutableEmployeeSettings.payment_mode_settings,
                allowed_payment_modes: mutableEmployeeSettings.payment_mode_settings.allowed_payment_modes?.map(
                  (mode) => {
                    return mode === AccountType.PERSONAL_ACCOUNT ? AccountType.PERSONAL : mode;
                  }
                ),
              }
            : mutableEmployeeSettings.payment_mode_settings,
        };

        expect(result).toEqual(expectedResult);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        done();
      });
    });

    it('should return null when no employee settings data exists', (done) => {
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [],
      };

      approverService.get.and.returnValue(of(mockResponse));

      service.getByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result).toBeNull();
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        done();
      });
    });

    it('should return first employee settings when multiple exist', (done) => {
      const mutableEmployeeSettings1 = JSON.parse(JSON.stringify(employeeSettingsData));
      const mutableEmployeeSettings2 = JSON.parse(JSON.stringify(employeeSettingsData2));
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [mutableEmployeeSettings1, mutableEmployeeSettings2],
      };

      approverService.get.and.returnValue(of(mockResponse));

      service.getByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result).toEqual(mutableEmployeeSettings1);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        done();
      });
    });

    it('should handle different employee IDs', (done) => {
      const differentEmployeeId = 'different-employee-id';
      const mutableEmployeeSettings = JSON.parse(JSON.stringify(employeeSettingsData2));
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [mutableEmployeeSettings],
      };

      approverService.get.and.returnValue(of(mockResponse));

      service.getByEmployeeId(differentEmployeeId).subscribe((result) => {
        expect(result).toEqual(mutableEmployeeSettings);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: differentEmployeeId },
        });
        done();
      });
    });

    it('should map PERSONAL_ACCOUNT to PERSONAL in default_payment_mode', (done) => {
      const employeeSettingsWithPersonalAccount = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        default_payment_mode: AccountType.PERSONAL_ACCOUNT,
      };
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithPersonalAccount],
      };

      approverService.get.and.returnValue(of(mockResponse));

      service.getByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result.default_payment_mode).toBe(AccountType.PERSONAL);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        done();
      });
    });

    it('should map PERSONAL_ACCOUNT to PERSONAL in allowed_payment_modes', (done) => {
      const employeeSettingsWithPersonalAccountModes = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        payment_mode_settings: {
          allowed_payment_modes: [AccountType.PERSONAL_ACCOUNT, AccountType.COMPANY],
        },
      };
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithPersonalAccountModes],
      };

      approverService.get.and.returnValue(of(mockResponse));

      service.getByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result.payment_mode_settings.allowed_payment_modes).toEqual([AccountType.PERSONAL, AccountType.COMPANY]);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
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

      approverService.get.and.returnValue(of(mockResponse));

      service.getByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result.payment_mode_settings).toBeUndefined();
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        done();
      });
    });

    it('should handle employee settings with empty allowed_payment_modes', (done) => {
      const employeeSettingsWithEmptyPaymentModes = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        payment_mode_settings: {
          allowed_payment_modes: [],
        },
      };
      const mockResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithEmptyPaymentModes],
      };

      approverService.get.and.returnValue(of(mockResponse));

      service.getByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result.payment_mode_settings.allowed_payment_modes).toEqual([]);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        done();
      });
    });
  });

  describe('getAllowedCostCentersByEmployeeId()', () => {
    const testEmployeeId = 'test-employee-id';

    it('should return filtered cost centers when employee has cost center IDs', (done) => {
      const mutableEmployeeSettings = JSON.parse(JSON.stringify(employeeSettingsData));
      const mockEmployeeSettingsResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [mutableEmployeeSettings],
      };

      approverService.get.and.returnValue(of(mockEmployeeSettingsResponse));
      costCentersService.getAllActive.and.returnValue(of(costCentersData));

      // Filter cost centers based on employee settings cost_center_ids (service converts costCenter.id to string)
      const expectedCostCenters = costCentersData.filter((costCenter) =>
        mutableEmployeeSettings.cost_center_ids.includes(costCenter.id.toString())
      );

      service.getAllowedCostCentersByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result).toEqual(expectedCostCenters);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(1);
        expect(costCentersService.getAllActive).toHaveBeenCalledWith();
        done();
      });
    });

    it('should return empty array when employee has no cost center IDs', (done) => {
      const employeeSettingsWithoutCostCenters = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        cost_center_ids: [],
      };

      const mockEmployeeSettingsResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithoutCostCenters],
      };

      approverService.get.and.returnValue(of(mockEmployeeSettingsResponse));
      costCentersService.getAllActive.and.returnValue(of(costCentersData));

      service.getAllowedCostCentersByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result).toEqual([]);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(0);
        done();
      });
    });

    it('should return empty array when employee settings is null', (done) => {
      const mockEmployeeSettingsResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [],
      };

      approverService.get.and.returnValue(of(mockEmployeeSettingsResponse));
      costCentersService.getAllActive.and.returnValue(of(costCentersData));

      service.getAllowedCostCentersByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result).toEqual([]);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(0);
        done();
      });
    });

    it('should return empty array when employee settings has null cost center IDs', (done) => {
      const employeeSettingsWithNullCostCenters = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        cost_center_ids: null,
      };

      const mockEmployeeSettingsResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithNullCostCenters],
      };

      approverService.get.and.returnValue(of(mockEmployeeSettingsResponse));
      costCentersService.getAllActive.and.returnValue(of(costCentersData));

      service.getAllowedCostCentersByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result).toEqual([]);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(0);
        done();
      });
    });

    it('should filter cost centers correctly when some IDs match', (done) => {
      const employeeSettingsWithSpecificCostCenters = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        cost_center_ids: ['2411', '2428'], // Only these two IDs from costCentersData (as strings)
      };

      const mockEmployeeSettingsResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithSpecificCostCenters],
      };

      approverService.get.and.returnValue(of(mockEmployeeSettingsResponse));
      costCentersService.getAllActive.and.returnValue(of(costCentersData));

      const expectedCostCenters = costCentersData.filter((costCenter) =>
        ['2411', '2428'].includes(costCenter.id.toString())
      );

      service.getAllowedCostCentersByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result).toEqual(expectedCostCenters);
        expect(result.length).toBe(2);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(1);
        expect(costCentersService.getAllActive).toHaveBeenCalledWith();
        done();
      });
    });

    it('should handle different cost centers data', (done) => {
      const mutableEmployeeSettings = JSON.parse(JSON.stringify(employeeSettingsData2));
      const mockEmployeeSettingsResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [mutableEmployeeSettings],
      };

      approverService.get.and.returnValue(of(mockEmployeeSettingsResponse));
      costCentersService.getAllActive.and.returnValue(of(costCentersData2));

      const expectedCostCenters = costCentersData2.filter((costCenter) =>
        mutableEmployeeSettings.cost_center_ids.includes(costCenter.id.toString())
      );

      service.getAllowedCostCentersByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result).toEqual(expectedCostCenters);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(1);
        expect(costCentersService.getAllActive).toHaveBeenCalledWith();
        done();
      });
    });

    it('should handle employee settings with undefined cost center IDs', (done) => {
      const employeeSettingsWithUndefinedCostCenters = {
        ...JSON.parse(JSON.stringify(employeeSettingsData)),
        cost_center_ids: undefined,
      };

      const mockEmployeeSettingsResponse: PlatformApiResponse<EmployeeSettings[]> = {
        data: [employeeSettingsWithUndefinedCostCenters],
      };

      approverService.get.and.returnValue(of(mockEmployeeSettingsResponse));
      costCentersService.getAllActive.and.returnValue(of(costCentersData));

      service.getAllowedCostCentersByEmployeeId(testEmployeeId).subscribe((result) => {
        expect(result).toEqual([]);
        expect(approverService.get).toHaveBeenCalledTimes(1);
        expect(approverService.get).toHaveBeenCalledWith('/employee_settings', {
          params: { employee_id: testEmployeeId },
        });
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(0);
        done();
      });
    });
  });
});
