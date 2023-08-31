import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject, Subscription, of } from 'rxjs';
import { costCenterOptions2, costCentersData, costCentersOptions } from 'src/app/core/mock-data/cost-centers.data';
import { customPropertiesData } from 'src/app/core/mock-data/custom-property.data';
import { txnFieldData2 } from 'src/app/core/mock-data/expense-field-obj.data';
import {
  dependentCustomFields2,
  expenseFieldResponse,
  expenseFieldWithBillable,
} from 'src/app/core/mock-data/expense-field.data';
import { formValue1, formValue2 } from 'src/app/core/mock-data/form-value.data';
import { locationData1, locationData2 } from 'src/app/core/mock-data/location.data';
import { filterEnabledMileageRatesData, unfilteredMileageRatesData } from 'src/app/core/mock-data/mileage-rate.data';
import { mileageCategories2, orgCategoryData, unsortedCategories1 } from 'src/app/core/mock-data/org-category.data';
import {
  orgSettingsCCDisabled,
  orgSettingsParamsWithSimplifiedReport,
  orgSettingsRes,
  orgSettingsWoAdvance,
} from 'src/app/core/mock-data/org-settings.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { recentlyUsedRes } from 'src/app/core/mock-data/recently-used.data';
import { draftReportPerDiemData, expectedErpt } from 'src/app/core/mock-data/report-unflattened.data';
import {
  txnCustomProperties4,
  txnCustomPropertiesData,
  txnCustomPropertiesData3,
} from 'src/app/core/mock-data/txn-custom-properties.data';
import {
  expectedUnflattendedTxnData5,
  newExpenseMileageData2,
  newMileageExpFromForm,
  newMileageExpFromForm2,
  newUnflattenedTxn,
  unflattenedTxnData,
  unflattenedTxnWithCC,
  unflattenedTxnWithCategory,
  unflattenedTxnWithReportID3,
} from 'src/app/core/mock-data/unflattened-txn.data';
import { CustomInput } from 'src/app/core/models/custom-input.model';
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
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { expectedProjectsResponse } from 'src/app/core/test-data/projects.spec.data';
import { AddEditMileagePage } from './add-edit-mileage.page';

export function TestCases4(getTestBed) {
  return describe('AddEditMileage-4', () => {
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
      component.selectedCostCenter$ = new BehaviorSubject(null);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('setupDependentFields(): should setup dependent fields', (done) => {
      component.setupDependentFields(of(dependentCustomFields2));

      component.dependentFields$.subscribe((res) => {
        expect(res).toEqual(dependentCustomFields2);
        done();
      });
    });

    describe('checkMileageCategories():', () => {
      it('should get default mileage category if a category is not set', (done) => {
        spyOn(component, 'getMileageCategories').and.returnValue(
          of({
            defaultMileageCategory: mileageCategories2[0],
            mileageCategories: [mileageCategories2[1]],
          })
        );

        component.checkMileageCategories(null).subscribe((res) => {
          expect(res).toEqual(mileageCategories2[0]);
          expect(component.getMileageCategories).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should return the category set by the user', (done) => {
        component.checkMileageCategories(orgCategoryData).subscribe((res) => {
          expect(res).toEqual(orgCategoryData);
          done();
        });
      });
    });

    describe('getCustomInputs():', () => {
      beforeEach(() => {
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        component.isConnected$ = of(true);
        spyOn(component, 'setupDependentFields');
        customInputsService.filterByCategory.and.returnValue(expenseFieldWithBillable);
      });

      it('should get custom inputs', (done) => {
        spyOn(component, 'getFormValues').and.returnValue({
          custom_inputs: customPropertiesData as CustomInput[],
        });
        spyOn(component, 'checkMileageCategories').and.returnValue(of(orgCategoryData));
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomPropertiesData);
        fixture.detectChanges();

        component.getCustomInputs().subscribe((res) => {
          expect(res.length).toEqual(8);
        });
        expect(component.setupDependentFields).toHaveBeenCalledOnceWith(jasmine.any(Observable));
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith(
          customPropertiesData,
          expenseFieldWithBillable
        );
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16566);
        done();
      });

      it('should get custom inputs if no previous custom inputs are assigned', (done) => {
        spyOn(component, 'checkMileageCategories').and.returnValue(of(orgCategoryData));
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomPropertiesData3);
        spyOn(component, 'getFormValues').and.returnValue({
          custom_inputs: null,
        });
        fixture.detectChanges();

        component.getCustomInputs().subscribe((res) => {
          expect(res.length).toEqual(6);
        });
        expect(component.setupDependentFields).toHaveBeenCalledOnceWith(jasmine.any(Observable));
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], expenseFieldWithBillable);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16566);
        expect(component.getFormValues).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('setupTxnFields():', () => {
      it('should setup transaction fields', () => {
        component.txnFields$ = of(txnFieldData2);
        component.isConnected$ = of(true);
        orgSettingsService.get.and.returnValue(of(orgSettingsRes));
        component.costCenters$ = of(costCentersOptions);
        component.isIndividualProjectsEnabled$ = of(true);
        component.individualProjectIds$ = of([316992, 316908]);
        component.fg.controls.purpose.setValue('Purpose');
        component.fg.controls.costCenter.setValue(costCentersData[0]);
        component.fg.controls.dateOfSpend.setValue(new Date('2021-07-29T06:30:00.000Z'));
        component.fg.controls.billable.setValue(true);
        component.fg.controls.project.setValue(expectedProjectsResponse[0]);
        fixture.detectChanges();

        component.setupTxnFields();

        expect(component.fg.controls.project.hasValidator(Validators.required)).toBeTrue();
        expect(component.fg.controls.costCenter.hasValidator(Validators.required)).toBeTrue();
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      });

      it('should set controllers to null where names match with keys in expense fields map', () => {
        component.txnFields$ = of(txnFieldData2);
        component.isConnected$ = of(false);
        orgSettingsService.get.and.returnValue(of(orgSettingsRes));
        component.costCenters$ = of([]);
        component.isIndividualProjectsEnabled$ = of(true);
        component.individualProjectIds$ = of([]);
        component.fg.controls.purpose.setValue('Purpose');
        component.fg.controls.costCenter.setValue(costCentersData[0]);
        component.fg.controls.dateOfSpend.setValue(new Date('2021-07-29T06:30:00.000Z'));
        component.fg.controls.billable.setValue(true);
        component.fg.controls.project.setValue(expectedProjectsResponse[0]);
        fixture.detectChanges();

        component.setupTxnFields();

        expect(component.fg.controls.project.hasValidator(null)).toBeTrue();
        expect(component.fg.controls.costCenter.hasValidator(null)).toBeTrue();
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
      });
    });

    it('setupSelectedProjects(): should setup selected projects', fakeAsync(() => {
      spyOn(component.selectedProject$, 'next');

      component.setupSelectedProjects();
      tick(500);

      component.fg.controls.project.setValue(expectedProjectsResponse[0]);
      tick(500);
      fixture.detectChanges();

      expect(component.selectedProject$.next).toHaveBeenCalledOnceWith(expectedProjectsResponse[0]);
    }));

    it('setupSelectedCostCenters(): should setup selected cost centers', fakeAsync(() => {
      spyOn(component.selectedCostCenter$, 'next');

      component.setupSelectedCostCenters();
      tick(500);

      component.fg.controls.costCenter.setValue(costCentersData[0]);
      tick(500);
      fixture.detectChanges();

      expect(component.selectedCostCenter$.next).toHaveBeenCalledOnceWith(costCentersData[0]);
    }));

    describe('checkNewReportsFlow():', () => {
      it('should check if user is on new reports flow', () => {
        component.checkNewReportsFlow(of(orgSettingsParamsWithSimplifiedReport));

        expect(component.isNewReportsFlowEnabled).toBeTrue();
      });

      it('should return null if settings are not present', () => {
        component.checkNewReportsFlow(of(null));

        expect(component.isNewReportsFlowEnabled).toBeFalse();
      });
    });

    describe('checkIndividualMileageEnabled():', () => {
      it('should check if indvidual mileage is enabled', (done) => {
        component.checkIndividualMileageEnabled(of(orgSettingsRes));

        component.individualMileageRatesEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
          done();
        });
      });
    });

    describe('checkAdvanceEnabled():', () => {
      it('should check if advance is enabled', (done) => {
        component.checkAdvanceEnabled(of(orgSettingsRes)).subscribe((res) => {
          expect(res).toBeTrue();
          done();
        });
      });

      it('should check for advance request', (done) => {
        component.checkAdvanceEnabled(of(orgSettingsWoAdvance)).subscribe((res) => {
          expect(res).toBeTrue();
          done();
        });
      });
    });

    describe('getRecentlyUsedValues():', () => {
      it('should recently used values', (done) => {
        component.isConnected$ = of(true);
        recentlyUsedItemsService.getRecentlyUsed.and.returnValue(of(recentlyUsedRes));

        component.getRecentlyUsedValues().subscribe((res) => {
          expect(res).toEqual(recentlyUsedRes);
          expect(recentlyUsedItemsService.getRecentlyUsed).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should return null if offline', (done) => {
        component.isConnected$ = of(false);

        component.getRecentlyUsedValues().subscribe((res) => {
          expect(res).toBeNull();
          expect(recentlyUsedItemsService.getRecentlyUsed).not.toHaveBeenCalled();
          done();
        });
      });
    });

    describe('getExpenseAmount():', () => {
      it('should get expense amount', fakeAsync(() => {
        component.rate$ = of(10);

        component.getExpenseAmount().subscribe((res) => {
          expect(res).toEqual(100);
        });
        tick(500);

        component.fg.patchValue({
          route: {
            distance: 10,
          },
        });

        tick(500);
        fixture.detectChanges();
      }));

      it('should get 0 if distance cannot be obtained', fakeAsync(() => {
        component.rate$ = of(10);

        component.getExpenseAmount().subscribe((res) => {
          expect(res).toEqual(0);
        });
        tick(500);

        component.fg.patchValue({
          route: null,
        });

        tick(500);
        fixture.detectChanges();
      }));
    });

    describe('getProjects():', () => {
      it('should return project from ID specified in the expense', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        projectsService.getbyId.and.returnValue(of(expectedProjectsResponse[0]));
        fixture.detectChanges();

        component.getProjects().subscribe((res) => {
          expect(res).toEqual(expectedProjectsResponse[0]);
          expect(projectsService.getbyId).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.project_id);
          done();
        });
      });

      it('should get default project ID and return the project if not provided in the expense', (done) => {
        component.etxn$ = of(newUnflattenedTxn);
        orgSettingsService.get.and.returnValue(of(orgSettingsRes));
        orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
        projectsService.getbyId.and.returnValue(of(expectedProjectsResponse[0]));
        fixture.detectChanges();

        component.getProjects().subscribe((res) => {
          expect(res).toEqual(expectedProjectsResponse[0]);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
          expect(projectsService.getbyId).toHaveBeenCalledOnceWith(orgUserSettingsData.preferences.default_project_id);
          done();
        });
      });

      it('should return null if no project could be found', (done) => {
        component.etxn$ = of(newUnflattenedTxn);
        orgSettingsService.get.and.returnValue(of(orgSettingsRes));
        orgUserSettingsService.get.and.returnValue(of(null));

        component.getProjects().subscribe((res) => {
          expect(res).toBeNull();
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
          expect(projectsService.getbyId).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it('getAddRates(): should get mileage rate', fakeAsync(() => {
      component.mileageRates$ = of(unfilteredMileageRatesData);
      spyOn(component, 'getRateByVehicleType').and.returnValue(10);
      fixture.detectChanges();

      component.getAddRates().subscribe((res) => {
        expect(res).toEqual(10);
      });
      tick(500);

      component.fg.patchValue({
        mileage_rate_name: filterEnabledMileageRatesData[0],
      });
      tick(500);
      fixture.detectChanges();

      expect(component.getRateByVehicleType).toHaveBeenCalledOnceWith(unfilteredMileageRatesData, 'bicycle');
    }));

    describe('getReports():', () => {
      it('should get reports', (done) => {
        component.autoSubmissionReportName$ = of('report');
        component.etxn$ = of(unflattenedTxnWithReportID3);
        component.reports$ = of([
          {
            label: 'report 1',
            value: expectedErpt[0],
          },
        ]);

        component.getReports().subscribe((res) => {
          expect(res).toEqual(expectedErpt[0]);
          done();
        });
      });

      it('should return the first report if only one option in DRAFT state is available', (done) => {
        component.autoSubmissionReportName$ = of(null);
        component.etxn$ = of(unflattenedTxnData);
        component.reports$ = of([
          {
            label: 'report 1',
            value: draftReportPerDiemData[0],
          },
        ]);

        component.getReports().subscribe((res) => {
          expect(res).toEqual(draftReportPerDiemData[0]);
          done();
        });
      });

      it('should return null if there are no report options', (done) => {
        component.autoSubmissionReportName$ = of(null);
        component.etxn$ = of(unflattenedTxnData);
        component.reports$ = of([]);

        component.getReports().subscribe((res) => {
          expect(res).toBeNull();
          done();
        });
      });
    });

    describe('getCostCenters():', () => {
      it('should get cost center if enabled', (done) => {
        orgUserSettingsService.getAllowedCostCenters.and.returnValue(of(costCentersData));
        component.getCostCenters(of(orgSettingsData), of(orgUserSettingsData)).subscribe((res) => {
          expect(res).toEqual(costCenterOptions2);
          expect(orgUserSettingsService.getAllowedCostCenters).toHaveBeenCalledOnceWith(orgUserSettingsData);
          done();
        });
      });

      it('should return empty array if cost centers are disabled', (done) => {
        component.getCostCenters(of(orgSettingsCCDisabled), of(orgUserSettingsData)).subscribe((res) => {
          expect(res).toEqual([]);
          done();
        });
      });
    });

    describe('getEditRates():', () => {
      it('should return mileage rate from expense', fakeAsync(() => {
        component.etxn$ = of(newExpenseMileageData2);
        component.mileageRates$ = of(unfilteredMileageRatesData);
        fixture.detectChanges();

        component.getEditRates().subscribe((res) => {
          expect(res).toEqual(10);
        });
        tick(500);

        component.fg.patchValue({
          vehicle_type: 'bicycle',
          mileage_rate_name: unfilteredMileageRatesData[0],
        });
        tick(500);
        fixture.detectChanges();
      }));

      it('should get rate from vehicle type provided in the form', fakeAsync(() => {
        spyOn(component, 'getRateByVehicleType').and.returnValue(10);
        component.etxn$ = of(unflattenedTxnData);
        component.mileageRates$ = of(unfilteredMileageRatesData);
        fixture.detectChanges();

        component.getEditRates().subscribe((res) => {
          expect(res).toEqual(10);
        });
        tick(500);

        component.fg.patchValue({
          vehicle_type: 'bicycle',
          mileage_rate_name: unfilteredMileageRatesData[0],
        });

        tick(500);
        fixture.detectChanges();

        expect(component.getRateByVehicleType).toHaveBeenCalledOnceWith(unfilteredMileageRatesData, 'bicycle');
      }));
    });

    it('getProjectDependentFields(): get project dependent fields from the form', () => {
      component.fg.patchValue({
        project_dependent_fields: [],
      });
      fixture.detectChanges();

      const result = component.getProjectDependentFields();
      expect(result).toEqual([]);
    });

    it('getCostCenterDependentFields(): get cost center dependent fields from the form', () => {
      component.fg.patchValue({
        project_dependent_fields: [],
      });
      fixture.detectChanges();

      const result = component.getCostCenterDependentFields();
      expect(result).toEqual([]);
    });

    describe('generateEtxnFromFg():', () => {
      beforeEach(() => {
        component.amount$ = of(100);
        component.homeCurrency$ = of('USD');
        component.mileageRates$ = of(unfilteredMileageRatesData);
        component.rate$ = of(null);
      });

      it('should generate an expense from form', (done) => {
        dateService.getUTCDate.and.returnValue(new Date('2023-02-13T01:00:00.000Z'));
        spyOn(component, 'getFormValues').and.returnValue(formValue1);
        spyOn(component, 'getRateByVehicleType').and.returnValue(10);
        fixture.detectChanges();

        component
          .generateEtxnFromFg(of(unflattenedTxnWithReportID3), of(txnCustomProperties4), of(10))
          .subscribe((res) => {
            expect(res).toEqual(newMileageExpFromForm);
            expect(component.getFormValues).toHaveBeenCalledTimes(1);
            expect(dateService.getUTCDate).toHaveBeenCalledTimes(2);
            done();
          });
      });

      it('should generate txn from form if properties are not specified', (done) => {
        dateService.getUTCDate.and.returnValue(new Date('2023-02-13T01:00:00.000Z'));
        spyOn(component, 'getFormValues').and.returnValue(formValue2);

        component.generateEtxnFromFg(of(unflattenedTxnWithReportID3), of(null), of(10)).subscribe((res) => {
          expect(res).toEqual(newMileageExpFromForm2);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(dateService.getUTCDate).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('showAddToReportSuccessToast(): should show success message on adding expense to report', () => {
      const modalSpy = jasmine.createSpyObj('expensesAddedToReportSnackBar', ['onAction']);
      modalSpy.onAction.and.returnValue(of(true));
      matSnackBar.openFromComponent.and.returnValue(modalSpy);

      component.showAddToReportSuccessToast('rpFE5X1Pqi9P');
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: 'Mileage expense added to report successfully',
      });
      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
        message: 'Mileage expense added to report successfully',
        redirectionText: 'View Report',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_report',
        { id: 'rpFE5X1Pqi9P', navigateBack: true },
      ]);
    });

    it('showSaveAndNext(): should save and show next expense', () => {
      component.activeIndex = 0;
      component.reviewList = [];
      expect(component.showSaveAndNext).toBeFalse();
    });

    it('route(): should get route control', () => {
      const result = component.route;

      expect(result).toEqual(component.fg.controls.route);
    });

    it('getFormValues(): should get values in form', () => {
      component.fg.patchValue({
        route: {
          roundTrip: true,
          mileageLocations: [locationData1, locationData2],
          distance: 10,
        },
      });

      expect(component.getFormValues()).toEqual({
        route: {
          roundTrip: true,
          mileageLocations: [locationData1, locationData2],
          distance: 10,
        },
        dateOfSpend: null,
        mileage_rate_name: null,
        paymentMode: null,
        purpose: null,
        project: null,
        billable: null,
        sub_category: null,
        custom_inputs: [],
        costCenter: null,
        report: null,
        duplicate_detection_reason: null,
        project_dependent_fields: [],
        cost_center_dependent_fields: [],
      });
    });

    it('getFormControl(): should get form control as per name provided', () => {
      expect(component.getFormControl('route')).toEqual(component.fg.controls.route);
    });

    describe('getCategories():', () => {
      it('should get categories according to category id in expense', (done) => {
        categoriesService.getAll.and.returnValue(of(unsortedCategories1));

        component.getCategories(unflattenedTxnWithCategory).subscribe((res) => {
          expect(res).toEqual(unsortedCategories1[2]);
          expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('getSelectedCostCenters():', () => {
      it('should get selected cost center', (done) => {
        component.etxn$ = of(unflattenedTxnWithCC);
        component.costCenters$ = of(costCenterOptions2);
        fixture.detectChanges();

        component.getSelectedCostCenters().subscribe((res) => {
          expect(res).toEqual(costCenterOptions2[0].value);
          done();
        });
      });

      it('should get ID from first cost center if not provided in expense', (done) => {
        component.etxn$ = of(expectedUnflattendedTxnData5);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.mode = 'add';
        component.costCenters$ = of(costCentersOptions);

        component.getSelectedCostCenters().subscribe((res) => {
          expect(res).toEqual(costCentersOptions[0].value);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should return null if no cost centers are available', (done) => {
        component.etxn$ = of(expectedUnflattendedTxnData5);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.costCenters$ = of([]);

        component.getSelectedCostCenters().subscribe((res) => {
          expect(res).toBeNull();
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });
}
