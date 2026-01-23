import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetController,
  ModalController,
  NavController,
  Platform,
  PopoverController,
} from '@ionic/angular/standalone';
import { BehaviorSubject, Observable, Subject, Subscription, of } from 'rxjs';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { accountOptionData1 } from 'src/app/core/mock-data/account-option.data';
import { costCenterOptions2, costCentersData } from 'src/app/core/mock-data/cost-centers.data';
import { expenseFieldObjData } from 'src/app/core/mock-data/expense-field-obj.data';
import { expenseFieldResponse, transformedResponse } from 'src/app/core/mock-data/expense-field.data';
import { policyExpense3 } from 'src/app/core/mock-data/expense.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import {
  mileageRateApiRes2,
  mileageRateOptions,
  unfilteredMileageRatesData,
} from 'src/app/core/mock-data/mileage-rate.data';
import { categorieListRes } from 'src/app/core/mock-data/org-category-list-item.data';
import { mileageCategories2, unsortedCategories1 } from 'src/app/core/mock-data/org-category.data';
import { orgSettingsOrgAutofill, orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { employeeSettingsData, employeeSettingsWoProjects } from 'src/app/core/mock-data/employee-settings.data';
import {
  recentlyUsedCostCentersRes,
  recentlyUsedMileages,
  recentlyUsedProjectRes,
  recentlyUsedRes,
} from 'src/app/core/mock-data/recently-used.data';
import { reportOptionsData3 } from 'src/app/core/mock-data/report-options.data';
import { expectedReportsPaginated } from 'src/app/core/mock-data/platform-report.data';
import { txnCustomProperties4, txnCustomPropertiesData6 } from 'src/app/core/mock-data/txn-custom-properties.data';
import {
  newExpenseMileageData1,
  newMileageExpFromForm3,
  unflattenedTxnData,
} from 'src/app/core/mock-data/unflattened-txn.data';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { DateService } from 'src/app/core/services/date.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FileService } from 'src/app/core/services/file.service';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { LocationService } from 'src/app/core/services/location.service';
import { MileageRatesService } from 'src/app/core/services/mileage-rates.service';
import { MileageService } from 'src/app/core/services/mileage.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TaxGroupService } from 'src/app/core/services/tax-group.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { multiplePaymentModesData } from 'src/app/core/test-data/accounts.service.spec.data';
import { expectedProjectsResponse } from 'src/app/core/test-data/projects.spec.data';
import { getEstatusApiResponse } from 'src/app/core/test-data/status.service.spec.data';
import { AddEditMileagePage } from './add-edit-mileage.page';
import { cloneDeep } from 'lodash';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { commuteDetailsResponseData } from 'src/app/core/mock-data/commute-details-response.data';
import { commuteDeductionOptionsData1 } from 'src/app/core/mock-data/commute-deduction-options.data';
import { CommuteDeduction } from 'src/app/core/enums/commute-deduction.enum';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { FySelectCommuteDetailsComponent } from 'src/app/shared/components/fy-select-commute-details/fy-select-commute-details.component';
import { locationData1, locationData2 } from 'src/app/core/mock-data/location.data';

export function TestCases5(getTestBed) {
  return describe('AddEditMileage-5', () => {
    let component: AddEditMileagePage;
    let fixture: ComponentFixture<AddEditMileagePage>;
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
    let policyService: jasmine.SpyObj<PolicyService>;
    let transactionOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
    let router: jasmine.SpyObj<Router>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let expenseCommentService: jasmine.SpyObj<ExpenseCommentService>;
    let fileService: jasmine.SpyObj<FileService>;
    let popoverController: jasmine.SpyObj<PopoverController>;
    let currencyService: jasmine.SpyObj<CurrencyService>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let navController: jasmine.SpyObj<NavController>;
    let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
    let recentlyUsedItemsService: jasmine.SpyObj<RecentlyUsedItemsService>;
    let tokenService: jasmine.SpyObj<TokenService>;
    let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
    let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
    let actionSheetController: jasmine.SpyObj<ActionSheetController>;
    let orgSettingsService: jasmine.SpyObj<PlatformOrgSettingsService>;
    let sanitizer: jasmine.SpyObj<DomSanitizer>;
    let personalCardsService: jasmine.SpyObj<PersonalCardsService>;
    let matSnackBar: jasmine.SpyObj<MatSnackBar>;
    let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
    let platform: Platform;
    let titleCasePipe: jasmine.SpyObj<TitleCasePipe>;
    let paymentModesService: jasmine.SpyObj<PaymentModesService>;
    let taxGroupService: jasmine.SpyObj<TaxGroupService>;
    let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
    let mileageService: jasmine.SpyObj<MileageService>;
    let mileageRatesService: jasmine.SpyObj<MileageRatesService>;
    let locationService: jasmine.SpyObj<LocationService>;
    let platformHandlerService: jasmine.SpyObj<PlatformHandlerService>;
    let employeesService: jasmine.SpyObj<EmployeesService>;

    beforeEach(() => {
      const TestBed = getTestBed();
      TestBed.compileComponents();

      fixture = TestBed.createComponent(AddEditMileagePage);
      component = fixture.componentInstance;

      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      formBuilder = TestBed.inject(UntypedFormBuilder);
      categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      platformReportService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
      projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
      customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
      customFieldsService = TestBed.inject(CustomFieldsService) as jasmine.SpyObj<CustomFieldsService>;
      transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
      policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
      transactionOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      expenseCommentService = TestBed.inject(ExpenseCommentService) as jasmine.SpyObj<ExpenseCommentService>;
      fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
      popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
      currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
      corporateCreditCardExpenseService = TestBed.inject(
        CorporateCreditCardExpenseService,
      ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      recentLocalStorageItemsService = TestBed.inject(
        RecentLocalStorageItemsService,
      ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
      recentlyUsedItemsService = TestBed.inject(RecentlyUsedItemsService) as jasmine.SpyObj<RecentlyUsedItemsService>;
      tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
      expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
      modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
      actionSheetController = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
      orgSettingsService = TestBed.inject(PlatformOrgSettingsService) as jasmine.SpyObj<PlatformOrgSettingsService>;
      sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
      personalCardsService = TestBed.inject(PersonalCardsService) as jasmine.SpyObj<PersonalCardsService>;
      matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
      snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
      platform = TestBed.inject(Platform);
      titleCasePipe = TestBed.inject(TitleCasePipe) as jasmine.SpyObj<TitleCasePipe>;
      paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
      taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
      platformEmployeeSettingsService = TestBed.inject(
        PlatformEmployeeSettingsService,
      ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
      storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
      launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
      mileageService = TestBed.inject(MileageService) as jasmine.SpyObj<MileageService>;
      mileageRatesService = TestBed.inject(MileageRatesService) as jasmine.SpyObj<MileageRatesService>;
      locationService = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;
      platformHandlerService = TestBed.inject(PlatformHandlerService) as jasmine.SpyObj<PlatformHandlerService>;
      employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;

      component.fg = formBuilder.group({
        mileage_rate_name: [],
        dateOfSpend: [, component.customDateValidator],
        route: [],
        paymentMode: [, Validators.required],
        purpose: [],
        project: [],
        billable: [],
        sub_category: [, Validators.required],
        custom_inputs: new UntypedFormArray([]),
        costCenter: [],
        report: [],
        project_dependent_fields: formBuilder.array([]),
        cost_center_dependent_fields: formBuilder.array([]),
        commuteDeduction: [],
      });

      component.hardwareBackButtonAction = new Subscription();
      component.onPageExit$ = new Subject();
      component.selectedProject$ = new BehaviorSubject(null);
      component.selectedCostCenter$ = new BehaviorSubject(null);
      fixture.detectChanges();
    });

    function setupObservables() {
      spyOn(component, 'initClassObservables');
      spyOn(component, 'setupSelectedProjects');
      spyOn(component, 'setupSelectedCostCenters');
      spyOn(component, 'checkNewReportsFlow');
      spyOn(component, 'setupNetworkWatcher');
      spyOn(component, 'setupTfcDefaultValues');
      spyOn(component, 'getMileageRatesOptions');
      spyOn(component, 'setupTxnFields');
      spyOn(component, 'getPolicyDetails');
      spyOn(component, 'checkIndividualMileageEnabled');
      spyOn(component, 'setupFilteredCategories');
    }

    function getClassValues() {
      spyOn(component, 'getTransactionFields').and.returnValue(of(expenseFieldObjData));
      spyOn(component, 'getSubCategories').and.returnValue(of(mileageCategories2));
      spyOn(component, 'getProjectCategories').and.returnValue(of(mileageCategories2));
      spyOn(component, 'getProjectCategoryIds').and.returnValue(of(['141295', '141300']));
      spyOn(component, 'getNewExpense').and.returnValue(of(newExpenseMileageData1));
      spyOn(component, 'getCustomInputs').and.returnValue(of(null));
      spyOn(component, 'getPaymentModes').and.returnValue(of(accountOptionData1));
      spyOn(component, 'getCostCenters').and.returnValue(of(costCenterOptions2));
      spyOn(component, 'getEditRates').and.returnValue(of(10));
      spyOn(component, 'getAddRates').and.returnValue(of(10));
      spyOn(component, 'getCategories').and.returnValue(of(unsortedCategories1[2]));
      spyOn(component, 'getExpenseAmount').and.returnValue(of(100));
      spyOn(component, 'getProjects').and.returnValue(of(expectedProjectsResponse[0]));
      spyOn(component, 'getReports').and.returnValue(of(expectedReportsPaginated[0]));
      spyOn(component, 'getSelectedCostCenters').and.returnValue(of(costCentersData[0]));
      const mockMileageRates = cloneDeep(unfilteredMileageRatesData[0]);
      spyOn(component, 'getMileageByVehicleType').and.returnValue(mockMileageRates);
    }

    function setupMocks() {
      tokenService.getClusterDomain.and.resolveTo('domain');
      reportService.getAutoSubmissionReportName.and.returnValue(of('purpose'));
      storageService.get.and.resolveTo(true);
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      projectsService.getProjectCount.and.returnValue(of(2));
      expenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));
      mileageRatesService.getAllMileageRates.and.returnValue(of(unfilteredMileageRatesData));
      mileageService.getEmployeeMileageSettings.and.returnValue(of(employeeSettingsData.mileage_settings));
      mileageRatesService.filterEnabledMileageRates.and.returnValue(cloneDeep(mileageRateApiRes2));
      mileageRatesService.getReadableRate.and.returnValue('10');
      mileageRatesService.formatMileageRateName.and.returnValue('Bicycle');
      recentlyUsedItemsService.getRecentCostCenters.and.returnValue(of(recentlyUsedCostCentersRes));
      platformReportService.getAllReportsByParams.and.returnValue(of(expectedReportsPaginated));
      accountsService.getEtxnSelectedPaymentMode.and.returnValue(multiplePaymentModesData[0]);
      accountsService.getAccountTypeFromPaymentMode.and.returnValue(AccountType.PERSONAL);
      authService.getEou.and.resolveTo(apiEouRes);
      recentlyUsedItemsService.getRecentlyUsedProjects.and.returnValue(of(recentlyUsedProjectRes));
      customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
      customInputsService.filterByCategory.and.returnValue(transformedResponse);
      customFieldsService.standardizeCustomFields.and.returnValue(txnCustomProperties4);
    }

    function setupMatchers() {
      expect(component.initClassObservables).toHaveBeenCalledTimes(1);
      expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);
      expect(component.navigateBack).toBeTrue();
      expect(dateService.addDaysToDate).toHaveBeenCalledTimes(1);
      expect(reportService.getAutoSubmissionReportName).toHaveBeenCalledTimes(1);
      expect(component.setupSelectedCostCenters).toHaveBeenCalledTimes(1);
      expect(component.setupSelectedProjects).toHaveBeenCalledTimes(1);
      expect(storageService.get).toHaveBeenCalledOnceWith('isExpandedViewMileage');
      expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      expect(component.checkNewReportsFlow).toHaveBeenCalledOnceWith(jasmine.any(Observable));
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
      expect(component.getTransactionFields).toHaveBeenCalledTimes(1);
      expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
      expect(component.getSubCategories).toHaveBeenCalledTimes(1);
      expect(component.getProjectCategoryIds).toHaveBeenCalledTimes(1);
      expect(component.getPaymentModes).toHaveBeenCalledTimes(1);
      expect(component.getNewExpense).toHaveBeenCalledTimes(1);
      expect(component.getEditExpense).toHaveBeenCalledTimes(1);
      expect(component.setupTfcDefaultValues).toHaveBeenCalledTimes(1);
      expect(component.getCustomInputs).toHaveBeenCalledTimes(1);
      expect(recentlyUsedItemsService.getRecentCostCenters).toHaveBeenCalledTimes(1);
      expect(component.setupTxnFields).toHaveBeenCalledTimes(1);
      expect(component.getPolicyDetails).toHaveBeenCalledTimes(1);
      expect(component.getEditRates).toHaveBeenCalledTimes(1);
      expect(component.getAddRates).toHaveBeenCalledTimes(1);
      expect(component.getExpenseAmount).toHaveBeenCalledTimes(1);
      expect(component.getProjects).toHaveBeenCalledTimes(1);
      expect(accountsService.getEtxnSelectedPaymentMode).toHaveBeenCalledTimes(1);
      expect(accountsService.getAccountTypeFromPaymentMode).toHaveBeenCalledTimes(1);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      expect(component.getCategories).toHaveBeenCalledTimes(1);
      expect(component.getReports).toHaveBeenCalledTimes(1);
      expect(component.getSelectedCostCenters).toHaveBeenCalledTimes(1);
      expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
    }

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    describe('ionViewWillEnter():', () => {
      beforeEach(() => {
        component.filteredCategories$ = of(categorieListRes);

        setupObservables();
        getClassValues();
        setupMocks();
      });

      it('should setup class variables', fakeAsync(() => {
        spyOn(component, 'getRecentlyUsedValues').and.returnValue(of(recentlyUsedRes));
        activatedRoute.snapshot.params.navigate_back = true;
        activatedRoute.snapshot.params.activeIndex = 0;
        activatedRoute.snapshot.params.txnIds = JSON.stringify(['tx3qHxFNgRcZ', 'txbO4Xaj4N53', 'tx053DOHz9pU']);
        spyOn(component, 'getEditExpense').and.returnValue(of(unflattenedTxnData));
        fixture.detectChanges();

        component.ionViewWillEnter();
        tick(1000);
        fixture.detectChanges();

        setupMatchers();

        component.mileageConfig$.subscribe((res) => {
          expect(res).toEqual(orgSettingsRes.mileage);
        });

        component.recentlyUsedValues$.subscribe((res) => {
          expect(res).toEqual(recentlyUsedRes);
        });

        expect(component.getRecentlyUsedValues).toHaveBeenCalledTimes(1);

        component.recentlyUsedMileageLocations$.subscribe((res) => {
          expect(res).toEqual(recentlyUsedMileages);
        });

        component.isProjectVisible$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        expect(expenseCommentService.getTransformedComments).toHaveBeenCalledOnceWith(
          activatedRoute.snapshot.params.id,
        );
        expect(component.checkIndividualMileageEnabled).toHaveBeenCalledOnceWith(jasmine.any(Observable));
        expect(mileageRatesService.getAllMileageRates).toHaveBeenCalledTimes(2);
        expect(mileageService.getEmployeeMileageSettings).toHaveBeenCalledTimes(1);

        component.mileageRates$.subscribe((res) => {
          expect(res).toEqual([]);
        });

        expect(component.getMileageRatesOptions).toHaveBeenCalledTimes(1);

        component.etxn$.subscribe((res) => {
          expect(res).toEqual(unflattenedTxnData);
        });

        component.isAmountDisabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isIndividualProjectsEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.individualProjectIds$.subscribe((res) => {
          expect(res).toEqual([290054, 316444, 316446, 149230, 316442, 316443]);
        });

        component.isProjectsEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.isCostCentersEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        expect(component.getCostCenters).toHaveBeenCalledOnceWith(jasmine.any(Observable));

        component.reports$.subscribe((res) => {
          expect(res).toEqual(reportOptionsData3);
        });

        expect(platformReportService.getAllReportsByParams).toHaveBeenCalledOnceWith({
          state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        });

        component.isAmountCapped$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isCriticalPolicyViolated$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.rate$.subscribe((res) => {
          expect(res).toEqual(10);
        });

        component.recentlyUsedProjects$.subscribe((res) => {
          expect(res).toEqual(recentlyUsedProjectRes);
        });

        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], transformedResponse);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.getMileageByVehicleType).toHaveBeenCalledOnceWith(unfilteredMileageRatesData, null);
        expect(mileageRatesService.getReadableRate).toHaveBeenCalledOnceWith(null, 'INR', null);
        expect(projectsService.getProjectCount).toHaveBeenCalledTimes(1);
      }));

      it('should setup class variables with autofill enabled and no recent values available', fakeAsync(() => {
        activatedRoute.snapshot.params.navigate_back = true;
        spyOn(component, 'getRecentlyUsedValues').and.returnValue(of(recentlyUsedRes));
        activatedRoute.snapshot.params.activeIndex = 3;
        activatedRoute.snapshot.params.txnIds = JSON.stringify(['tx3qHxFNgRcZ', 'txbO4Xaj4N53']);
        component.mode = 'edit';
        spyOn(component, 'getEditExpense').and.returnValue(of(newMileageExpFromForm3));
        orgSettingsService.get.and.returnValue(of(orgSettingsOrgAutofill));
        platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsWoProjects));
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomPropertiesData6);
        fixture.detectChanges();

        component.ionViewWillEnter();
        tick(1000);

        setupMatchers();

        component.mileageConfig$.subscribe((res) => {
          expect(res).toEqual(orgSettingsRes.mileage);
        });

        component.recentlyUsedValues$.subscribe((res) => {
          expect(res).toEqual(recentlyUsedRes);
        });

        expect(component.getRecentlyUsedValues).toHaveBeenCalledTimes(1);

        component.recentlyUsedMileageLocations$.subscribe((res) => {
          expect(res).toEqual(recentlyUsedMileages);
        });

        component.isProjectVisible$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        expect(mileageRatesService.getAllMileageRates).toHaveBeenCalledTimes(2);
        expect(mileageService.getEmployeeMileageSettings).toHaveBeenCalledTimes(1);

        component.mileageRates$.subscribe((res) => {
          expect(res).toEqual([]);
        });

        component.etxn$.subscribe((res) => {
          expect(res).toEqual(newMileageExpFromForm3);
        });

        component.isAmountDisabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isIndividualProjectsEnabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.individualProjectIds$.subscribe((res) => {
          expect(res).toEqual([]);
        });

        component.isProjectsEnabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isCostCentersEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.reports$.subscribe((res) => {
          expect(res).toEqual(reportOptionsData3);
        });

        expect(platformReportService.getAllReportsByParams).toHaveBeenCalledOnceWith({
          state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        });

        component.isAmountCapped$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.isCriticalPolicyViolated$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.rate$.subscribe((res) => {
          expect(res).toEqual(10);
        });

        component.recentlyUsedProjects$.subscribe((res) => {
          expect(res).toEqual(recentlyUsedProjectRes);
        });

        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], transformedResponse);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.getMileageByVehicleType).toHaveBeenCalledOnceWith(unfilteredMileageRatesData, null);
        expect(mileageRatesService.getReadableRate).toHaveBeenCalledOnceWith(null, 'INR', null);
      }));

      it('should setup class variables without mileage rates and payment modes', fakeAsync(() => {
        component.mode = 'add';
        activatedRoute.snapshot.params.navigate_back = true;
        activatedRoute.snapshot.params.activeIndex = 0;
        activatedRoute.snapshot.params.txnIds = JSON.stringify(['tx3qwe4ty', 'tx6sd7gh', 'txD3cvb6']);
        spyOn(component, 'getRecentlyUsedValues').and.returnValue(of(null));
        expenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));
        mileageRatesService.getAllMileageRates.and.returnValue(of([]));
        mileageService.getEmployeeMileageSettings.and.returnValue(of(null));
        mileageRatesService.filterEnabledMileageRates.and.returnValue([]);
        spyOn(component, 'getEditExpense').and.returnValue(of(unflattenedTxnData));
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(null);
        fixture.detectChanges();

        component.ionViewWillEnter();
        tick(1000);
        fixture.detectChanges();

        setupMatchers();

        component.mileageConfig$.subscribe((res) => {
          expect(res).toEqual(orgSettingsRes.mileage);
        });

        component.recentlyUsedValues$.subscribe((res) => {
          expect(res).toBeNull();
        });

        expect(component.getRecentlyUsedValues).toHaveBeenCalledTimes(1);

        component.recentlyUsedMileageLocations$.subscribe((res) => {
          expect(res).toEqual({ start_locations: [], end_locations: [], locations: [] });
        });

        component.isProjectVisible$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.mileageRates$.subscribe((res) => {
          expect(res).toEqual([]);
        });

        expect(component.getMileageRatesOptions).toHaveBeenCalledTimes(1);

        component.etxn$.subscribe((res) => {
          expect(res).toEqual(unflattenedTxnData);
        });

        component.isAmountDisabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isIndividualProjectsEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.individualProjectIds$.subscribe((res) => {
          expect(res).toEqual([290054, 316444, 316446, 149230, 316442, 316443]);
        });

        component.isProjectsEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        expect(component.getCustomInputs).toHaveBeenCalledTimes(1);

        component.isCostCentersEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.reports$.subscribe((res) => {
          expect(res).toEqual(reportOptionsData3);
        });

        expect(platformReportService.getAllReportsByParams).toHaveBeenCalledOnceWith({
          state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        });
        expect(component.setupTxnFields).toHaveBeenCalledTimes(1);

        component.isAmountCapped$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isCriticalPolicyViolated$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.rate$.subscribe((res) => {
          expect(res).toEqual(10);
        });

        component.recentlyUsedProjects$.subscribe((res) => {
          expect(res).toEqual(recentlyUsedProjectRes);
        });

        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], transformedResponse);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.getMileageByVehicleType).toHaveBeenCalledOnceWith([], null);
        expect(mileageRatesService.getReadableRate).toHaveBeenCalledOnceWith(null, 'INR', null);
      }));

      it('should set commuteDetails if commute deduction is enabled for org', fakeAsync(() => {
        component.mode = 'edit';
        activatedRoute.snapshot.params.navigate_back = true;
        activatedRoute.snapshot.params.activeIndex = 0;
        activatedRoute.snapshot.params.txnIds = JSON.stringify(['tx3qwe4ty', 'tx6sd7gh', 'txD3cvb6']);
        spyOn(component, 'getRecentlyUsedValues').and.returnValue(of(null));
        expenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));
        mileageRatesService.getAllMileageRates.and.returnValue(of([]));
        mileageService.getEmployeeMileageSettings.and.returnValue(of(null));
        mileageRatesService.filterEnabledMileageRates.and.returnValue([]);
        spyOn(component, 'getEditExpense').and.returnValue(of(unflattenedTxnData));
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(null);
        mileageService.isCommuteDeductionEnabled.and.returnValue(true);
        const mockOrgSettings = cloneDeep(orgSettingsRes);
        mockOrgSettings.commute_deduction_settings = { allowed: true, enabled: true };
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        employeesService.getCommuteDetails.and.returnValue(of(commuteDetailsResponseData));
        mileageService.getCommuteDeductionOptions.and.returnValue(commuteDeductionOptionsData1);
        fixture.detectChanges();

        component.ionViewWillEnter();
        tick(1000);
        fixture.detectChanges();

        setupMatchers();

        expect(component.commuteDetails).toEqual(commuteDetailsResponseData.data[0].commute_details);
        expect(employeesService.getCommuteDetails).toHaveBeenCalledOnceWith(apiEouRes);
        expect(component.distanceUnit).toEqual('Miles');
        expect(mileageService.getCommuteDeductionOptions).toHaveBeenCalledOnceWith(10);
      }));

      it('should set distanceUnit to kilometers if mileage unit is KM and commute details to null if employee service returns no data', fakeAsync(() => {
        component.mode = 'edit';
        activatedRoute.snapshot.params.navigate_back = true;
        activatedRoute.snapshot.params.activeIndex = 0;
        activatedRoute.snapshot.params.txnIds = JSON.stringify(['tx3qwe4ty', 'tx6sd7gh', 'txD3cvb6']);
        spyOn(component, 'getRecentlyUsedValues').and.returnValue(of(null));
        expenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));
        mileageRatesService.getAllMileageRates.and.returnValue(of([]));
        mileageService.getEmployeeMileageSettings.and.returnValue(of(null));
        mileageRatesService.filterEnabledMileageRates.and.returnValue([]);
        spyOn(component, 'getEditExpense').and.returnValue(of(unflattenedTxnData));
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(null);
        mileageService.isCommuteDeductionEnabled.and.returnValue(true);
        const mockOrgSettings = cloneDeep(orgSettingsRes);
        mockOrgSettings.commute_deduction_settings = { allowed: true, enabled: true };
        mockOrgSettings.mileage.unit = 'KM';
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        const mockCommuteDetailsResponse = cloneDeep(commuteDetailsResponseData);
        mockCommuteDetailsResponse.data = undefined;
        employeesService.getCommuteDetails.and.returnValue(of(mockCommuteDetailsResponse));
        mileageService.getCommuteDeductionOptions.and.returnValue(commuteDeductionOptionsData1);
        fixture.detectChanges();

        component.ionViewWillEnter();
        tick(1000);
        fixture.detectChanges();

        setupMatchers();

        expect(component.commuteDetails).toBeNull();
        expect(component.distanceUnit).toEqual('km');
      }));

      it('should set existing commute deduction and patch to form if commute_deduction is present in edit mode', fakeAsync(() => {
        component.mode = 'edit';
        activatedRoute.snapshot.params.navigate_back = true;
        activatedRoute.snapshot.params.activeIndex = 0;
        activatedRoute.snapshot.params.txnIds = JSON.stringify(['tx3qwe4ty', 'tx6sd7gh', 'txD3cvb6']);
        activatedRoute.snapshot.params.id = 'tx3qwe4ty';
        spyOn(component, 'getRecentlyUsedValues').and.returnValue(of(null));
        expenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));
        mileageRatesService.getAllMileageRates.and.returnValue(of([]));
        mileageService.getEmployeeMileageSettings.and.returnValue(of(null));
        mileageRatesService.filterEnabledMileageRates.and.returnValue([]);
        const mockEtxn = cloneDeep(unflattenedTxnData);
        mockEtxn.tx.commute_deduction = CommuteDeduction.ONE_WAY;
        spyOn(component, 'getEditExpense').and.returnValue(of(mockEtxn));
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(null);
        mileageService.isCommuteDeductionEnabled.and.returnValue(true);
        const mockOrgSettings = cloneDeep(orgSettingsRes);
        mockOrgSettings.commute_deduction_settings = { allowed: true, enabled: true };
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        employeesService.getCommuteDetails.and.returnValue(of(commuteDetailsResponseData));
        mileageService.getCommuteDeductionOptions.and.returnValue(commuteDeductionOptionsData1);
        fixture.detectChanges();

        component.ionViewWillEnter();
        tick(1000);
        fixture.detectChanges();

        setupMatchers();

        expect(component.existingCommuteDeduction).toEqual(CommuteDeduction.ONE_WAY);
        expect(component.fg.get('commuteDeduction').value).toEqual(CommuteDeduction.ONE_WAY);
      }));

      it('should call updateDistanceOnDeductionChange method if commuteDeduction form control value changes and commuteDetails is defined', fakeAsync(() => {
        component.mode = 'edit';
        activatedRoute.snapshot.params.navigate_back = true;
        activatedRoute.snapshot.params.activeIndex = 0;
        activatedRoute.snapshot.params.txnIds = JSON.stringify(['tx3qwe4ty', 'tx6sd7gh', 'txD3cvb6']);
        activatedRoute.snapshot.params.id = 'tx3qwe4ty';
        spyOn(component, 'getRecentlyUsedValues').and.returnValue(of(null));
        expenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));
        mileageRatesService.getAllMileageRates.and.returnValue(of([]));
        mileageService.getEmployeeMileageSettings.and.returnValue(of(null));
        mileageRatesService.filterEnabledMileageRates.and.returnValue([]);
        const mockEtxn = cloneDeep(unflattenedTxnData);
        mockEtxn.tx.commute_deduction = CommuteDeduction.ONE_WAY;
        spyOn(component, 'getEditExpense').and.returnValue(of(mockEtxn));
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(null);
        mileageService.isCommuteDeductionEnabled.and.returnValue(true);
        const mockOrgSettings = cloneDeep(orgSettingsRes);
        mockOrgSettings.commute_deduction_settings = { allowed: true, enabled: true };
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        const mockCommuteDetailsResponse = cloneDeep(commuteDetailsResponseData);
        employeesService.getCommuteDetails.and.returnValue(of(mockCommuteDetailsResponse));
        mileageService.getCommuteDeductionOptions.and.returnValue(commuteDeductionOptionsData1);
        mileageService.isCommuteDeductionEnabled.and.returnValue(true);
        spyOn(component, 'updateDistanceOnDeductionChange');
        spyOn(component, 'openCommuteDetailsModal');
        fixture.detectChanges();

        component.ionViewWillEnter();
        tick(1000);
        fixture.detectChanges();

        setupMatchers();

        component.commuteDetails.id = 12345;
        component.fg.get('commuteDeduction').setValue(CommuteDeduction.ROUND_TRIP);

        expect(component.updateDistanceOnDeductionChange).toHaveBeenCalledTimes(1);
        expect(component.openCommuteDetailsModal).not.toHaveBeenCalled();
      }));

      it('should call openCommuteDetailsModal method if commuteDeduction form control value changes and commuteDetails is not defined', fakeAsync(() => {
        component.mode = 'edit';
        activatedRoute.snapshot.params.navigate_back = true;
        activatedRoute.snapshot.params.activeIndex = 0;
        activatedRoute.snapshot.params.txnIds = JSON.stringify(['tx3qwe4ty', 'tx6sd7gh', 'txD3cvb6']);
        activatedRoute.snapshot.params.id = 'tx3qwe4ty';
        spyOn(component, 'getRecentlyUsedValues').and.returnValue(of(null));
        expenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));
        mileageRatesService.getAllMileageRates.and.returnValue(of([]));
        mileageService.getEmployeeMileageSettings.and.returnValue(of(null));
        mileageRatesService.filterEnabledMileageRates.and.returnValue([]);
        const mockEtxn = cloneDeep(unflattenedTxnData);
        mockEtxn.tx.commute_deduction = CommuteDeduction.ONE_WAY;
        spyOn(component, 'getEditExpense').and.returnValue(of(mockEtxn));
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(null);
        mileageService.isCommuteDeductionEnabled.and.returnValue(true);
        const mockOrgSettings = cloneDeep(orgSettingsRes);
        mockOrgSettings.commute_deduction_settings = { allowed: true, enabled: true };
        orgSettingsService.get.and.returnValue(of(mockOrgSettings));
        employeesService.getCommuteDetails.and.returnValue(of(commuteDetailsResponseData));
        mileageService.getCommuteDeductionOptions.and.returnValue(commuteDeductionOptionsData1);
        spyOn(component, 'updateDistanceOnDeductionChange');
        spyOn(component, 'openCommuteDetailsModal');
        fixture.detectChanges();

        component.ionViewWillEnter();
        tick(1000);
        fixture.detectChanges();

        setupMatchers();

        component.commuteDetails = null;
        component.fg.get('commuteDeduction').setValue(CommuteDeduction.ROUND_TRIP);

        expect(component.updateDistanceOnDeductionChange).not.toHaveBeenCalled();
        expect(component.openCommuteDetailsModal).toHaveBeenCalledTimes(1);
      }));
    });

    it('getMileageRatesOptions(): should get mileages rates options', (done) => {
      component.mileageRates$ = of(cloneDeep(mileageRateApiRes2));
      component.homeCurrency$ = of('USD');
      mileageRatesService.getReadableRate.withArgs(18, 'USD', 'MILES').and.returnValue('$10/mi');
      mileageRatesService.getReadableRate.withArgs(122, 'USD', 'MILES').and.returnValue('$10/mi');

      mileageRatesService.formatMileageRateName.withArgs('electric_car').and.returnValue('Electric Car');
      mileageRatesService.formatMileageRateName.withArgs('Type 1').and.returnValue('Car');

      component.getMileageRatesOptions();

      component.mileageRatesOptions$.subscribe((res) => {
        expect(res).toEqual(mileageRateOptions);
        expect(mileageRatesService.getReadableRate).toHaveBeenCalledTimes(2);
        expect(mileageRatesService.getReadableRate).toHaveBeenCalledWith(18, 'USD', 'MILES');
        expect(mileageRatesService.getReadableRate).toHaveBeenCalledWith(122, 'USD', 'MILES');
        expect(mileageRatesService.formatMileageRateName).toHaveBeenCalledTimes(2);
        expect(mileageRatesService.formatMileageRateName).toHaveBeenCalledWith('electric_car');
        expect(mileageRatesService.formatMileageRateName).toHaveBeenCalledWith('Type 1');
        done();
      });
    });

    describe('initSubjectObservables():', () => {
      it('should setup subject obserbvables', () => {
        platformHandlerService.registerBackButtonAction.and.stub();
        const dependentFieldSpy = jasmine.createSpyObj('DependentFieldComponent', ['ngOnInit']);

        component.projectDependentFieldsRef = dependentFieldSpy;
        component.costCenterDependentFieldsRef = dependentFieldSpy;

        component.initClassObservables();

        expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
          BackButtonActionPriority.MEDIUM,
          jasmine.any(Function),
        );
        expect(dependentFieldSpy.ngOnInit).toHaveBeenCalledTimes(2);
      });

      it('should setup observables without dependent fields observables', () => {
        platformHandlerService.registerBackButtonAction.and.stub();

        component.projectDependentFieldsRef = null;
        component.costCenterDependentFieldsRef = null;

        component.initClassObservables();

        expect(platformHandlerService.registerBackButtonAction).toHaveBeenCalledOnceWith(
          BackButtonActionPriority.MEDIUM,
          jasmine.any(Function),
        );
      });
    });

    it('should return true if expense amount is less than 1', () => {
      const result = component.getIsPolicyExpense(policyExpense3);

      expect(result).toBeTrue();
    });

    it('onRouteVisualizerClick(): should open route selector modal', fakeAsync(() => {
      const routeSelectorSpy = jasmine.createSpyObj('RouteSelectorComponent', ['openModal']);
      component.routeSelector = routeSelectorSpy;
      fixture.detectChanges();

      component.onRouteVisualizerClick();
      tick(500);

      expect(component.routeSelector.openModal).toHaveBeenCalledTimes(1);
    }));

    it('ngOnInit(): should set report flags if provided in route', () => {
      activatedRoute.snapshot.params.remove_from_report = JSON.stringify(true);
      fixture.detectChanges();

      component.ngOnInit();

      expect(component.isRedirectedFromReport).toBeTrue();
      expect(component.canRemoveFromReport).toBeTrue();
    });

    it('getCommuteUpdatedTextBody(): should return body text of commute updated popover', () => {
      const result = component.getCommuteUpdatedTextBody();

      expect(result).toEqual(
        `<div>
              <p>Your Commute Details have been successfully added to your Profile
              Settings.</p>
              <p>You can now easily deduct commute from your Mileage expenses.<p>  
            </div>`,
      );
    });

    it('showCommuteUpdatedPopover(): should show commute updated popover', fakeAsync(() => {
      const sizeLimitExceededPopoverSpy = jasmine.createSpyObj('sizeLimitExceededPopover', ['present']);
      popoverController.create.and.resolveTo(sizeLimitExceededPopoverSpy);
      spyOn(component, 'getCommuteUpdatedTextBody').and.returnValue('body message');

      component.showCommuteUpdatedPopover();
      tick(100);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Commute Updated',
          message: 'body message',
          primaryCta: {
            text: 'Proceed',
          },
        },
        cssClass: 'pop-up-in-center',
      });

      expect(sizeLimitExceededPopoverSpy.present).toHaveBeenCalledTimes(1);
    }));

    describe('openCommuteDetailsModal():', () => {
      beforeEach(() => {
        authService.getEou.and.resolveTo(apiEouRes);
        employeesService.getCommuteDetails.and.returnValue(of(commuteDetailsResponseData));
        mileageService.getCommuteDeductionOptions.and.returnValue(commuteDeductionOptionsData1);
        spyOn(component, 'showCommuteUpdatedPopover');
      });

      it('should set commuteDetails and change commute deduction form value to no deduction if user saves commute details from mileage page', fakeAsync(() => {
        const commuteDetailsModalSpy = jasmine.createSpyObj('commuteDetailsModal', ['present', 'onWillDismiss']);
        commuteDetailsModalSpy.onWillDismiss.and.resolveTo({
          data: { action: 'save', commuteDetails: commuteDetailsResponseData.data[0] },
        });
        modalController.create.and.resolveTo(commuteDetailsModalSpy);

        component.openCommuteDetailsModal();
        tick(100);

        expect(modalController.create).toHaveBeenCalledOnceWith({
          component: FySelectCommuteDetailsComponent,
          mode: 'ios',
        });
        expect(trackingService.commuteDeductionAddLocationOptionClicked).toHaveBeenCalledTimes(1);
        expect(commuteDetailsModalSpy.present).toHaveBeenCalledTimes(1);
        expect(commuteDetailsModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(employeesService.getCommuteDetails).toHaveBeenCalledOnceWith(apiEouRes);
        expect(component.commuteDetails).toEqual(commuteDetailsResponseData.data[0].commute_details);
        expect(component.commuteDeductionOptions).toEqual(commuteDeductionOptionsData1);
        expect(mileageService.getCommuteDeductionOptions).toHaveBeenCalledOnceWith(10);
        expect(component.showCommuteUpdatedPopover).toHaveBeenCalledTimes(1);
        expect(trackingService.commuteDeductionDetailsAddedFromMileageForm).toHaveBeenCalledOnceWith(
          commuteDetailsResponseData.data[0],
        );
      }));

      it('should set commuteDetails to null if data returns undefined', fakeAsync(() => {
        const commuteDetailsModalSpy = jasmine.createSpyObj('commuteDetailsModal', ['present', 'onWillDismiss']);
        commuteDetailsModalSpy.onWillDismiss.and.resolveTo({ data: { action: 'save' } });
        modalController.create.and.resolveTo(commuteDetailsModalSpy);

        const mockCommuteDetails = cloneDeep(commuteDetailsResponseData);
        mockCommuteDetails.data = undefined;
        employeesService.getCommuteDetails.and.returnValue(of(mockCommuteDetails));

        component.openCommuteDetailsModal();
        tick(100);

        expect(modalController.create).toHaveBeenCalledOnceWith({
          component: FySelectCommuteDetailsComponent,
          mode: 'ios',
        });

        expect(component.commuteDetails).toBeNull();
      }));

      it('should set commuteDetails and change commute deduction form value to null if user does not save commute details from mileage page', fakeAsync(() => {
        const commuteDetailsModalSpy = jasmine.createSpyObj('commuteDetailsModal', ['present', 'onWillDismiss']);
        commuteDetailsModalSpy.onWillDismiss.and.resolveTo({ data: { action: 'cancel' } });
        modalController.create.and.resolveTo(commuteDetailsModalSpy);

        component.openCommuteDetailsModal();
        tick(100);

        expect(modalController.create).toHaveBeenCalledOnceWith({
          component: FySelectCommuteDetailsComponent,
          mode: 'ios',
        });
        expect(commuteDetailsModalSpy.present).toHaveBeenCalledTimes(1);
        expect(commuteDetailsModalSpy.onWillDismiss).toHaveBeenCalledTimes(1);
        expect(authService.getEou).not.toHaveBeenCalled();
        expect(employeesService.getCommuteDetails).not.toHaveBeenCalled();
        expect(mileageService.getCommuteDeductionOptions).not.toHaveBeenCalled();
        expect(component.showCommuteUpdatedPopover).not.toHaveBeenCalled();
        expect(component.fg.get('commuteDeduction').value).toBeNull();
      }));
    });

    describe('updateDistanceOnRoundTripChange():', () => {
      it('should not modify distance if distance is zero', () => {
        component.fg.controls.route.setValue({ mileageLocations: [], distance: 0, roundTrip: false });

        component.updateDistanceOnRoundTripChange();

        expect(component.fg.controls.route.value.distance).toEqual(0);
      });

      it('should not modify distance if commuteDeduction is not defined', () => {
        component.fg.controls.route.setValue({ mileageLocations: [], distance: 23, roundTrip: false });
        component.fg.controls.commuteDeduction.setValue(null);

        component.updateDistanceOnRoundTripChange();

        expect(component.fg.controls.route.value.distance).toEqual(23);
      });

      it('should not modify distance if previous round trip is equal to current round trip value', () => {
        component.previousRouteValue = { mileageLocations: [], distance: 23, roundTrip: false };
        component.fg.controls.route.setValue({ mileageLocations: [], distance: 23, roundTrip: false });
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.updateDistanceOnRoundTripChange();

        expect(component.fg.controls.route.value.distance).toEqual(23);
      });

      it('should not modify distance if route form value and previousRouteValue are null', () => {
        component.previousRouteValue = null;
        component.fg.controls.route.setValue(null);
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.updateDistanceOnRoundTripChange();

        expect(component.fg.controls.route.value).toBeNull();
      });

      it('should calculate distance and deduct commute properly if round trip is marked', () => {
        component.fg.controls.route.setValue({ mileageLocations: [], distance: 230, roundTrip: true });
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.updateDistanceOnRoundTripChange();

        expect(component.fg.controls.route.value.distance).toEqual(660);
      });

      it('should not change distance from zero if round trip is marked and locations are not present', () => {
        component.fg.controls.route.setValue({ mileageLocations: null, distance: 0, roundTrip: true });
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.updateDistanceOnRoundTripChange();

        expect(component.fg.controls.route.value.distance).toEqual(0);
      });

      it('should calculate distance and deduct commute properly if round trip is unmarked', () => {
        component.fg.controls.route.setValue({ mileageLocations: [], distance: 230, roundTrip: false });
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.updateDistanceOnRoundTripChange();

        expect(component.fg.controls.route.value.distance).toEqual(15);
      });

      it('should set distance as zero if after calculation distance is negative if round trip is unmarked', () => {
        component.fg.controls.route.setValue({ mileageLocations: [], distance: 150, roundTrip: false });
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.updateDistanceOnRoundTripChange();

        expect(component.fg.controls.route.value.distance).toEqual(0);
      });

      it('should correctly calculate distance if initially distance is zero, locations are present and roundTrip is checked as true', () => {
        const mockLocations = cloneDeep([locationData1, locationData2]);
        component.fg.controls.route.setValue({ mileageLocations: mockLocations, distance: 0, roundTrip: true });
        component.distanceUnit = 'Miles';
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);
        mileageService.getDistance.and.returnValue(of(200000));

        component.updateDistanceOnRoundTripChange();

        /*
         * 200 KM -> 124.26 Miles,
         * 124.26 * 2 = 248.52 Miles
         * 248.52 - 200 = 48.52 Miles
         */
        expect(component.fg.controls.route.value.distance).toEqual(48.52);
      });

      it('should set distance as zero if locations are present and roundTrip is checked as true but it is less than commute deduction', () => {
        const mockLocations = cloneDeep([locationData1, locationData2]);
        component.fg.controls.route.setValue({ mileageLocations: mockLocations, distance: 0, roundTrip: true });
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);
        mileageService.getDistance.and.returnValue(of(90000));

        component.updateDistanceOnRoundTripChange();

        /*
         * 90 * 2 = 180 KM
         * 180 - 200 = -20 KM
         */
        expect(component.fg.controls.route.value.distance).toEqual(0);
      });
    });

    describe('calculateNetDistanceForDeduction()', () => {
      it('should deduct commute distance from original distance and patch the value in form', () => {
        component.fg.controls.route.setValue({ mileageLocations: [], distance: 230 });
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.initialDistance = 300;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.calculateNetDistanceForDeduction('ONE_WAY', commuteDeductionOptionsData1[0]);

        expect(component.fg.controls.route.value.distance).toEqual(200);
        expect(component.previousCommuteDeductionType).toEqual('ONE_WAY');
      });

      it('should set distance to zero if commute deduction is more than the original distance', () => {
        component.fg.controls.route.setValue({ mileageLocations: [locationData1, locationData2], distance: 230 });
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.initialDistance = 90;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.calculateNetDistanceForDeduction('ONE_WAY', commuteDeductionOptionsData1[0]);

        expect(component.fg.controls.route.value.distance).toEqual(0);
        expect(component.previousCommuteDeductionType).toEqual('ONE_WAY');
      });

      it('should not set previousCommuteDeductionType if locations are not present', () => {
        component.fg.controls.route.setValue({ mileageLocations: null, distance: 230 });
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.initialDistance = 90;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.calculateNetDistanceForDeduction('ONE_WAY', commuteDeductionOptionsData1[0]);

        expect(component.fg.controls.route.value.distance).toEqual(0);
        expect(component.previousCommuteDeductionType).toBeUndefined();
      });
    });

    describe('updateDistanceOnDeductionChange():', () => {
      it('should not update distance if route form value is null', () => {
        component.fg.controls.route.setValue(null);
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.updateDistanceOnDeductionChange('ONE_WAY');

        expect(component.fg.controls.route.value).toBeNull();
      });

      it('should set initial distance and call calculateNetDistanceForDeduction if previousCommuteDeductionType is present', () => {
        component.previousCommuteDeductionType = CommuteDeduction.ROUND_TRIP;
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.route.setValue({ mileageLocations: null, distance: 230 });
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);
        spyOn(component, 'calculateNetDistanceForDeduction');

        component.updateDistanceOnDeductionChange('ONE_WAY');

        expect(component.initialDistance).toEqual(430);
        expect(component.calculateNetDistanceForDeduction).toHaveBeenCalledOnceWith(
          'ONE_WAY',
          commuteDeductionOptionsData1[0],
        );
      });

      it('should set initial distance as distance from expense and call calculateNetDistanceForDeduction if expense is in edit mode', () => {
        component.existingCommuteDeduction = CommuteDeduction.ROUND_TRIP;
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        activatedRoute.snapshot.params.id = 'txe3dfgre43d';
        component.fg.controls.route.setValue({ mileageLocations: null, distance: 250 });
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);
        spyOn(component, 'calculateNetDistanceForDeduction');

        component.updateDistanceOnDeductionChange('ONE_WAY');

        expect(component.initialDistance).toEqual(450);
        expect(component.calculateNetDistanceForDeduction).toHaveBeenCalledOnceWith(
          'ONE_WAY',
          commuteDeductionOptionsData1[0],
        );
      });

      it('should set initial distance as distance present in form and call calculateNetDistanceForDeduction if user is selecting commute deduction for first time', () => {
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.route.setValue({ mileageLocations: null, distance: 250 });
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);
        spyOn(component, 'calculateNetDistanceForDeduction');

        component.updateDistanceOnDeductionChange('ONE_WAY');

        expect(component.initialDistance).toEqual(250);
        expect(component.calculateNetDistanceForDeduction).toHaveBeenCalledOnceWith(
          'ONE_WAY',
          commuteDeductionOptionsData1[0],
        );
      });

      it('should set initial distance as distance between the locations and call calculateNetDistanceForDeduction if mileage locations are present and distance is set as zero', () => {
        mileageService.getDistance.and.returnValue(of(200000));
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.route.setValue({ mileageLocations: [locationData1, locationData2], distance: 0 });
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);
        spyOn(component, 'calculateNetDistanceForDeduction');

        component.updateDistanceOnDeductionChange('ONE_WAY');

        expect(component.initialDistance).toEqual(200);
        expect(component.calculateNetDistanceForDeduction).toHaveBeenCalledOnceWith(
          'ONE_WAY',
          commuteDeductionOptionsData1[0],
        );
      });

      it('should set initial distance as distance between the locations and call calculateNetDistanceForDeduction if mileage locations are present and distance is set as zero with distance unit as miles', () => {
        mileageService.getDistance.and.returnValue(of(21000));
        component.distanceUnit = 'Miles';
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.route.setValue({
          mileageLocations: [locationData1, locationData2],
          distance: 0,
          roundTrip: true,
        });
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);
        spyOn(component, 'calculateNetDistanceForDeduction');

        component.updateDistanceOnDeductionChange('ONE_WAY');

        expect(component.initialDistance).toEqual(26.1);
        expect(component.calculateNetDistanceForDeduction).toHaveBeenCalledOnceWith(
          'ONE_WAY',
          commuteDeductionOptionsData1[0],
        );
      });
    });

    describe('updateDistanceOnLocationChange():', () => {
      it('should not update distance if route form value is null', () => {
        component.fg.controls.route.setValue(null);
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ROUND_TRIP);

        component.updateDistanceOnLocationChange(230);

        expect(component.fg.controls.route.value).toBeNull();
      });

      it('should patch distance to form if previous mileage locations and current locations are not same', () => {
        component.previousRouteValue = { mileageLocations: [], distance: 230, roundTrip: true };
        component.fg.controls.route.setValue({
          mileageLocations: [locationData1, locationData2],
          distance: 230,
          roundTrip: true,
        });

        component.updateDistanceOnLocationChange(230);

        expect(component.fg.controls.route.value).toEqual({
          distance: 230,
          roundTrip: true,
        });
      });

      it('should calculate distance after commute deduction and patch value to the form if previous mileage locations and current locations are not same', () => {
        component.previousRouteValue = { mileageLocations: [], distance: 230, roundTrip: true };
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ONE_WAY);
        component.fg.controls.route.setValue({
          mileageLocations: [locationData1, locationData2],
          distance: 230,
          roundTrip: true,
        });

        component.updateDistanceOnLocationChange(230);

        expect(component.previousRouteValue).toEqual({
          mileageLocations: [locationData1, locationData2],
          distance: 230,
          roundTrip: true,
        });
        expect(component.fg.controls.route.value).toEqual({
          distance: 130,
          roundTrip: true,
        });
      });

      it('should calculate distance after commute deduction and patch value to the form if previous mileage locations and current locations are not same and commute deduction is greater than distance', () => {
        component.previousRouteValue = { mileageLocations: [], distance: 230, roundTrip: true };
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ONE_WAY);
        component.fg.controls.route.setValue({
          mileageLocations: [locationData1, locationData2],
          distance: 230,
          roundTrip: true,
        });

        component.updateDistanceOnLocationChange(90);

        expect(component.previousRouteValue).toEqual({
          mileageLocations: [locationData1, locationData2],
          distance: 230,
          roundTrip: true,
        });
        expect(component.fg.controls.route.value).toEqual({
          distance: 0,
          roundTrip: true,
        });
      });

      it('should calculate distance after commute deduction but should not set previousRouteValue if route mileageLocations is null', () => {
        component.previousRouteValue = { mileageLocations: [], distance: 230, roundTrip: true };
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ONE_WAY);
        component.fg.controls.route.setValue({
          mileageLocations: null,
          distance: 230,
          roundTrip: true,
        });

        component.updateDistanceOnLocationChange(230);

        expect(component.previousRouteValue).toEqual({
          mileageLocations: [],
          distance: 230,
          roundTrip: true,
        });
        expect(component.fg.controls.route.value).toEqual({
          distance: 130,
          roundTrip: true,
        });
      });

      it('should calculate distance after commute deduction but should not set previousRouteValue if route mileageLocations is null and commuteDeduction is greater than distance', () => {
        component.previousRouteValue = { mileageLocations: [], distance: 230, roundTrip: true };
        component.commuteDeductionOptions = commuteDeductionOptionsData1;
        component.fg.controls.commuteDeduction.setValue(CommuteDeduction.ONE_WAY);
        component.fg.controls.route.setValue({
          mileageLocations: null,
          distance: 230,
          roundTrip: true,
        });

        component.updateDistanceOnLocationChange(90);

        expect(component.previousRouteValue).toEqual({
          mileageLocations: [],
          distance: 230,
          roundTrip: true,
        });
        expect(component.fg.controls.route.value).toEqual({
          distance: 0,
          roundTrip: true,
        });
      });
    });

    describe('setupFilteredCategories():', () => {
      beforeEach(() => {
        component.mode = 'add';
        component.isProjectCategoryRestrictionsEnabled$ = of(true);
        component.subCategories$ = of(unsortedCategories1);
        projectsService.getAllowedOrgCategoryIds.and.returnValue(unsortedCategories1);
      });

      it('should set billable to false when user clears the project', fakeAsync(() => {
        component.setupFilteredCategories();
        tick(500);

        component.fg.controls.project.markAsDirty();
        component.fg.controls.project.setValue(null);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should not reset billable when project is null and user has not interacted with the project', fakeAsync(() => {
        component.showBillable = true;
        component.fg.controls.billable.setValue(true);

        component.setupFilteredCategories();
        tick(500);

        component.fg.controls.project.setValue(null);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeTrue();
      }));

      it('should set billable to true when project with default_billable true is selected', fakeAsync(() => {
        component.showBillable = true;
        component.setupFilteredCategories();
        tick(500);

        const projectWithBillable = {
          ...expectedProjectsResponse[0],
          default_billable: true,
        };
        component.fg.controls.project.setValue(projectWithBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeTrue();
      }));

      it('should set billable to false when project with default_billable false is selected', fakeAsync(() => {
        component.showBillable = true;
        component.setupFilteredCategories();
        tick(500);

        const projectWithNonBillable = {
          ...expectedProjectsResponse[0],
          default_billable: false,
        };
        component.fg.controls.project.setValue(projectWithNonBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should set billable to false when showBillable is false regardless of project default_billable', fakeAsync(() => {
        component.showBillable = false;
        component.setupFilteredCategories();
        tick(500);

        const projectWithBillable = {
          ...expectedProjectsResponse[0],
          default_billable: true,
        };
        component.fg.controls.project.setValue(projectWithBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should use project default_billable when user changes project even if expenseLevelBillable is true', fakeAsync(() => {
        component.showBillable = true;
        component.expenseLevelBillable = true;
        component.fg.controls.billable.setValue(true);

        component.setupFilteredCategories();
        tick(500);

        const projectWithNonBillable = {
          ...expectedProjectsResponse[0],
          default_billable: false,
        };
        component.fg.controls.project.markAsDirty();
        component.fg.controls.project.setValue(projectWithNonBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should not override saved expense billable with project default_billable in edit mode', fakeAsync(() => {
        component.mode = 'edit';
        component.showBillable = true;
        component.expenseLevelBillable = false;
        component.fg.controls.billable.setValue(false);

        component.setupFilteredCategories();
        tick(500);

        const projectWithBillable = {
          ...expectedProjectsResponse[0],
          default_billable: true,
        };
        component.fg.controls.project.setValue(projectWithBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should set billable from project default_billable in edit mode when billable is unset', fakeAsync(() => {
        component.mode = 'edit';
        component.showBillable = true;
        component.fg.controls.billable.setValue(null);

        component.setupFilteredCategories();
        tick(500);

        const projectWithBillable = {
          ...expectedProjectsResponse[0],
          default_billable: true,
        };
        component.fg.controls.project.setValue(projectWithBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeTrue();
      }));
    });
  });
}
