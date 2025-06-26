import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject, Subscription, of } from 'rxjs';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { expectedCCdata, expectedCCdata2 } from 'src/app/core/mock-data/cost-centers.data';
import { defaultTxnFieldValuesData3 } from 'src/app/core/mock-data/default-txn-field-values.data';
import {
  expenseFieldsMapResponse,
  txnFieldsData,
  txnFieldsData2,
  txnFieldsData3,
} from 'src/app/core/mock-data/expense-fields-map.data';
import { policyExpense2 } from 'src/app/core/mock-data/expense.data';
import { categorieListRes } from 'src/app/core/mock-data/org-category-list-item.data';
import { TaxiCategory, orgCategoryData1 } from 'src/app/core/mock-data/org-category.data';
import {
  orgSettingsCCCDisabled2,
  orgSettingsCCCDisabled3,
  orgSettingsParamWoCCC,
} from 'src/app/core/mock-data/org-settings.data';
import { taxGroupData } from 'src/app/core/mock-data/tax-group.data';
import {
  checkDebitCCCExpenseData1,
  checkDebitCCCExpenseData2,
  checkSplitExpData1,
  checkSplitExpData2,
  unflattenedExpWithCCCExpn,
  unflattenedExpWithoutCCExpnSync,
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
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
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
import { ExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TaxGroupService } from 'src/app/core/services/tax-group.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import {
  multiplePaymentModesData,
  orgSettingsData,
  advanceWallet1Data,
  multiplePaymentModes,
} from 'src/app/core/test-data/accounts.service.spec.data';
import { expectedProjectsResponse } from 'src/app/core/test-data/projects.spec.data';
import { AddEditExpensePage } from './add-edit-expense.page';
import { TransactionStatusInfoPopoverComponent } from 'src/app/shared/components/transaction-status-info-popover/transaction-status-info-popover.component';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { AdvanceWalletsService } from 'src/app/core/services/platform/v1/spender/advance-wallets.service';
import { expenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import {
  transformedExpenseWithMatchCCCData,
  transformedExpenseWithMatchCCCData3,
  transformedExpenseWithMatchCCCData4,
} from 'src/app/core/mock-data/transformed-expense.data';
import { matchedCCTransactionData, matchedCCTransactionData2 } from 'src/app/core/mock-data/matchedCCTransaction.data';
import { ccTransactionData, ccTransactionData1 } from 'src/app/core/mock-data/cc-transaction.data';
import { ccTransactionResponseData } from 'src/app/core/mock-data/corporate-card-transaction-response.data';
import { cloneDeep } from 'lodash';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { CCExpenseMerchantInfoModalComponent } from 'src/app/shared/components/cc-expense-merchant-info-modal/cc-expense-merchant-info-modal.component';

export function TestCases6(getTestBed) {
  describe('AddEditExpensePage-6', () => {
    let component: AddEditExpensePage;
    let fixture: ComponentFixture<AddEditExpensePage>;
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
    let paymentModesService: jasmine.SpyObj<PaymentModesService>;
    let taxGroupService: jasmine.SpyObj<TaxGroupService>;
    let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
    let platform: jasmine.SpyObj<Platform>;
    let platformHandlerService: jasmine.SpyObj<PlatformHandlerService>;
    let expensesService: jasmine.SpyObj<ExpensesService>;
    let advanceWalletsService: jasmine.SpyObj<AdvanceWalletsService>;

    function setFormValueNull() {
      Object.defineProperty(component.fg, 'value', {
        get: () => null,
      });
    }

    beforeEach(() => {
      const TestBed = getTestBed();
      TestBed.compileComponents();

      fixture = TestBed.createComponent(AddEditExpensePage);
      component = fixture.componentInstance;

      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      formBuilder = TestBed.inject(UntypedFormBuilder);
      categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
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
      paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
      taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
      platformEmployeeSettingsService = TestBed.inject(
        PlatformEmployeeSettingsService
      ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
      storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
      launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
      platformHandlerService = TestBed.inject(PlatformHandlerService) as jasmine.SpyObj<PlatformHandlerService>;
      expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;

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
        custom_inputs: new UntypedFormArray([]),
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
      component.selectedCostCenter$ = new BehaviorSubject(null);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
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

    it('setupSelectedProjectObservable(): should call project observable if value changes', fakeAsync(() => {
      spyOn(component.selectedProject$, 'next');
      component.setupSelectedProjectObservable();
      tick(500);

      component.fg.controls.project.setValue(expectedProjectsResponse[0]);
      fixture.detectChanges();

      tick(500);
      expect(component.selectedProject$.next).toHaveBeenCalledOnceWith(expectedProjectsResponse[0]);
    }));

    it('setupSelectedCostCenterObservable(): should call cost center observable if value changes', fakeAsync(() => {
      spyOn(component.selectedCostCenter$, 'next');
      component.setupSelectedCostCenterObservable();
      tick(500);

      component.fg.controls.costCenter.setValue(expectedCCdata2[0].value);
      fixture.detectChanges();

      tick(500);
      expect(component.selectedCostCenter$.next).toHaveBeenCalledOnceWith(expectedCCdata2[0].value);
    }));

    describe('getCCCpaymentMode():', () => {
      it('should set the CCC payment mode', fakeAsync(() => {
        component.getCCCpaymentMode();
        tick(500);

        component.isCCCPaymentModeSelected$.subscribe((res) => {
          expect(res).toBeFalse();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesData[0]);
        fixture.detectChanges();

        tick(500);
      }));

      it('should set CCC payment mode to null in case removed', fakeAsync(() => {
        component.getCCCpaymentMode();
        tick(500);

        component.isCCCPaymentModeSelected$.subscribe((res) => {
          expect(res).toBeFalse();
        });
        component.fg.controls.paymentMode.setValue(null);
        fixture.detectChanges();

        tick(500);
      }));
    });

    it('generateTxnFieldsMap(): should generate txn fields map', fakeAsync(() => {
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse));
      expenseFieldsService.filterByOrgCategoryId.and.returnValue(of(txnFieldsData));

      component.generateTxnFieldsMap().subscribe((res) => {
        expect(res).toEqual(txnFieldsData);
      });
      tick(500);

      component.fg.controls.billable.setValue(true);
      fixture.detectChanges();
      tick(500);

      expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(2);
      expect(expenseFieldsService.filterByOrgCategoryId).toHaveBeenCalledWith(
        expenseFieldsMapResponse,
        [
          'purpose',
          'txn_dt',
          'vendor_id',
          'cost_center_id',
          'project_id',
          'from_dt',
          'to_dt',
          'location1',
          'location2',
          'distance',
          'distance_unit',
          'flight_journey_travel_class',
          'flight_return_travel_class',
          'train_travel_class',
          'bus_travel_class',
          'billable',
          'tax_group_id',
          'org_category_id',
        ],
        undefined
      );
    }));

    describe('updateFormForExpenseFields():', () => {
      it('should update form with expense fields values', () => {
        component.etxn$ = of(unflattenedExpWithCCCExpn);
        const mockTaxGroupData = cloneDeep(taxGroupData);
        component.taxGroups$ = of(mockTaxGroupData);
        expenseFieldsService.getDefaultTxnFieldValues.and.returnValue(defaultTxnFieldValuesData3);
        fixture.detectChanges();

        component.updateFormForExpenseFields(of(expenseFieldsMapResponse[0]));
        expect(expenseFieldsService.getDefaultTxnFieldValues).toHaveBeenCalledTimes(1);
      });

      it('should update form with expense fields values with billable fields', () => {
        component.etxn$ = of(unflattenedExpWithCCCExpn);
        const mockTaxGroupData = cloneDeep(taxGroupData);
        component.taxGroups$ = of(mockTaxGroupData);
        expenseFieldsService.getDefaultTxnFieldValues.and.returnValue(defaultTxnFieldValuesData3);
        component.fg.controls.project.setValue(expectedProjectsResponse[0]);
        component.fg.controls.billable.setValue(null);
        Object.defineProperty(component.fg.controls.billable, 'touched', {
          get: () => false,
        });
        fixture.detectChanges();

        component.updateFormForExpenseFields(of(expenseFieldsMapResponse[0]));
        expect(expenseFieldsService.getDefaultTxnFieldValues).toHaveBeenCalledTimes(1);
      });
    });

    describe('setupExpenseFields():', () => {
      it('should setup expense fields', () => {
        const mockTxnFields = cloneDeep(txnFieldsData2);
        spyOn(component, 'generateTxnFieldsMap').and.returnValue(of(mockTxnFields));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.isIndividualProjectsEnabled$ = of(true);
        component.individualProjectIds$ = of([]);
        component.costCenters$ = of(expectedCCdata);
        component.isConnected$ = of(true);
        component.taxGroups$ = of(taxGroupData);
        component.filteredCategories$ = of(categorieListRes);
        component.fg.controls.category.setValue(TaxiCategory);
        component.systemCategories = ['Taxi'];
        spyOn(component, 'updateFormForExpenseFields');
        fixture.detectChanges();

        component.setupExpenseFields();

        expect(component.generateTxnFieldsMap).toHaveBeenCalledOnceWith();
        expect(component.updateFormForExpenseFields).toHaveBeenCalledOnceWith(jasmine.any(Observable));
      });

      it('should setup expense fields for offline mode and cost centers enabled', () => {
        const mockTxnFields = cloneDeep(txnFieldsData3);
        spyOn(component, 'generateTxnFieldsMap').and.returnValue(of(mockTxnFields));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.isIndividualProjectsEnabled$ = of(true);
        component.individualProjectIds$ = of([]);
        component.costCenters$ = of(expectedCCdata);
        component.isConnected$ = of(false);
        component.taxGroups$ = of(taxGroupData);
        component.filteredCategories$ = of(categorieListRes);
        spyOn(component, 'updateFormForExpenseFields');
        fixture.detectChanges();

        component.setupExpenseFields();
        expect(component.generateTxnFieldsMap).toHaveBeenCalledOnceWith();
        expect(component.updateFormForExpenseFields).toHaveBeenCalledOnceWith(jasmine.any(Observable));
      });

      it('should setup expense fields if cost centers are empty', () => {
        const mockTxnFields = cloneDeep(txnFieldsData3);
        spyOn(component, 'generateTxnFieldsMap').and.returnValue(of(mockTxnFields));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.isIndividualProjectsEnabled$ = of(true);
        component.individualProjectIds$ = of([123]);
        component.costCenters$ = of(null);
        component.isConnected$ = of(false);
        component.taxGroups$ = of(taxGroupData);
        component.filteredCategories$ = of(categorieListRes);
        spyOn(component, 'updateFormForExpenseFields');
        fixture.detectChanges();

        component.setupExpenseFields();
        expect(component.generateTxnFieldsMap).toHaveBeenCalledOnceWith();
        expect(component.updateFormForExpenseFields).toHaveBeenCalledOnceWith(jasmine.any(Observable));
      });
    });

    describe('initSplitTxn():', () => {
      it('should initialize split txns made using ccc', () => {
        expensesService.getSplitExpenses.and.returnValue(of([expenseData, expenseData]));
        component.etxn$ = of(unflattenedExpWithCCCExpn);
        spyOn(component, 'handleCCCExpenses');
        spyOn(component, 'getSplitExpenses');
        fixture.detectChanges();

        component.initSplitTxn(of(orgSettingsData));
        expect(expensesService.getSplitExpenses).toHaveBeenCalledOnceWith('tx3qHxFNgRcZ');
        expect(component.handleCCCExpenses).toHaveBeenCalledOnceWith(unflattenedExpWithCCCExpn, undefined);
        expect(corporateCreditCardExpenseService.getMatchedTransactionById).not.toHaveBeenCalled();
        expect(component.getSplitExpenses).toHaveBeenCalledOnceWith([expenseData, expenseData]);
      });

      it('should initialize CCC expenses with group ID', () => {
        expensesService.getSplitExpenses.and.returnValue(of(null));
        component.etxn$ = of(unflattenedExpWithCCCExpn);
        spyOn(component, 'handleCCCExpenses');
        spyOn(component, 'getSplitExpenses');
        fixture.detectChanges();

        component.initSplitTxn(of(orgSettingsParamWoCCC));
        expect(expensesService.getSplitExpenses).toHaveBeenCalledOnceWith('tx3qHxFNgRcZ');
        expect(component.handleCCCExpenses).toHaveBeenCalledOnceWith(unflattenedExpWithCCCExpn, undefined);
        expect(corporateCreditCardExpenseService.getMatchedTransactionById).not.toHaveBeenCalled();
        expect(component.getSplitExpenses).not.toHaveBeenCalledOnceWith([expenseData, expenseData]);
      });

      it('should initialize CCC expenses with group Id if not synced up', () => {
        expensesService.getSplitExpenses.and.returnValue(of(null));
        corporateCreditCardExpenseService.getMatchedTransactionById.and.returnValue(of(ccTransactionResponseData));
        component.etxn$ = of(unflattenedExpWithoutCCExpnSync);
        spyOn(component, 'handleCCCExpenses');
        spyOn(component, 'getSplitExpenses');
        fixture.detectChanges();

        component.initSplitTxn(of(orgSettingsParamWoCCC));
        expect(expensesService.getSplitExpenses).toHaveBeenCalledOnceWith('tx6I9xcOZFU6');
        expect(component.handleCCCExpenses).toHaveBeenCalledOnceWith(
          unflattenedExpWithoutCCExpnSync,
          ccTransactionData1
        );
        expect(corporateCreditCardExpenseService.getMatchedTransactionById).toHaveBeenCalledOnceWith(
          unflattenedExpWithoutCCExpnSync.tx.corporate_credit_card_expense_group_id
        );
        expect(component.getSplitExpenses).not.toHaveBeenCalledOnceWith([expenseData, expenseData]);
      });
    });

    describe('handleCCCExpenses():', () => {
      it('should handle CCC expenses if expenses have matched_corporate_card_transaction synced', () => {
        const date = new Date('2018-07-03T13:00:00.000Z');
        jasmine.clock().mockDate(date);
        const mockEtxn = cloneDeep(transformedExpenseWithMatchCCCData);
        component.handleCCCExpenses(mockEtxn, null);
        expect(component.cardNumber).toEqual('7620');
        expect(component.matchedCCCTransaction).toEqual(matchedCCTransactionData);
      });

      it('should handle CCC expenses if expense does not have matched_corporate_card_transaction synced', () => {
        const date = new Date('2018-07-03T13:00:00.000Z');
        jasmine.clock().mockDate(date);
        const mockTransformedCCCTxn = cloneDeep(matchedCCTransactionData);
        corporateCreditCardExpenseService.transformCCTransaction.and.returnValue(mockTransformedCCCTxn);
        const mockEtxn = cloneDeep(transformedExpenseWithMatchCCCData4);
        component.handleCCCExpenses(mockEtxn, ccTransactionData);
        expect(corporateCreditCardExpenseService.transformCCTransaction).toHaveBeenCalledOnceWith(ccTransactionData);
        expect(component.cardNumber).toEqual('7620');
        expect(component.matchedCCCTransaction).toEqual(matchedCCTransactionData);
      });

      it('should show card digits and vendor description', () => {
        const date = new Date('2018-06-06T08:30:00.000Z');
        jasmine.clock().mockDate(date);
        const mockEtxn = cloneDeep(transformedExpenseWithMatchCCCData3);
        component.handleCCCExpenses(mockEtxn, null);
        expect(component.cardNumber).toEqual('9891');
        expect(component.matchedCCCTransaction).toEqual(matchedCCTransactionData2);
      });
    });

    it('getSplitExpenses(): should get split expenses', () => {
      component.getSplitExpenses([expenseData, expenseData]);

      expect(component.isSplitExpensesPresent).toBeTrue();
      expect(component.canEditCCCMatchedSplitExpense).toBeFalse();
    });

    it('clearCategoryOnValueChange(): should clear category dependent fields if category changes', fakeAsync(() => {
      Object.defineProperty(component.fg.controls.category, 'dirty', {
        get: () => true,
      });
      component.clearCategoryOnValueChange();
      tick(500);

      component.fg.controls.category.setValue(orgCategoryData1);
      tick(500);
      fixture.detectChanges();

      expect(component.fg.controls.from_dt.value).toBeNull();
      expect(component.fg.controls.to_dt.value).toBeNull();
      expect(component.fg.controls.location_1.value).toBeNull();
      expect(component.fg.controls.location_2.value).toBeNull();
      expect(component.fg.controls.distance.value).toBeNull();
      expect(component.fg.controls.distance_unit.value).toBeNull();
      expect(component.fg.controls.flight_journey_travel_class.value).toBeNull();
      expect(component.fg.controls.flight_return_travel_class.value).toBeNull();
      expect(component.fg.controls.train_travel_class.value).toBeNull();
      expect(component.fg.controls.bus_travel_class.value).toBeNull();
    }));

    it('ngOnInit(): should populate report permissions', () => {
      activatedRoute.snapshot.params.remove_from_report = JSON.stringify(true);
      fixture.detectChanges();

      component.ngOnInit();
      expect(component.canRemoveFromReport).toBeTrue();
      expect(component.isRedirectedFromReport).toBeTrue();
    });

    describe('currencyObjValidator():', () => {
      it('should validate currency object', () => {
        component.fg.controls.currencyObj.setValue({
          amount: null,
          currency: null,
          orig_amount: 10,
          orig_currency: 'USD',
        });
        fixture.detectChanges();

        const result = component.currencyObjValidator(component.fg.controls.currencyObj);
        expect(result).toBeNull();
      });

      it('should return false if there is no value in form control', () => {
        component.fg.controls.currencyObj.setValue(null);
        fixture.detectChanges();

        const result = component.currencyObjValidator(component.fg.controls.currencyObj);
        expect(result).toEqual({
          required: false,
        });
      });
    });

    describe('getSourceAccID():', () => {
      it('should get source account id', () => {
        component.fg.controls.paymentMode.setValue({
          acc: { id: 'id' },
        });

        const result = component.getSourceAccID();
        expect(result).toEqual('id');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getSourceAccID();
        expect(result).toBeUndefined();
      });
    });

    describe('getAdvanceWalletId():', () => {
      it('should get advance wallet id', () => {
        component.fg.controls.paymentMode.setValue({
          id: 'areq1234',
        });

        const result = component.getAdvanceWalletId(true);
        expect(result).toEqual('areq1234');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getAdvanceWalletId(true);
        expect(result).toBeUndefined();
      });

      it('should return null when advance wallet setting is disabled', () => {
        setFormValueNull();

        const result = component.getAdvanceWalletId(false);
        expect(result).toBeFalse();
      });

      it('should return null', () => {
        component.fg.controls.paymentMode.setValue({
          acc: {
            id: 'id',
          },
        });

        const result = component.getAdvanceWalletId(true);
        expect(result).toBeNull();
      });
    });

    describe('getBillable():', () => {
      it('should get billable', () => {
        component.fg.controls.billable.setValue(true);

        const result = component.getBillable();
        expect(result).toBeTrue();
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getBillable();
        expect(result).toBeUndefined();
      });
    });

    describe('getSkipRemibursement():', () => {
      it('should get reimbursement', () => {
        component.fg.controls.paymentMode.setValue({
          acc: {
            type: AccountType.PERSONAL,
          },
        });

        const result = component.getSkipRemibursement();
        expect(result).toBeTrue();
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getSkipRemibursement();
        expect(result).toBeFalse();
      });

      it('should get reimbursement with paymentmode as advance wallet', () => {
        component.fg.controls.paymentMode.setValue({
          id: 'areq1234',
        });

        const result = component.getSkipRemibursement();
        expect(result).toBeTrue();
      });
    });

    describe('getCurrency():', () => {
      it('should get currency', () => {
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
        });

        const result = component.getCurrency();
        expect(result).toEqual('USD');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getCurrency();
        expect(result).toBeUndefined();
      });
    });

    describe('getOriginalCurrency():', () => {
      it('should get currency', () => {
        component.fg.controls.currencyObj.setValue({
          orig_currency: 'USD',
        });

        const result = component.getOriginalCurrency();
        expect(result).toEqual('USD');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getOriginalCurrency();
        expect(result).toBeUndefined();
      });
    });

    describe('getOriginalAmount():', () => {
      it('should get currency', () => {
        component.fg.controls.currencyObj.setValue({
          orig_amount: 100,
        });

        const result = component.getOriginalAmount();
        expect(result).toEqual(100);
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getOriginalAmount();
        expect(result).toBeUndefined();
      });
    });

    describe('getProjectID():', () => {
      it('should get project ID', () => {
        component.fg.controls.project.setValue({
          project_id: 100,
        });

        const result = component.getProjectID();
        expect(result).toEqual(100);
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getProjectID();
        expect(result).toBeUndefined();
      });
    });

    describe('getTaxAmount():', () => {
      it('should get tax amount', () => {
        component.fg.controls.tax_amount.setValue(100);

        const result = component.getTaxAmount();
        expect(result).toEqual(100);
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getTaxAmount();
        expect(result).toBeUndefined();
      });
    });

    describe('getTaxGroupID():', () => {
      it('should get tax group ID', () => {
        component.fg.controls.tax_group.setValue({
          id: '100',
        });

        const result = component.getTaxGroupID();
        expect(result).toEqual('100');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getTaxGroupID();
        expect(result).toBeUndefined();
      });
    });

    describe('getOrgCategoryID():', () => {
      it('should get category ID', () => {
        component.fg.controls.category.setValue({
          id: 100,
        });

        const result = component.getOrgCategoryID();
        expect(result).toEqual(100);
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getOrgCategoryID();
        expect(result).toBeUndefined();
      });
    });

    describe('getFyleCategory():', () => {
      it('should get fyle category', () => {
        component.fg.controls.category.setValue({
          fyle_category: 'cat',
        });

        const result = component.getFyleCategory();
        expect(result).toEqual('cat');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getFyleCategory();
        expect(result).toBeUndefined();
      });
    });

    describe('getDisplayName():', () => {
      it('should get display name', () => {
        component.fg.controls.vendor_id.setValue({
          display_name: 'vendor',
        });

        const result = component.getDisplayName();
        expect(result).toEqual('vendor');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getDisplayName();
        expect(result).toBeUndefined();
      });
    });

    describe('getPurpose():', () => {
      it('should get purpose', () => {
        component.fg.controls.purpose.setValue('purpose');

        const result = component.getPurpose();
        expect(result).toEqual('purpose');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getPurpose();
        expect(result).toBeUndefined();
      });
    });

    describe('getFlightJourneyClass():', () => {
      it('should get flight journey class', () => {
        component.fg.controls.flight_journey_travel_class.setValue('FIRST');

        const result = component.getFlightJourneyClass();
        expect(result).toEqual('FIRST');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getFlightJourneyClass();
        expect(result).toBeUndefined();
      });
    });

    describe('getFlightReturnClass():', () => {
      it('should get flight return journey class', () => {
        component.fg.controls.flight_return_travel_class.setValue('FIRST');

        const result = component.getFlightReturnClass();
        expect(result).toEqual('FIRST');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getFlightReturnClass();
        expect(result).toBeUndefined();
      });
    });

    describe('getTrainTravelClass():', () => {
      it('should get train travel class', () => {
        component.fg.controls.train_travel_class.setValue('FIRST');

        const result = component.getTrainTravelClass();
        expect(result).toEqual('FIRST');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getTrainTravelClass();
        expect(result).toBeUndefined();
      });
    });

    describe('getBusTravelClass():', () => {
      it('should get bus travel class', () => {
        component.fg.controls.bus_travel_class.setValue('FIRST');

        const result = component.getBusTravelClass();
        expect(result).toEqual('FIRST');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getBusTravelClass();
        expect(result).toBeUndefined();
      });
    });

    describe('getDistance():', () => {
      it('should get distance', () => {
        component.fg.controls.distance.setValue(100);

        const result = component.getDistance();
        expect(result).toEqual(100);
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getDistance();
        expect(result).toBeUndefined();
      });
    });

    describe('getDistanceUnit():', () => {
      it('should get distance unit', () => {
        component.fg.controls.distance_unit.setValue('KM');

        const result = component.getDistanceUnit();
        expect(result).toEqual('KM');
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getDistanceUnit();
        expect(result).toBeUndefined();
      });
    });

    describe('getBreakfastProvided():', () => {
      it('should get if breakfast was provided', () => {
        component.fg.controls.hotel_is_breakfast_provided.setValue(true);

        const result = component.getBreakfastProvided();
        expect(result).toBeTrue();
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getBreakfastProvided();
        expect(result).toBeUndefined();
      });
    });

    describe('getTxnDate():', () => {
      it('should get txn date', () => {
        dateService.getUTCDate.and.returnValue(null);
        component.fg.controls.dateOfSpend.setValue({
          acc: {
            type: AccountType.PERSONAL,
          },
        });

        const result = component.getTxnDate();
        expect(result).toBeNull();
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getTxnDate();
        expect(result).toBeNull();
      });
    });

    describe('getFromDt():', () => {
      it('should get txn date', () => {
        dateService.getUTCDate.and.returnValue(null);
        component.fg.controls.from_dt.setValue(new Date('2019-06-19T06:30:00'));

        const result = component.getFromDt();
        expect(result).toBeNull();
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getFromDt();
        expect(result).toBeUndefined();
      });
    });

    describe('getToDt():', () => {
      it('should get txn date', () => {
        dateService.getUTCDate.and.returnValue(null);
        component.fg.controls.to_dt.setValue(new Date('2019-06-19T06:30:00'));

        const result = component.getToDt();
        expect(result).toBeNull();
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getToDt();
        expect(result).toBeUndefined();
      });
    });

    describe('getAmount():', () => {
      it('should get tax amount', () => {
        component.fg.controls.currencyObj.setValue({
          amount: 100,
        });

        const result = component.getAmount();
        expect(result).toEqual(100);
      });

      it('should return null', () => {
        setFormValueNull();

        const result = component.getAmount();
        expect(result).toBeUndefined();
      });
    });

    it('getIsPolicyExpense(): should get if an expense is policy', () => {
      const result = component.getIsPolicyExpense(policyExpense2);

      expect(result).toBeTrue();
    });

    describe('getCCCSettings():', () => {
      it('should return true if CCC settings are enabled', () => {
        const result = component.getCCCSettings(orgSettingsData);

        expect(result).toBeTrue();
      });

      it('should return null if no CCC settings exist', () => {
        const result = component.getCCCSettings(orgSettingsCCCDisabled2);

        expect(result).toBeUndefined();
      });

      it('should return null if no org settings exist', () => {
        const result = component.getCCCSettings(null);

        expect(result).toBeUndefined();
      });

      it('should return false if CCC no enabled', () => {
        const result = component.getCCCSettings(orgSettingsCCCDisabled3);

        expect(result).toBeNull();
      });
    });

    describe('getCheckSpiltExpense():', () => {
      it('should check if the expense is a  split expense', () => {
        const result = component.getCheckSpiltExpense(checkSplitExpData1);

        expect(result).toBeFalse();
      });

      it('should return true if split group ID is absent', () => {
        const result = component.getCheckSpiltExpense(checkSplitExpData2);

        expect(result).toBeTrue();
      });

      it('should return false if no expense is present', () => {
        const result = component.getCheckSpiltExpense(null);

        expect(result).toBeFalse();
      });
    });

    describe('getDebitCCCExpense():', () => {
      it('should return whether the expense is debit', () => {
        const result = component.getDebitCCCExpense(checkDebitCCCExpenseData1);

        expect(result).toBeTrue();
      });

      it('should return false if expense is not present', () => {
        const result = component.getDebitCCCExpense(null);

        expect(result).toBeFalse();
      });
    });

    describe('getDismissCCCExpense():', () => {
      it('should return whether the expense is debit', () => {
        const result = component.getDismissCCCExpense(checkDebitCCCExpenseData2);

        expect(result).toBeTrue();
      });

      it('should return false if expense is not present', () => {
        const result = component.getDismissCCCExpense(null);

        expect(result).toBeFalse();
      });
    });

    describe('getRemoveCCCExpense():', () => {
      it('should return true if a CCC expense can be removed', () => {
        const result = component.getRemoveCCCExpense(checkDebitCCCExpenseData2);

        expect(result).toBeTrue();
      });

      it('should return false if expense is not present', () => {
        const result = component.getRemoveCCCExpense(null);

        expect(result).toBeFalse();
      });
    });

    describe('checkAdvanceAccountAndBalance():', () => {
      it('should return false if account is not present', () => {
        const result = component.checkAdvanceAccountAndBalance(null);

        expect(result).toBeFalse();
      });

      it('should return true if account is of type advance', () => {
        const result = component.checkAdvanceAccountAndBalance(multiplePaymentModes[2]);

        expect(result).toBeTrue();
      });
    });

    describe('checkAdvanceWalletsWithSufficientBalance():', () => {
      it('should return false if advance wallet is not present', () => {
        const result = component.checkAdvanceWalletsWithSufficientBalance(null);

        expect(result).toBeFalse();
      });

      it('should return true if account is of type advace', () => {
        const result = component.checkAdvanceWalletsWithSufficientBalance(advanceWallet1Data);

        expect(result).toBeTrue();
      });
    });

    it('openTransactionStatusInfoModal(): should open the transaction status info modal', fakeAsync(() => {
      const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present']);
      popoverController.create.and.resolveTo(popoverSpy);

      component.openTransactionStatusInfoModal(ExpenseTransactionStatus.PENDING);

      tick();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: TransactionStatusInfoPopoverComponent,
        componentProps: {
          transactionStatus: ExpenseTransactionStatus.PENDING,
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
    }));

    it('openCCExpenseMerchantInfoModal(): should open the transaction status info modal', fakeAsync(() => {
      const modalSpy = jasmine.createSpyObj('modal', ['present']);
      modalController.create.and.resolveTo(modalSpy);

      modalProperties.getModalDefaultProperties.and.returnValue({
        cssClass: 'merchant-info',
        showBackdrop: true,
        canDismiss: true,
        backdropDismiss: true,
        animated: true,
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        handle: false,
      });

      component.openCCExpenseMerchantInfoModal();

      tick();

      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: CCExpenseMerchantInfoModalComponent,
        cssClass: 'merchant-info',
        showBackdrop: true,
        canDismiss: true,
        backdropDismiss: true,
        animated: true,
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        handle: false,
      });

      expect(modalSpy.present).toHaveBeenCalledTimes(1);
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
    }));

    describe('getCostCenterDependentFields():', () => {
      it('should get cost center dependent fields', () => {
        const mockDependentFields = [
          { id: 1, name: 'field1', value: 'test1' },
          { id: 2, name: 'field2', value: 'test2' },
        ];

        // Clear the form array and add new controls
        const costCenterDependentFieldsArray = component.fg.controls.cost_center_dependent_fields as UntypedFormArray;
        while (costCenterDependentFieldsArray.length) {
          costCenterDependentFieldsArray.removeAt(0);
        }

        mockDependentFields.forEach((field) => {
          costCenterDependentFieldsArray.push(formBuilder.control(field));
        });

        const result = component.getCostCenterDependentFields();
        expect(result).toEqual(mockDependentFields);
      });

      it('should return empty array when form value is null', () => {
        // Set form value to have empty cost_center_dependent_fields
        Object.defineProperty(component.fg, 'value', {
          get: () => ({
            cost_center_dependent_fields: [],
          }),
        });

        const result = component.getCostCenterDependentFields();
        expect(result).toEqual([]);
      });
    });
  });
}
