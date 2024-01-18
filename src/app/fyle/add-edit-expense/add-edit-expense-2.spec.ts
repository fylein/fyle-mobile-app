import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { Observable, Subscription, finalize, of, throwError } from 'rxjs';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { criticalPolicyViolation2 } from 'src/app/core/mock-data/crtical-policy-violations.data';
import { duplicateSetData1, duplicateSetData4 } from 'src/app/core/mock-data/duplicate-sets.data';
import { expenseData1, expenseData2 } from 'src/app/core/mock-data/expense.data';
import { fileObject7, fileObjectData } from 'src/app/core/mock-data/file-object.data';
import { individualExpPolicyStateData2 } from 'src/app/core/mock-data/individual-expense-policy-state.data';
import { filterOrgCategoryParam, orgCategoryData } from 'src/app/core/mock-data/org-category.data';
import {
  orgSettingsCCCDisabled,
  orgSettingsCCCEnabled,
  orgSettingsWoDuplicateDetectionV2,
  orgSettingsWithDuplicateDetectionV2,
} from 'src/app/core/mock-data/org-settings.data';
import { outboxQueueData1 } from 'src/app/core/mock-data/outbox-queue.data';
import {
  expectedInstaFyleData1,
  expectedInstaFyleData2,
  instaFyleData3,
  instaFyleData4,
  parsedInfo1,
  parsedInfo2,
  parsedReceiptData1,
  parsedReceiptData2,
  parsedReceiptDataWoDate,
} from 'src/app/core/mock-data/parsed-receipt.data';
import { splitPolicyExp4 } from 'src/app/core/mock-data/policy-violation.data';
import { editExpTxn, txnData2 } from 'src/app/core/mock-data/transaction.data';
import {
  expectedUnflattendedTxnData1,
  unflattenedTxnData,
  unflattenedTxnWithExtractedData,
  unflattenedTxnWithExtractedData2,
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
import { accountsData, orgSettingsData, paymentModesData } from 'src/app/core/test-data/accounts.service.spec.data';
import { estatusData1 } from 'src/app/core/test-data/status.service.spec.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { FyPolicyViolationComponent } from 'src/app/shared/components/fy-policy-violation/fy-policy-violation.component';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { AddEditExpensePage } from './add-edit-expense.page';
import { setFormValid } from './add-edit-expense.setup.spec';
import { SuggestedDuplicatesComponent } from './suggested-duplicates/suggested-duplicates.component';
import { customFieldData1 } from 'src/app/core/mock-data/custom-field.data';
import {
  missingMandatoryFieldsData1,
  missingMandatoryFieldsData2,
} from 'src/app/core/mock-data/missing-mandatory-fields.data';
import { platformPolicyExpenseData1 } from 'src/app/core/mock-data/platform-policy-expense.data';
import { PublicPolicyExpense } from 'src/app/core/models/public-policy-expense.model';
import { FileObject } from 'src/app/core/models/file-obj.model';
import { CustomField } from 'src/app/core/models/custom_field.model';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { expenseDuplicateSet2 } from 'src/app/core/mock-data/platform/v1/expense-duplicate-sets.data';
import { cloneDeep } from 'lodash';

const properties = {
  cssClass: 'fy-modal',
  showBackdrop: true,
  canDismiss: true,
  backdropDismiss: true,
  animated: true,
  initialBreakpoint: 1,
  breakpoints: [0, 1],
  handle: false,
};

export function TestCases2(getTestBed) {
  return describe('AddEditExpensePage-2', () => {
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
    let expensesService: jasmine.SpyObj<ExpensesService>;

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

    describe('getPaymentModes():', () => {
      it('should get payment modes', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        accountsService.getEMyAccounts.and.returnValue(of(accountsData));
        orgSettingsService.get.and.returnValue(of(orgSettingsCCCDisabled));
        orgUserSettingsService.getAllowedPaymentModes.and.returnValue(
          of([AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY])
        );
        paymentModesService.checkIfPaymentModeConfigurationsIsEnabled.and.returnValue(
          of(orgSettingsData.payment_mode_settings.enabled && orgSettingsData.payment_mode_settings.allowed)
        );
        accountsService.getPaymentModes.and.returnValue(paymentModesData);
        fixture.detectChanges();

        component.getPaymentModes().subscribe((res) => {
          expect(res).toEqual(paymentModesData);
          expect(component.showCardTransaction).toBeFalse();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          expect(orgUserSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(paymentModesService.checkIfPaymentModeConfigurationsIsEnabled).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should get payment modes in case org settings are not present', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        accountsService.getEMyAccounts.and.returnValue(of(accountsData));
        orgSettingsService.get.and.returnValue(of(null));
        orgUserSettingsService.getAllowedPaymentModes.and.returnValue(
          of([AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY])
        );
        paymentModesService.checkIfPaymentModeConfigurationsIsEnabled.and.returnValue(
          of(orgSettingsData.payment_mode_settings.enabled && orgSettingsData.payment_mode_settings.allowed)
        );
        accountsService.getPaymentModes.and.returnValue(paymentModesData);
        spyOn(component, 'getCCCSettings').and.returnValue(false);

        component.getPaymentModes().subscribe((res) => {
          expect(res).toEqual(paymentModesData);
          expect(component.showCardTransaction).toBeFalse();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          expect(orgUserSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(paymentModesService.checkIfPaymentModeConfigurationsIsEnabled).toHaveBeenCalledTimes(1);
          expect(component.getCCCSettings).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should get payment modes if CCC expense is enabled', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        accountsService.getEMyAccounts.and.returnValue(of(accountsData));
        orgSettingsService.get.and.returnValue(of(orgSettingsCCCEnabled));
        orgUserSettingsService.getAllowedPaymentModes.and.returnValue(
          of([AccountType.PERSONAL, AccountType.CCC, AccountType.COMPANY])
        );
        paymentModesService.checkIfPaymentModeConfigurationsIsEnabled.and.returnValue(
          of(orgSettingsData.payment_mode_settings.enabled && orgSettingsData.payment_mode_settings.allowed)
        );
        spyOn(component, 'getCCCSettings').and.returnValue(true);
        accountsService.getPaymentModes.and.returnValue(paymentModesData);

        component.getPaymentModes().subscribe((res) => {
          expect(res).toEqual(paymentModesData);
          expect(component.showCardTransaction).toBeTrue();
          expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          expect(orgUserSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
          expect(paymentModesService.checkIfPaymentModeConfigurationsIsEnabled).toHaveBeenCalledTimes(1);
          expect(component.getCCCSettings).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('getActiveCategories(): should get active categories', (done) => {
      categoriesService.getAll.and.returnValue(of(filterOrgCategoryParam));
      categoriesService.filterRequired.and.returnValue([filterOrgCategoryParam[0]]);

      component.getActiveCategories().subscribe((res) => {
        expect(res).toEqual([filterOrgCategoryParam[0]]);
        expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
        expect(categoriesService.filterRequired).toHaveBeenCalledOnceWith(filterOrgCategoryParam);
        done();
      });
    });

    describe('getInstaFyleImageData():', () => {
      it('should return image data if parsed from a receipt', (done) => {
        activatedRoute.snapshot.params.dataUrl = 'data-url';
        activatedRoute.snapshot.params.canExtractData = 'true';
        currencyService.getHomeCurrency.and.returnValue(of('INR'));
        currencyService.getExchangeRate.and.returnValue(of(82));
        transactionOutboxService.parseReceipt.and.resolveTo(parsedReceiptData1);

        component.getInstaFyleImageData().subscribe((res) => {
          expect(res).toEqual(expectedInstaFyleData1);
          expect(transactionOutboxService.parseReceipt).toHaveBeenCalledOnceWith('data-url');
          expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
          expect(currencyService.getExchangeRate).toHaveBeenCalledOnceWith(
            'USD',
            'INR',
            new Date('2023-02-15T06:30:00.000Z')
          );
          done();
        });
      });

      it('should return extracted data if both extracted and home currencies are same', (done) => {
        activatedRoute.snapshot.params.dataUrl = 'data-url';
        activatedRoute.snapshot.params.canExtractData = 'true';
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        transactionOutboxService.parseReceipt.and.resolveTo(parsedReceiptData1);

        component.getInstaFyleImageData().subscribe((res) => {
          expect(transactionOutboxService.parseReceipt).toHaveBeenCalledOnceWith('data-url');
          expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
          expect(res).toEqual(expectedInstaFyleData2);
          done();
        });
      });

      it('should return data from URL if data extraction is not allowed', (done) => {
        activatedRoute.snapshot.params.dataUrl = 'data-url';
        activatedRoute.snapshot.params.canExtractData = 'false';
        component.getInstaFyleImageData().subscribe((res) => {
          expect(res).toEqual({
            thumbnail: 'data-url',
            type: 'image',
            url: 'data-url',
          });
          done();
        });
      });

      it('should get null if there is no data in URL', (done) => {
        component.getInstaFyleImageData().subscribe((res) => {
          expect(res).toBeNull();
          done();
        });
      });

      it('should throw error if receipt could not be parsed', (done) => {
        activatedRoute.snapshot.params.dataUrl = 'url';
        activatedRoute.snapshot.params.canExtractData = 'true';
        transactionOutboxService.parseReceipt.and.rejectWith(throwError(() => new Error('error')));
        fixture.detectChanges();

        component.getInstaFyleImageData().subscribe({
          error: (err) => expect(err).toBeTruthy(),
        });
        done();
      });

      it('should throw error if exchange rate errors out', (done) => {
        activatedRoute.snapshot.params.dataUrl = 'data-url';
        activatedRoute.snapshot.params.canExtractData = 'true';
        currencyService.getHomeCurrency.and.returnValue(of('INR'));
        currencyService.getExchangeRate.and.returnValue(throwError(() => new Error('error')));
        transactionOutboxService.parseReceipt.and.resolveTo(parsedReceiptDataWoDate);

        component.getInstaFyleImageData().subscribe({
          next: (res) => {
            expect(res).toEqual(instaFyleData3);
            expect(transactionOutboxService.parseReceipt).toHaveBeenCalledOnceWith('data-url');
            expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
            expect(currencyService.getExchangeRate).toHaveBeenCalledOnceWith('USD', 'INR', jasmine.any(Date));
          },
          error: (err) => expect(err).toBeNull(),
        });
        done();
      });

      it('should return insta fyle data if parsed response is not present', (done) => {
        activatedRoute.snapshot.params.dataUrl = 'data-url';
        activatedRoute.snapshot.params.canExtractData = 'true';
        transactionOutboxService.parseReceipt.and.resolveTo({ data: null });

        component.getInstaFyleImageData().subscribe((res) => {
          expect(res).toEqual(instaFyleData4);
          expect(transactionOutboxService.parseReceipt).toHaveBeenCalledOnceWith('data-url');
          done();
        });
      });
    });

    it('setCategoryFromVendor(): should set category in the form', () => {
      categoriesService.getCategoryByName.and.returnValue(of(orgCategoryData));

      component.setCategoryFromVendor(orgCategoryData.displayName);
      expect(trackingService.setCategoryFromVendor).toHaveBeenCalledOnceWith(orgCategoryData);
      expect(component.fg.controls.category.value).toEqual(orgCategoryData);
    });

    describe('getEditExpenseObservable(): ', () => {
      it('should get editable expense observable if the txn is in DRAFT state', (done) => {
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnWithExtractedData));
        categoriesService.getCategoryByName.and.returnValue(of(orgCategoryData));
        dateService.getUTCDate.and.returnValue(new Date('2023-01-24T11:30:00.000Z'));

        component.getEditExpenseObservable().subscribe((res) => {
          expect(res).toEqual(expectedUnflattendedTxnData1);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
          expect(categoriesService.getCategoryByName).toHaveBeenCalledOnceWith(
            unflattenedTxnWithExtractedData.tx.extracted_data.category
          );
          expect(dateService.getUTCDate).not.toHaveBeenCalled();
          expect(component.isIncompleteExpense).toBeTrue();
          done();
        });
      });

      it('should return txn if state is not DRAFT', (done) => {
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));

        component.getEditExpenseObservable().subscribe((res) => {
          expect(res).toEqual(unflattenedTxnData);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(activatedRoute.snapshot.params.id);
          done();
        });
      });

      it('should return txn when the expense or the extracted data does not contain any category', (done) => {
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnWithExtractedData2));
        dateService.getUTCDate.and.returnValue(new Date('2023-01-24T11:30:00.000Z'));

        component.getEditExpenseObservable().subscribe((res) => {
          expect(res).toEqual(unflattenedTxnWithExtractedData2);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledTimes(1);
          expect(dateService.getUTCDate).not.toHaveBeenCalled();
          done();
        });
      });

      it('should update txn date with extracted date if txn date is not defined in original expense', (done) => {
        const mockedTxn = cloneDeep(unflattenedTxnWithExtractedData2);
        const extractedDate = new Date('2023-01-24');

        mockedTxn.tx.txn_dt = null;
        mockedTxn.tx.extracted_data.invoice_dt = null;
        mockedTxn.tx.extracted_data.date = extractedDate;

        transactionService.getETxnUnflattened.and.returnValue(of(mockedTxn));
        dateService.getUTCDate.and.returnValue(extractedDate);

        component.getEditExpenseObservable().subscribe((res) => {
          expect(res).toEqual(mockedTxn);
          expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(mockedTxn.tx.extracted_data.date);
          expect(mockedTxn.tx.txn_dt).toEqual(extractedDate);
          done();
        });
      });
    });

    it('goToPrev(): should go to the previous txn', () => {
      spyOn(component, 'goToTransaction');
      activatedRoute.snapshot.params.activeIndex = 1;
      component.reviewList = ['txSEM4DtjyKR', 'txNyI8ot5CuJ'];
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
      fixture.detectChanges();

      component.goToPrev();
      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txSEM4DtjyKR');
      expect(component.goToTransaction).toHaveBeenCalledOnceWith(unflattenedTxnData, component.reviewList, 0);
    });

    it('goToNext(): should got to the next txn', () => {
      const etxn = { ...unflattenedTxnData, tx: { ...unflattenedTxnData.tx, id: 'txNyI8ot5CuJ' } };
      spyOn(component, 'goToTransaction');
      activatedRoute.snapshot.params.activeIndex = 0;
      component.reviewList = ['txSEM4DtjyKR', 'txNyI8ot5CuJ'];
      transactionService.getETxnUnflattened.and.returnValue(of(etxn));
      fixture.detectChanges();

      component.goToNext();
      expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txNyI8ot5CuJ');
      expect(component.goToTransaction).toHaveBeenCalledOnceWith(etxn, component.reviewList, 1);
    });

    describe('goToTransaction():', () => {
      const txn_ids = ['txfCdl3TEZ7K'];
      it('should navigate to add-edit mileage if category is mileage', () => {
        const expense = { ...unflattenedTxnData, tx: { ...unflattenedTxnData.tx, org_category: 'MILEAGE' } };
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

      it('should navigate to per diem expense form if the category is per diem', () => {
        const expense = { ...unflattenedTxnData, tx: { ...unflattenedTxnData.tx, org_category: 'PER DIEM' } };
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

      it('should navigate to expense form', () => {
        const expense = unflattenedTxnData;
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

    it('reloadCurrentRoute(): should reload the current load', fakeAsync(() => {
      component.reloadCurrentRoute();
      tick(500);

      expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/enterprise/my_expenses', { skipLocationChange: true });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'add_edit_expense']);
    }));

    describe('saveExpense():', () => {
      it('should save an expense and match as personal if created from a personal card', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        setFormValid(component);
        component.isCreatedFromPersonalCard = true;
        component.mode = 'add';
        spyOn(component, 'saveAndMatchWithPersonalCardTxn');

        component.saveExpense();
        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_EXPENSE');
        expect(component.saveAndMatchWithPersonalCardTxn).toHaveBeenCalledTimes(1);
      });

      it('should save an expense after editing', () => {
        component.mode = 'edit';
        setFormValid(component);
        activatedRoute.snapshot.params.dataUrl = 'url';
        spyOn(component, 'editExpense').and.returnValue(of(editExpTxn));
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'goBack');
        fixture.detectChanges();

        component.saveExpense();
        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledOnceWith();
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_EXPENSE');
        expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_EXPENSE');
        expect(component.goBack).toHaveBeenCalledOnceWith();
      });

      it('should show form validation errors', fakeAsync(() => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => false,
        });
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(true));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(true));
        spyOn(component, 'showFormValidationErrors');
        fixture.detectChanges();

        component.saveExpense();
        tick(3500);

        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_EXPENSE');
        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledOnceWith();
        expect(component.showFormValidationErrors).toHaveBeenCalledOnceWith();
      }));

      it('should add expense in add mode', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(true));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(true));
        component.fg.controls.report.setValue(null);
        activatedRoute.snapshot.params.dataUrl = JSON.stringify(['url1']);
        component.mode = 'add';
        spyOn(component, 'addExpense').and.returnValue(of(Promise.resolve(outboxQueueData1[0])));
        fixture.detectChanges();

        component.saveExpense();

        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_EXPENSE');
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_EXPENSE');
        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
      });

      it('should return null if add expense fails', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(true));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(true));
        component.fg.controls.report.setValue(null);
        activatedRoute.snapshot.params.dataUrl = JSON.stringify(['url']);
        component.mode = 'add';
        spyOn(component, 'addExpense').and.returnValue(of(null));
        fixture.detectChanges();

        component.saveExpense();

        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_EXPENSE');
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_EXPENSE');
        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
      });
    });

    describe('saveAndNewExpense():', () => {
      it('should save and create expense if the form is valid and is in add mode', () => {
        spyOn(component, 'addExpense').and.returnValue(of(Promise.resolve(outboxQueueData1[0])));
        spyOn(component, 'reloadCurrentRoute');
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        component.mode = 'add';
        component.fg.clearValidators();
        component.fg.updateValueAndValidity();
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveAndNewExpense();
        expect(trackingService.clickSaveAddNew).toHaveBeenCalledTimes(1);
        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_AND_NEW_EXPENSE');
        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEW_EXPENSE');
        expect(component.reloadCurrentRoute).toHaveBeenCalledTimes(1);
      });

      it('should save an edited expense if the form is valid and is in edit mode ', () => {
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        spyOn(component, 'editExpense').and.returnValue(of(txnData2));
        spyOn(component, 'goBack');
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveAndNewExpense();
        expect(trackingService.clickSaveAddNew).toHaveBeenCalledTimes(1);
        expect(component.checkIfInvalidPaymentMode).toHaveBeenCalledTimes(1);
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_AND_NEW_EXPENSE');
        expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEW_EXPENSE');
        expect(component.goBack).toHaveBeenCalledTimes(1);
      });

      it('should show validation errors if payment mode is invalid', fakeAsync(() => {
        spyOn(component, 'showFormValidationErrors');
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(true));
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(true));

        component.saveAndNewExpense();
        tick(3000);

        expect(trackingService.clickSaveAddNew).toHaveBeenCalledTimes(1);
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_AND_NEW_EXPENSE');
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
        expect(component.invalidPaymentMode).toBeFalse();
      }));
    });

    describe('showSaveExpenseLoader()', () => {
      it('should set saveExpenseLoader to true if redirected from save expense flow', () => {
        component.showSaveExpenseLoader('SAVE_EXPENSE');
        expect(component.saveExpenseLoader).toBeTrue();
      });

      it('should set saveAndNewExpenseLoader to true if redirected from save and new expense flow', () => {
        component.showSaveExpenseLoader('SAVE_AND_NEW_EXPENSE');
        expect(component.saveAndNewExpenseLoader).toBeTrue();
      });

      it('should set saveAndNextExpenseLoader to true if redirected from save and next expense flow', () => {
        component.showSaveExpenseLoader('SAVE_AND_NEXT_EXPENSE');
        expect(component.saveAndNextExpenseLoader).toBeTrue();
      });

      it('should set saveAndPrevExpenseLoader to true if redirected from save and prev expense flow', () => {
        component.showSaveExpenseLoader('SAVE_AND_PREV_EXPENSE');
        expect(component.saveAndPrevExpenseLoader).toBeTrue();
      });
    });

    it('hideSaveExpenseLoader(): it should set all the save expense loader flags to false', () => {
      component.hideSaveExpenseLoader();

      expect(component.saveExpenseLoader).toBeFalse();
      expect(component.saveAndNewExpenseLoader).toBeFalse();
      expect(component.saveAndNextExpenseLoader).toBeFalse();
      expect(component.saveAndPrevExpenseLoader).toBeFalse();
    });

    describe('checkIfReceiptIsMissingAndMandatory()', () => {
      let customFields$: Observable<CustomField[]>;

      beforeEach(() => {
        customFields$ = of(customFieldData1);
        component.isConnected$ = of(true);

        spyOn(component, 'getCustomFields').and.returnValue(customFields$);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnData));
        spyOn(component, 'showSaveExpenseLoader');
        spyOn(component, 'hideSaveExpenseLoader');

        policyService.getPlatformPolicyExpense.and.returnValue(of(platformPolicyExpenseData1));
        transactionService.checkMandatoryFields.and.returnValue(of(missingMandatoryFieldsData1));
      });

      it('should return true if receipt is missing and mandatory', (done) => {
        component.checkIfReceiptIsMissingAndMandatory('SAVE_EXPENSE').subscribe((isReceiptMissingAndMandatory) => {
          expect(isReceiptMissingAndMandatory).toBeTrue();
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$, true);
          expect(policyService.getPlatformPolicyExpense).toHaveBeenCalledOnceWith(
            unflattenedTxnData as unknown as { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] },
            component.selectedCCCTransaction
          );
          expect(transactionService.checkMandatoryFields).toHaveBeenCalledOnceWith(platformPolicyExpenseData1);

          done();
        });
      });

      it('should show save expense loader while checking if receipt is invalid', (done) => {
        const isReceiptInvalid$ = component.checkIfReceiptIsMissingAndMandatory('SAVE_EXPENSE');
        expect(component.showSaveExpenseLoader).toHaveBeenCalledOnceWith('SAVE_EXPENSE');

        isReceiptInvalid$
          .pipe(
            finalize(() => {
              expect(component.hideSaveExpenseLoader).toHaveBeenCalledTimes(1);
              done();
            })
          )
          .subscribe();
      });

      it('should set showReceiptMandatoryError to true if receipt is missing and mandatory', (done) => {
        component.checkIfReceiptIsMissingAndMandatory('SAVE_EXPENSE').subscribe((isReceiptMissingAndMandatory) => {
          expect(component.showReceiptMandatoryError).toBeTrue();
          done();
        });
      });

      it('should return false if receipt is not missing or not mandatory', (done) => {
        transactionService.checkMandatoryFields.and.returnValue(of(missingMandatoryFieldsData2));
        component.checkIfReceiptIsMissingAndMandatory('SAVE_EXPENSE').subscribe((isReceiptMissingAndMandatory) => {
          expect(isReceiptMissingAndMandatory).toBeFalse();
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$, true);
          expect(policyService.getPlatformPolicyExpense).toHaveBeenCalledOnceWith(
            unflattenedTxnData as unknown as { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] },
            component.selectedCCCTransaction
          );
          expect(transactionService.checkMandatoryFields).toHaveBeenCalledOnceWith(platformPolicyExpenseData1);

          done();
        });
      });

      it('should return false if offline', (done) => {
        component.isConnected$ = of(false);
        component.checkIfReceiptIsMissingAndMandatory('SAVE_EXPENSE').subscribe((isReceiptMissingAndMandatory) => {
          expect(isReceiptMissingAndMandatory).toBeFalse();
          expect(component.getCustomFields).not.toHaveBeenCalled();
          expect(component.generateEtxnFromFg).not.toHaveBeenCalled();
          expect(policyService.getPlatformPolicyExpense).not.toHaveBeenCalled();
          expect(transactionService.checkMandatoryFields).not.toHaveBeenCalled();

          done();
        });
      });

      it('should return false if expense has receipts attached', (done) => {
        component.attachedReceiptsCount = 1;
        component.checkIfReceiptIsMissingAndMandatory('SAVE_EXPENSE').subscribe((isReceiptMissingAndMandatory) => {
          expect(isReceiptMissingAndMandatory).toBeFalse();
          expect(component.getCustomFields).not.toHaveBeenCalled();
          expect(component.generateEtxnFromFg).not.toHaveBeenCalled();
          expect(policyService.getPlatformPolicyExpense).not.toHaveBeenCalled();
          expect(transactionService.checkMandatoryFields).not.toHaveBeenCalled();

          done();
        });
      });

      it('should return false if check_mandatory_fields call fails', (done) => {
        transactionService.checkMandatoryFields.and.returnValue(throwError(() => new Error()));
        component.checkIfReceiptIsMissingAndMandatory('SAVE_EXPENSE').subscribe((isReceiptMissingAndMandatory) => {
          expect(isReceiptMissingAndMandatory).toBeFalse();
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$, true);
          expect(policyService.getPlatformPolicyExpense).toHaveBeenCalledOnceWith(
            unflattenedTxnData as unknown as { tx: PublicPolicyExpense; dataUrls: Partial<FileObject>[] },
            component.selectedCCCTransaction
          );
          expect(transactionService.checkMandatoryFields).toHaveBeenCalledOnceWith(platformPolicyExpenseData1);

          done();
        });
      });
    });

    describe('saveExpenseAndGotoPrev():', () => {
      it('should add a new expense and close the form', () => {
        spyOn(component, 'addExpense').and.returnValue(of(Promise.resolve(outboxQueueData1[0])));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'closeAddEditExpenses');
        component.activeIndex = 0;
        component.mode = 'add';
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_EXPENSE');
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledWith('SAVE_AND_PREV_EXPENSE');
        expect(component.closeAddEditExpenses).toHaveBeenCalledOnceWith();
      });

      it('should add a new expense and go to the previous expense if not the first one in list', () => {
        spyOn(component, 'addExpense').and.returnValue(of(Promise.resolve(outboxQueueData1[0])));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'goToPrev');
        component.activeIndex = 1;
        component.mode = 'add';
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_EXPENSE');
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledWith('SAVE_AND_PREV_EXPENSE');
        expect(component.goToPrev).toHaveBeenCalledOnceWith();
      });

      it('should save an edited expense and close the form', () => {
        spyOn(component, 'editExpense').and.returnValue(of(txnData2));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'closeAddEditExpenses');
        component.activeIndex = 0;
        component.mode = 'edit';
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoPrev();
        expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_EXPENSE');
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledWith('SAVE_AND_PREV_EXPENSE');
        expect(component.closeAddEditExpenses).toHaveBeenCalledOnceWith();
      });

      it('should save an edited expense and go to the previous expense', () => {
        spyOn(component, 'editExpense').and.returnValue(of(txnData2));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'goToPrev');
        component.activeIndex = 1;
        component.mode = 'edit';
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoPrev();
        expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_EXPENSE');
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledWith('SAVE_AND_PREV_EXPENSE');
        expect(component.goToPrev).toHaveBeenCalledOnceWith();
      });

      it('should show validation errors if the form is not valid', () => {
        spyOn(component, 'showFormValidationErrors');
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(true));

        component.saveExpenseAndGotoPrev();

        expect(component.showFormValidationErrors).toHaveBeenCalledOnceWith();
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledWith('SAVE_AND_PREV_EXPENSE');
      });
    });

    describe('saveExpenseAndGotoNext():', () => {
      it('should add a new expense and close the form', () => {
        spyOn(component, 'addExpense').and.returnValue(of(Promise.resolve(outboxQueueData1[0])));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'closeAddEditExpenses');
        component.activeIndex = 0;
        component.reviewList = ['id1'];
        component.mode = 'add';
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoNext();
        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
        expect(component.closeAddEditExpenses).toHaveBeenCalledOnceWith();
      });

      it('should add a new expense and go to the next expense if not the first one in list', () => {
        spyOn(component, 'addExpense').and.returnValue(of(Promise.resolve(outboxQueueData1[0])));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'goToNext');
        component.activeIndex = 0;
        component.mode = 'add';
        component.reviewList = ['id1', 'id2'];
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoNext();
        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
        expect(component.goToNext).toHaveBeenCalledTimes(1);
      });

      it('should save an edited expense and close the form', () => {
        spyOn(component, 'editExpense').and.returnValue(of(txnData2));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'closeAddEditExpenses');
        component.activeIndex = 0;
        component.mode = 'edit';
        component.reviewList = ['id1'];
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoNext();
        expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
        expect(component.closeAddEditExpenses).toHaveBeenCalledTimes(1);
      });

      it('should save an edited expense and go to the next expense', () => {
        spyOn(component, 'editExpense').and.returnValue(of(txnData2));
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(false));
        spyOn(component, 'goToNext');
        component.activeIndex = 0;
        component.mode = 'edit';
        component.reviewList = ['id1', 'id2'];
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoNext();
        expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
        expect(component.goToNext).toHaveBeenCalledTimes(1);
      });

      it('should show validation errors if the form is not valid', () => {
        spyOn(component, 'checkIfReceiptIsMissingAndMandatory').and.returnValue(of(true));
        spyOn(component, 'showFormValidationErrors');

        component.saveExpenseAndGotoNext();

        expect(component.showFormValidationErrors).toHaveBeenCalledOnceWith();
        expect(component.checkIfReceiptIsMissingAndMandatory).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_EXPENSE');
      });
    });

    it('continueWithCriticalPolicyViolation(): should show critical policy violation modal', async () => {
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      const fyCriticalPolicyViolationPopOverSpy = jasmine.createSpyObj('fyCriticalPolicyViolationPopOver', [
        'present',
        'onWillDismiss',
      ]);
      fyCriticalPolicyViolationPopOverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'primary',
        },
      });

      modalController.create.and.resolveTo(fyCriticalPolicyViolationPopOverSpy);

      const result = await component.continueWithCriticalPolicyViolation(criticalPolicyViolation2);

      expect(result).toBeTrue();
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyCriticalPolicyViolationComponent,
        componentProps: {
          criticalViolationMessages: criticalPolicyViolation2,
        },
        mode: 'ios',
        presentingElement: await modalController.getTop(),
        ...properties,
      });
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
    });

    it('continueWithPolicyViolations(): should display violations and relevant CTA in a modal', async () => {
      modalProperties.getModalDefaultProperties.and.returnValue(properties);
      const currencyModalSpy = jasmine.createSpyObj('currencyModal', ['present', 'onWillDismiss']);
      currencyModalSpy.onWillDismiss.and.resolveTo({
        data: { comment: 'primary' },
      });
      modalController.create.and.resolveTo(currencyModalSpy);

      const result = await component.continueWithPolicyViolations(
        criticalPolicyViolation2,
        splitPolicyExp4.data.final_desired_state
      );

      expect(result).toEqual({ comment: 'primary' });
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: FyPolicyViolationComponent,
        componentProps: {
          policyViolationMessages: criticalPolicyViolation2,
          policyAction: splitPolicyExp4.data.final_desired_state,
        },
        mode: 'ios',
        ...properties,
      });
      expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
    });

    it('trackPolicyCorrections(): should track policy corrections', () => {
      component.isCriticalPolicyViolated$ = of(true);
      component.comments$ = of(estatusData1);
      component.fg.markAsDirty();

      fixture.detectChanges();

      component.trackPolicyCorrections();
      expect(trackingService.policyCorrection).toHaveBeenCalledWith({ Violation: 'Critical', Mode: 'Edit Expense' });
      expect(trackingService.policyCorrection).toHaveBeenCalledWith({ Violation: 'Regular', Mode: 'Edit Expense' });
    });

    it('getTimeSpentOnPage(): should get time spent on page', () => {
      component.expenseStartTime = 164577000;
      fixture.detectChanges();

      const result = component.getTimeSpentOnPage();
      expect(result).toEqual((new Date().getTime() - component.expenseStartTime) / 1000);
    });

    it('closeAddEditExpenses(): should close the form and navigate back to my_expenses page', () => {
      component.closeAddEditExpenses();

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
    });

    describe('getParsedReceipt():', () => {
      it('should get parsed receipt', fakeAsync(() => {
        transactionOutboxService.parseReceipt.and.resolveTo(parsedReceiptData1);
        currencyService.getHomeCurrency.and.returnValue(of('INR'));
        currencyService.getExchangeRate.and.returnValue(of(82));

        const result = component.getParsedReceipt('base64encoded', 'jpeg');
        tick(500);

        result.then((res) => {
          expect(res).toEqual(parsedInfo1);
          expect(transactionOutboxService.parseReceipt).toHaveBeenCalledOnceWith('base64encoded', 'jpeg');
          expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
          expect(currencyService.getExchangeRate).toHaveBeenCalledOnceWith(
            'USD',
            'INR',
            new Date('2023-02-15T06:30:00.000Z')
          );
        });
      }));

      it('should get parsed receipt without date', fakeAsync(() => {
        transactionOutboxService.parseReceipt.and.resolveTo(parsedReceiptData2);
        currencyService.getHomeCurrency.and.returnValue(of('INR'));
        currencyService.getExchangeRate.and.returnValue(of(82));

        const result = component.getParsedReceipt('base64encoded', 'jpeg');
        tick(500);

        result.then((res) => {
          expect(res).toEqual(parsedInfo2);
          expect(transactionOutboxService.parseReceipt).toHaveBeenCalledOnceWith('base64encoded', 'jpeg');
          expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
          expect(currencyService.getExchangeRate).toHaveBeenCalledOnceWith('USD', 'INR', jasmine.any(Date));
        });
      }));
    });

    it('getReceiptExtension(): should get file extension', () => {
      const result = component.getReceiptExtension('name.pdf');
      expect(result).toEqual('pdf');
    });

    describe('getReceiptDetails():', () => {
      it('should get receipt details if file has pdf extension', () => {
        spyOn(component, 'getReceiptExtension').and.returnValue('pdf');

        const result = component.getReceiptDetails({ ...fileObjectData, name: '000.pdf' });

        expect(result).toEqual({
          type: 'pdf',
          thumbnail: 'img/fy-pdf.svg',
        });
      });

      it('should get receipt details if file is an image', () => {
        spyOn(component, 'getReceiptExtension').and.returnValue('jpeg');

        const result = component.getReceiptDetails(fileObjectData);

        expect(result).toEqual({
          type: 'image',
          thumbnail: fileObjectData.url,
        });
      });
    });

    describe('getDeleteReportParams():', () => {
      it('should return modal params and method to remove expense from report', () => {
        reportService.removeTransaction.and.returnValue(of());

        component
          .getDeleteReportParams(
            { header: 'Header', body: 'body', ctaText: 'Action', ctaLoadingText: 'Loading' },
            true,
            'rpId'
          )
          .componentProps.deleteMethod();
        expect(reportService.removeTransaction).toHaveBeenCalledTimes(1);
      });

      it('should  return modal params and method to delete expense', () => {
        transactionService.delete.and.returnValue(of(expenseData1));
        component
          .getDeleteReportParams(
            { header: 'Header', body: 'body', ctaText: 'Action', ctaLoadingText: 'Loading' },
            false
          )
          .componentProps.deleteMethod();
        expect(transactionService.delete).toHaveBeenCalledTimes(1);
      });
    });

    describe('deleteExpense():', () => {
      it('should delete expense and navigate back to report if deleting directly from report', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: 'success',
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        component.isRedirectedFromReport = true;
        fixture.detectChanges();

        const header = 'Remove Expense';
        const body = 'Are you sure you want to remove this expense from this report?';
        const ctaText = 'Remove';
        const ctaLoadingText = 'Removing';

        component.deleteExpense('rpFE5X1Pqi9P');
        tick(500);

        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_view_report', { id: 'rpFE5X1Pqi9P' }]);
        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith(
          { header, body, ctaText, ctaLoadingText },
          true,
          'rpFE5X1Pqi9P'
        );
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams({ header, body, ctaText, ctaLoadingText }, true, 'rpFE5X1Pqi9P')
        );
      }));

      it('should delete expense and go back to my expenses page if not redirected from report', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: 'success',
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        component.isRedirectedFromReport = false;
        fixture.detectChanges();

        const header = 'Delete Expense';
        const body = 'Are you sure you want to delete this expense?';
        const ctaText = 'Delete';
        const ctaLoadingText = 'Deleting';

        component.deleteExpense();
        tick(500);

        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith(
          { header, body, ctaText, ctaLoadingText },
          undefined,
          undefined
        );
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams({ header, body, ctaText, ctaLoadingText }, undefined, undefined)
        );
      }));

      it('should go to next expense if delete successful', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        spyOn(component, 'goToTransaction');
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
        component.reviewList = ['txfCdl3TEZ7K', 'txCYDX0peUw5'];
        component.activeIndex = 0;

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: 'success',
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        component.isRedirectedFromReport = true;
        fixture.detectChanges();

        const header = 'Delete Expense';
        const body = 'Are you sure you want to delete this expense?';
        const ctaText = 'Delete';
        const ctaLoadingText = 'Deleting';

        component.deleteExpense();
        tick(500);

        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith(
          { header, body, ctaText, ctaLoadingText },
          undefined,
          undefined
        );
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams({ header, body, ctaText, ctaLoadingText }, undefined, undefined)
        );
        expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(
          component.reviewList[+component.activeIndex]
        );
        expect(component.goToTransaction).toHaveBeenCalledOnceWith(
          unflattenedTxnData,
          component.reviewList,
          +component.activeIndex
        );
      }));
    });

    describe('openCommentsModal():', () => {
      it('should add comment', fakeAsync(() => {
        component.etxn$ = of(unflattenedTxnData);
        modalProperties.getModalDefaultProperties.and.returnValue(properties);
        const modalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);

        modalSpy.onDidDismiss.and.resolveTo({ data: { updated: 'comment' } });

        modalController.create.and.resolveTo(modalSpy);

        component.openCommentsModal();
        tick(500);

        expect(modalController.create).toHaveBeenCalledOnceWith({
          component: ViewCommentComponent,
          componentProps: {
            objectType: 'transactions',
            objectId: unflattenedTxnData.tx.id,
          },
          ...properties,
        });
        expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
        expect(trackingService.addComment).toHaveBeenCalledTimes(1);
      }));

      it('should view comment', fakeAsync(() => {
        component.etxn$ = of(unflattenedTxnData);
        modalProperties.getModalDefaultProperties.and.returnValue(properties);
        const modalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);

        modalSpy.onDidDismiss.and.resolveTo({ data: {} });

        modalController.create.and.resolveTo(modalSpy);

        component.openCommentsModal();
        tick(500);

        expect(modalController.create).toHaveBeenCalledOnceWith({
          component: ViewCommentComponent,
          componentProps: {
            objectType: 'transactions',
            objectId: unflattenedTxnData.tx.id,
          },
          ...properties,
        });
        expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
        expect(trackingService.viewComment).toHaveBeenCalledTimes(1);
      }));
    });

    it('hideFields(): should disable expanded view', () => {
      component.hideFields();

      expect(trackingService.hideMoreClicked).toHaveBeenCalledOnceWith({
        source: 'Add Edit Expenses page',
      });
      expect(component.isExpandedView).toBeFalse();
    });

    it('showFields(): should show expanded view', () => {
      component.showFields();

      expect(trackingService.showMoreClicked).toHaveBeenCalledOnceWith({
        source: 'Add Edit Expenses page',
      });
      expect(component.isExpandedView).toBeTrue();
    });

    it('getPolicyDetails(): should get policy details', () => {
      policyService.getSpenderExpensePolicyViolations.and.returnValue(of(individualExpPolicyStateData2));

      component.getPolicyDetails();

      expect(component.policyDetails).toEqual(individualExpPolicyStateData2);
      expect(policyService.getSpenderExpensePolicyViolations).toHaveBeenCalledOnceWith(
        activatedRoute.snapshot.params.id
      );
    });

    describe('addFileType(): ', () => {
      it('should add file type image to objects if the file is not a pdf', () => {
        transactionOutboxService.isPDF.and.returnValue(false);
        const result = component.addFileType([fileObjectData]);

        expect(result).toEqual([{ ...fileObjectData, type: 'image' }]);
      });

      it('should add file type pdf to objects if the file is a pdf', () => {
        transactionOutboxService.isPDF.and.returnValue(true);
        const result = component.addFileType([{ ...fileObjectData, type: 'pdf' }]);

        expect(result).toEqual([{ ...fileObjectData, type: 'pdf' }]);
      });
    });

    it('postToFileService(): should post files to file service', () => {
      fileService.post.and.returnValue(of(null));

      component.postToFileService(fileObjectData, 'tx5fBcPBAxLv');

      expect(fileService.post).toHaveBeenCalledOnceWith({ ...fileObjectData, transaction_id: 'tx5fBcPBAxLv' });
    });

    it('uploadFileAndPostToFileService(): should upload to file service', (done) => {
      transactionOutboxService.fileUpload.and.resolveTo(fileObjectData);
      spyOn(component, 'postToFileService').and.returnValue(of(fileObjectData));

      component.uploadFileAndPostToFileService(fileObjectData, 'tx5fBcPBAxLv').subscribe(() => {
        expect(transactionOutboxService.fileUpload).toHaveBeenCalledOnceWith(fileObjectData.url, fileObjectData.type);
        expect(component.postToFileService).toHaveBeenCalledOnceWith(fileObjectData, 'tx5fBcPBAxLv');
        done();
      });
    });

    it('uploadMultipleFiles(): should upload multiple files', (done) => {
      const uploadSpy = spyOn(component, 'uploadFileAndPostToFileService');
      uploadSpy.withArgs(fileObject7[0], 'tx5fBcPBAxLv').and.returnValue(of(fileObject7[0]));
      uploadSpy.withArgs(fileObject7[1], 'tx5fBcPBAxLv').and.returnValue(of(fileObject7[1]));

      component.uploadMultipleFiles(fileObject7, 'tx5fBcPBAxLv').subscribe((res) => {
        expect(res).toEqual(fileObject7);
        expect(component.uploadFileAndPostToFileService).toHaveBeenCalledTimes(2);
        expect(component.uploadFileAndPostToFileService).toHaveBeenCalledWith(fileObject7[0], 'tx5fBcPBAxLv');
        expect(component.uploadFileAndPostToFileService).toHaveBeenCalledWith(fileObject7[1], 'tx5fBcPBAxLv');
        done();
      });
    });

    describe('getDuplicateExpenses():', () => {
      it('should return early if expenseId is not provided', () => {
        activatedRoute.snapshot.params.id = ''; // No expenseId provided

        component.getDuplicateExpenses();

        expect(orgSettingsService.get).not.toHaveBeenCalled();
        expect(expensesService.getDuplicatesByExpense).not.toHaveBeenCalled();
        expect(transactionService.getETxnc).not.toHaveBeenCalled();
      });

      it('should get duplicate expenses from platform when duplicate detection v2 is enabled', () => {
        activatedRoute.snapshot.params.id = 'tx5fBcPBAxLv';
        const expenseId = activatedRoute.snapshot.params.id;

        orgSettingsService.get.and.returnValue(of(orgSettingsWithDuplicateDetectionV2));
        expensesService.getDuplicatesByExpense.and.returnValue(of([expenseDuplicateSet2]));
        transactionService.getETxnc.and.returnValue(of([expenseData1]));
        spyOn(component, 'addExpenseDetailsToDuplicateSets').and.returnValue([expenseData1]);

        component.getDuplicateExpenses();

        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(expensesService.getDuplicatesByExpense).toHaveBeenCalledWith(expenseId);
        expect(transactionService.getETxnc).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 100,
          params: { tx_id: `in.(tx5fBcPBAxLv)` },
        });
        expect(component.addExpenseDetailsToDuplicateSets).toHaveBeenCalledOnceWith(duplicateSetData4, [expenseData1]);
      });

      it('should get duplicate expenses from public when duplicate detection v2 is disabled', () => {
        activatedRoute.snapshot.params.id = 'tx5fBcPBAxLv';
        const expenseId = activatedRoute.snapshot.params.id;

        orgSettingsService.get.and.returnValue(of(orgSettingsWoDuplicateDetectionV2));
        handleDuplicates.getDuplicatesByExpense.and.returnValue(of([duplicateSetData1]));
        transactionService.getETxnc.and.returnValue(of([expenseData1]));
        spyOn(component, 'addExpenseDetailsToDuplicateSets').and.returnValue([expenseData1]);

        component.getDuplicateExpenses();

        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(handleDuplicates.getDuplicatesByExpense).toHaveBeenCalledWith(expenseId);
        expect(transactionService.getETxnc).toHaveBeenCalledWith({
          offset: 0,
          limit: 100,
          params: { tx_id: 'in.(tx5fBcPBAxLv)' },
        });
        expect(component.addExpenseDetailsToDuplicateSets).toHaveBeenCalledOnceWith(duplicateSetData1, [expenseData1]);
      });

      it('should return empty array if no duplicate is found in public', () => {
        activatedRoute.snapshot.params.id = 'tx5fBcPBAxLv';

        orgSettingsService.get.and.returnValue(of(orgSettingsWoDuplicateDetectionV2));
        handleDuplicates.getDuplicatesByExpense.and.returnValue(of([]));

        component.getDuplicateExpenses();

        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(handleDuplicates.getDuplicatesByExpense).toHaveBeenCalledWith(activatedRoute.snapshot.params.id);
        expect(component.duplicateExpenses).toBeUndefined();
      });

      it('should return empty array if no duplicate is found in platform', () => {
        activatedRoute.snapshot.params.id = 'tx5fBcPBAxLv';

        orgSettingsService.get.and.returnValue(of(orgSettingsWithDuplicateDetectionV2));
        expensesService.getDuplicatesByExpense.and.returnValue(of([]));

        component.getDuplicateExpenses();

        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(expensesService.getDuplicatesByExpense).toHaveBeenCalledWith(activatedRoute.snapshot.params.id);
        expect(component.duplicateExpenses).toBeUndefined();
      });
    });

    it('addExpenseDetailsToDuplicateSets(): should add expense to duplicate sets if there exists a duplicate expense', () => {
      const result = component.addExpenseDetailsToDuplicateSets(duplicateSetData1, [expenseData1, expenseData2]);
      expect(result).toEqual([expenseData1]);
    });

    describe('showSuggestedDuplicates():', () => {
      it('should show potential duplicates', fakeAsync(() => {
        spyOn(component, 'getDuplicateExpenses');

        modalProperties.getModalDefaultProperties.and.returnValue(properties);

        const currencyModalSpy = jasmine.createSpyObj('currencyModal', ['present', 'onWillDismiss']);
        currencyModalSpy.onWillDismiss.and.resolveTo({ data: { action: 'dismissed' } });

        modalController.create.and.resolveTo(currencyModalSpy);

        component.showSuggestedDuplicates([expenseData1]);
        tick(500);

        expect(trackingService.showSuggestedDuplicates).toHaveBeenCalledTimes(1);
        expect(modalController.create).toHaveBeenCalledOnceWith({
          component: SuggestedDuplicatesComponent,
          componentProps: {
            duplicateExpenseIDs: ['tx5fBcPBAxLv'],
          },
          mode: 'ios',
          ...properties,
        });
        expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
        expect(component.getDuplicateExpenses).toHaveBeenCalledTimes(1);
      }));

      it('should show potential duplicates', fakeAsync(() => {
        spyOn(component, 'getDuplicateExpenses');

        modalProperties.getModalDefaultProperties.and.returnValue(properties);

        const currencyModalSpy = jasmine.createSpyObj('currencyModal', ['present', 'onWillDismiss']);
        currencyModalSpy.onWillDismiss.and.resolveTo({ data: null });

        modalController.create.and.resolveTo(currencyModalSpy);

        component.showSuggestedDuplicates([expenseData1]);
        tick(500);

        expect(trackingService.showSuggestedDuplicates).toHaveBeenCalledTimes(1);
        expect(modalController.create).toHaveBeenCalledOnceWith({
          component: SuggestedDuplicatesComponent,
          componentProps: {
            duplicateExpenseIDs: ['tx5fBcPBAxLv'],
          },
          mode: 'ios',
          ...properties,
        });
        expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
        expect(component.getDuplicateExpenses).not.toHaveBeenCalled();
      }));
    });

    it('showSnackBarToast(): should show snackbar with relevant properties', () => {
      const properties = {
        data: {
          icon: 'check-square-fill',
          showCloseButton: true,
          message: 'Message',
        },
        duration: 3000,
      };
      snackbarProperties.setSnackbarProperties.and.returnValue(properties);

      component.showSnackBarToast({ message: 'Message' }, 'success', ['panel-class']);

      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...properties,
        panelClass: ['panel-class'],
      });
      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', { message: 'Message' });
    });

    it('showSizeLimitExceededPopover(): should show a warning popover if size of the file increases', fakeAsync(() => {
      const sizeLimitExceededPopoverSpy = jasmine.createSpyObj('sizeLimitExceededPopover', ['present']);

      popoverController.create.and.resolveTo(sizeLimitExceededPopoverSpy);

      component.showSizeLimitExceededPopover();
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Size limit exceeded',
          message: 'The uploaded file is greater than 5MB in size. Please reduce the file size and try again.',
          primaryCta: {
            text: 'OK',
          },
        },
        cssClass: 'pop-up-in-center',
      });
    }));
  });
}
