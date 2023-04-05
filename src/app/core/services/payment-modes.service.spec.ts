import { TestBed } from '@angular/core/testing';
import { PaymentModesService } from './payment-modes.service';
import { AccountsService } from './accounts.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TrackingService } from './tracking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from './snackbar-properties.service';
import { of } from 'rxjs';
import {
  orgUserSettingsData,
  orgUserSettingsWoPaymentModes,
  orgUserSettingsWoPayModesCompany,
} from '../mock-data/org-user-settings.data';
import { orgSettingsRes, orgSettingsParamWoCCC } from '../mock-data/org-settings.data';
import { multiplePaymentModesData } from '../test-data/accounts.service.spec.data';
import { AccountType } from '../enums/account-type.enum';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import {
  cccAndPaidByCompanyPaymentModeSettingsParam,
  cccAndReimbursablePaymentModeSettingsParam,
  cccOnlyPaymentModeSettingsParam,
  reimbursableOnlyPaymentModeSettingsParam,
} from '../mock-data/org-payment-mode-settings.data';

describe('PaymentModesService', () => {
  let paymentModesService: PaymentModesService;
  let accountService: jasmine.SpyObj<AccountsService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarPropertiesService: jasmine.SpyObj<SnackbarPropertiesService>;

  beforeEach(() => {
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['setAccountProperties']);
    const orgUserSettingsSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get', 'getAllowedPaymentModes']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['showToastMessage']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
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
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesServiceSpy,
        },
      ],
    });
    paymentModesService = TestBed.inject(PaymentModesService);
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    accountService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    snackbarPropertiesService = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
  });

  it('should be created', () => {
    expect(paymentModesService).toBeTruthy();
  });

  it('checkIfPaymentModeConfigurationsIsEnabled(): should check if payment mode is enabled', (done) => {
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));

    paymentModesService.checkIfPaymentModeConfigurationsIsEnabled().subscribe((res) => {
      expect(res).toEqual(
        orgUserSettingsData.payment_mode_settings.allowed && orgUserSettingsData.payment_mode_settings.enabled
      );
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getDefaultAccount():', () => {
    it('should get default account with payment modes enabled', (done) => {
      orgUserSettingsService.getAllowedPaymentModes.and.returnValue(
        of(orgUserSettingsData.payment_mode_settings.allowed_payment_modes)
      );
      spyOn(paymentModesService, 'checkIfPaymentModeConfigurationsIsEnabled').and.returnValue(
        of(orgUserSettingsData.payment_mode_settings.allowed && orgUserSettingsData.payment_mode_settings.enabled)
      );

      paymentModesService
        .getDefaultAccount(orgSettingsRes, multiplePaymentModesData, orgUserSettingsData)
        .subscribe((res) => {
          expect(res).toBeUndefined();
          expect(orgUserSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(accountService.setAccountProperties).toHaveBeenCalledOnceWith(
            multiplePaymentModesData[0],
            AccountType.PERSONAL,
            false
          );
          done();
        });
    });

    it('should get default account without payment modes enabled', (done) => {
      orgUserSettingsService.getAllowedPaymentModes.and.returnValue(
        of(orgUserSettingsWoPaymentModes.payment_mode_settings.allowed_payment_modes)
      );
      spyOn(paymentModesService, 'checkIfPaymentModeConfigurationsIsEnabled').and.returnValue(
        of(
          orgUserSettingsWoPaymentModes.payment_mode_settings.allowed &&
            orgUserSettingsData.payment_mode_settings.enabled
        )
      );

      paymentModesService
        .getDefaultAccount(orgSettingsRes, multiplePaymentModesData, orgUserSettingsWoPaymentModes)
        .subscribe((res) => {
          expect(res).toBeUndefined();
          expect(orgUserSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(accountService.setAccountProperties).toHaveBeenCalledOnceWith(
            multiplePaymentModesData[1],
            AccountType.CCC,
            false
          );
          done();
        });
    });

    it('should get default account without payment modes enabled and preference to COMPANY', (done) => {
      orgUserSettingsService.getAllowedPaymentModes.and.returnValue(
        of(orgUserSettingsWoPayModesCompany.payment_mode_settings.allowed_payment_modes)
      );
      spyOn(paymentModesService, 'checkIfPaymentModeConfigurationsIsEnabled').and.returnValue(of(false));

      paymentModesService
        .getDefaultAccount(orgSettingsRes, multiplePaymentModesData, orgUserSettingsWoPayModesCompany)
        .subscribe((res) => {
          expect(res).toBeUndefined();
          expect(orgUserSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(accountService.setAccountProperties).toHaveBeenCalledOnceWith(
            multiplePaymentModesData[0],
            AccountType.COMPANY,
            false
          );
          done();
        });
    });

    it('should get default account without ccc enabled', (done) => {
      orgUserSettingsService.getAllowedPaymentModes.and.returnValue(
        of(orgUserSettingsWoPayModesCompany.payment_mode_settings.allowed_payment_modes)
      );
      spyOn(paymentModesService, 'checkIfPaymentModeConfigurationsIsEnabled').and.returnValue(of(false));

      paymentModesService
        .getDefaultAccount(orgSettingsParamWoCCC, multiplePaymentModesData, orgUserSettingsWoPayModesCompany)
        .subscribe((res) => {
          expect(res).toBeUndefined();
          expect(orgUserSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(accountService.setAccountProperties).toHaveBeenCalledOnceWith(
            multiplePaymentModesData[0],
            AccountType.COMPANY,
            false
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
});
