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
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StatusService } from 'src/app/core/services/status.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { AdvanceWalletsService } from 'src/app/core/services/platform/v1/spender/advance-wallets.service';

import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { orgCategoryData, orgCategoryData1, perDiemCategory } from 'src/app/core/mock-data/org-category.data';
import { BehaviorSubject, finalize, of, skip, take, tap } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { unflattenedTxnDataPerDiem } from 'src/app/core/mock-data/unflattened-expense.data';
import { unflattenedExpWoCostCenter, unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { dependentCustomFields2, expenseFieldResponse } from 'src/app/core/mock-data/expense-field.data';
import { expectedTxnCustomProperties } from 'src/app/core/mock-data/txn-custom-properties.data';
import { dependentCustomProperties } from 'src/app/core/mock-data/custom-property.data';
import { cloneDeep } from 'lodash';
import {
  expectedControlValues,
  expectedExpenseFieldWithoutControl,
  perDiemCustomInputsData1,
  perDiemCustomInputsData2,
} from 'src/app/core/mock-data/per-diem-custom-inputs.data';
import { projects } from 'src/app/core/mock-data/extended-projects.data';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { authResData1 } from 'src/app/core/mock-data/auth-reponse.data';
import {
  accountsData,
  multipleAdvAccountsData,
  multiplePaymentModesData,
  orgSettingsData,
  paymentModeDataCCC,
  paymentModesData,
  unflattenedAccount2Data,
  advanceWallet1Data,
  multiplePaymentModesWithoutAdvData,
} from 'src/app/core/test-data/accounts.service.spec.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { expectedReportsPaginated, expectedSingleReport } from 'src/app/core/mock-data/platform-report.data';
import { reportOptionsData3 } from 'src/app/core/mock-data/report-options.data';
import { txnFieldsData2, txnFieldsData3 } from 'src/app/core/mock-data/expense-field-obj.data';
import { allowedPerDiem, expectedPerDiems } from 'src/app/core/test-data/per-diem.service.spec.data';
import { costCentersData, expectedCCdata2, expectedCCdata3 } from 'src/app/core/mock-data/cost-centers.data';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { recentlyUsedRes } from 'src/app/core/mock-data/recently-used.data';
import { categorieListRes } from 'src/app/core/mock-data/org-category-list-item.data';
import { getEstatusApiResponse } from 'src/app/core/test-data/status.service.spec.data';
import {
  orgSettingsParamsWithSimplifiedReport,
  orgSettingsRes,
  orgSettingsWoTax,
  orgSettingsParamsWithAdvanceWallet,
} from 'src/app/core/mock-data/org-settings.data';
import { TxnCustomProperties } from 'src/app/core/models/txn-custom-properties.model';
import { OrgCategory } from 'src/app/core/models/v1/org-category.model';
import { allowedPerDiemRateOptionsData1 } from 'src/app/core/mock-data/allowed-per-diem-rate-options.data';
import { perDiemRatesData1, perDiemRatesData2 } from 'src/app/core/mock-data/per-diem-rates.data';
import { currencyObjData5, currencyObjData6 } from 'src/app/core/mock-data/currency-obj.data';
import {
  perDiemFormValuesData1,
  perDiemFormValuesData10,
  perDiemFormValuesData2,
  perDiemFormValuesData3,
  perDiemFormValuesData4,
  perDiemFormValuesData5,
  perDiemFormValuesData6,
  perDiemFormValuesData7,
} from 'src/app/core/mock-data/per-diem-form-value.data';
import { platformExpenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { transformedExpenseData } from 'src/app/core/mock-data/transformed-expense.data';
import { CostCentersService } from 'src/app/core/services/cost-centers.service';

export function TestCases2(getTestBed) {
  return describe('add-edit-per-diem test cases set 2', () => {
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
    let platformReportService: jasmine.SpyObj<SpenderReportsService>;
    let customInputsService: jasmine.SpyObj<CustomInputsService>;
    let customFieldsService: jasmine.SpyObj<CustomFieldsService>;
    let transactionService: jasmine.SpyObj<TransactionService>;
    let expensesService: jasmine.SpyObj<ExpensesService>;
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
    let costCentersService: jasmine.SpyObj<CostCentersService>;
    let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
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
      platformReportService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
      customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
      customFieldsService = TestBed.inject(CustomFieldsService) as jasmine.SpyObj<CustomFieldsService>;
      transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
      expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
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
      costCentersService = TestBed.inject(CostCentersService) as jasmine.SpyObj<CostCentersService>;
      orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
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

    it('getNewExpense(): should return new expense object', () => {
      spyOn(component, 'getPerDiemCategories').and.returnValue(
        of({
          defaultPerDiemCategory: perDiemCategory,
          perDiemCategories: [perDiemCategory],
        })
      );
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      authService.getEou.and.resolveTo(apiEouRes);

      component.getNewExpense().subscribe((res) => {
        expect(component.getPerDiemCategories).toHaveBeenCalledTimes(1);
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(res).toEqual(unflattenedTxnDataPerDiem);
      });
    });

    it('getEditExpense(): should call expensesService.getExpensesById and return expense data', () => {
      expensesService.getExpenseById.and.returnValue(of(platformExpenseData));
      transactionService.transformExpense.and.returnValue(transformedExpenseData);
      activatedRoute.snapshot.params = { id: 'txvslh8aQMbu' };

      component.getEditExpense().subscribe((res) => {
        expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith('txvslh8aQMbu');
        expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
        expect(res).toEqual(transformedExpenseData);
      });
    });

    it('setupFilteredCategories(): should setup filteredCategories$', () => {
      component.subCategories$ = of(orgCategoryData1);
      component.isProjectCategoryRestrictionsEnabled$ = of(true);
      component.fg.patchValue({
        sub_category: {
          id: 247980,
        },
        project: projects[0],
      });
      projectsService.getAllowedOrgCategoryIds.and.returnValue([orgCategoryData]);
      spyOn(component.fg.controls.sub_category, 'reset');
      component.setupFilteredCategories();
      expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledOnceWith(projects[0], orgCategoryData1, true);
      expect(component.fg.controls.sub_category.reset).toHaveBeenCalledTimes(1);
    });

    it('getTimeSpentOnPage(): should get time spent on page', () => {
      component.expenseStartTime = 164577000;
      fixture.detectChanges();

      const result = component.getTimeSpentOnPage();
      const endTime = (new Date().getTime() - component.expenseStartTime) / 1000;
      expect(result).toBeCloseTo(endTime, 2);
    });

    describe('getCustomInputs():', () => {
      const mockCategoryData = cloneDeep(orgCategoryData);
      mockCategoryData.id = 16577;
      beforeEach(() => {
        component.fg.patchValue({
          sub_category: {
            id: 247980,
          },
        });
        customInputsService.getAll.and.returnValue(of([...dependentCustomFields2, ...expenseFieldResponse]));
        spyOn(component, 'getPerDiemCategories').and.returnValue(
          of({
            defaultPerDiemCategory: perDiemCategory,
            perDiemCategories: [perDiemCategory],
          })
        );
        spyOn(component.fg, 'updateValueAndValidity');
        component.etxn$ = of(unflattenedTxnData);
        categoriesService.getAll.and.returnValue(of([mockCategoryData]));
        customFieldsService.standardizeCustomFields.and.returnValue(cloneDeep(expectedTxnCustomProperties));
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        component.isConnected$ = of(true);
      });

      it('should update dependentFields$ correctly', () => {
        component.getCustomInputs();
        component.dependentFields$.subscribe((dependentFields) => {
          expect(dependentFields).toEqual(dependentCustomFields2);
        });
      });

      it('should return custom inputs if etxn.tx.org_category_id is defined', () => {
        component.fg.value.custom_inputs = dependentCustomProperties;
        component.getCustomInputs().subscribe((res) => {
          expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
          expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith(
            dependentCustomProperties,
            expenseFieldResponse
          );
          expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
          const expenseFieldWithoutControl = res.map(({ control, ...otherProps }) => ({ ...otherProps }));
          const expectedExpenseFieldWithControl = perDiemCustomInputsData1.map(({ control, ...otherProps }) => ({
            ...otherProps,
          })) as TxnCustomProperties[];
          expect(expenseFieldWithoutControl).toEqual(expectedExpenseFieldWithControl);
          // We just want to check the value and not the methods like pendingChange etc
          const controlValues = res.map(({ control }) => control.value);
          const expectedControlValues = perDiemCustomInputsData1.map(({ control }) => control.value);
          expect(controlValues).toEqual(expectedControlValues);
        });
      });

      it('should return custom inputs if etxn.tx.org_category_id is undefined', () => {
        component.fg.value.custom_inputs = undefined;
        const mockEtxn = cloneDeep(unflattenedTxnData);
        mockEtxn.tx.org_category_id = undefined;
        component.etxn$ = of(mockEtxn);
        categoriesService.getAll.and.returnValue(of([orgCategoryData]));
        component.getCustomInputs().subscribe((res) => {
          expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
          expect(component.getPerDiemCategories).toHaveBeenCalledTimes(1);
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], expenseFieldResponse);
          expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 38912);
          const expenseFieldWithoutControl = res.map(({ control, ...otherProps }) => ({ ...otherProps }));
          expect(expenseFieldWithoutControl).toEqual(expectedExpenseFieldWithoutControl);
          const controlValues = res.map(({ control }) => control.value);
          expect(controlValues).toEqual(expectedControlValues);
        });
      });

      it('should return custom inputs if initialFetch is false', () => {
        component.fg.value.custom_inputs = dependentCustomProperties;
        const getCustomInputs$ = component.getCustomInputs();
        component.initialFetch = false;
        getCustomInputs$.subscribe((res) => {
          expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
          expect(categoriesService.getAll).not.toHaveBeenCalled();
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith(
            dependentCustomProperties,
            expenseFieldResponse
          );
          expect(component.getPerDiemCategories).not.toHaveBeenCalled();
          expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 247980);
          const expenseFieldWithoutControl = res.map(({ control, ...otherProps }) => ({ ...otherProps }));
          const expectedExpenseFieldWithControl = perDiemCustomInputsData1.map(({ control, ...otherProps }) => ({
            ...otherProps,
          })) as TxnCustomProperties[];
          expect(expenseFieldWithoutControl).toEqual(expectedExpenseFieldWithControl);
          // We just want to check the value and not the methods like pendingChange etc
          const controlValues = res.map(({ control }) => control.value);
          const expectedControlValues = perDiemCustomInputsData1.map(({ control }) => control.value);
          expect(controlValues).toEqual(expectedControlValues);
        });
      });

      it('should return custom inputs if initialFetch is false and sub_category is undefined', () => {
        component.fg.value.custom_inputs = dependentCustomProperties;
        component.fg.value.sub_category = undefined;
        const getCustomInputs$ = component.getCustomInputs();
        component.initialFetch = false;
        getCustomInputs$.subscribe((res) => {
          expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
          expect(categoriesService.getAll).not.toHaveBeenCalled();
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith(
            dependentCustomProperties,
            expenseFieldResponse
          );
          expect(component.getPerDiemCategories).toHaveBeenCalledTimes(1);
          expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 38912);
          const expenseFieldWithoutControl = res.map(({ control, ...otherProps }) => ({ ...otherProps }));
          const expectedExpenseFieldWithControl = perDiemCustomInputsData1.map(({ control, ...otherProps }) => ({
            ...otherProps,
          })) as TxnCustomProperties[];
          expect(expenseFieldWithoutControl).toEqual(expectedExpenseFieldWithControl);
          // We just want to check the value and not the methods like pendingChange etc
          const controlValues = res.map(({ control }) => control.value);
          const expectedControlValues = perDiemCustomInputsData1.map(({ control }) => control.value);
          expect(controlValues).toEqual(expectedControlValues);
        });
      });
    });

    describe('checkAdvanceAccountAndBalance():', () => {
      it('should return false if account is not present', () => {
        const result = component.checkAdvanceAccountAndBalance(null);

        expect(result).toBeFalse();
      });

      it('should return true if account is of type advance', () => {
        const result = component.checkAdvanceAccountAndBalance(multiplePaymentModesData[2]);

        expect(result).toBeTrue();
      });
    });

    describe('checkAdvanceWalletsWithSufficientBalance():', () => {
      it('should return false if advance wallet is not present', () => {
        const result = component.checkAdvanceWalletsWithSufficientBalance(null);

        expect(result).toBeFalse();
      });

      it('should return true if advance wallet has balance', () => {
        const result = component.checkAdvanceWalletsWithSufficientBalance(advanceWallet1Data);

        expect(result).toBeTrue();
      });
    });

    describe('setupBalanceFlag():', () => {
      it('should setup balance available flag', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesData));
        advanceWalletsService.getAllAdvanceWallets.and.returnValue(of([]));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeTrue();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledOnceWith();
          expect(advanceWalletsService.getAllAdvanceWallets).toHaveBeenCalledOnceWith();
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[0]);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return false in advance balance if payment mode is not personal', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesData));
        advanceWalletsService.getAllAdvanceWallets.and.returnValue(of([]));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledOnceWith();
          expect(advanceWalletsService.getAllAdvanceWallets).toHaveBeenCalledOnceWith();
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[1]);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return false when account changes to null', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(null));
        advanceWalletsService.getAllAdvanceWallets.and.returnValue(of([]));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledOnceWith();
          expect(advanceWalletsService.getAllAdvanceWallets).toHaveBeenCalledOnceWith();
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(null);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return false when orgSettings is null', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesData));
        advanceWalletsService.getAllAdvanceWallets.and.returnValue(of([]));
        orgSettingsService.get.and.returnValue(of(null));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeTrue();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledOnceWith();
          expect(advanceWalletsService.getAllAdvanceWallets).toHaveBeenCalledOnceWith();
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[0]);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return true for advance wallets', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesWithoutAdvData));
        advanceWalletsService.getAllAdvanceWallets.and.returnValue(of(advanceWallet1Data));
        orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithAdvanceWallet));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeTrue();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledOnceWith();
          expect(advanceWalletsService.getAllAdvanceWallets).toHaveBeenCalledOnceWith();
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[0]);
        fixture.detectChanges();

        tick(500);
      }));
    });

    describe('ionViewWillEnter():', () => {
      beforeEach(() => {
        activatedRoute.snapshot.params = {
          txnIds: '["tx3qwe4ty","tx6sd7gh"]',
          id: 'tx5n59fvxk4z',
          activeIndex: 2,
        };
        spyOn(platform.backButton, 'subscribeWithPriority').and.stub();
        tokenService.getClusterDomain.and.resolveTo(authResData1.cluster_domain);
        storageService.get.and.resolveTo(true);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        platformReportService.getAllReportsByParams.and.returnValue(of(expectedReportsPaginated));
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        customFieldsService.standardizeCustomFields.and.returnValue(cloneDeep(expectedTxnCustomProperties));
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(paymentModeDataCCC);
        const mockPerDiem = allowedPerDiem.map((mockPerDiem) => ({
          ...mockPerDiem,
          created_at: new Date('2020-08-12T16:09:14.551Z'),
          updated_at: new Date('2022-09-20T11:48:38.901Z'),
        }));
        perDiemService.getAllowedPerDiems.and.returnValue(of(mockPerDiem));
        component.isConnected$ = of(true);
        costCentersService.getAllActive.and.returnValue(of(costCentersData));
        reportService.getAutoSubmissionReportName.and.returnValue(of('#1: Aug 2023'));
        accountsService.getAccountTypeFromPaymentMode.and.returnValue(AccountType.CCC);
        recentlyUsedItemsService.getRecentlyUsed.and.returnValue(of(recentlyUsedRes));
        authService.getEou.and.resolveTo(apiEouRes);
        recentlyUsedItemsService.getRecentlyUsedProjects.and.returnValue(of(projects));
        recentlyUsedItemsService.getRecentCostCenters.and.returnValue(of(expectedCCdata2));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        component.filteredCategories$ = of(categorieListRes);
        projectsService.getProjectCount.and.returnValue(of(4));
        statusService.find.and.returnValue(of(getEstatusApiResponse));
        currencyService.getAmountWithCurrencyFraction.and.returnValue(23);
        currencyService.getExchangeRate.and.returnValue(of(12));
        accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesData));
        projectsService.getbyId.and.returnValue(of(projects[0]));
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(multiplePaymentModesData[0]);
        perDiemService.getRates.and.returnValue(of(expectedPerDiems));
        spyOn(component, 'getSubCategories').and.returnValue(of(orgCategoryData1));
        spyOn(component, 'setupFilteredCategories');
        spyOn(component, 'getProjectCategories').and.returnValue(of(orgCategoryData1));
        spyOn(component, 'getProjectCategoryIds').and.returnValue(of(['129140', '129112', '16582', '201952']));
        spyOn(component, 'getPerDiemCategories').and.returnValue(
          of({
            defaultPerDiemCategory: perDiemCategory,
            perDiemCategories: [perDiemCategory],
          })
        );
        spyOn(component, 'getEditExpense').and.returnValue(of(unflattenedTxnData));
        spyOn(component, 'getNewExpense').and.returnValue(of(unflattenedTxnDataPerDiem));
        spyOn(component, 'getCustomInputs').and.returnValue(of(perDiemCustomInputsData2));
        spyOn(component, 'getPolicyDetails');
        spyOn(component, 'getTransactionFields').and.returnValue(of(txnFieldsData3));
        spyOn(component, 'getPaymentModes').and.returnValue(of(paymentModesData));
        spyOn(component, 'customDateValidator');
        spyOn(component, 'setupNetworkWatcher');
        spyOn(component, 'setupTfcDefaultValues');
        fixture.detectChanges();
      });

      it('should initialize all the variables correctly', fakeAsync(() => {
        const dependentFieldSpy = jasmine.createSpyObj('DependentFieldComponent', ['ngOnInit']);
        component.projectCategories$ = of(orgCategoryData1);
        component.projectDependentFieldsRef = dependentFieldSpy;
        component.costCenterDependentFieldsRef = dependentFieldSpy;
        const tomorrow = new Date('2023-08-18');
        const today = new Date();
        dateService.addDaysToDate.and.returnValue(tomorrow);
        component.ionViewWillEnter();
        // tick(1000) is required as we are resolving promises (getClusterDomain) and there is a setTimeout in ionViewWillEnter
        tick(1000);
        expect(dependentFieldSpy.ngOnInit).toHaveBeenCalledTimes(2);
        expect(component.minDate).toEqual('2001-01-1');
        expect(component.maxDate).toEqual('2023-08-18');
        expect(dateService.addDaysToDate).toHaveBeenCalledOnceWith(today, 1);
        expect(platform.backButton.subscribeWithPriority).toHaveBeenCalledOnceWith(
          BackButtonActionPriority.MEDIUM,
          jasmine.any(Function)
        );
        expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
        expect(component.clusterDomain).toEqual('https://staging.fyle.tech');
        expect(component.title).toEqual('Edit');
        expect(component.activeIndex).toEqual(2);
        expect(component.reviewList).toEqual(['tx3qwe4ty', 'tx6sd7gh']);
        expect(component.mode).toEqual('edit');
        expect(storageService.get).toHaveBeenCalledOnceWith('isExpandedViewPerDiem');
        expect(component.isExpandedView).toBeTrue();
      }));

      it('should set mode as add if txnId is not defined', fakeAsync(() => {
        activatedRoute.snapshot.params = {
          txnIds: '["tx3qwe4ty","tx6sd7gh", "tx9qwu47v"]',
          activeIndex: 0,
        };
        component.ionViewWillEnter();
        tick(1000);
        expect(component.mode).toEqual('add');
        expect(component.reviewList).toEqual(['tx3qwe4ty', 'tx6sd7gh', 'tx9qwu47v']);
        expect(component.title).toEqual('Review');
        expect(storageService.get).toHaveBeenCalledOnceWith('isExpandedViewPerDiem');
        expect(component.isExpandedView).toBeTrue();
      }));

      it('should call orgSettingsService.get, orgUserSettingsService.get, perDiemService.getRates and reportService.getAutoSubmissionReportName once and update isNewReportsFlowEnabled', () => {
        orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithSimplifiedReport));
        component.ionViewWillEnter();
        expect(orgSettingsService.get).toHaveBeenCalledTimes(2);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
        expect(perDiemService.getRates).toHaveBeenCalledTimes(1);
        expect(reportService.getAutoSubmissionReportName).toHaveBeenCalledTimes(1);
        component.autoSubmissionReportName$.subscribe((res) => {
          expect(res).toEqual('#1: Aug 2023');
        });
        expect(component.isNewReportsFlowEnabled).toBeTrue();
      });

      it('should set isAdvancesEnabled$, individualPerDiemRatesEnabled$ and recentlyUsedValues$', () => {
        orgSettingsService.get.and.returnValue(of(orgSettingsWoTax));
        component.ionViewWillEnter();
        component.isAdvancesEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });
        component.individualPerDiemRatesEnabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });
        component.recentlyUsedValues$.subscribe((res) => {
          expect(res).toEqual(recentlyUsedRes);
        });
        expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
        expect(recentlyUsedItemsService.getRecentlyUsed).toHaveBeenCalledTimes(1);
      });

      it('should set isAdvancesEnabled$ to true and recentlyUsedValues$ to null if orgSettings.advances.enabled is true and device is offline', () => {
        component.isConnected$ = of(false);
        orgSettingsService.get.and.returnValue(of(orgSettingsRes));
        component.ionViewWillEnter();
        component.isAdvancesEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });
        component.recentlyUsedValues$.subscribe((res) => {
          expect(res).toBeNull();
        });
        expect(recentlyUsedItemsService.getRecentlyUsed).not.toHaveBeenCalled();
      });

      it('should update canCreatePerDiem$ to true if perDiemRates is not empty array', (done) => {
        component.ionViewWillEnter();
        component.canCreatePerDiem$
          .pipe(
            finalize(() => {
              expect(loaderService.hideLoader).toHaveBeenCalledTimes(3);
            })
          )
          .subscribe((res) => {
            // 3 times because it is called in initializing allowedPerDiemRates$, canCreatePerDiem$ and setting up form value
            expect(loaderService.showLoader).toHaveBeenCalledTimes(3);
            expect(perDiemService.getAllowedPerDiems).toHaveBeenCalledOnceWith(expectedPerDiems);
            expect(res).toBeTrue();
            done();
          });
      });

      it('should update canCreatePerDiem$ to false if perDiemRates is empty array', (done) => {
        perDiemService.getAllowedPerDiems.and.returnValue(of([]));
        perDiemService.getRates.and.returnValue(of([]));
        component.ionViewWillEnter();
        component.canCreatePerDiem$
          .pipe(
            finalize(() => {
              expect(loaderService.hideLoader).toHaveBeenCalledTimes(3);
            })
          )
          .subscribe((res) => {
            expect(loaderService.showLoader).toHaveBeenCalledTimes(3);
            expect(perDiemService.getAllowedPerDiems).toHaveBeenCalledOnceWith([]);
            expect(res).toBeFalse();
            done();
          });
      });

      it('should update canCreatePerDiem$ to true if enable_individual_per_diem_rates is enabled in orgSettings and allowedPerDiemRates and perDiemRates are not empty', (done) => {
        const mockOrgSettings = cloneDeep(orgSettingsRes);
        mockOrgSettings.advanced_per_diems_settings.enable_employee_restriction = true;
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        component.ionViewWillEnter();
        component.canCreatePerDiem$
          .pipe(
            finalize(() => {
              expect(loaderService.hideLoader).toHaveBeenCalledTimes(3);
            })
          )
          .subscribe((res) => {
            expect(loaderService.showLoader).toHaveBeenCalledTimes(3);
            expect(perDiemService.getAllowedPerDiems).toHaveBeenCalledOnceWith(expectedPerDiems);
            expect(res).toBeTrue();
            done();
          });
      });

      it('should update canCreatePerDiem$ to false if enable_individual_per_diem_rates is enabled in orgSettings and allowedPerDiemRates and perDiemRates are empty', (done) => {
        perDiemService.getAllowedPerDiems.and.returnValue(of([]));
        perDiemService.getRates.and.returnValue(of([]));
        const mockOrgSettings = cloneDeep(orgSettingsRes);
        mockOrgSettings.advanced_per_diems_settings.enable_employee_restriction = true;
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        component.ionViewWillEnter();
        component.canCreatePerDiem$
          .pipe(
            finalize(() => {
              expect(loaderService.hideLoader).toHaveBeenCalledTimes(3);
            })
          )
          .subscribe((res) => {
            expect(loaderService.showLoader).toHaveBeenCalledTimes(3);
            expect(perDiemService.getAllowedPerDiems).toHaveBeenCalledOnceWith([]);
            expect(res).toBeFalse();
            done();
          });
      });

      it('should update txnFields$, homeCurrency$, subCategories$, projectCategoryIds$, isProjectVisible$ and comments$ correctly', (done) => {
        component.ionViewWillEnter();
        component.txnFields$.subscribe((res) => {
          expect(component.getTransactionFields).toHaveBeenCalledTimes(1);
          expect(res).toEqual(txnFieldsData3);
        });
        component.homeCurrency$.subscribe((res) => {
          expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
          expect(res).toEqual('USD');
        });

        component.subCategories$.subscribe((res) => {
          expect(component.getSubCategories).toHaveBeenCalledTimes(1);
          expect(res).toEqual(orgCategoryData1);
        });

        component.projectCategoryIds$.subscribe((res) => {
          expect(component.getProjectCategoryIds).toHaveBeenCalledTimes(1);
          expect(res).toEqual(['129140', '129112', '16582', '201952']);
        });

        component.isProjectVisible$.subscribe((res) => {
          expect(projectsService.getProjectCount).toHaveBeenCalledOnceWith(
            {
              categoryIds: ['129140', '129112', '16582', '201952'],
            },
            orgCategoryData1
          );
          expect(res).toBeTrue();
        });

        component.comments$.subscribe((res) => {
          expect(statusService.find).toHaveBeenCalledOnceWith('transactions', 'tx5n59fvxk4z');
          expect(res).toEqual(getEstatusApiResponse);
        });
        done();
      });

      it('should update allowedPerDiemRateOptions$, isIndividualProjectsEnabled$, individualProjectIds$ and etxn$ correctly', (done) => {
        component.ionViewWillEnter();
        component.allowedPerDiemRateOptions$.subscribe((res) => {
          expect(res).toEqual(allowedPerDiemRateOptionsData1);
        });

        component.isIndividualProjectsEnabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.individualProjectIds$.subscribe((res) => {
          expect(res).toEqual([290054, 316444, 316446, 149230, 316442, 316443]);
        });

        component.etxn$.subscribe((res) => {
          expect(component.getEditExpense).toHaveBeenCalledTimes(1);
          expect(res).toEqual(unflattenedTxnData);
        });
        done();
      });

      it('should set individualProjectIds$ to empty array if orgUserSettings.project_ids are undefined', (done) => {
        const mockOrgUserSettings = cloneDeep(orgUserSettingsData);
        mockOrgUserSettings.project_ids = undefined;
        orgUserSettingsService.get.and.returnValue(of(mockOrgUserSettings));
        component.ionViewWillEnter();

        component.individualProjectIds$.subscribe((res) => {
          expect(res).toEqual([]);
        });

        done();
      });

      it('should update isProjectsEnabled$, customInputs$, isCostCentersEnabled$ and paymentModes$', (done) => {
        component.ionViewWillEnter();
        component.isProjectsEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.customInputs$.subscribe((res) => {
          expect(res).toEqual(perDiemCustomInputsData2);
        });

        component.isCostCentersEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.paymentModes$.subscribe((res) => {
          expect(component.getPaymentModes).toHaveBeenCalledTimes(1);
          expect(res).toEqual(paymentModesData);
        });
        done();
      });

      it('should update the costCenters$, recentlyUsedCostCenters$ and reports$ correctly', (done) => {
        component.ionViewWillEnter();
        component.costCenters$.subscribe((res) => {
          expect(costCentersService.getAllActive).toHaveBeenCalledTimes(1);
          expect(res).toEqual(expectedCCdata3);
        });

        component.recentlyUsedCostCenters$.subscribe((res) => {
          expect(recentlyUsedItemsService.getRecentCostCenters).toHaveBeenCalledOnceWith(
            expectedCCdata3,
            recentlyUsedRes
          );
          expect(res).toEqual(expectedCCdata2);
        });

        component.reports$.subscribe((res) => {
          expect(platformReportService.getAllReportsByParams).toHaveBeenCalledOnceWith({
            state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
          });
          expect(res).toEqual(reportOptionsData3);
        });

        expect(component.setupTfcDefaultValues).toHaveBeenCalledTimes(1);
        done();
      });

      it('should set costCenters to empty array if cost centers are not enabled in orgSettings', (done) => {
        const mockOrgSettings = cloneDeep(orgSettingsRes);
        mockOrgSettings.cost_centers.enabled = false;
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        component.ionViewWillEnter();
        component.costCenters$.subscribe((res) => {
          expect(costCentersService.getAllActive).not.toHaveBeenCalled();
          expect(res).toEqual([]);
        });
        done();
      });

      it('should set isAmountCapped$, isAmountDisabled$ and isCriticalPolicyViolated$ correctly', (done) => {
        component.ionViewWillEnter();
        component.isAmountCapped$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isAmountDisabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isCriticalPolicyViolated$.subscribe((res) => {
          expect(res).toBeFalse();
        });
        expect(component.getPolicyDetails).toHaveBeenCalledTimes(1);
        done();
      });

      it('should set isCriticalPolicyViolated$ to true if policy_amount is lesser than 0.0001', (done) => {
        const mockTxn = cloneDeep(unflattenedTxnData);
        mockTxn.tx.policy_amount = 0.00009;
        component.getEditExpense = jasmine.createSpy().and.returnValue(of(mockTxn));
        component.ionViewWillEnter();
        component.isCriticalPolicyViolated$.subscribe((res) => {
          expect(res).toBeTrue();
        });
        done();
      });

      it('should set num_days if from_dt and to_dt values changes in form', (done) => {
        component.ionViewWillEnter();
        component.fg.patchValue({
          from_dt: '2023-08-01',
          to_dt: '2023-08-03',
        });
        expect(component.fg.controls.num_days.value).toEqual(3);
        done();
      });

      it('should set num_days as 1 if from_dt and to_dt values are same', (done) => {
        component.ionViewWillEnter();
        component.fg.patchValue({
          from_dt: '2023-08-01',
          to_dt: '2023-08-01',
        });
        expect(component.fg.controls.num_days.value).toEqual(1);
        done();
      });

      it('should set to_dt if from_dt and num_days values changes in form', (done) => {
        component.ionViewWillEnter();
        dateService.getUTCDate.and.returnValue(new Date('2023-08-01'));
        component.fg.patchValue({
          from_dt: '2023-08-01',
          num_days: 3,
        });
        expect(component.fg.controls.to_dt.value).toEqual('2023-08-03');
        expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(new Date('2023-08-01'));
        done();
      });

      it('should set currencyObj if per_diem_rate, num_days and homeCurrency changes', (done) => {
        currencyService.getAmountWithCurrencyFraction.and.returnValue(90);
        component.ionViewWillEnter();
        component.fg.patchValue({
          per_diem_rate: perDiemRatesData1,
          num_days: 3,
          homeCurrency: 'USD',
        });
        expect(component.fg.controls.currencyObj.value).toEqual(currencyObjData5);
        expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledOnceWith(90, 'USD');
        done();
      });

      it('should set currencyObj if per_diem_rate, num_days and homeCurrency changes and if perDiemRate currency does not match with homeCurrency', (done) => {
        currencyService.getAmountWithCurrencyFraction.and.returnValues(10800, 900);
        component.ionViewWillEnter();
        component.fg.patchValue({
          per_diem_rate: perDiemRatesData2,
          num_days: 3,
          homeCurrency: 'USD',
        });
        expect(component.fg.controls.currencyObj.value).toEqual(currencyObjData6);
        expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledTimes(2);
        expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(10800, 'USD');
        expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledWith(900, 'INR');
        done();
      });

      it('should autofill the per diem form', fakeAsync(() => {
        component.ionViewWillEnter();
        tick(1000);
        expect(component.fg.value).toEqual(perDiemFormValuesData1);
        component.selectedProject$.subscribe((res) => {
          expect(res).toEqual(projects[0]);
        });
      }));

      it('should set project to null in form if orgUserSettings.preferences is undefined', fakeAsync(() => {
        const mockTxnData = cloneDeep(unflattenedTxnData);
        mockTxnData.tx.project_id = undefined;
        component.getEditExpense = jasmine.createSpy().and.returnValue(of(mockTxnData));
        const mockOrgUserSettings = cloneDeep(orgUserSettingsData);
        mockOrgUserSettings.preferences = undefined;
        orgUserSettingsService.get.and.returnValue(of(mockOrgUserSettings));
        component.ionViewWillEnter();
        tick(1000);
        expect(component.fg.value).toEqual(perDiemFormValuesData2);
      }));

      it('should set per_diem_rate if etxn.tx.per_diem_rate_id is defined', fakeAsync(() => {
        const mockTxnData = cloneDeep(unflattenedTxnData);
        mockTxnData.tx.per_diem_rate_id = 4213;
        component.getEditExpense = jasmine.createSpy().and.returnValue(of(mockTxnData));
        component.ionViewWillEnter();
        tick(1000);
        expect(component.fg.value).toEqual(perDiemFormValuesData3);
      }));

      it('should set report if etxn.tx.report_id is defined', fakeAsync(() => {
        const mockTxnData = cloneDeep(unflattenedTxnData);
        mockTxnData.tx.report_id = 'rprAfNrce73O';
        component.getEditExpense = jasmine.createSpy().and.returnValue(of(mockTxnData));
        component.ionViewWillEnter();
        tick(1000);
        expect(component.fg.value).toEqual(perDiemFormValuesData4);
      }));

      it('should set report if etxn.tx.report_id is undefined and autoSubmission report name is empty with report state as DRAFT', fakeAsync(() => {
        reportService.getAutoSubmissionReportName.and.returnValue(of(''));
        platformReportService.getAllReportsByParams.and.returnValue(of(expectedSingleReport));
        component.ionViewWillEnter();
        tick(1000);
        expect(component.fg.value).toEqual(perDiemFormValuesData5);
      }));

      it('should set costCenter if costCenter length is 1 and mode is add', fakeAsync(() => {
        component.getNewExpense = jasmine.createSpy().and.returnValue(of(unflattenedExpWoCostCenter));
        costCentersService.getAllActive.and.returnValue(of([costCentersData[0]]));
        activatedRoute.snapshot.params.id = undefined;
        component.ionViewWillEnter();
        tick(1000);
        expect(component.fg.value).toEqual(perDiemFormValuesData6);
        component.selectedCostCenter$.subscribe((res) => {
          expect(res).toEqual(costCentersData[0]);
        });
      }));

      it('should set from_dt and to_dt if etxn.tx.to_dt and etxn.tx.from_dt are defined', fakeAsync(() => {
        const mockTxnData = cloneDeep(unflattenedTxnData);
        dateService.getUTCDate.and.returnValue(new Date('2023-08-01'));
        mockTxnData.tx.to_dt = new Date('2023-08-03');
        mockTxnData.tx.from_dt = new Date('2023-08-01');
        component.getEditExpense = jasmine.createSpy().and.returnValue(of(mockTxnData));
        component.ionViewWillEnter();
        tick(1000);
        expect(component.fg.value).toEqual(perDiemFormValuesData7);
      }));

      it('should autofill project and costCenter if autofill is enabled and recentProjects and recentCostCenters are available', fakeAsync(() => {
        const mockTxnData = cloneDeep(unflattenedTxnData);
        mockTxnData.tx.project_id = null;
        mockTxnData.tx.cost_center_id = null;
        mockTxnData.tx.state = 'DRAFT';
        component.getEditExpense = jasmine.createSpy().and.returnValue(of(mockTxnData));
        recentlyUsedItemsService.getRecentlyUsedProjects.and.returnValue(of(projects));
        recentlyUsedItemsService.getRecentCostCenters.and.returnValue(of(expectedCCdata2));
        component.ionViewWillEnter();
        tick(1000);
        expect(component.recentProjects).toEqual([
          { label: 'Customer Mapped Project', value: projects[0] },
          { label: 'Abercrombie International Group', value: projects[1] },
        ]);
        expect(component.fg.controls.project.value).toEqual(projects[0]);
        expect(component.presetProjectId).toEqual(257528);
        expect(component.recentCostCenters).toEqual(expectedCCdata2);
        expect(component.fg.controls.costCenter.value).toEqual(expectedCCdata2[0].value);
        expect(component.presetCostCenterId).toEqual(2411);
      }));

      it('should set paymentModeInvalid$', fakeAsync(() => {
        spyOn(component, 'isPaymentModeValid').and.returnValue(of(false));
        component.ionViewWillEnter();
        tick(1000);
        component.paymentModeInvalid$.subscribe((res) => {
          expect(component.isPaymentModeValid).toHaveBeenCalledTimes(1);
          expect(res).toBeFalse();
        });
      }));
    });
  });
}
