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
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { AdvanceWalletsService } from 'src/app/core/services/platform/v1/spender/advance-wallets.service';

import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { ModalController, NavController, Platform, PopoverController } from '@ionic/angular/standalone';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { popoverControllerParams2 } from 'src/app/core/mock-data/modal-controller.data';
import { of } from 'rxjs';
import { expectedUnflattendedTxnData3 } from 'src/app/core/mock-data/unflattened-txn.data';
import {
  unflattenedTxn,
} from 'src/app/core/mock-data/unflattened-expense.data';
import { EventEmitter } from '@angular/core';
import {
  accountsData,
  paymentModesConfig,
  paymentModesData,
} from 'src/app/core/test-data/accounts.service.spec.data';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { cloneDeep } from 'lodash';
import { expenseFieldsMapResponse } from 'src/app/core/mock-data/expense-fields-map.data';
import {
  expectedAllOrgCategories,
  perDiemCategories2,
  perDiemCategory,
  transformedOrgCategoryById,
} from 'src/app/core/mock-data/org-category.data';
import { txnFieldsData2 } from 'src/app/core/mock-data/expense-field-obj.data';
import { defaultTxnFieldValuesData2 } from 'src/app/core/mock-data/default-txn-field-values.data';
import {
  orgSettingsCCCDisabled,
} from 'src/app/core/mock-data/org-settings.data';
import { expectedProjectsResponse } from 'src/app/core/test-data/projects.spec.data';
import {
  platformExpenseData,
  platformExpenseDataWithSubCategory,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import {
  transformedExpenseData,
  transformedExpenseDataWithSubCategory,
} from 'src/app/core/mock-data/transformed-expense.data';

export function TestCases1(getTestBed) {
  return describe('add-edit-per-diem test cases set 1', () => {
    let component: AddEditPerDiemPage;
    let fixture: ComponentFixture<AddEditPerDiemPage>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let accountsService: jasmine.SpyObj<AccountsService>;
    let authService: jasmine.SpyObj<AuthService>;
    let formBuilder: UntypedFormBuilder;
    let categoriesService: jasmine.SpyObj<CategoriesService>;
    let dateService: jasmine.SpyObj<DateService>;
    let projectsService: jasmine.SpyObj<ProjectsService>;
    let reportService: jasmine.SpyObj<ReportService>;
    let customInputsService: jasmine.SpyObj<CustomInputsService>;
    let customFieldsService: jasmine.SpyObj<CustomFieldsService>;
    let transactionService: jasmine.SpyObj<TransactionService>;
    let expensesService: jasmine.SpyObj<ExpensesService>;
    let policyService: jasmine.SpyObj<PolicyService>;
    let transactionOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
    let router: jasmine.SpyObj<Router>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let expenseCommentService: jasmine.SpyObj<ExpenseCommentService>;
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
    let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let perDiemService: jasmine.SpyObj<PerDiemService>;
    let advanceWalletsService: jasmine.SpyObj<AdvanceWalletsService>;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(AddEditPerDiemPage);
      component = fixture.componentInstance;

      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      formBuilder = TestBed.inject(UntypedFormBuilder);
      categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
      customFieldsService = TestBed.inject(CustomFieldsService) as jasmine.SpyObj<CustomFieldsService>;
      transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
      expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
      policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
      transactionOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      expenseCommentService = TestBed.inject(ExpenseCommentService) as jasmine.SpyObj<ExpenseCommentService>;
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
      platformEmployeeSettingsService = TestBed.inject(
        PlatformEmployeeSettingsService,
      ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
      storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
      perDiemService = TestBed.inject(PerDiemService) as jasmine.SpyObj<PerDiemService>;
      advanceWalletsService = TestBed.inject(AdvanceWalletsService) as jasmine.SpyObj<AdvanceWalletsService>;

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
        custom_inputs: new UntypedFormArray([]),
        billable: [],
        costCenter: [],
        project_dependent_fields: formBuilder.array([]),
        cost_center_dependent_fields: formBuilder.array([]),
      });
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('scrollInputIntoView(): should scroll input into view on keydown', () => {
      const inputElement = document.createElement('input');
      spyOn(inputElement, 'scrollIntoView');
      spyOn(component, 'getActiveElement').and.returnValue(inputElement);

      component.scrollInputIntoView();

      expect(inputElement.scrollIntoView).toHaveBeenCalledOnceWith({
        block: 'center',
      });

      expect(component.getActiveElement).toHaveBeenCalledTimes(1);
    });

    it('getActiveElement(): should return active element in DOM', () => {
      const result = component.getActiveElement();

      expect(result).toEqual(document.activeElement);
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
      component.reviewList = ['txvslh8aQMbu', 'txNyI8ot5CuJ'];
      expensesService.getExpenseById.and.returnValue(of(platformExpenseData));
      transactionService.transformExpense.and.returnValue(transformedExpenseData);
      fixture.detectChanges();

      component.goToPrev();
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith('txvslh8aQMbu');
      expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
      expect(component.goToTransaction).toHaveBeenCalledOnceWith(transformedExpenseData, component.reviewList, 0);
    });

    it('goToNext(): should got to the next txn', () => {
      spyOn(component, 'goToTransaction');
      activatedRoute.snapshot.params.activeIndex = 0;
      component.reviewList = ['txSEM4DtjyKR', 'txD5hIQgLuR5'];
      expensesService.getExpenseById.and.returnValue(of(platformExpenseDataWithSubCategory));
      transactionService.transformExpense.and.returnValue(transformedExpenseDataWithSubCategory);
      fixture.detectChanges();

      component.goToNext();
      expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith('txD5hIQgLuR5');
      expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseDataWithSubCategory);
      expect(component.goToTransaction).toHaveBeenCalledOnceWith(
        transformedExpenseDataWithSubCategory,
        component.reviewList,
        1,
      );
    });

    describe('goToTransaction():', () => {
      const txn_ids = ['txfCdl3TEZ7K'];
      it('should navigate to add-edit-mileage if category is mileage', () => {
        const expense = {
          ...expectedUnflattendedTxnData3,
          tx: { ...expectedUnflattendedTxnData3.tx, org_category: 'MILEAGE' },
        };
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
        const expense = {
          ...expectedUnflattendedTxnData3,
          tx: { ...expectedUnflattendedTxnData3.tx, org_category: 'PER DIEM' },
        };
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
        const expense = expectedUnflattendedTxnData3;
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

    it('getTransactionFields(): should return all the transaction fields', (done) => {
      const fields = ['purpose', 'cost_center_id', 'project_id', 'from_dt', 'to_dt', 'num_days', 'billable'];
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse));
      spyOn(component, 'getPerDiemCategories').and.returnValue(
        of({
          defaultPerDiemCategory: perDiemCategory,
          perDiemCategories: [perDiemCategory],
        }),
      );
      const mockTxnFieldData = cloneDeep(txnFieldsData2);
      expenseFieldsService.filterByOrgCategoryId.and.returnValue(of(mockTxnFieldData));
      component.getTransactionFields().subscribe((res) => {
        expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(1);
        expect(component.getPerDiemCategories).toHaveBeenCalledTimes(1);
        expect(expenseFieldsService.filterByOrgCategoryId).toHaveBeenCalledOnceWith(
          expenseFieldsMapResponse,
          fields,
          perDiemCategory,
        );
        expect(res).toEqual(mockTxnFieldData);
        done();
      });
    });

    it('setupTfcDefaultValues(): should update the form with default expense field values if some fields are empty', () => {
      const fields = ['purpose', 'cost_center_id', 'from_dt', 'to_dt', 'num_days', 'billable'];
      const mockTxnFieldData = cloneDeep(txnFieldsData2);
      component.showBillable = true;
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse));
      spyOn(component, 'getPerDiemCategories').and.returnValue(
        of({
          defaultPerDiemCategory: perDiemCategory,
          perDiemCategories: [perDiemCategory],
        }),
      );
      expenseFieldsService.filterByOrgCategoryId.and.returnValue(of(mockTxnFieldData));
      expenseFieldsService.getDefaultTxnFieldValues.and.returnValue(defaultTxnFieldValuesData2);
      component.fg.controls.project.setValue(expectedProjectsResponse[0]);
      component.fg.controls.purpose.setValue('');
      component.fg.controls.costCenter.setValue(null);
      component.fg.controls.from_dt.setValue('2023-01-01');
      component.fg.controls.num_days.setValue(32);
      component.fg.controls.to_dt.setValue('2023-02-02');
      component.fg.controls.billable.setValue(null);

      component.setupTfcDefaultValues();

      expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(1);
      expect(component.getPerDiemCategories).toHaveBeenCalledTimes(1);
      expect(expenseFieldsService.filterByOrgCategoryId).toHaveBeenCalledOnceWith(
        expenseFieldsMapResponse,
        fields,
        perDiemCategory,
      );
      expect(expenseFieldsService.getDefaultTxnFieldValues).toHaveBeenCalledOnceWith(mockTxnFieldData);
      expect(component.fg.controls.costCenter.value).toEqual(15818);
      expect(component.fg.controls.purpose.value).toEqual('test_term');
      expect(component.fg.controls.billable.value).toBeTrue();
    });

    it('getPaymentModes(): should get payment modes', (done) => {
      component.etxn$ = of(unflattenedTxn);
      accountsService.getMyAccounts.and.returnValue(of(accountsData));
      advanceWalletsService.getAllAdvanceWallets.and.returnValue(of([]));
      orgSettingsService.get.and.returnValue(of(orgSettingsCCCDisabled));
      platformEmployeeSettingsService.getAllowedPaymentModes.and.returnValue(
        of([AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY]),
      );
      paymentModesService.checkIfPaymentModeConfigurationsIsEnabled.and.returnValue(of(true));
      accountsService.getPaymentModes.and.returnValue(paymentModesData);
      fixture.detectChanges();

      component.getPaymentModes().subscribe((res) => {
        expect(res).toEqual(paymentModesData);
        expect(accountsService.getMyAccounts).toHaveBeenCalledTimes(1);
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(platformEmployeeSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
        expect(paymentModesService.checkIfPaymentModeConfigurationsIsEnabled).toHaveBeenCalledTimes(1);
        expect(accountsService.getPaymentModes).toHaveBeenCalledOnceWith(
          accountsData,
          [AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY],
          paymentModesConfig,
        );
        done();
      });
    });

    it('getPaymentModes(): should get payment modes when orgSettings is null', (done) => {
      component.etxn$ = of(unflattenedTxn);
      accountsService.getMyAccounts.and.returnValue(of(accountsData));
      orgSettingsService.get.and.returnValue(of(null));
      platformEmployeeSettingsService.getAllowedPaymentModes.and.returnValue(
        of([AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY]),
      );
      paymentModesService.checkIfPaymentModeConfigurationsIsEnabled.and.returnValue(of(true));
      accountsService.getPaymentModes.and.returnValue(paymentModesData);
      fixture.detectChanges();

      component.getPaymentModes().subscribe((res) => {
        expect(res).toEqual(paymentModesData);
        expect(accountsService.getMyAccounts).toHaveBeenCalledTimes(1);
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(platformEmployeeSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
        expect(paymentModesService.checkIfPaymentModeConfigurationsIsEnabled).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('getSubCategories(): ', () => {
      it('should return all categories having category name as per diem', (done) => {
        const mockPerDiemCategory = cloneDeep(perDiemCategory);
        mockPerDiemCategory.sub_category = '';
        categoriesService.getAll.and.returnValue(of([...expectedAllOrgCategories, mockPerDiemCategory]));
        component.getSubCategories().subscribe((res) => {
          expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
          expect(res).toEqual([mockPerDiemCategory]);
          done();
        });
      });

      it('should return empty array if category name is undefined', (done) => {
        const mockPerDiemCategory = cloneDeep(perDiemCategory);
        mockPerDiemCategory.name = undefined;
        categoriesService.getAll.and.returnValue(of([mockPerDiemCategory]));
        component.getSubCategories().subscribe((res) => {
          expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
          expect(res).toEqual([]);
          done();
        });
      });

      it('should return all categories having name as per diem if sub category is undefined', (done) => {
        const mockPerDiemCategory = cloneDeep(perDiemCategory);
        mockPerDiemCategory.sub_category = undefined;
        categoriesService.getAll.and.returnValue(of([mockPerDiemCategory]));
        component.getSubCategories().subscribe((res) => {
          expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
          expect(res).toEqual([mockPerDiemCategory]);
          done();
        });
      });
    });

    describe('getProjectCategoryIds():', () => {
      it('should return project category ids', (done) => {
        component.projectCategories$ = of([perDiemCategory]);
        categoriesService.getAll.and.returnValue(of([...expectedAllOrgCategories, perDiemCategory]));
        component.getProjectCategoryIds().subscribe((res) => {
          expect(res).toEqual(['38912']);
          done();
        });
      });

      it('should return undefined if category id is undefined', (done) => {
        component.projectCategories$ = of([undefined]);
        const mockPerDiemCategory = cloneDeep(perDiemCategory);
        mockPerDiemCategory.id = undefined;
        categoriesService.getAll.and.returnValue(of([...expectedAllOrgCategories, mockPerDiemCategory]));
        component.getProjectCategoryIds().subscribe((res) => {
          // If category id is undefined, it will return undefined due to default behaviour of map function
          expect(res).toEqual([undefined]);
          done();
        });
      });
    });

    describe('getProjectCategories():', () => {
      it('should return MILEAGE category IDs', (done) => {
        component.projectCategories$ = of(perDiemCategories2);
        categoriesService.getAll.and.returnValue(of(perDiemCategories2));

        component.getProjectCategories().subscribe((res) => {
          expect(res).toEqual(perDiemCategories2);
          done();
        });
      });

      it('should return an empty array if there are no MILEAGE categories', (done) => {
        component.projectCategories$ = of([]);
        categoriesService.getAll.and.returnValue(of(transformedOrgCategoryById));

        component.getProjectCategories().subscribe((res) => {
          expect(res).toEqual([]);
          done();
        });
      });
    });

    it('getPerDiemCategories(): should return defaultPerDiemCategory and perDiemCategories', (done) => {
      categoriesService.getAll.and.returnValue(of([...expectedAllOrgCategories, perDiemCategory]));
      component.getPerDiemCategories().subscribe((res) => {
        expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
        expect(res).toEqual({
          defaultPerDiemCategory: perDiemCategory,
          perDiemCategories: [perDiemCategory],
        });
        done();
      });
    });
  });
}
