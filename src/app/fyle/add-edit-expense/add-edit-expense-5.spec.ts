import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject, Subscription, of } from 'rxjs';
import { accountOptionData1 } from 'src/app/core/mock-data/account-option.data';
import { eCCCData1, expectedECccResponse } from 'src/app/core/mock-data/corporate-card-expense-unflattened.data';
import { costCentersData, expectedCCdata, expectedCCdata2 } from 'src/app/core/mock-data/cost-centers.data';
import { apiAllCurrencies } from 'src/app/core/mock-data/currency.data';
import { customInputsData3 } from 'src/app/core/mock-data/custom-input.data';
import { defaultTxnFieldValuesData2 } from 'src/app/core/mock-data/default-txn-field-values.data';
import { costCenterDependentFields, projectDependentFields } from 'src/app/core/mock-data/dependent-field.data';
import { dependentCustomFields2, expenseFieldResponse } from 'src/app/core/mock-data/expense-field.data';
import { expenseData1, splitExpData } from 'src/app/core/mock-data/expense.data';

import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { expectedFileData1, fileObject4 } from 'src/app/core/mock-data/file-object.data';
import { categorieListRes, recentUsedCategoriesRes } from 'src/app/core/mock-data/org-category-list-item.data';
import { orgCategoryData, sortedCategory, transformedOrgCategories } from 'src/app/core/mock-data/org-category.data';
import {
  orgSettingsWithProjectAndAutofill,
  orgSettingsWoTax,
  taxSettingsData,
  taxSettingsData2,
} from 'src/app/core/mock-data/org-settings.data';
import {
  orgUserSettingsData,
  orgUserSettingsData2,
  orgUserSettingsWoDefaultProject,
} from 'src/app/core/mock-data/org-user-settings.data';
import {
  recentCurrencyRes,
  recentlyUsedCostCentersRes,
  recentlyUsedProjectRes,
  recentlyUsedRes,
} from 'src/app/core/mock-data/recently-used.data';
import { reportOptionsData, reportOptionsData2, reportOptionsData3 } from 'src/app/core/mock-data/report-options.data';
import { expectedErpt } from 'src/app/core/mock-data/report-unflattened.data';
import { expectedTaxGroupData, taxGroupData } from 'src/app/core/mock-data/tax-group.data';
import { TxnCustomProperties3 } from 'src/app/core/mock-data/txn-custom-properties.data';
import { unflattenExp1 } from 'src/app/core/mock-data/unflattened-expense.data';
import {
  expectedExpenseObservable,
  expectedUnflattendedTxnData1,
  setupFormExpenseWoCurrency,
  setupFormExpenseWoCurrency2,
  setupFormExpenseWoCurrency3,
  unflattenedExp2,
  unflattenedExpWithCostCenter,
  unflattenedExpWithReport,
  unflattenedExpWoCostCenter,
  unflattenedExpWoProject,
  unflattenedExpenseWithCCCGroupId2,
  unflattenedTxnData,
} from 'src/app/core/mock-data/unflattened-txn.data';
import { CostCenter } from 'src/app/core/models/v1/cost-center.model';
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
import {
  multiplePaymentModesData,
  multiplePaymentModesWithoutAdvData,
  orgSettingsData,
  unflattenedAccount1Data,
} from 'src/app/core/test-data/accounts.service.spec.data';
import { customInput2, customInputData, filledCustomProperties } from 'src/app/core/test-data/custom-inputs.spec.data';
import { txnCustomProperties, txnCustomProperties2 } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { apiV2ResponseMultiple, expectedProjectsResponse } from 'src/app/core/test-data/projects.spec.data';
import { getEstatusApiResponse } from 'src/app/core/test-data/status.service.spec.data';
import { AddEditExpensePage } from './add-edit-expense.page';
import { expenseFieldObjData } from 'src/app/core/mock-data/expense-field-obj.data';

export function TestCases5(getTestBed) {
  return describe('AddEditExpensePage-5', () => {
    let component: AddEditExpensePage;
    let fixture: ComponentFixture<AddEditExpensePage>;
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
    let titleCasePipe: jasmine.SpyObj<TitleCasePipe>;
    let handleDuplicates: jasmine.SpyObj<HandleDuplicatesService>;
    let paymentModesService: jasmine.SpyObj<PaymentModesService>;
    let taxGroupService: jasmine.SpyObj<TaxGroupService>;
    let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
    let platform: jasmine.SpyObj<Platform>;

    beforeEach(() => {
      const TestBed = getTestBed();
      TestBed.compileComponents();

      fixture = TestBed.createComponent(AddEditExpensePage);
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
      platform = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;
      titleCasePipe = TestBed.inject(TitleCasePipe) as jasmine.SpyObj<TitleCasePipe>;
      handleDuplicates = TestBed.inject(HandleDuplicatesService) as jasmine.SpyObj<HandleDuplicatesService>;
      paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
      taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
      orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
      storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
      launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;

      component.fg = formBuilder.group({
        currencyObj: [, component.currencyObjValidator],
        paymentMode: [, Validators.required],
        project: [],
        category: [],
        dateOfSpend: [, component.customDateValidator],
        vendor_id: [, component.merchantValidator],
        purpose: [],
        report: [],
        tax_group: [],
        tax_amount: [],
        location_1: [],
        location_2: [],
        from_dt: [],
        to_dt: [],
        flight_journey_travel_class: [],
        flight_return_travel_class: [],
        train_travel_class: [],
        bus_travel_class: [],
        distance: [],
        distance_unit: [],
        custom_inputs: new FormArray([]),
        duplicate_detection_reason: [],
        billable: [],
        costCenter: [],
        hotel_is_breakfast_provided: [],
        project_dependent_fields: formBuilder.array([]),
        cost_center_dependent_fields: formBuilder.array([]),
      });

      component._isExpandedView = true;
      component.navigateBack = true;
      component.hardwareBackButtonAction = new Subscription();
      component.onPageExit$ = new Subject();
      component.selectedProject$ = new BehaviorSubject(null);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    describe('getMarkDismissModalParams():', () => {
      it('should get modal params with method to mark as personal', (done) => {
        transactionService.unmatchCCCExpense.and.returnValue(of(null));
        spyOn(component, 'markCCCAsPersonal').and.returnValue(of(expenseData1));
        activatedRoute.snapshot.params.id = 'txfCdl3TEZ7K';
        component.corporateCreditCardExpenseGroupId = 'cccet1B17R8gWZ';
        fixture.detectChanges();

        component
          .getMarkDismissModalParams(
            {
              header: 'Header',
              body: 'body',
              ctaText: 'Done',
              ctaLoadingText: 'Loading',
            },
            true
          )
          .componentProps.deleteMethod()
          .subscribe((res) => {
            expect(res).toEqual(expenseData1);
            expect(transactionService.unmatchCCCExpense).toHaveBeenCalledOnceWith('txfCdl3TEZ7K', 'cccet1B17R8gWZ');
            expect(component.markCCCAsPersonal).toHaveBeenCalledOnceWith('txfCdl3TEZ7K');
            done();
          });
      });

      it('should get modal params with method to dismiss expense', (done) => {
        transactionService.unmatchCCCExpense.and.returnValue(of(null));
        spyOn(component, 'dismissCCC').and.returnValue(of(expenseData1));
        activatedRoute.snapshot.params.id = 'txfCdl3TEZ7K';
        component.matchedCCCTransaction = expectedECccResponse[0].ccce;
        fixture.detectChanges();

        component
          .getMarkDismissModalParams(
            {
              header: 'Header',
              body: 'body',
              ctaText: 'Done',
              ctaLoadingText: 'Loading',
            },
            false
          )
          .componentProps.deleteMethod()
          .subscribe((res) => {
            expect(res).toEqual(expenseData1);
            expect(transactionService.unmatchCCCExpense).toHaveBeenCalledOnceWith('txfCdl3TEZ7K', 'tx3qHxFNgRcZ');
            expect(component.dismissCCC).toHaveBeenCalledOnceWith('txfCdl3TEZ7K', 'tx3qHxFNgRcZ');
            done();
          });
      });

      it('should get modal params with method to dismiss expense if matched expense does not exist', (done) => {
        transactionService.unmatchCCCExpense.and.returnValue(of(null));
        spyOn(component, 'dismissCCC').and.returnValue(of(expenseData1));
        activatedRoute.snapshot.params.id = 'txfCdl3TEZ7K';
        component.matchedCCCTransaction = null;
        fixture.detectChanges();

        component
          .getMarkDismissModalParams(
            {
              header: 'Header',
              body: 'body',
              ctaText: 'Done',
              ctaLoadingText: 'Loading',
            },
            false
          )
          .componentProps.deleteMethod()
          .subscribe((res) => {
            expect(res).toEqual(expenseData1);
            expect(transactionService.unmatchCCCExpense).toHaveBeenCalledOnceWith('txfCdl3TEZ7K', undefined);
            expect(component.dismissCCC).toHaveBeenCalledOnceWith('txfCdl3TEZ7K', undefined);
            done();
          });
      });
    });

    describe('setupBalanceFlag():', () => {
      it('should setup balance available flag', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesData));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeTrue();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[0]);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return false in advance balance if payment mode is not personal', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesData));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[1]);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return false account type changes to null', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(null));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(null);
        fixture.detectChanges();

        tick(500);
      }));
    });

    describe('setupFilteredCategories():', () => {
      it('should get filtered categories for a project', fakeAsync(() => {
        component.etxn$ = of(unflattenedTxnData);
        projectsService.getbyId.and.returnValue(of(apiV2ResponseMultiple[0]));
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.setupFilteredCategories(of(sortedCategory));
        tick(500);

        component.fg.controls.project.setValue(apiV2ResponseMultiple[1]);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
        expect(projectsService.getbyId).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.project_id);
        expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledWith(apiV2ResponseMultiple[1], sortedCategory);
      }));

      it('should get updated filtered categories for changing an existing project', fakeAsync(() => {
        component.etxn$ = of(unflattenedExpWoProject);
        component.fg.controls.project.setValue(expectedProjectsResponse[0]);
        component.fg.controls.category.setValue(orgCategoryData);
        projectsService.getbyId.and.returnValue(of(apiV2ResponseMultiple[0]));
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.setupFilteredCategories(of(sortedCategory));
        tick(500);

        component.fg.controls.project.setValue(apiV2ResponseMultiple[1]);
        fixture.detectChanges();
        tick(500);

        expect(projectsService.getbyId).toHaveBeenCalledOnceWith(257528);
        expect(component.fg.controls.billable.value).toBeFalse();
        expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledWith(apiV2ResponseMultiple[1], sortedCategory);
      }));

      it('should return null the expense does not have project id', fakeAsync(() => {
        component.etxn$ = of(unflattenedExpWoProject);
        component.fg.controls.project.reset();
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.setupFilteredCategories(of(sortedCategory));
        tick(500);

        component.fg.controls.project.setValue(null);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
        expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledWith(null, sortedCategory);
      }));
    });

    describe('setupCustomFields():', () => {
      it('should setup custom fields using category', fakeAsync(() => {
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        component.mode = 'add';
        spyOn(component, 'getCategoryOnAdd').and.returnValue(of(orgCategoryData));
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomProperties);
        component.isConnected$ = of(true);
        component.setupCustomFields();
        tick(500);

        component.fg.controls.category.setValue(sortedCategory[0]);
        fixture.detectChanges();
        tick(500);

        expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
        expect(component.getCategoryOnAdd).toHaveBeenCalledTimes(1);
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledTimes(1);
        component.dependentFields$.subscribe((res) => {
          expect(res).toEqual([]);
        });
      }));
    });

    describe('ionViewWillLeave(): ', () => {
      it('should unsubscribe and complete observable as component leaves', () => {
        const dependentFieldSpy = jasmine.createSpyObj('DependentFieldComponent', ['ngOnDestroy']);

        component.projectDependentFieldsRef = dependentFieldSpy;
        component.costCenterDependentFieldsRef = dependentFieldSpy;
        spyOn(component.hardwareBackButtonAction, 'unsubscribe');
        spyOn(component.onPageExit$, 'next');
        spyOn(component.onPageExit$, 'complete');
        spyOn(component.selectedProject$, 'complete');
        fixture.detectChanges();

        component.ionViewWillLeave();

        expect(dependentFieldSpy.ngOnDestroy).toHaveBeenCalledTimes(2);
        expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalledOnceWith();
        expect(component.onPageExit$.next).toHaveBeenCalledOnceWith(null);
        expect(component.onPageExit$.complete).toHaveBeenCalledOnceWith();
        expect(component.selectedProject$.complete).toHaveBeenCalledOnceWith();
      });

      it('should unsubscribe remaining observables as dependent fields are not present', () => {
        component.projectDependentFieldsRef = null;
        component.costCenterDependentFieldsRef = null;
        spyOn(component.hardwareBackButtonAction, 'unsubscribe');
        spyOn(component.onPageExit$, 'next');
        spyOn(component.onPageExit$, 'complete');
        spyOn(component.selectedProject$, 'complete');
        fixture.detectChanges();

        component.ionViewWillLeave();

        expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalledOnceWith();
        expect(component.onPageExit$.next).toHaveBeenCalledOnceWith(null);
        expect(component.onPageExit$.complete).toHaveBeenCalledOnceWith();
        expect(component.selectedProject$.complete).toHaveBeenCalledOnceWith();
      });
    });

    describe('getSelectedCategory():', () => {
      it('should get selected category', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        categoriesService.getCategoryById.and.returnValue(of(orgCategoryData));
        fixture.detectChanges();

        component.getSelectedCategory().subscribe((res) => {
          expect(res).toEqual(orgCategoryData);
          expect(categoriesService.getCategoryById).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.org_category_id);
          done();
        });
      });

      it('should return null if category is not present in expense', (done) => {
        component.etxn$ = of({ ...unflattenedTxnData, tx: { ...unflattenedTxnData.tx, org_category_id: null } });
        fixture.detectChanges();

        component.getSelectedCategory().subscribe((res) => {
          expect(res).toBeNull();
          expect(categoriesService.getCategoryById).not.toHaveBeenCalled();
          done();
        });
      });
    });

    describe('getSelectedProjects():', () => {
      it('should return the selected project from the expense', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        projectsService.getbyId.and.returnValue(of(expectedProjectsResponse[0]));
        fixture.detectChanges();

        component.getSelectedProjects().subscribe((res) => {
          expect(res).toEqual(expectedProjectsResponse[0]);
          expect(projectsService.getbyId).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.project_id);
          done();
        });
      });

      it('should return project from the default ID specified in org', (done) => {
        component.etxn$ = of(unflattenedExpWoProject);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.orgUserSettings$ = of(orgUserSettingsData);
        projectsService.getbyId.and.returnValue(of(expectedProjectsResponse[0]));
        fixture.detectChanges();

        component.getSelectedProjects().subscribe((res) => {
          expect(res).toEqual(expectedProjectsResponse[0]);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          expect(projectsService.getbyId).toHaveBeenCalledOnceWith(orgUserSettingsData.preferences.default_project_id);
          done();
        });
      });

      it('should return null if no project ID is available', (done) => {
        component.etxn$ = of(unflattenedExpWoProject);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.orgUserSettings$ = of(orgUserSettingsWoDefaultProject);

        component.getSelectedProjects().subscribe((res) => {
          expect(res).toBeNull();
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('getSelectedReport():', () => {
      it('should get the selected report', (done) => {
        component.reports$ = of(reportOptionsData);
        component.autoSubmissionReportName$ = of('June #23');
        component.etxn$ = of(unflattenedExpWithReport);
        fixture.detectChanges();

        component.getSelectedReport().subscribe((res) => {
          expect(res).toEqual(expectedErpt[0]);
          done();
        });
      });

      it('should return the report specified in the route', (done) => {
        component.reports$ = of(reportOptionsData);
        component.autoSubmissionReportName$ = of('June #23');
        component.etxn$ = of(unflattenedTxnData);
        activatedRoute.snapshot.params.rp_id = 'rpLMyvYSXgJy';
        fixture.detectChanges();

        component.getSelectedReport().subscribe((res) => {
          expect(res).toEqual(expectedErpt[1]);
          done();
        });
      });

      it('should return the first option in reports if it is in DRAFT state and number of options is one', (done) => {
        component.reports$ = of(reportOptionsData2);
        component.autoSubmissionReportName$ = of(null);
        component.etxn$ = of(unflattenedTxnData);
        fixture.detectChanges();

        component.getSelectedReport().subscribe((res) => {
          expect(res).toEqual(reportOptionsData2[0].value);
          done();
        });
      });

      it('should return null if no report is found', (done) => {
        component.reports$ = of([]);
        component.autoSubmissionReportName$ = of(null);
        component.etxn$ = of(unflattenedTxnData);
        fixture.detectChanges();

        component.getSelectedReport().subscribe((res) => {
          expect(res).toBeNull();
          done();
        });
      });
    });

    it('getSelectedPaymentModes(): should get selected payment modes', (done) => {
      component.etxn$ = of(unflattenedTxnData);
      component.paymentModes$ = of(accountOptionData1);
      accountsService.getEtxnSelectedPaymentMode.and.returnValue(unflattenedAccount1Data);
      fixture.detectChanges();

      component.getSelectedPaymentModes().subscribe((res) => {
        expect(res).toEqual(unflattenedAccount1Data);
        expect(accountsService.getEtxnSelectedPaymentMode).toHaveBeenCalledOnceWith(
          unflattenedTxnData,
          accountOptionData1
        );
        done();
      });
    });

    describe('getDefaultPaymentModes():', () => {
      it('should get default payment modes', (done) => {
        component.paymentModes$ = of(accountOptionData1);
        component.orgUserSettings$ = of(orgUserSettingsData2);
        paymentModesService.checkIfPaymentModeConfigurationsIsEnabled.and.returnValue(of(true));
        component.isCreatedFromCCC = true;
        fixture.detectChanges();

        component.getDefaultPaymentModes().subscribe((res) => {
          expect(res).toEqual(accountOptionData1[1].value);
          expect(paymentModesService.checkIfPaymentModeConfigurationsIsEnabled).toHaveBeenCalledOnceWith();
          done();
        });
      });

      it('should return the first item in account options if expense was not created from CCC', (done) => {
        component.paymentModes$ = of(accountOptionData1);
        component.orgUserSettings$ = of(orgUserSettingsData2);
        paymentModesService.checkIfPaymentModeConfigurationsIsEnabled.and.returnValue(of(true));
        component.isCreatedFromCCC = false;
        fixture.detectChanges();

        component.getDefaultPaymentModes().subscribe((res) => {
          expect(res).toEqual(accountOptionData1[0].value);
          expect(paymentModesService.checkIfPaymentModeConfigurationsIsEnabled).toHaveBeenCalledOnceWith();
          done();
        });
      });
    });

    it('getRecentProjects(): should get recent projects', (done) => {
      component.recentlyUsedValues$ = of(recentlyUsedRes);
      authService.getEou.and.resolveTo(apiEouRes);
      component.fg.controls.category.setValue(orgCategoryData);
      recentlyUsedItemsService.getRecentlyUsedProjects.and.returnValue(of(recentlyUsedProjectRes));
      fixture.detectChanges();

      component.getRecentProjects().subscribe((res) => {
        expect(res).toEqual(recentlyUsedProjectRes);
        expect(authService.getEou).toHaveBeenCalledOnceWith();
        expect(recentlyUsedItemsService.getRecentlyUsedProjects).toHaveBeenCalledOnceWith({
          recentValues: recentlyUsedRes,
          eou: apiEouRes,
          categoryIds: component.fg.controls.category.value && component.fg.controls.category.value.id,
        });
        done();
      });
    });

    it('getRecentCostCenters(): should get recent cost centers', (done) => {
      component.recentlyUsedValues$ = of(recentlyUsedRes);
      component.costCenters$ = of(expectedCCdata);
      recentlyUsedItemsService.getRecentCostCenters.and.returnValue(of(recentlyUsedCostCentersRes));
      fixture.detectChanges();

      component.getRecentCostCenters().subscribe((res) => {
        expect(res).toEqual(recentlyUsedCostCentersRes);
        expect(recentlyUsedItemsService.getRecentCostCenters).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('getRecentCurrencies(): should get recent currencies', (done) => {
      component.recentlyUsedValues$ = of(recentlyUsedRes);
      currencyService.getAll.and.returnValue(of(apiAllCurrencies));
      recentlyUsedItemsService.getRecentCurrencies.and.returnValue(of(recentCurrencyRes));
      fixture.detectChanges();

      component.getRecentCurrencies().subscribe((res) => {
        expect(res).toEqual(recentCurrencyRes);
        expect(currencyService.getAll).toHaveBeenCalledOnceWith();
        expect(recentlyUsedItemsService.getRecentCurrencies).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('getSelectedCostCenters():', () => {
      it('should get cost center ID from expense', (done) => {
        component.etxn$ = of(unflattenedExpWithCostCenter);
        component.costCenters$ = of(expectedCCdata);
        fixture.detectChanges();

        component.getSelectedCostCenters().subscribe((res) => {
          expect(res).toEqual(costCentersData[0]);
          done();
        });
      });

      it('should return the first available cost center in add mode', (done) => {
        component.etxn$ = of(unflattenedExpWoCostCenter);
        component.costCenters$ = of(expectedCCdata2);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.mode = 'add';
        fixture.detectChanges();

        component.getSelectedCostCenters().subscribe((res) => {
          expect(res).toEqual(expectedCCdata2[0].value);
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
          done();
        });
      });

      it('should return null if no cost center is available', (done) => {
        component.etxn$ = of(unflattenedExpWoCostCenter);
        component.costCenters$ = of([]);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.mode = 'edit';
        fixture.detectChanges();

        component.getSelectedCostCenters().subscribe((res) => {
          expect(res).toBeNull();
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('getReceiptCount():', () => {
      it('should get receipt count', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        fileService.findByTransactionId.and.returnValue(of(fileObject4));
        fixture.detectChanges();

        component.getReceiptCount().subscribe((res) => {
          expect(res).toEqual(1);
          expect(fileService.findByTransactionId).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
          done();
        });
      });

      it('should return 0 if no receipts are returned', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        fileService.findByTransactionId.and.returnValue(of(null));
        fixture.detectChanges();

        component.getReceiptCount().subscribe((res) => {
          expect(res).toEqual(0);
          expect(fileService.findByTransactionId).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
          done();
        });
      });
    });

    it('setCategoryOnValueChange(): should change category value if vendor changes', fakeAsync(() => {
      component.setCategoryOnValueChange();
      spyOn(component, 'setCategoryFromVendor');
      tick(500);

      component.fg.controls.vendor_id.setValue({
        name: 'vendor',
        default_category: 'TAXI',
      });
      fixture.detectChanges();
      tick(500);

      expect(component.setCategoryFromVendor).toHaveBeenCalledOnceWith('TAXI');
    }));

    describe('setupFormInit():', () => {
      it('should setup form', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedErpt[0]));
        spyOn(component, 'getSelectedPaymentModes').and.returnValue(of(unflattenedAccount1Data));
        spyOn(component, 'getRecentCostCenters').and.returnValue(of(recentlyUsedCostCentersRes));
        spyOn(component, 'getRecentProjects').and.returnValue(of(recentlyUsedProjectRes));
        spyOn(component, 'getRecentCurrencies').and.returnValue(of(recentCurrencyRes));
        spyOn(component, 'getDefaultPaymentModes').and.returnValue(of(accountOptionData1[1].value));
        spyOn(component, 'getSelectedCostCenters').and.returnValue(of(costCentersData[0]));
        spyOn(component, 'getReceiptCount').and.returnValue(of(1));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        loaderService.hideLoader.and.resolveTo();
        loaderService.showLoader.and.resolveTo();
        component.etxn$ = of(unflattenedTxnData);
        component.taxGroups$ = of(taxGroupData);
        component.orgUserSettings$ = of(orgUserSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of(recentUsedCategoriesRes);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
        spyOn(component, 'setCategoryOnValueChange');
        spyOn(component, 'getAutofillCategory');
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomProperties);
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        fixture.detectChanges();

        component.setupFormInit();
        tick(1000);

        expect(component.getSelectedProjects).toHaveBeenCalledTimes(1);
        expect(component.getSelectedCategory).toHaveBeenCalledTimes(1);
        expect(component.getSelectedProjects).toHaveBeenCalledTimes(1);
        expect(component.getSelectedReport).toHaveBeenCalledTimes(1);
        expect(component.getSelectedPaymentModes).toHaveBeenCalledTimes(1);
        expect(component.getRecentCostCenters).toHaveBeenCalledTimes(1);
        expect(component.getDefaultPaymentModes).toHaveBeenCalledTimes(1);
        expect(component.getRecentProjects).toHaveBeenCalledTimes(1);
        expect(component.getRecentCurrencies).toHaveBeenCalledTimes(1);
        expect(component.getSelectedCostCenters).toHaveBeenCalledTimes(1);
        expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
        expect(component.getReceiptCount).toHaveBeenCalledTimes(1);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: recentUsedCategoriesRes,
          etxn: unflattenedTxnData,
          category: orgCategoryData,
        });
        expect(component.setCategoryOnValueChange).toHaveBeenCalledTimes(1);
      }));

      it('should setup up form for a draft expense with policy violation', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedErpt[0]));
        spyOn(component, 'getSelectedPaymentModes').and.returnValue(of(unflattenedAccount1Data));
        spyOn(component, 'getRecentCostCenters').and.returnValue(of(recentlyUsedCostCentersRes));
        spyOn(component, 'getRecentProjects').and.returnValue(of(recentlyUsedProjectRes));
        spyOn(component, 'getRecentCurrencies').and.returnValue(of(recentCurrencyRes));
        spyOn(component, 'getDefaultPaymentModes').and.returnValue(of(accountOptionData1[1].value));
        spyOn(component, 'getSelectedCostCenters').and.returnValue(of(costCentersData[0]));
        spyOn(component, 'getReceiptCount').and.returnValue(of(1));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        loaderService.hideLoader.and.resolveTo();
        loaderService.showLoader.and.resolveTo();
        component.etxn$ = of(unflattenedExp2);
        component.taxGroups$ = of(taxGroupData);
        component.orgUserSettings$ = of(orgUserSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of(recentUsedCategoriesRes);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
        spyOn(component, 'setCategoryOnValueChange');
        customFieldsService.standardizeCustomFields.and.returnValue(filledCustomProperties);
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        activatedRoute.snapshot.params.extractData = true;
        activatedRoute.snapshot.params.image = JSON.stringify('image');
        spyOn(component, 'parseFile');
        fixture.detectChanges();

        component.setupFormInit();
        tick(1000);

        expect(component.getSelectedProjects).toHaveBeenCalledTimes(1);
        expect(component.getSelectedCategory).toHaveBeenCalledTimes(1);
        expect(component.getSelectedProjects).toHaveBeenCalledTimes(1);
        expect(component.getSelectedReport).toHaveBeenCalledTimes(1);
        expect(component.getSelectedPaymentModes).toHaveBeenCalledTimes(1);
        expect(component.getRecentCostCenters).toHaveBeenCalledTimes(1);
        expect(component.getDefaultPaymentModes).toHaveBeenCalledTimes(1);
        expect(component.getRecentProjects).toHaveBeenCalledTimes(1);
        expect(component.getRecentCurrencies).toHaveBeenCalledTimes(1);
        expect(component.getSelectedCostCenters).toHaveBeenCalledTimes(1);
        expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
        expect(component.getReceiptCount).toHaveBeenCalledTimes(1);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.setCategoryOnValueChange).toHaveBeenCalledTimes(1);
        expect(component.parseFile).toHaveBeenCalledTimes(1);
        expect(component.attachedReceiptsCount).toEqual(1);
      }));

      it('setup form without currency and amount', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedErpt[0]));
        spyOn(component, 'getSelectedPaymentModes').and.returnValue(of(unflattenedAccount1Data));
        spyOn(component, 'getRecentCostCenters').and.returnValue(of(recentlyUsedCostCentersRes));
        spyOn(component, 'getRecentProjects').and.returnValue(of(recentlyUsedProjectRes));
        spyOn(component, 'getRecentCurrencies').and.returnValue(of(recentCurrencyRes));
        spyOn(component, 'getDefaultPaymentModes').and.returnValue(of(accountOptionData1[1].value));
        spyOn(component, 'getSelectedCostCenters').and.returnValue(of(costCentersData[0]));
        spyOn(component, 'getReceiptCount').and.returnValue(of(1));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        loaderService.hideLoader.and.resolveTo();
        loaderService.showLoader.and.resolveTo();
        component.etxn$ = of(setupFormExpenseWoCurrency);
        component.taxGroups$ = of(taxGroupData);
        component.orgUserSettings$ = of(orgUserSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of([]);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
        spyOn(component, 'setCategoryOnValueChange');
        spyOn(component, 'getAutofillCategory');
        customFieldsService.standardizeCustomFields.and.returnValue(TxnCustomProperties3);
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        fixture.detectChanges();

        component.setupFormInit();
        tick(1000);

        expect(component.getSelectedProjects).toHaveBeenCalledTimes(1);
        expect(component.getSelectedCategory).toHaveBeenCalledTimes(1);
        expect(component.getSelectedProjects).toHaveBeenCalledTimes(1);
        expect(component.getSelectedReport).toHaveBeenCalledTimes(1);
        expect(component.getSelectedPaymentModes).toHaveBeenCalledTimes(1);
        expect(component.getRecentCostCenters).toHaveBeenCalledTimes(1);
        expect(component.getDefaultPaymentModes).toHaveBeenCalledTimes(1);
        expect(component.getRecentProjects).toHaveBeenCalledTimes(1);
        expect(component.getRecentCurrencies).toHaveBeenCalledTimes(1);
        expect(component.getSelectedCostCenters).toHaveBeenCalledTimes(1);
        expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
        expect(component.getReceiptCount).toHaveBeenCalledTimes(1);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, undefined);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: [],
          etxn: setupFormExpenseWoCurrency,
          category: orgCategoryData,
        });
        expect(component.setCategoryOnValueChange).toHaveBeenCalledTimes(1);
      }));

      it('setup form without amount and same currency as home currency', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedErpt[0]));
        spyOn(component, 'getSelectedPaymentModes').and.returnValue(of(unflattenedAccount1Data));
        spyOn(component, 'getRecentCostCenters').and.returnValue(of(recentlyUsedCostCentersRes));
        spyOn(component, 'getRecentProjects').and.returnValue(of(recentlyUsedProjectRes));
        spyOn(component, 'getRecentCurrencies').and.returnValue(of(recentCurrencyRes));
        spyOn(component, 'getDefaultPaymentModes').and.returnValue(of(accountOptionData1[1].value));
        spyOn(component, 'getSelectedCostCenters').and.returnValue(of(costCentersData[0]));
        spyOn(component, 'getReceiptCount').and.returnValue(of(1));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        loaderService.hideLoader.and.resolveTo();
        loaderService.showLoader.and.resolveTo();
        component.etxn$ = of(setupFormExpenseWoCurrency2);
        component.taxGroups$ = of(taxGroupData);
        component.orgUserSettings$ = of(orgUserSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of([]);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
        spyOn(component, 'setCategoryOnValueChange');
        spyOn(component, 'getAutofillCategory');
        customFieldsService.standardizeCustomFields.and.returnValue(TxnCustomProperties3);
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        fixture.detectChanges();

        component.setupFormInit();
        tick(1000);

        expect(component.getSelectedProjects).toHaveBeenCalledTimes(1);
        expect(component.getSelectedCategory).toHaveBeenCalledTimes(1);
        expect(component.getSelectedProjects).toHaveBeenCalledTimes(1);
        expect(component.getSelectedReport).toHaveBeenCalledTimes(1);
        expect(component.getSelectedPaymentModes).toHaveBeenCalledTimes(1);
        expect(component.getRecentCostCenters).toHaveBeenCalledTimes(1);
        expect(component.getDefaultPaymentModes).toHaveBeenCalledTimes(1);
        expect(component.getRecentProjects).toHaveBeenCalledTimes(1);
        expect(component.getRecentCurrencies).toHaveBeenCalledTimes(1);
        expect(component.getSelectedCostCenters).toHaveBeenCalledTimes(1);
        expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
        expect(component.getReceiptCount).toHaveBeenCalledTimes(1);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, undefined);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: [],
          etxn: setupFormExpenseWoCurrency2,
          category: orgCategoryData,
        });
        expect(component.setCategoryOnValueChange).toHaveBeenCalledTimes(1);
      }));

      it('setup form for an expense with different currencies and DRAFT state', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedErpt[0]));
        spyOn(component, 'getSelectedPaymentModes').and.returnValue(of(unflattenedAccount1Data));
        spyOn(component, 'getRecentCostCenters').and.returnValue(of(recentlyUsedCostCentersRes));
        spyOn(component, 'getRecentProjects').and.returnValue(of(recentlyUsedProjectRes));
        spyOn(component, 'getRecentCurrencies').and.returnValue(of(recentCurrencyRes));
        spyOn(component, 'getDefaultPaymentModes').and.returnValue(of(accountOptionData1[1].value));
        spyOn(component, 'getSelectedCostCenters').and.returnValue(of(costCentersData[0]));
        spyOn(component, 'getReceiptCount').and.returnValue(of(1));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        orgSettingsService.get.and.returnValue(of(orgSettingsWithProjectAndAutofill));
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        loaderService.hideLoader.and.resolveTo();
        loaderService.showLoader.and.resolveTo();
        component.etxn$ = of(setupFormExpenseWoCurrency3);
        component.taxGroups$ = of(taxGroupData);
        component.orgUserSettings$ = of(orgUserSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of([]);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
        spyOn(component, 'setCategoryOnValueChange');
        spyOn(component, 'getAutofillCategory');
        customFieldsService.standardizeCustomFields.and.returnValue(TxnCustomProperties3);
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        fixture.detectChanges();

        component.setupFormInit();
        tick(1000);

        expect(component.getSelectedProjects).toHaveBeenCalledTimes(1);
        expect(component.getSelectedCategory).toHaveBeenCalledTimes(1);
        expect(component.getSelectedProjects).toHaveBeenCalledTimes(1);
        expect(component.getSelectedReport).toHaveBeenCalledTimes(1);
        expect(component.getSelectedPaymentModes).toHaveBeenCalledTimes(1);
        expect(component.getRecentCostCenters).toHaveBeenCalledTimes(1);
        expect(component.getDefaultPaymentModes).toHaveBeenCalledTimes(1);
        expect(component.getRecentProjects).toHaveBeenCalledTimes(1);
        expect(component.getRecentCurrencies).toHaveBeenCalledTimes(1);
        expect(component.getSelectedCostCenters).toHaveBeenCalledTimes(1);
        expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
        expect(component.getReceiptCount).toHaveBeenCalledTimes(1);
        expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
        expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, undefined);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: [],
          etxn: setupFormExpenseWoCurrency3,
          category: orgCategoryData,
        });
        expect(component.setCategoryOnValueChange).toHaveBeenCalledTimes(1);
      }));
    });

    it('getProjectDependentFields(): should get project dependent fields', () => {
      component.fg = formBuilder.group({
        project_dependent_fields: [],
      });

      component.fg.controls.project_dependent_fields.setValue(projectDependentFields);

      const result = component.getProjectDependentFields();
      expect(result).toEqual(projectDependentFields);
    });

    it('getCostCenterDependentFields(): should get cost center dependent fields', () => {
      component.fg = formBuilder.group({
        cost_center_dependent_fields: [],
      });

      component.fg.controls.cost_center_dependent_fields.setValue(costCenterDependentFields);

      const result = component.getCostCenterDependentFields();
      expect(result).toEqual(costCenterDependentFields);
    });

    it('getCustomFields(): should get custom fields data', () => {
      component.dependentFields$ = of(dependentCustomFields2);
      customFieldsService.standardizeCustomFields.and.returnValue(txnCustomProperties2);
      spyOn(component, 'getProjectDependentFields').and.returnValue([]);
      spyOn(component, 'getCostCenterDependentFields').and.returnValue([]);

      component.customInputs$ = of(customInputData);
      component.fg = formBuilder.group({
        project_dependent_fields: [],
        custom_inputs: [],
        cost_center_dependent_fields: [],
      });
      component.fg.controls.custom_inputs.setValue(projectDependentFields);
      fixture.detectChanges();

      component.getCustomFields().subscribe((res) => {
        expect(res).toEqual(customInputsData3);
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], dependentCustomFields2);
        expect(component.getProjectDependentFields).toHaveBeenCalledTimes(1);
        expect(component.getCostCenterDependentFields).toHaveBeenCalledTimes(1);
      });
    });

    it('initCCCTxn(): should initialize ccc details', () => {
      activatedRoute.snapshot.params.bankTxn = JSON.stringify(eCCCData1);
      fixture.detectChanges();

      component.initCCCTxn();
      expect(component.showSelectedTransaction).toBeTrue();
      expect(component.isCreatedFromCCC).toBeTrue();
    });

    describe('ionViewWillEnter():', () => {
      it('should setup class variables', (done) => {
        component.isConnected$ = of(true);
        component.txnFields$ = of(expenseFieldObjData);
        component.filteredCategories$ = of(categorieListRes);

        spyOn(component, 'initClassObservables').and.returnValue(null);
        tokenService.getClusterDomain.and.resolveTo('domain');
        categoriesService.getSystemCategories.and.returnValue(['Bus', 'Airlines', 'Lodging', 'Train']);
        categoriesService.getBreakfastSystemCategories.and.returnValue(['Lodging']);
        reportService.getAutoSubmissionReportName.and.returnValue(of('Jun #23'));
        spyOn(component, 'setupSelectedProjectObservable');
        spyOn(component, 'setupSelectedCostCenterObservable');
        spyOn(component, 'getCCCpaymentMode');
        spyOn(component, 'setUpTaxCalculations');
        spyOn(component, 'initCCCTxn').and.returnValue(null);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesData));
        spyOn(component, 'setupNetworkWatcher');
        taxGroupService.get.and.returnValue(of(taxGroupData));
        recentlyUsedItemsService.getRecentlyUsed.and.returnValue(of(recentlyUsedRes));
        component.individualProjectIds$ = of([]);
        component.isIndividualProjectsEnabled$ = of(false);
        projectsService.getProjectCount.and.returnValue(of(2));
        spyOn(component, 'setupCostCenters');
        storageService.get.and.resolveTo(true);
        spyOn(component, 'setupBalanceFlag');
        statusService.find.and.returnValue(of(getEstatusApiResponse));
        spyOn(component, 'getActiveCategories').and.returnValue(of(sortedCategory));
        spyOn(component, 'getNewExpenseObservable').and.returnValue(of(expectedExpenseObservable));
        spyOn(component, 'getEditExpenseObservable').and.returnValue(of(expectedUnflattendedTxnData1));
        fileService.findByTransactionId.and.returnValue(of(expectedFileData1));
        fileService.downloadUrl.and.returnValue(of('url'));
        spyOn(component, 'getReceiptDetails').and.returnValue({
          type: 'jpeg',
          thumbnail: 'thumbnail',
        });
        spyOn(component, 'getPaymentModes');
        spyOn(component, 'setupFilteredCategories');
        spyOn(component, 'setupExpenseFields');

        reportService.getFilteredPendingReports.and.returnValue(of(expectedErpt));
        recentlyUsedItemsService.getRecentCategories.and.returnValue(of(recentUsedCategoriesRes));

        spyOn(component, 'setupFormInit');
        spyOn(component, 'setupCustomFields');
        spyOn(component, 'clearCategoryOnValueChange');
        spyOn(component, 'getActionSheetOptions').and.returnValue(of([]));
        spyOn(component, 'getPolicyDetails');
        spyOn(component, 'getDuplicateExpenses');

        activatedRoute.snapshot.params.bankTxn = JSON.stringify(expectedECccResponse);
        activatedRoute.snapshot.params.txnIds = JSON.stringify(['id_1']);
        component.reviewList = ['id_1'];
        component.activeIndex = 0;
        fixture.detectChanges();

        component.ionViewWillEnter();

        expect(component.initClassObservables).toHaveBeenCalledTimes(1);
        expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);

        expect(categoriesService.getSystemCategories).toHaveBeenCalledTimes(1);
        expect(categoriesService.getBreakfastSystemCategories).toHaveBeenCalledTimes(1);
        expect(reportService.getAutoSubmissionReportName).toHaveBeenCalledTimes(1);

        expect(component.setupSelectedProjectObservable).toHaveBeenCalledTimes(1);
        expect(component.setupSelectedCostCenterObservable).toHaveBeenCalledTimes(1);
        expect(component.initCCCTxn).toHaveBeenCalledTimes(1);
        expect(component.getCCCpaymentMode).toHaveBeenCalledTimes(1);
        expect(component.setUpTaxCalculations).toHaveBeenCalledTimes(1);

        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);

        component.isAdvancesEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.taxGroups$.subscribe((res) => {
          expect(res).toEqual(taxGroupData);
        });

        component.taxGroupsOptions$.subscribe((res) => {
          expect(res).toEqual(expectedTaxGroupData);
        });

        expect(component.isCorporateCreditCardEnabled).toBeTrue();
        expect(component.isNewReportsFlowEnabled).toBeFalse();
        expect(component.isDraftExpenseEnabled).toBeTrue();

        expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);

        component.recentlyUsedValues$.subscribe((res) => {
          expect(res).toEqual(recentlyUsedRes);
        });
        expect(recentlyUsedItemsService.getRecentlyUsed).toHaveBeenCalledTimes(1);

        component.individualProjectIds$.subscribe((res) => {
          expect(res).toEqual([290054, 316444, 316446, 149230, 316442, 316443]);
        });

        component.isIndividualProjectsEnabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isProjectsVisible$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        expect(projectsService.getProjectCount).toHaveBeenCalledTimes(1);
        expect(component.setupCostCenters).toHaveBeenCalledTimes(1);

        expect(storageService.get).toHaveBeenCalledOnceWith('isExpandedView');
        expect(statusService.find).toHaveBeenCalledTimes(1);

        component.isProjectsEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.isSplitExpenseAllowed$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        expect(component.setupBalanceFlag).toHaveBeenCalledTimes(1);

        component.paymentAccount$.subscribe((res) => {
          expect(res).toBeNull();
        });

        expect(component.getPaymentModes).toHaveBeenCalledTimes(1);

        expect(component.getNewExpenseObservable).toHaveBeenCalledTimes(1);
        expect(component.getEditExpenseObservable).toHaveBeenCalledTimes(1);

        component.isCCCAccountSelected$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.attachments$.subscribe((res) => {
          expect(res).toEqual(expectedFileData1);
        });

        expect(fileService.findByTransactionId).toHaveBeenCalledOnceWith('tx3qHxFNgRcZ');
        expect(fileService.downloadUrl).toHaveBeenCalledOnceWith('fiV1gXpyCcbU');
        expect(component.getReceiptDetails).toHaveBeenCalledOnceWith(expectedFileData1[0]);

        component.flightJourneyTravelClassOptions$.subscribe((res) => {
          expect(res).toEqual([
            {
              value: 'BUSINESS',
              label: 'BUSINESS',
            },
          ]);
        });

        expect(component.setupFilteredCategories).toHaveBeenCalledOnceWith(jasmine.any(Observable));
        expect(component.setupExpenseFields).toHaveBeenCalledTimes(1);

        component.taxSettings$.subscribe((res) => {
          expect(res).toEqual(taxSettingsData);
        });

        component.reports$.subscribe((res) => {
          expect(res).toEqual(reportOptionsData3);
        });

        component.recentlyUsedCategories$.subscribe((res) => {
          expect(res).toEqual(recentUsedCategoriesRes);
        });

        component.transactionInReport$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isNotReimbursable$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isAmountCapped$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isAmountDisabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isCriticalPolicyViolated$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        expect(taxGroupService.get).toHaveBeenCalledTimes(2);

        expect(reportService.getFilteredPendingReports).toHaveBeenCalledOnceWith({ state: 'edit' });
        expect(recentlyUsedItemsService.getRecentCategories).toHaveBeenCalledTimes(1);
        expect(component.setupFormInit).toHaveBeenCalledTimes(1);
        expect(component.setupCustomFields).toHaveBeenCalledTimes(1);
        expect(component.clearCategoryOnValueChange).toHaveBeenCalledTimes(1);
        expect(component.getActionSheetOptions).toHaveBeenCalledTimes(1);
        expect(component.getDuplicateExpenses).toHaveBeenCalledTimes(1);
        expect(component.getPolicyDetails).toHaveBeenCalledTimes(1);
        done();
      });

      it('should setup class variables for offline mode', (done) => {
        component.isConnected$ = of(false);
        component.txnFields$ = of(expenseFieldObjData);
        component.filteredCategories$ = of(categorieListRes);
        component.etxn$ = of(unflattenedExpenseWithCCCGroupId2);
        activatedRoute.snapshot.params.bankTxn = JSON.stringify(expectedECccResponse[0]);
        activatedRoute.snapshot.params.id = null;
        spyOn(component, 'initCCCTxn').and.returnValue(null);

        spyOn(component, 'initClassObservables').and.returnValue(null);
        tokenService.getClusterDomain.and.resolveTo('domain');
        categoriesService.getSystemCategories.and.returnValue(['Bus', 'Airlines', 'Lodging', 'Train']);
        categoriesService.getBreakfastSystemCategories.and.returnValue(['Lodging']);
        reportService.getAutoSubmissionReportName.and.returnValue(of('Jun #23'));
        spyOn(component, 'setupSelectedProjectObservable');
        spyOn(component, 'setupSelectedCostCenterObservable');
        spyOn(component, 'getCCCpaymentMode');
        spyOn(component, 'setUpTaxCalculations');
        orgSettingsService.get.and.returnValue(of(orgSettingsWoTax));
        orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesData));
        spyOn(component, 'setupNetworkWatcher');
        taxGroupService.get.and.returnValue(of(taxGroupData));
        recentlyUsedItemsService.getRecentlyUsed.and.returnValue(of(recentlyUsedRes));
        component.individualProjectIds$ = of([]);
        component.isIndividualProjectsEnabled$ = of(true);
        projectsService.getProjectCount.and.returnValue(of(2));
        spyOn(component, 'setupCostCenters');
        storageService.get.and.resolveTo(true);
        spyOn(component, 'setupBalanceFlag');
        statusService.find.and.returnValue(of(getEstatusApiResponse));
        spyOn(component, 'getActiveCategories').and.returnValue(of(sortedCategory));
        spyOn(component, 'getNewExpenseObservable').and.returnValue(of(expectedExpenseObservable));
        spyOn(component, 'getEditExpenseObservable').and.returnValue(of(expectedUnflattendedTxnData1));
        transactionService.getSplitExpenses.and.returnValue(of(splitExpData));
        corporateCreditCardExpenseService.getEccceByGroupId.and.returnValue(of(expectedECccResponse));
        fileService.findByTransactionId.and.returnValue(of(expectedFileData1));
        fileService.downloadUrl.and.returnValue(of('url'));
        activatedRoute.snapshot.params.activeIndex = JSON.stringify(1);
        activatedRoute.snapshot.params.txnIds = JSON.stringify(['id_1', 'id_2']);
        spyOn(component, 'getCCCSettings').and.returnValue(true);
        spyOn(component, 'getReceiptDetails').and.returnValue({
          type: 'jpeg',
          thumbnail: 'thumbnail',
        });
        spyOn(component, 'getPaymentModes');
        spyOn(component, 'setupFilteredCategories');
        spyOn(component, 'setupExpenseFields');

        reportService.getFilteredPendingReports.and.returnValue(of(expectedErpt));
        recentlyUsedItemsService.getRecentCategories.and.returnValue(of(recentUsedCategoriesRes));

        spyOn(component, 'setupFormInit');
        spyOn(component, 'setupCustomFields');
        spyOn(component, 'clearCategoryOnValueChange');
        spyOn(component, 'getActionSheetOptions').and.returnValue(of([]));
        spyOn(component, 'getPolicyDetails');
        spyOn(component, 'getDuplicateExpenses');
        activatedRoute.snapshot.params.id = null;
        activatedRoute.snapshot.params.bankTxn = JSON.stringify(expectedECccResponse);
        fixture.detectChanges();

        component.ionViewWillEnter();

        expect(component.initClassObservables).toHaveBeenCalledTimes(1);
        expect(tokenService.getClusterDomain).toHaveBeenCalledTimes(1);

        expect(categoriesService.getSystemCategories).toHaveBeenCalledTimes(1);
        expect(categoriesService.getBreakfastSystemCategories).toHaveBeenCalledTimes(1);
        expect(reportService.getAutoSubmissionReportName).toHaveBeenCalledTimes(1);

        expect(component.setupSelectedProjectObservable).toHaveBeenCalledTimes(1);
        expect(component.setupSelectedCostCenterObservable).toHaveBeenCalledTimes(1);
        expect(component.initCCCTxn).toHaveBeenCalledTimes(1);
        expect(component.getCCCpaymentMode).toHaveBeenCalledTimes(1);
        expect(component.setUpTaxCalculations).toHaveBeenCalledTimes(1);

        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);

        component.isAdvancesEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.taxGroups$.subscribe((res) => {
          expect(res).toBeNull();
        });

        component.taxGroupsOptions$.subscribe((res) => {
          expect(res).toBeUndefined();
        });

        expect(component.isCorporateCreditCardEnabled).toBeTrue();
        expect(component.isNewReportsFlowEnabled).toBeTrue();
        expect(component.isDraftExpenseEnabled).toBeTrue();

        expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);

        component.recentlyUsedValues$.subscribe((res) => {
          expect(res).toBeNull();
        });

        component.individualProjectIds$.subscribe((res) => {
          expect(res).toEqual([290054, 316444, 316446, 149230, 316442, 316443]);
        });

        component.isIndividualProjectsEnabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isProjectsVisible$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        expect(projectsService.getProjectCount).toHaveBeenCalledTimes(1);
        expect(component.setupCostCenters).toHaveBeenCalledTimes(1);

        expect(storageService.get).toHaveBeenCalledOnceWith('isExpandedView');
        expect(statusService.find).toHaveBeenCalledTimes(1);

        component.isProjectsEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.isSplitExpenseAllowed$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        expect(component.setupBalanceFlag).toHaveBeenCalledTimes(1);

        component.paymentAccount$.subscribe((res) => {
          expect(res).toEqual(multiplePaymentModesData[1]);
        });

        expect(component.getPaymentModes).toHaveBeenCalledTimes(1);

        expect(component.getNewExpenseObservable).toHaveBeenCalledTimes(1);
        expect(component.getEditExpenseObservable).toHaveBeenCalledTimes(1);

        component.isCCCAccountSelected$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.attachments$.subscribe((res) => {
          expect(res).toEqual(expectedFileData1);
        });

        expect(fileService.findByTransactionId).toHaveBeenCalledOnceWith(undefined);
        expect(fileService.downloadUrl).toHaveBeenCalledOnceWith('fiV1gXpyCcbU');
        expect(component.getReceiptDetails).toHaveBeenCalledOnceWith(expectedFileData1[0]);

        component.flightJourneyTravelClassOptions$.subscribe((res) => {
          expect(res).toEqual([
            {
              value: 'BUSINESS',
              label: 'BUSINESS',
            },
          ]);
        });

        expect(component.setupFilteredCategories).toHaveBeenCalledOnceWith(jasmine.any(Observable));
        expect(component.setupExpenseFields).toHaveBeenCalledTimes(1);

        component.taxSettings$.subscribe((res) => {
          expect(res).toEqual(taxSettingsData2);
        });

        component.reports$.subscribe((res) => {
          expect(res).toEqual(reportOptionsData3);
        });

        component.recentlyUsedCategories$.subscribe((res) => {
          expect(res).toEqual(recentUsedCategoriesRes);
        });

        component.transactionInReport$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isNotReimbursable$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isAmountCapped$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isAmountDisabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isCriticalPolicyViolated$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        expect(reportService.getFilteredPendingReports).toHaveBeenCalledOnceWith({ state: 'edit' });
        expect(recentlyUsedItemsService.getRecentCategories).toHaveBeenCalledTimes(1);
        expect(component.setupFormInit).toHaveBeenCalledTimes(1);
        expect(component.setupCustomFields).toHaveBeenCalledTimes(1);
        expect(component.clearCategoryOnValueChange).toHaveBeenCalledTimes(1);
        expect(component.getActionSheetOptions).toHaveBeenCalledTimes(1);
        expect(component.getDuplicateExpenses).toHaveBeenCalledTimes(1);
        expect(component.getPolicyDetails).toHaveBeenCalledTimes(1);
        expect(component.getCCCSettings).toHaveBeenCalledTimes(2);

        done();
      });
    });
  });
}
