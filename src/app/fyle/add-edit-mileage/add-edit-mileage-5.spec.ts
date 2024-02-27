import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
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
import { orgUserSettingsData, orgUserSettingsWoProjects } from 'src/app/core/mock-data/org-user-settings.data';
import {
  recentlyUsedCostCentersRes,
  recentlyUsedMileages,
  recentlyUsedProjectRes,
  recentlyUsedRes,
} from 'src/app/core/mock-data/recently-used.data';
import { reportOptionsData4 } from 'src/app/core/mock-data/report-options.data';
import { expectedErpt } from 'src/app/core/mock-data/report-unflattened.data';
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
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StatusService } from 'src/app/core/services/status.service';
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

export function TestCases5(getTestBed) {
  return describe('AddEditMileage-5', () => {
    let component: AddEditMileagePage;
    let fixture: ComponentFixture<AddEditMileagePage>;
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
    let fileService: jasmine.SpyObj<FileService>;
    let popoverController: jasmine.SpyObj<PopoverController>;
    let currencyService: jasmine.SpyObj<CurrencyService>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let popupService: jasmine.SpyObj<PopupService>;
    let navController: jasmine.SpyObj<NavController>;
    let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
    let recentlyUsedItemsService: jasmine.SpyObj<RecentlyUsedItemsService>;
    let tokenService: jasmine.SpyObj<TokenService>;
    let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
    let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
    let actionSheetController: jasmine.SpyObj<ActionSheetController>;
    let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
    let sanitizer: jasmine.SpyObj<DomSanitizer>;
    let personalCardsService: jasmine.SpyObj<PersonalCardsService>;
    let matSnackBar: jasmine.SpyObj<MatSnackBar>;
    let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
    let platform: Platform;
    let titleCasePipe: jasmine.SpyObj<TitleCasePipe>;
    let paymentModesService: jasmine.SpyObj<PaymentModesService>;
    let taxGroupService: jasmine.SpyObj<TaxGroupService>;
    let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
    let mileageService: jasmine.SpyObj<MileageService>;
    let mileageRatesService: jasmine.SpyObj<MileageRatesService>;
    let locationService: jasmine.SpyObj<LocationService>;
    let platformHandlerService: jasmine.SpyObj<PlatformHandlerService>;

    beforeEach(() => {
      const TestBed = getTestBed();
      TestBed.compileComponents();

      fixture = TestBed.createComponent(AddEditMileagePage);
      component = fixture.componentInstance;

      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      formBuilder = TestBed.inject(FormBuilder);
      categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
      customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
      customFieldsService = TestBed.inject(CustomFieldsService) as jasmine.SpyObj<CustomFieldsService>;
      transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
      policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
      transactionOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
      fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
      popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
      currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      popupService = TestBed.inject(PopupService) as jasmine.SpyObj<PopupService>;
      navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
      corporateCreditCardExpenseService = TestBed.inject(
        CorporateCreditCardExpenseService
      ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      recentLocalStorageItemsService = TestBed.inject(
        RecentLocalStorageItemsService
      ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
      recentlyUsedItemsService = TestBed.inject(RecentlyUsedItemsService) as jasmine.SpyObj<RecentlyUsedItemsService>;
      tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
      expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
      modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
      actionSheetController = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
      orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
      sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
      personalCardsService = TestBed.inject(PersonalCardsService) as jasmine.SpyObj<PersonalCardsService>;
      matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
      snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
      platform = TestBed.inject(Platform);
      titleCasePipe = TestBed.inject(TitleCasePipe) as jasmine.SpyObj<TitleCasePipe>;
      paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
      taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
      orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
      storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
      launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
      mileageService = TestBed.inject(MileageService) as jasmine.SpyObj<MileageService>;
      mileageRatesService = TestBed.inject(MileageRatesService) as jasmine.SpyObj<MileageRatesService>;
      locationService = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;
      platformHandlerService = TestBed.inject(PlatformHandlerService) as jasmine.SpyObj<PlatformHandlerService>;

      component.fg = formBuilder.group({
        mileage_rate_name: [],
        dateOfSpend: [, component.customDateValidator],
        route: [],
        paymentMode: [, Validators.required],
        purpose: [],
        project: [],
        billable: [],
        sub_category: [, Validators.required],
        custom_inputs: new FormArray([]),
        costCenter: [],
        report: [],
        duplicate_detection_reason: [],
        project_dependent_fields: formBuilder.array([]),
        cost_center_dependent_fields: formBuilder.array([]),
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
      spyOn(component, 'checkAvailableAdvance');
      spyOn(component, 'checkIndividualMileageEnabled');
      spyOn(component, 'setupFilteredCategories');
    }

    function getClassValues() {
      spyOn(component, 'getTransactionFields').and.returnValue(of(expenseFieldObjData));
      spyOn(component, 'getSubCategories').and.returnValue(of(mileageCategories2));
      spyOn(component, 'getProjectCategoryIds').and.returnValue(of(['141295', '141300']));
      spyOn(component, 'getNewExpense').and.returnValue(of(newExpenseMileageData1));
      spyOn(component, 'getCustomInputs').and.returnValue(of(null));
      spyOn(component, 'getPaymentModes').and.returnValue(of(accountOptionData1));
      spyOn(component, 'checkAdvanceEnabled').and.returnValue(of(true));
      spyOn(component, 'getCostCenters').and.returnValue(of(costCenterOptions2));
      spyOn(component, 'getEditRates').and.returnValue(of(10));
      spyOn(component, 'getAddRates').and.returnValue(of(10));
      spyOn(component, 'getCategories').and.returnValue(of(unsortedCategories1[2]));
      spyOn(component, 'getExpenseAmount').and.returnValue(of(100));
      spyOn(component, 'getProjects').and.returnValue(of(expectedProjectsResponse[0]));
      spyOn(component, 'getReports').and.returnValue(of(expectedErpt[0]));
      spyOn(component, 'getSelectedCostCenters').and.returnValue(of(costCentersData[0]));
      spyOn(component, 'getMileageByVehicleType').and.returnValue(unfilteredMileageRatesData[0]);
    }

    function setupMocks() {
      tokenService.getClusterDomain.and.resolveTo('domain');
      reportService.getAutoSubmissionReportName.and.returnValue(of('purpose'));
      storageService.get.and.resolveTo(true);
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      projectsService.getProjectCount.and.returnValue(of(2));
      statusService.find.and.returnValue(of(getEstatusApiResponse));
      mileageRatesService.getAllMileageRates.and.returnValue(of(unfilteredMileageRatesData));
      mileageService.getOrgUserMileageSettings.and.returnValue(of(orgUserSettingsData.mileage_settings));
      mileageRatesService.filterEnabledMileageRates.and.returnValue(cloneDeep(mileageRateApiRes2));
      mileageRatesService.getReadableRate.and.returnValue('10');
      mileageRatesService.formatMileageRateName.and.returnValue('Bicycle');
      recentlyUsedItemsService.getRecentCostCenters.and.returnValue(of(recentlyUsedCostCentersRes));
      reportService.getFilteredPendingReports.and.returnValue(of(expectedErpt));
      accountsService.getEtxnSelectedPaymentMode.and.returnValue(multiplePaymentModesData[0]);
      accountsService.getAccountTypeFromPaymentMode.and.returnValue(AccountType.PERSONAL);
      authService.getEou.and.resolveTo(apiEouRes);
      recentlyUsedItemsService.getRecentlyUsedProjects.and.returnValue(of(recentlyUsedProjectRes));
      customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo();
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
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
      expect(component.checkAdvanceEnabled).toHaveBeenCalledOnceWith(jasmine.any(Observable));
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
      expect(component.checkAvailableAdvance).toHaveBeenCalledTimes(1);
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
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
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

        component.isAdvancesEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
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

        expect(statusService.find).toHaveBeenCalledOnceWith('transactions', activatedRoute.snapshot.params.id);
        expect(component.checkIndividualMileageEnabled).toHaveBeenCalledOnceWith(jasmine.any(Observable));
        expect(mileageRatesService.getAllMileageRates).toHaveBeenCalledTimes(2);
        expect(mileageService.getOrgUserMileageSettings).toHaveBeenCalledTimes(1);

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

        expect(component.getCostCenters).toHaveBeenCalledOnceWith(jasmine.any(Observable), jasmine.any(Observable));

        component.reports$.subscribe((res) => {
          expect(res).toEqual(reportOptionsData4);
        });

        expect(reportService.getFilteredPendingReports).toHaveBeenCalledOnceWith({ state: 'edit' });

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
        orgUserSettingsService.get.and.returnValue(of(orgUserSettingsWoProjects));
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomPropertiesData6);
        fixture.detectChanges();

        component.ionViewWillEnter();
        tick(1000);

        setupMatchers();

        component.mileageConfig$.subscribe((res) => {
          expect(res).toEqual(orgSettingsRes.mileage);
        });

        component.isAdvancesEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
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
        expect(mileageService.getOrgUserMileageSettings).toHaveBeenCalledTimes(1);

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
          expect(res).toEqual(reportOptionsData4);
        });

        expect(reportService.getFilteredPendingReports).toHaveBeenCalledOnceWith({ state: 'edit' });

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
        statusService.find.and.returnValue(of(getEstatusApiResponse));
        mileageRatesService.getAllMileageRates.and.returnValue(of([]));
        mileageService.getOrgUserMileageSettings.and.returnValue(of(null));
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

        component.isAdvancesEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.recentlyUsedValues$.subscribe((res) => {
          expect(res).toBeNull();
        });

        expect(component.getRecentlyUsedValues).toHaveBeenCalledTimes(1);

        component.recentlyUsedMileageLocations$.subscribe((res) => {
          expect(res).toEqual({ recent_start_locations: [], recent_end_locations: [], recent_locations: [] });
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
          expect(res).toEqual(reportOptionsData4);
        });

        expect(reportService.getFilteredPendingReports).toHaveBeenCalledOnceWith({ state: 'edit' });
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
          jasmine.any(Function)
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
          jasmine.any(Function)
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
  });
}
