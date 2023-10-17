import { TitleCasePipe } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { BehaviorSubject, Subject, Subscription, of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { coordinatesData1, locationData1, predictedLocation1 } from 'src/app/core/mock-data/location.data';
import { mileageLocationData1 } from 'src/app/core/mock-data/mileage-location.data';
import {
  filterEnabledMileageRatesData,
  mileageRateApiRes1,
  unfilteredMileageRatesData,
} from 'src/app/core/mock-data/mileage-rate.data';
import {
  expectedMileageCategoriesData,
  mileageCategories2,
  mileageCategories3,
} from 'src/app/core/mock-data/org-category.data';
import {
  orgSettingsParams2,
  orgSettingsRes,
  orgSettingsWithExpenseFormAutofill,
} from 'src/app/core/mock-data/org-settings.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { recentlyUsedRes } from 'src/app/core/mock-data/recently-used.data';
import {
  newExpenseMileageData1,
  newExpenseMileageData2,
  unflattenedTxnData,
  unflattenedTxnWithSourceID,
  unflattenedTxnWithSourceID2,
} from 'src/app/core/mock-data/unflattened-txn.data';
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
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
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
import { accountsData, multiplePaymentModesData } from 'src/app/core/test-data/accounts.service.spec.data';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { AddEditMileagePage } from './add-edit-mileage.page';
import { setFormValid } from './add-edit-mileage.page.setup.spec';
import { criticalPolicyViolation1 } from 'src/app/core/mock-data/crtical-policy-violations.data';
import { policyViolation1 } from 'src/app/core/mock-data/policy-violation.data';
import { platformPolicyExpenseData1 } from 'src/app/core/mock-data/platform-policy-expense.data';
import { expensePolicyData } from 'src/app/core/mock-data/expense-policy.data';
import { projectDependentFields } from 'src/app/core/mock-data/dependent-field.data';
import { dependentCustomFields2 } from 'src/app/core/mock-data/expense-field.data';
import { txnCustomPropertiesData } from 'src/app/core/mock-data/txn-custom-properties.data';
import { txnCustomProperties2 } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { cloneDeep } from 'lodash';
import { customInputData1 } from 'src/app/core/mock-data/custom-input.data';
import { CustomInput } from 'src/app/core/models/custom-input.model';

export function TestCases2(getTestBed) {
  return describe('AddEditMileage-2', () => {
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
    let handleDuplicates: jasmine.SpyObj<HandleDuplicatesService>;
    let paymentModesService: jasmine.SpyObj<PaymentModesService>;
    let taxGroupService: jasmine.SpyObj<TaxGroupService>;
    let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
    let mileageService: jasmine.SpyObj<MileageService>;
    let mileageRatesService: jasmine.SpyObj<MileageRatesService>;
    let locationService: jasmine.SpyObj<LocationService>;

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
      handleDuplicates = TestBed.inject(HandleDuplicatesService) as jasmine.SpyObj<HandleDuplicatesService>;
      paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
      taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
      orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
      storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
      launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
      mileageService = TestBed.inject(MileageService) as jasmine.SpyObj<MileageService>;
      mileageRatesService = TestBed.inject(MileageRatesService) as jasmine.SpyObj<MileageRatesService>;
      locationService = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;

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
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('setupNetworkWatcher(): should setup a network watcher', (done) => {
      networkService.connectivityWatcher.and.returnValue(new EventEmitter<boolean>());
      networkService.isOnline.and.returnValue(of(true));
      fixture.detectChanges();

      component.setupNetworkWatcher();

      component.connectionStatus$.subscribe((res) => {
        expect(res).toEqual({
          connected: true,
        });
      });
      expect(networkService.connectivityWatcher).toHaveBeenCalledTimes(1);
      expect(networkService.isOnline).toHaveBeenCalledTimes(1);
      done();
    });

    it('getMileageCategories(): should get all mileage categories', (done) => {
      categoriesService.getAll.and.returnValue(of(mileageCategories2));

      component.getMileageCategories().subscribe((res) => {
        expect(res).toEqual({
          defaultMileageCategory: mileageCategories2[0],
          mileageCategories: [mileageCategories2[1]],
        });
        expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('getSubCategories():', () => {
      it('should get sub categories', (done) => {
        categoriesService.getAll.and.returnValue(of(mileageCategories2));

        component.getSubCategories().subscribe((res) => {
          expect(res).toEqual([mileageCategories2[0]]);
          expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should return empty arrays if category could not be found', (done) => {
        categoriesService.getAll.and.returnValue(of(mileageCategories3));

        component.getSubCategories().subscribe((res) => {
          expect(res).toEqual(expectedMileageCategoriesData);
          expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('getRateByVehicleType(): should get rate by vehicle type', () => {
      const result = component.getRateByVehicleType(unfilteredMileageRatesData, 'bicycle');

      expect(result).toEqual(10);
    });

    it('getMileageByVehicleType(): should get mileage by vehicle type', () => {
      const result = component.getMileageByVehicleType(unfilteredMileageRatesData, 'bicycle');

      expect(result).toEqual(unfilteredMileageRatesData[0]);
    });

    describe('saveAndNewExpense():', () => {
      it('should add an expense in add mode if the payment mode is valid', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        setFormValid(component);
        component.mode = 'add';
        spyOn(component, 'addExpense').and.returnValue(of(true));
        spyOn(component, 'reloadCurrentRoute');
        fixture.detectChanges();

        component.saveAndNewExpense();

        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
        expect(component.addExpense).toHaveBeenCalledTimes(1);
        expect(component.reloadCurrentRoute).toHaveBeenCalledTimes(1);
        expect(trackingService.clickSaveAddNew).toHaveBeenCalledTimes(1);
      });

      it('should edit an expense in edit mode if the payment mode is valid', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        setFormValid(component);
        component.mode = 'edit';
        spyOn(component, 'editExpense').and.returnValue(of(null));
        spyOn(component, 'close');
        fixture.detectChanges();

        component.saveAndNewExpense();

        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
        expect(component.editExpense).toHaveBeenCalledTimes(1);
        expect(component.close).toHaveBeenCalledTimes(1);
      });

      it('should show an error if payment mode is invalid', fakeAsync(() => {
        spyOn(component, 'showFormValidationErrors');
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(true));
        fixture.detectChanges();

        component.saveAndNewExpense();
        tick(4000);

        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      }));
    });

    describe('saveExpense():', () => {
      it('should add an expense in add mode if the payment mode is valid', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        setFormValid(component);
        component.mode = 'add';
        spyOn(component, 'addExpense').and.returnValue(of(true));

        spyOn(component, 'close');
        fixture.detectChanges();

        component.saveExpense();

        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
        expect(component.addExpense).toHaveBeenCalledTimes(1);
        expect(component.close).toHaveBeenCalledTimes(1);
      });

      it('should edit an expense in edit mode if the payment mode is valid', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        setFormValid(component);
        component.mode = 'edit';
        spyOn(component, 'editExpense').and.returnValue(of(null));
        spyOn(component, 'close');
        fixture.detectChanges();

        component.saveExpense();

        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
        expect(component.editExpense).toHaveBeenCalledTimes(1);
        expect(component.close).toHaveBeenCalledTimes(1);
      });

      it('should show an error if payment mode is invalid', fakeAsync(() => {
        spyOn(component, 'showFormValidationErrors');
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(true));
        fixture.detectChanges();

        component.saveExpense();
        tick(4000);

        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      }));
    });

    describe('getNewExpense():', () => {
      beforeEach(function () {
        jasmine.clock().install();
      });

      it('should get a new expense object', (done) => {
        const date = new Date('2023-08-21T07:43:15.592Z');
        jasmine.clock().mockDate(date);
        transactionService.getDefaultVehicleType.and.returnValue(of('CAR'));
        mileageService.getOrgUserMileageSettings.and.returnValue(of(orgUserSettingsData.mileage_settings));
        orgSettingsService.get.and.returnValue(of(cloneDeep(orgSettingsParams2)));
        orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.mileageRates$ = of(unfilteredMileageRatesData);
        spyOn(component, 'getMileageByVehicleType').and.returnValue(filterEnabledMileageRatesData[0]);
        authService.getEou.and.resolveTo(apiEouRes);
        locationService.getCurrentLocation.and.returnValue(of(coordinatesData1));
        spyOn(component, 'getMileageCategories').and.returnValue(
          of({
            defaultMileageCategory: mileageCategories2[0],
            mileageCategories: [mileageCategories2[1]],
          })
        );
        component.homeCurrency$ = of('USD');
        fixture.detectChanges();

        component.getNewExpense().subscribe((res) => {
          expect(res).toEqual(newExpenseMileageData1);
          expect(transactionService.getDefaultVehicleType).toHaveBeenCalledTimes(1);
          expect(mileageService.getOrgUserMileageSettings).toHaveBeenCalledTimes(1);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(3);
          expect(orgUserSettingsService.get).toHaveBeenCalledTimes(2);
          expect(locationService.getCurrentLocation).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(2);
          expect(component.getMileageByVehicleType).toHaveBeenCalledOnceWith(unfilteredMileageRatesData, 'bicycle');
          expect(component.getMileageCategories).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should get a new expense with autofill enabled and populating the location fields', (done) => {
        const date = new Date('2023-08-21T07:43:15.592Z');
        jasmine.clock().mockDate(date);
        transactionService.getDefaultVehicleType.and.returnValue(of('CAR'));
        mileageService.getOrgUserMileageSettings.and.returnValue(of(orgUserSettingsData.mileage_settings));
        orgSettingsService.get.and.returnValue(of(orgSettingsWithExpenseFormAutofill));
        orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
        locationService.getAutocompletePredictions.and.returnValue(of(predictedLocation1));
        locationService.getGeocode.and.returnValue(of(locationData1));
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.mileageRates$ = of(unfilteredMileageRatesData);
        spyOn(component, 'getMileageByVehicleType').and.returnValue(filterEnabledMileageRatesData[0]);
        authService.getEou.and.resolveTo(apiEouRes);
        locationService.getCurrentLocation.and.returnValue(of(coordinatesData1));
        spyOn(component, 'getMileageCategories').and.returnValue(
          of({
            defaultMileageCategory: mileageCategories2[0],
            mileageCategories: [mileageCategories2[1]],
          })
        );
        component.homeCurrency$ = of('USD');
        fixture.detectChanges();

        component.getNewExpense().subscribe((res) => {
          expect(res).toEqual(newExpenseMileageData2);
          expect(transactionService.getDefaultVehicleType).toHaveBeenCalledTimes(1);
          expect(mileageService.getOrgUserMileageSettings).toHaveBeenCalledTimes(1);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(3);
          expect(orgUserSettingsService.get).toHaveBeenCalledTimes(2);
          expect(locationService.getCurrentLocation).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(2);
          expect(component.getMileageByVehicleType).toHaveBeenCalledOnceWith(unfilteredMileageRatesData, 'bicycle');
          expect(component.getMileageCategories).toHaveBeenCalledTimes(1);
          expect(locationService.getAutocompletePredictions).toHaveBeenCalledOnceWith(
            'MG Road, Halasuru, Yellappa Chetty Layout, Sivanchetti Gardens, Bengaluru, Karnataka, India',
            'usvKA4X8Ugcr',
            '10.12,89.67'
          );
          expect(locationService.getGeocode).toHaveBeenCalledOnceWith(
            'ChIJbU60yXAWrjsR4E9-UejD3_g',
            'Bengaluru, Karnataka, India'
          );
          done();
        });
      });

      it('should get a new expense object if org user mileage service settings returns undefined', (done) => {
        const date = new Date('2023-08-21T07:43:15.592Z');
        jasmine.clock().mockDate(date);
        transactionService.getDefaultVehicleType.and.returnValue(of('CAR'));
        mileageService.getOrgUserMileageSettings.and.returnValue(of(undefined));
        orgSettingsService.get.and.returnValue(of(cloneDeep(orgSettingsParams2)));
        orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.mileageRates$ = of(unfilteredMileageRatesData);
        spyOn(component, 'getMileageByVehicleType').and.returnValue(filterEnabledMileageRatesData[0]);
        authService.getEou.and.resolveTo(apiEouRes);
        locationService.getCurrentLocation.and.returnValue(of(coordinatesData1));
        spyOn(component, 'getMileageCategories').and.returnValue(
          of({
            defaultMileageCategory: mileageCategories2[0],
            mileageCategories: [mileageCategories2[1]],
          })
        );
        component.homeCurrency$ = of('USD');
        fixture.detectChanges();

        const newExpense = component.getNewExpense();

        newExpense.subscribe((expectedNewExpense) => {
          expect(expectedNewExpense).toEqual(newExpenseMileageData1);
          expect(transactionService.getDefaultVehicleType).toHaveBeenCalledTimes(1);
          expect(mileageService.getOrgUserMileageSettings).toHaveBeenCalledTimes(1);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(3);
          expect(orgUserSettingsService.get).toHaveBeenCalledTimes(2);
          expect(locationService.getCurrentLocation).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(2);
          expect(component.getMileageByVehicleType).toHaveBeenCalledOnceWith(unfilteredMileageRatesData, 'bicycle');
          expect(component.getMileageCategories).toHaveBeenCalledTimes(1);
          done();
        });
      });

      afterEach(function () {
        jasmine.clock().uninstall();
      });
    });

    describe('checkIfInvalidPaymentMode():', () => {
      it('should return false if source ID is same and if txn amount and tentative amount is less than the current amount', (done) => {
        spyOn(component, 'getFormValues').and.returnValue({ paymentMode: multiplePaymentModesData[2] });
        component.etxn$ = of(unflattenedTxnWithSourceID);
        component.amount$ = of(101);
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeFalse();
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should return true if source ID is different and if tentative amount less than expense amount', (done) => {
        spyOn(component, 'getFormValues').and.returnValue({ paymentMode: accountsData[2] });
        component.etxn$ = of(unflattenedTxnWithSourceID2);
        component.amount$ = of(600);
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeTrue();
          expect(paymentModesService.showInvalidPaymentModeToast).toHaveBeenCalledTimes(1);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should return false if payment account is null', (done) => {
        spyOn(component, 'getFormValues').and.returnValue({ paymentMode: null });
        component.etxn$ = of(unflattenedTxnWithSourceID2);
        component.amount$ = of(600);
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeFalse();
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('showClosePopup():', () => {
      it('should show popup and if the user continues navigate to my expenses page', fakeAsync(() => {
        Object.defineProperty(component.fg, 'touched', {
          get: () => true,
        });

        const unsavedChangesPopOverSpy = jasmine.createSpyObj('unsavedChangesPopOver', ['present', 'onWillDismiss']);
        unsavedChangesPopOverSpy.onWillDismiss.and.resolveTo({
          data: {
            action: 'continue',
          },
        });
        popoverController.create.and.resolveTo(unsavedChangesPopOverSpy);
        spyOn(component, 'close');
        component.navigateBack = false;
        fixture.detectChanges();

        component.showClosePopup();
        tick(500);

        expect(popoverController.create).toHaveBeenCalledOnceWith({
          component: PopupAlertComponent,
          componentProps: {
            title: 'Unsaved Changes',
            message: 'You have unsaved information that will be lost if you discard this expense.',
            primaryCta: {
              text: 'Discard',
              action: 'continue',
            },
            secondaryCta: {
              text: 'Cancel',
              action: 'cancel',
            },
          },
          cssClass: 'pop-up-in-center',
        });
        expect(component.close).toHaveBeenCalledTimes(1);
      }));

      it('should show popup and if the user continues, go back to previous page', fakeAsync(() => {
        Object.defineProperty(component.fg, 'touched', {
          get: () => true,
        });

        const unsavedChangesPopOverSpy = jasmine.createSpyObj('unsavedChangesPopOver', ['present', 'onWillDismiss']);
        unsavedChangesPopOverSpy.onWillDismiss.and.resolveTo({
          data: {
            action: 'continue',
          },
        });
        popoverController.create.and.resolveTo(unsavedChangesPopOverSpy);
        component.navigateBack = true;
        fixture.detectChanges();

        component.showClosePopup();
        tick(500);

        expect(popoverController.create).toHaveBeenCalledOnceWith({
          component: PopupAlertComponent,
          componentProps: {
            title: 'Unsaved Changes',
            message: 'You have unsaved information that will be lost if you discard this expense.',
            primaryCta: {
              text: 'Discard',
              action: 'continue',
            },
            secondaryCta: {
              text: 'Cancel',
              action: 'cancel',
            },
          },
          cssClass: 'pop-up-in-center',
        });
        expect(navController.back).toHaveBeenCalledTimes(1);
      }));

      it('should not show popup and track the view event, navigate back to my expenses page', () => {
        component.presetLocation = locationData1[0];
        activatedRoute.snapshot.params.id = '123';

        spyOn(component, 'close');
        component.navigateBack = false;
        fixture.detectChanges();

        component.showClosePopup();

        expect(component.close).toHaveBeenCalledTimes(1);
        expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Mileage' });
        expect(popoverController.create).not.toHaveBeenCalled();
      });

      it('should not show popup and track the view event, navigate back to previous page', () => {
        component.presetLocation = locationData1[0];
        activatedRoute.snapshot.params.id = '123';

        component.navigateBack = true;
        fixture.detectChanges();

        component.showClosePopup();

        expect(navController.back).toHaveBeenCalledTimes(1);
        expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Mileage' });
        expect(popoverController.create).not.toHaveBeenCalled();
      });
    });

    describe('criticalPolicyViolationHandler():', () => {
      it('should return expense with permission from user to continue with critical policy violation', (done) => {
        spyOn(component, 'continueWithCriticalPolicyViolation').and.resolveTo(true);
        loaderService.showLoader.and.resolveTo();

        component
          .criticalPolicyViolationHandler({
            policyViolations: criticalPolicyViolation1,
            etxn: unflattenedTxnData,
          })
          .subscribe((res) => {
            expect(res).toEqual({ etxn: unflattenedTxnData });
            expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
            expect(component.continueWithCriticalPolicyViolation).toHaveBeenCalledOnceWith(criticalPolicyViolation1);
            done();
          });
      });

      it('should throw error if user denies permission', (done) => {
        spyOn(component, 'continueWithCriticalPolicyViolation').and.resolveTo(false);

        component
          .criticalPolicyViolationHandler({
            policyViolations: criticalPolicyViolation1,
            etxn: unflattenedTxnData,
          })
          .subscribe({
            next: () => {
              expect(component.continueWithCriticalPolicyViolation).toHaveBeenCalledOnceWith(criticalPolicyViolation1);
            },
            error: (err) => {
              expect(err).toBeTruthy();
              done();
            },
          });
      });
    });

    describe('policyViolationHandler():', () => {
      it('should return expense if user continues with a comment', (done) => {
        spyOn(component, 'continueWithPolicyViolations').and.resolveTo({
          comment: 'A comment',
        });
        loaderService.showLoader.and.resolveTo();

        component
          .policyViolationHandler({
            policyViolations: criticalPolicyViolation1,
            policyAction: policyViolation1.data.final_desired_state,
            etxn: unflattenedTxnData,
          })
          .subscribe((res) => {
            expect(res).toEqual({
              etxn: unflattenedTxnData,
              comment: 'A comment',
            });
            expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
            expect(component.continueWithPolicyViolations).toHaveBeenCalledOnceWith(
              criticalPolicyViolation1,
              policyViolation1.data.final_desired_state
            );
            done();
          });
      });

      it('should return expense with default comment if user continues without a comment', (done) => {
        spyOn(component, 'continueWithPolicyViolations').and.resolveTo({
          comment: '',
        });
        loaderService.showLoader.and.resolveTo();

        component
          .policyViolationHandler({
            policyViolations: criticalPolicyViolation1,
            policyAction: policyViolation1.data.final_desired_state,
            etxn: unflattenedTxnData,
          })
          .subscribe((res) => {
            expect(res).toEqual({
              etxn: unflattenedTxnData,
              comment: 'No policy violation explaination provided',
            });
            expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
            expect(component.continueWithPolicyViolations).toHaveBeenCalledOnceWith(
              criticalPolicyViolation1,
              policyViolation1.data.final_desired_state
            );
            done();
          });
      });

      it('should throw an error if user denies permission', (done) => {
        spyOn(component, 'continueWithPolicyViolations').and.resolveTo(null);

        component
          .policyViolationHandler({
            policyViolations: criticalPolicyViolation1,
            policyAction: policyViolation1.data.final_desired_state,
            etxn: unflattenedTxnData,
          })
          .subscribe({
            next: () => {
              expect(component.continueWithPolicyViolations).toHaveBeenCalledOnceWith(
                criticalPolicyViolation1,
                policyViolation1.data.final_desired_state
              );
            },
            error: (err) => {
              expect(err).toBeTruthy();
              done();
            },
          });
      });
    });

    it('checkPolicyViolation(): should check for policy violation', (done) => {
      component.mileageRates$ = of(cloneDeep(mileageRateApiRes1));
      spyOn(component, 'getMileageByVehicleType').and.returnValue(mileageRateApiRes1[0]);
      policyService.transformTo.and.returnValue(platformPolicyExpenseData1);
      transactionService.checkPolicy.and.returnValue(of(expensePolicyData));

      component.checkPolicyViolation(unflattenedTxnData).subscribe((res) => {
        expect(res).toEqual(expensePolicyData);
        expect(component.getMileageByVehicleType).toHaveBeenCalledOnceWith(
          mileageRateApiRes1,
          unflattenedTxnData.tx.mileage_vehicle_type
        );
        expect(transactionService.checkPolicy).toHaveBeenCalledOnceWith(platformPolicyExpenseData1);
        expect(policyService.transformTo).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('getCustomFields():', () => {
      it('should get custom fields data', (done) => {
        component.dependentFields$ = of(dependentCustomFields2);
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomProperties2);
        spyOn(component, 'getProjectDependentFields').and.returnValue([]);
        spyOn(component, 'getCostCenterDependentFields').and.returnValue([]);
        spyOn(component, 'getFormValues').and.returnValue(null);

        component.customInputs$ = of(txnCustomPropertiesData);
        component.fg = formBuilder.group({
          project_dependent_fields: [],
          custom_inputs: [],
          cost_center_dependent_fields: [],
        });
        component.fg.controls.custom_inputs.setValue(projectDependentFields);
        fixture.detectChanges();

        component.getCustomFields().subscribe(() => {
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], dependentCustomFields2);
          expect(component.getProjectDependentFields).toHaveBeenCalledTimes(1);
          expect(component.getCostCenterDependentFields).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should get custom inputs in case dependent fields are empty', (done) => {
        component.dependentFields$ = of(dependentCustomFields2);
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomProperties2);
        spyOn(component, 'getProjectDependentFields').and.returnValue([]);
        spyOn(component, 'getCostCenterDependentFields').and.returnValue([]);
        spyOn(component, 'getFormValues').and.returnValue({
          custom_inputs: customInputData1 as CustomInput[],
        });
        component.customInputs$ = of(txnCustomPropertiesData);

        fixture.detectChanges();

        component.getCustomFields().subscribe(() => {
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], dependentCustomFields2);
          expect(component.getProjectDependentFields).toHaveBeenCalledTimes(1);
          expect(component.getCostCenterDependentFields).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });
}
