import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, getTestBed, tick } from '@angular/core/testing';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, PopoverController, NavController, ActionSheetController, Platform } from '@ionic/angular';
import { Subscription, of } from 'rxjs';
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
import { AddEditExpensePage } from './add-edit-expense.page';
import {
  multiplePaymentModesData,
  multiplePaymentModesWithoutAdvData,
} from 'src/app/core/test-data/accounts.service.spec.data';
import { expenseData1 } from 'src/app/core/mock-data/expense.data';
import {
  expectedUnflattendedTxnData1,
  unflattenedExpWoProject,
  unflattenedTxnData,
} from 'src/app/core/mock-data/unflattened-txn.data';
import { apiV2ResponseMultiple, expectedProjectsResponse } from 'src/app/core/test-data/projects.spec.data';
import { orgCategoryData, sortedCategory, transformedOrgCategories } from 'src/app/core/mock-data/org-category.data';
import { expenseFieldResponse } from 'src/app/core/mock-data/expense-field.data';
import { txnCustomProperties } from 'src/app/core/test-data/dependent-fields.service.spec.data';

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
        component.matchedCCCTransaction = expectedUnflattendedTxnData1.tx;
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
        expect(component.getCategoryOnAdd).toHaveBeenCalledOnceWith({});
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledTimes(1);
        component.dependentFields$.subscribe((res) => {
          expect(res).toEqual([]);
        });
      }));
    });
  });
}
