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
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { popoverControllerParams2 } from 'src/app/core/mock-data/modal-controller.data';
import { of } from 'rxjs';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { unflattenExp1 } from 'src/app/core/mock-data/unflattened-expense.data';
import { EventEmitter } from '@angular/core';
import { unflattenedAccount1Data } from 'src/app/core/test-data/accounts.service.spec.data';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { cloneDeep } from 'lodash';

export function TestCases1(getTestBed) {
  return describe('add-edit-per-diem test cases set 1', () => {
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

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    describe('ngOnInit()', () => {
      it('should set isRedirectedFromReport and canRemoveFromReport to true if remove_from_report is true', () => {
        activatedRoute.snapshot.params = {
          remove_from_report: 'true',
        };
        fixture.detectChanges();
        expect(component.isRedirectedFromReport).toBeTrue();
        expect(component.canRemoveFromReport).toBeTrue();
      });

      it('should set isRedirectedFromReport to true and canRemoveFromReport to false if remove_from_report is false', () => {
        activatedRoute.snapshot.params = {
          remove_from_report: 'false',
        };
        fixture.detectChanges();
        expect(component.isRedirectedFromReport).toBeTrue();
        expect(component.canRemoveFromReport).toBeFalse();
      });

      it('should set isRedirectedFromReport and canRemoveFromReport to false if remove_from_report is undefined', () => {
        activatedRoute.snapshot.params = {};
        fixture.detectChanges();
        expect(component.isRedirectedFromReport).toBeFalse();
        expect(component.canRemoveFromReport).toBeFalse();
      });
    });

    it('minPerDiemDate(): should return minimum date to be set for to_dt field', () => {
      component.fg.patchValue({
        from_dt: '2021-02-02',
      });

      expect(component.minPerDiemDate).toEqual('2021-02-1');
    });

    it('get isExpandedView(): should return _isExpandedView value', () => {
      expect(component.isExpandedView).toBeFalse();
    });

    describe('set isExpandedView():', () => {
      it('should set _isExpandedView and call storageService in add-per-diem mode', () => {
        component.mode = 'add';
        component.isExpandedView = true;

        expect(component.isExpandedView).toBeTrue();
        expect(storageService.set).toHaveBeenCalledOnceWith('isExpandedViewPerDiem', true);
      });

      it('should set _isExpandedView but not call storageService in edit-per-diem mode', () => {
        component.mode = 'edit';
        component.isExpandedView = true;

        expect(component.isExpandedView).toBeTrue();
        expect(storageService.set).not.toHaveBeenCalled();
      });
    });

    describe('showClosePopup(): ', () => {
      beforeEach(() => {
        component.presetProjectId = 316992;
        fixture.detectChanges();
      });

      it('should show close popup and automatically go back if action is continue', fakeAsync(() => {
        component.navigateBack = true;
        const unsavedChangesPopOverSpy = jasmine.createSpyObj('unsavedChangesPopOver', ['present', 'onWillDismiss']);
        unsavedChangesPopOverSpy.onWillDismiss.and.resolveTo({
          data: {
            action: 'continue',
          },
        });
        popoverController.create.and.resolveTo(unsavedChangesPopOverSpy);

        component.showClosePopup();
        tick(100);

        expect(popoverController.create).toHaveBeenCalledOnceWith(popoverControllerParams2);
        expect(navController.back).toHaveBeenCalledTimes(1);
      }));

      it('should show close popup and go back to my expenses page if navigate back is false', fakeAsync(() => {
        const unsavedChangesPopOverSpy = jasmine.createSpyObj('unsavedChangesPopOver', ['present', 'onWillDismiss']);
        unsavedChangesPopOverSpy.onWillDismiss.and.resolveTo({
          data: {
            action: 'continue',
          },
        });
        popoverController.create.and.resolveTo(unsavedChangesPopOverSpy);
        spyOn(component, 'goBack');
        component.navigateBack = false;
        fixture.detectChanges();

        component.showClosePopup();
        tick(100);

        expect(popoverController.create).toHaveBeenCalledOnceWith(popoverControllerParams2);
        expect(component.goBack).toHaveBeenCalledTimes(1);
      }));

      it('should navigate back to previous page if form is not touched', () => {
        component.navigateBack = true;
        component.presetProjectId = null;
        component.presetCostCenterId = null;
        activatedRoute.snapshot.params.dataUrl = null;
        Object.defineProperty(component.fg, 'touched', {
          get: () => false,
        });

        fixture.detectChanges();

        component.showClosePopup();

        expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
        expect(navController.back).toHaveBeenCalledTimes(1);
      });

      it('should navigate back to my expenses if the form in not touched', () => {
        component.presetProjectId = null;
        component.presetCostCenterId = null;
        component.navigateBack = false;
        activatedRoute.snapshot.params.dataUrl = null;
        spyOn(component, 'goBack');
        Object.defineProperty(component.fg, 'touched', {
          get: () => false,
        });

        fixture.detectChanges();

        component.showClosePopup();

        expect(component.goBack).toHaveBeenCalledTimes(1);
      });
    });

    describe('goBack():', () => {
      it('should go back to the report if redirected from the report page', () => {
        component.isRedirectedFromReport = true;
        fixture.detectChanges();

        navController.back.and.returnValue(null);

        component.goBack();
        expect(navController.back).toHaveBeenCalledTimes(1);
      });

      it('should go back to my expenses page if it is not redirected from report and no filters are applied', () => {
        activatedRoute.snapshot.params = {
          persist_filters: false,
        };
        component.isRedirectedFromReport = false;
        fixture.detectChanges();

        component.goBack();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
      });
    });

    it('goToPrev(): should go to the previous txn', () => {
      spyOn(component, 'goToTransaction');
      activatedRoute.snapshot.params.activeIndex = 1;
      component.reviewList = ['txSEM4DtjyKR', 'txNyI8ot5CuJ'];
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
      fixture.detectChanges();

      component.goToPrev();
      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txSEM4DtjyKR');
      expect(component.goToTransaction).toHaveBeenCalledOnceWith(unflattenedTxnData, component.reviewList, 0);
    });

    it('goToNext(): should got to the next txn', () => {
      const etxn = { ...unflattenedTxnData, tx: { ...unflattenedTxnData.tx, id: 'txNyI8ot5CuJ' } };
      spyOn(component, 'goToTransaction');
      activatedRoute.snapshot.params.activeIndex = 0;
      component.reviewList = ['txSEM4DtjyKR', 'txNyI8ot5CuJ'];
      transactionService.getETxnUnflattened.and.returnValue(of(etxn));
      fixture.detectChanges();

      component.goToNext();
      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txNyI8ot5CuJ');
      expect(component.goToTransaction).toHaveBeenCalledOnceWith(etxn, component.reviewList, 1);
    });

    describe('goToTransaction():', () => {
      const txn_ids = ['txfCdl3TEZ7K'];
      it('should navigate to add-edit-mileage if category is mileage', () => {
        const expense = { ...unflattenExp1, tx: { ...unflattenExp1.tx, org_category: 'MILEAGE' } };
        component.goToTransaction(expense, txn_ids, 0);

        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_mileage',
          {
            id: expense.tx.id,
            txnIds: JSON.stringify(txn_ids),
            activeIndex: 0,
          },
        ]);
      });

      it('should navigate to add-edit-per-diem if the category is per diem', () => {
        const expense = { ...unflattenExp1, tx: { ...unflattenExp1.tx, org_category: 'PER DIEM' } };
        component.goToTransaction(expense, txn_ids, 0);

        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_per_diem',
          {
            id: expense.tx.id,
            txnIds: JSON.stringify(txn_ids),
            activeIndex: 0,
          },
        ]);
      });

      it('should navigate to add-edit-expense page if category is not amongst mileage and per diem', () => {
        const expense = unflattenExp1;
        component.goToTransaction(expense, txn_ids, 0);

        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_expense',
          {
            id: expense.tx.id,
            txnIds: JSON.stringify(txn_ids),
            activeIndex: 0,
          },
        ]);
      });
    });

    it('setupNetworkWatcher(): should setup network watching', (done) => {
      networkService.connectivityWatcher.and.returnValue(null);
      networkService.isOnline.and.returnValue(of(true));

      component.setupNetworkWatcher();
      expect(networkService.connectivityWatcher).toHaveBeenCalledOnceWith(new EventEmitter<boolean>());
      expect(networkService.isOnline).toHaveBeenCalledTimes(1);
      component.isConnected$.subscribe((res) => {
        expect(res).toBeTrue();
        done();
      });
    });

    describe('checkIfInvalidPaymentMode():', () => {
      it('should check for invalid payment mode if payment account type is not advance account', (done) => {
        component.etxn$ = of(unflattenExp1);
        component.fg.controls.paymentMode.setValue(unflattenedAccount1Data);
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
          amount: 500,
        });
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(paymentModesService.showInvalidPaymentModeToast).not.toHaveBeenCalled();
          expect(res).toBeFalse();
          done();
        });
      });

      it('should check for invalid payment in case of Advance accounts if source account ID does not match with account type', (done) => {
        component.etxn$ = of(unflattenExp1);
        component.fg.controls.paymentMode.setValue({
          ...unflattenedAccount1Data,
          acc: { ...unflattenedAccount1Data.acc, type: AccountType.ADVANCE },
        });
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
          amount: 500,
        });
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeTrue();
          expect(paymentModesService.showInvalidPaymentModeToast).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should check for invalid payment mode if the source account ID matches with the account type', (done) => {
        component.etxn$ = of(unflattenExp1);
        component.fg.controls.paymentMode.setValue({
          ...unflattenedAccount1Data,
          acc: { ...unflattenedAccount1Data.acc, type: AccountType.ADVANCE, id: 'acc5APeygFjRd' },
        });
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
          amount: 500,
        });
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeTrue();
          expect(paymentModesService.showInvalidPaymentModeToast).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should not call paymentModesService.showInvalidPaymentModeToast method if paymentAccount.acc is undefined', (done) => {
        component.etxn$ = of(unflattenExp1);
        const mockPaymentAccount = cloneDeep(unflattenedAccount1Data);
        mockPaymentAccount.acc = undefined;
        component.fg.controls.paymentMode.setValue(mockPaymentAccount);
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(paymentModesService.showInvalidPaymentModeToast).not.toHaveBeenCalled();
          expect(res).toBeFalse();
          done();
        });
      });

      it('should not call paymentModesService.showInvalidPaymentModeToast method if paymentAccount is undefined', (done) => {
        component.etxn$ = of(unflattenExp1);
        component.fg.controls.paymentMode.setValue(undefined);
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(paymentModesService.showInvalidPaymentModeToast).not.toHaveBeenCalled();
          expect(res).toBeFalse();
          done();
        });
      });
    });
  });
}
