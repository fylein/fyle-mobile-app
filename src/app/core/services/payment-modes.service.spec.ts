import { TestBed } from '@angular/core/testing';
import { PaymentModesService } from './payment-modes.service';
import { AccountsService } from './accounts.service';
import { PlatformEmployeeSettingsService } from './platform/v1/spender/employee-settings.service';
import { TrackingService } from './tracking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from './snackbar-properties.service';
import { of } from 'rxjs';
import { orgSettingsRes, orgSettingsParamWoCCC } from '../mock-data/org-settings.data';
import {
  multiplePaymentModesData,
  multiplePaymentModesWithCompanyAccData,
} from '../test-data/accounts.service.spec.data';
import { AccountType } from '../enums/account-type.enum';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import {
  cccAndPaidByCompanyPaymentModeSettingsParam,
  cccAndReimbursablePaymentModeSettingsParam,
  cccOnlyPaymentModeSettingsParam,
  reimbursableOnlyPaymentModeSettingsParam,
} from '../mock-data/org-payment-mode-settings.data';
import { AllowedPaymentModes } from '../models/allowed-payment-modes.enum';
import {
  employeeSettingsData,
  employeeSettingsWoPaymentModes,
  employeeSettingsWoPayModesCompany,
} from '../mock-data/employee-settings.data';
import { TranslocoService } from '@jsverse/transloco';
describe('PaymentModesService', () => {
  let paymentModesService: PaymentModesService;
  let accountService: jasmine.SpyObj<AccountsService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarPropertiesService: jasmine.SpyObj<SnackbarPropertiesService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['setAccountProperties']);
    const platformEmployeeSettingsSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', [
      'get',
      'getAllowedPaymentModes',
    ]);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['showToastMessage']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.paymentModes.insufficientBalance':
          'Insufficient balance in the selected account. Please choose a different payment mode.',
        'services.paymentModes.personalAdvances': 'Personal Advances',
        'services.paymentModes.corporateCreditCard': 'Corporate Credit Card',
        'services.paymentModes.personalCashCard': 'Personal Cash/Card',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        AccountsService,
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: AccountsService,
          useValue: accountServiceSpy,
        },
        {
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    paymentModesService = TestBed.inject(PaymentModesService);
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    accountService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService,
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    snackbarPropertiesService = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(paymentModesService).toBeTruthy();
  });

  it('checkIfPaymentModeConfigurationsIsEnabled(): should check if payment mode is enabled', (done) => {
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));

    paymentModesService.checkIfPaymentModeConfigurationsIsEnabled().subscribe((res) => {
      expect(res).toEqual(
        employeeSettingsData.payment_mode_settings.allowed && employeeSettingsData.payment_mode_settings.enabled,
      );
      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getDefaultAccount():', () => {
    it('should get default account with payment modes enabled', (done) => {
      platformEmployeeSettingsService.getAllowedPaymentModes.and.returnValue(
        of(employeeSettingsData.payment_mode_settings.allowed_payment_modes),
      );
      spyOn(paymentModesService, 'checkIfPaymentModeConfigurationsIsEnabled').and.returnValue(
        of(employeeSettingsData.payment_mode_settings.allowed && employeeSettingsData.payment_mode_settings.enabled),
      );

      paymentModesService
        .getDefaultAccount(orgSettingsRes, multiplePaymentModesData, employeeSettingsData)
        .subscribe((res) => {
          expect(res).toBeUndefined();
          expect(platformEmployeeSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(accountService.setAccountProperties).toHaveBeenCalledOnceWith(
            multiplePaymentModesData[0],
            AccountType.PERSONAL,
            false,
          );
          done();
        });
    });

    it('should get default account without payment modes enabled', (done) => {
      platformEmployeeSettingsService.getAllowedPaymentModes.and.returnValue(
        of(employeeSettingsWoPaymentModes.payment_mode_settings.allowed_payment_modes),
      );
      spyOn(paymentModesService, 'checkIfPaymentModeConfigurationsIsEnabled').and.returnValue(
        of(
          employeeSettingsWoPaymentModes.payment_mode_settings.allowed &&
            employeeSettingsData.payment_mode_settings.enabled,
        ),
      );

      paymentModesService
        .getDefaultAccount(orgSettingsRes, multiplePaymentModesWithCompanyAccData, employeeSettingsWoPaymentModes)
        .subscribe((res) => {
          expect(res).toBeUndefined();
          expect(platformEmployeeSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(accountService.setAccountProperties).toHaveBeenCalledOnceWith(
            multiplePaymentModesWithCompanyAccData[0],
            AccountType.CCC,
            false,
          );
          done();
        });
    });

    it('should get default account without payment modes enabled and preference to COMPANY', (done) => {
      platformEmployeeSettingsService.getAllowedPaymentModes.and.returnValue(
        of(employeeSettingsWoPayModesCompany.payment_mode_settings.allowed_payment_modes),
      );
      spyOn(paymentModesService, 'checkIfPaymentModeConfigurationsIsEnabled').and.returnValue(of(false));

      paymentModesService
        .getDefaultAccount(orgSettingsRes, multiplePaymentModesData, employeeSettingsWoPayModesCompany)
        .subscribe((res) => {
          expect(res).toBeUndefined();
          expect(platformEmployeeSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(accountService.setAccountProperties).toHaveBeenCalledOnceWith(
            multiplePaymentModesData[0],
            AccountType.COMPANY,
            false,
          );
          done();
        });
    });

    it('should get default account without ccc enabled', (done) => {
      platformEmployeeSettingsService.getAllowedPaymentModes.and.returnValue(
        of(employeeSettingsWoPayModesCompany.payment_mode_settings.allowed_payment_modes),
      );
      spyOn(paymentModesService, 'checkIfPaymentModeConfigurationsIsEnabled').and.returnValue(of(false));

      paymentModesService
        .getDefaultAccount(orgSettingsParamWoCCC, multiplePaymentModesData, employeeSettingsWoPayModesCompany)
        .subscribe((res) => {
          expect(res).toBeUndefined();
          expect(platformEmployeeSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(accountService.setAccountProperties).toHaveBeenCalledOnceWith(
            multiplePaymentModesData[0],
            AccountType.COMPANY,
            false,
          );
          done();
        });
    });
  });

  it('showInvalidPaymentModeToast(): should invalid payment mode toast', () => {
    const message = 'Insufficient balance in the selected account. Please choose a different payment mode.';
    paymentModesService.showInvalidPaymentModeToast();
    expect(snackbarPropertiesService.setSnackbarProperties).toHaveBeenCalledOnceWith('failure', { message });
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...snackbarPropertiesService.setSnackbarProperties('failure', { message }),
      panelClass: ['msb-failure-with-report-btn'],
    });
    expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: message });
  });

  describe('isNonReimbursableOrg():', () => {
    it('should return true if only non-reimbursable payment modes exist in the payment mode settings', () => {
      expect(paymentModesService.isNonReimbursableOrg(cccOnlyPaymentModeSettingsParam)).toBeTrue();
      expect(paymentModesService.isNonReimbursableOrg(cccAndPaidByCompanyPaymentModeSettingsParam)).toBeTrue();
    });

    it('should return false if only reimbursable payment modes exist in the payment mode settings', () => {
      expect(paymentModesService.isNonReimbursableOrg(reimbursableOnlyPaymentModeSettingsParam)).toBeFalse();
      expect(paymentModesService.isNonReimbursableOrg(cccAndReimbursablePaymentModeSettingsParam)).toBeFalse();
    });
  });

  describe('getPaymentModeDisplayName():', () => {
    it('should return Personal Advances if payment mode is PERSONAL_ADVANCE_ACCOUNT', () => {
      const paymentMode = AllowedPaymentModes.PERSONAL_ADVANCE_ACCOUNT;
      expect(paymentModesService.getPaymentModeDisplayName(paymentMode)).toEqual('Personal Advances');
    });

    it('should return Corporate Credit Card if payment mode is PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', () => {
      const paymentMode = AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT;
      expect(paymentModesService.getPaymentModeDisplayName(paymentMode)).toEqual('Corporate Credit Card');
    });

    it('should return Personal Cash/Card if payment mode is not PERSONAL_ADVANCE_ACCOUNT or PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT', () => {
      const paymentMode = AllowedPaymentModes.PERSONAL_CASH_ACCOUNT;
      expect(paymentModesService.getPaymentModeDisplayName(paymentMode)).toEqual('Personal Cash/Card');
    });
  });
});
