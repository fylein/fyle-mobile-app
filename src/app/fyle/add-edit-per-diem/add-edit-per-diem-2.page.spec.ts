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
} from 'src/app/core/test-data/accounts.service.spec.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { draftReportPerDiemData, expectedAddedApproverERpts } from 'src/app/core/mock-data/report-unflattened.data';
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
} from 'src/app/core/mock-data/org-settings.data';
import { TxnCustomProperties } from 'src/app/core/models/txn-custom-properties.model';
import { OrgCategory } from 'src/app/core/models/v1/org-category.model';
import { allowedPerDiemRateOptionsData1 } from 'src/app/core/mock-data/allowed-per-diem-rate-options.data';
import { perDiemReportsData1 } from 'src/app/core/mock-data/per-diem-reports.data';
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

export function TestCases2(getTestBed) {
  return describe('add-edit-per-diem test cases set 2', () => {
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

    it('getEditExpense(): should call transactionService.getETxnUnflattened and return unflattened transaction data', () => {
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
      activatedRoute.snapshot.params = { id: 'tx5n59fvxk4z' };

      component.getEditExpense().subscribe((res) => {
        expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('tx5n59fvxk4z');
        expect(res).toEqual(unflattenedTxnData);
      });
    });

    it('setupFilteredCategories(): should setup filteredCategories$', () => {
      component.fg.patchValue({
        sub_category: {
          id: 247980,
        },
        project: projects[0],
      });
      projectsService.getAllowedOrgCategoryIds.and.returnValue([orgCategoryData]);
      spyOn(component.fg.controls.sub_category, 'reset');
      component.setupFilteredCategories(of(orgCategoryData1));
      expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledOnceWith(projects[0], orgCategoryData1);
      expect(component.fg.controls.sub_category.reset).toHaveBeenCalledTimes(1);
    });

    it('getTimeSpentOnPage(): should get time spent on page', () => {
      component.expenseStartTime = 164577000;
      fixture.detectChanges();

      const result = component.getTimeSpentOnPage();
      const endTime = (new Date().getTime() - component.expenseStartTime) / 1000;
      expect(result).toEqual(endTime);
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
        reportService.getFilteredPendingReports.and.returnValue(of(expectedAddedApproverERpts));
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
        orgUserSettingsService.getAllowedCostCenters.and.returnValue(of(costCentersData));
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
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
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
        mockOrgSettings.per_diem.enable_individual_per_diem_rates = true;
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
        mockOrgSettings.per_diem.enable_individual_per_diem_rates = true;
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
          expect(projectsService.getProjectCount).toHaveBeenCalledOnceWith({
            categoryIds: ['129140', '129112', '16582', '201952'],
          });
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
          expect(orgUserSettingsService.getAllowedCostCenters).toHaveBeenCalledOnceWith(orgUserSettingsData);
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
          expect(reportService.getFilteredPendingReports).toHaveBeenCalledOnceWith({ state: 'edit' });
          expect(res).toEqual(perDiemReportsData1);
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
          expect(orgUserSettingsService.getAllowedCostCenters).not.toHaveBeenCalled();
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

      it('should set isBalanceAvailableInAnyAdvanceAccount$ correctly if paymentMode changed and paymentMode.acc.type equals PERSONAL account', (done) => {
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(accountsData[0]);
        accountsService.getEMyAccounts.and.returnValue(of(accountsData));
        component.ionViewWillEnter();
        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);
          expect(res).toBeTrue();
          done();
        });
      });

      it('should set isBalanceAvailableInAnyAdvanceAccount$ correctly if paymentMode changed and paymentMode.acc.type equals PERSONAL account and account.acc is undefined', (done) => {
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(accountsData[0]);
        const mockAccountsData = cloneDeep(accountsData);
        mockAccountsData[0].acc = undefined;
        accountsService.getEMyAccounts.and.returnValue(of(mockAccountsData));
        component.ionViewWillEnter();
        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);
          expect(res).toBeTrue();
          done();
        });
      });

      it('should set isBalanceAvailableInAnyAdvanceAccount$ correctly if paymentMode changed and paymentMode.acc.type equals PERSONAL account and account is undefined', (done) => {
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(accountsData[0]);
        const mockAccountsData = cloneDeep(accountsData);
        mockAccountsData[0] = undefined;
        accountsService.getEMyAccounts.and.returnValue(of(mockAccountsData));
        component.ionViewWillEnter();
        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);
          expect(res).toBeTrue();
          done();
        });
      });

      it('should set isBalanceAvailableInAnyAdvanceAccount$ to false if paymentMode changed and paymentMode.acc is undefined', (done) => {
        const mockAccountsData = cloneDeep(accountsData[0]);
        mockAccountsData.acc = undefined;
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(mockAccountsData);
        component.ionViewWillEnter();
        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(accountsService.getEMyAccounts).not.toHaveBeenCalled();
          expect(res).toBeFalse();
          done();
        });
      });

      it('should set isBalanceAvailableInAnyAdvanceAccount$ to false if paymentMode changed and paymentMode is undefined', (done) => {
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(undefined);
        component.ionViewWillEnter();
        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(accountsService.getEMyAccounts).not.toHaveBeenCalled();
          expect(res).toBeFalse();
          done();
        });
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
        mockTxnData.tx.report_id = 'rp35DK02IvMP';
        component.getEditExpense = jasmine.createSpy().and.returnValue(of(mockTxnData));
        component.ionViewWillEnter();
        tick(1000);
        expect(component.fg.value).toEqual(perDiemFormValuesData4);
      }));

      it('should set report if etxn.tx.report_id is undefined and autoSubmission report name is empty with report state as DRAFT', fakeAsync(() => {
        reportService.getAutoSubmissionReportName.and.returnValue(of(''));
        reportService.getFilteredPendingReports.and.returnValue(of(draftReportPerDiemData));
        component.ionViewWillEnter();
        tick(1000);
        expect(component.fg.value).toEqual(perDiemFormValuesData5);
      }));

      it('should set costCenter if costCenter length is 1 and mode is add', fakeAsync(() => {
        component.getNewExpense = jasmine.createSpy().and.returnValue(of(unflattenedExpWoCostCenter));
        orgUserSettingsService.getAllowedCostCenters.and.returnValue(of([costCentersData[0]]));
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
