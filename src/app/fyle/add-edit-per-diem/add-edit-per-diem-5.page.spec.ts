import { ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { AddEditPerDiemPage } from './add-edit-per-diem.page';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { DateService } from 'src/app/core/services/date.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StatusService } from 'src/app/core/services/status.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';

import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { Observable, finalize, of } from 'rxjs';
import { outboxQueueData1 } from 'src/app/core/mock-data/outbox-queue.data';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { perDiemFormValuesData10 } from 'src/app/core/mock-data/per-diem-form-value.data';
import { PerDiemRedirectedFrom } from 'src/app/core/models/per-diem-redirected-from.enum';

export function TestCases5(getTestBed) {
  return describe('add-edit-per-diem test cases set 5', () => {
    let component: AddEditPerDiemPage;
    let fixture: ComponentFixture<AddEditPerDiemPage>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let accountsService: jasmine.SpyObj<AccountsService>;
    let authService: jasmine.SpyObj<AuthService>;
    let formBuilder: FormBuilder;
    let categoriesService: jasmine.SpyObj<CategoriesService>;
    let dateService: jasmine.SpyObj<DateService>;
    let projectsService: jasmine.SpyObj<ProjectsService>;
    let reportService: jasmine.SpyObj<ReportService>;
    let customInputsService: jasmine.SpyObj<CustomInputsService>;
    let customFieldsService: jasmine.SpyObj<CustomFieldsService>;
    let transactionService: jasmine.SpyObj<TransactionService>;
    let policyService: jasmine.SpyObj<PolicyService>;
    let transactionOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
    let router: jasmine.SpyObj<Router>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let statusService: jasmine.SpyObj<StatusService>;
    let popoverController: jasmine.SpyObj<PopoverController>;
    let currencyService: jasmine.SpyObj<CurrencyService>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let navController: jasmine.SpyObj<NavController>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let recentlyUsedItemsService: jasmine.SpyObj<RecentlyUsedItemsService>;
    let tokenService: jasmine.SpyObj<TokenService>;
    let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
    let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
    let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
    let matSnackBar: jasmine.SpyObj<MatSnackBar>;
    let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
    let platform: Platform;
    let paymentModesService: jasmine.SpyObj<PaymentModesService>;
    let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let perDiemService: jasmine.SpyObj<PerDiemService>;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(AddEditPerDiemPage);
      component = fixture.componentInstance;

      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      formBuilder = TestBed.inject(FormBuilder);
      categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
      customFieldsService = TestBed.inject(CustomFieldsService) as jasmine.SpyObj<CustomFieldsService>;
      transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
      policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
      transactionOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
      popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
      currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      recentlyUsedItemsService = TestBed.inject(RecentlyUsedItemsService) as jasmine.SpyObj<RecentlyUsedItemsService>;
      tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
      expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
      modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
      orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
      matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
      snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
      platform = TestBed.inject(Platform);
      paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
      orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
      storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
      perDiemService = TestBed.inject(PerDiemService) as jasmine.SpyObj<PerDiemService>;
      component.fg = formBuilder.group({
        currencyObj: [
          {
            value: null,
            disabled: true,
          },
        ],
        paymentMode: [, Validators.required],
        project: [],
        sub_category: [],
        per_diem_rate: [, Validators.required],
        purpose: [],
        num_days: [, Validators.compose([Validators.required, Validators.min(0)])],
        report: [],
        from_dt: [],
        to_dt: [, component.customDateValidator.bind(component)],
        custom_inputs: new FormArray([]),
        duplicate_detection_reason: [],
        billable: [],
        costCenter: [],
        project_dependent_fields: formBuilder.array([]),
        cost_center_dependent_fields: formBuilder.array([]),
      });
    }));

    it('reloadCurrentRoute(): should reload the current route', fakeAsync(() => {
      component.reloadCurrentRoute();
      tick(100);

      expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/enterprise/my_expenses', { skipLocationChange: true });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'add_edit_per_diem']);
    }));

    describe('saveAndNewExpense():', () => {
      beforeEach(() => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'editExpense').and.returnValue(of(unflattenedTxnData.tx));
        component.fg = formBuilder.group({
          ...perDiemFormValuesData10,
        });
        spyOn(component, 'goBack');
        spyOn(component, 'reloadCurrentRoute');
      });

      it('should add expense and reload current route if form and payment mode is valid', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        component.saveAndNewExpense();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEW_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.goBack).not.toHaveBeenCalled();
        expect(component.reloadCurrentRoute).toHaveBeenCalledTimes(1);
      });

      it('should add expense and go back if form and payment mode is valid and user is in edit mode', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        component.mode = 'edit';
        component.saveAndNewExpense();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEW_PER_DIEM);
        expect(component.goBack).toHaveBeenCalledTimes(1);
        expect(component.reloadCurrentRoute).not.toHaveBeenCalled();
      });

      it('should mark all fields as touched and scroll to invalid element if form is invalid', fakeAsync(() => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(true));
        Object.defineProperty(component.fg, 'valid', {
          get: () => false,
        });
        spyOn(component, 'showFormValidationErrors');
        spyOn(component.fg, 'markAllAsTouched');
        component.saveAndNewExpense();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
        expect(component.invalidPaymentMode).toBeTrue();
        tick(3000);
        expect(component.invalidPaymentMode).toBeFalse();
      }));
    });

    describe('saveExpenseAndGotoPrev():', () => {
      beforeEach(() => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'editExpense').and.returnValue(of(unflattenedTxnData.tx));
        spyOn(component, 'close');
        spyOn(component, 'goToPrev');
        spyOn(component, 'showFormValidationErrors');
        component.activeIndex = 0;
        component.mode = 'add';
      });

      it('should close the current page if form is valid, user is in add mode and expense is the first one in list', () => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).toHaveBeenCalledTimes(1);
        expect(component.goToPrev).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should go to previous page if form is valid, user is in add mode and expense is not the first one in list', () => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        component.activeIndex = 1;
        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToPrev).toHaveBeenCalledTimes(1);
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should close the current page if form is valid, user is in edit mode and expense is the first one in list', () => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        component.mode = 'edit';
        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM);
        expect(component.close).toHaveBeenCalledTimes(1);
        expect(component.goToPrev).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should go to previous page if form is valid, user is in edit mode and expense is not the first one in list', () => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        component.activeIndex = 1;
        component.mode = 'edit';
        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM);
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToPrev).toHaveBeenCalledTimes(1);
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should show validation errors if the form is not valid', () => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => false,
        });
        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToPrev).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      });
    });

    describe('saveExpenseAndGotoNext():', () => {
      beforeEach(() => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'editExpense').and.returnValue(of(unflattenedTxnData.tx));
        spyOn(component, 'close');
        spyOn(component, 'goToNext');
        spyOn(component, 'showFormValidationErrors');
        component.activeIndex = 0;
        component.mode = 'add';
        component.reviewList = ['txSEM4DtjyKR'];
      });

      it('should close the current page if form is valid, user is in add mode and expense is the first one in list', () => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        component.saveExpenseAndGotoNext();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).toHaveBeenCalledTimes(1);
        expect(component.goToNext).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should go to next page if form is valid, user is in add mode and expense is not the first one in list', () => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        component.activeIndex = 1;
        component.saveExpenseAndGotoNext();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToNext).toHaveBeenCalledTimes(1);
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should close the current page if form is valid, user is in edit mode and expense is the first one in list', () => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        component.mode = 'edit';
        component.saveExpenseAndGotoNext();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM);
        expect(component.close).toHaveBeenCalledTimes(1);
        expect(component.goToNext).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should go to next page if form is valid, user is in edit mode and expense is not the first one in list', () => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        component.activeIndex = 1;
        component.mode = 'edit';
        component.saveExpenseAndGotoNext();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM);
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToNext).toHaveBeenCalledTimes(1);
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should show validation errors if the form is not valid', () => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => false,
        });
        component.saveExpenseAndGotoNext();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToNext).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      });
    });
  });
}
