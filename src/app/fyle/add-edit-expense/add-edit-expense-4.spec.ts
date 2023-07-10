import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, PopoverController, NavController, ActionSheetController, Platform } from '@ionic/angular';
import { Observable, Subscription, of } from 'rxjs';
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
import { expectedECccResponse } from 'src/app/core/mock-data/corporate-card-expense-unflattened.data';
import { unflattenExp1, unflattenedTxn } from 'src/app/core/mock-data/unflattened-expense.data';
import {
  expectedUnflattendedTxnData1,
  expectedUnflattendedTxnData3,
  unflattenedTxnData,
} from 'src/app/core/mock-data/unflattened-txn.data';
import { orgSettingsData, unflattenedAccount1Data } from 'src/app/core/test-data/accounts.service.spec.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { apiV2ResponseMultiple } from 'src/app/core/test-data/projects.spec.data';
import { expectedAutoFillCategory, orgCategoryData } from 'src/app/core/mock-data/org-category.data';
import { expectedErpt } from 'src/app/core/mock-data/report-unflattened.data';
import { costCenterApiRes1, expectedCCdata } from 'src/app/core/mock-data/cost-centers.data';
import { recentItemsRes } from 'src/app/core/mock-data/recent-local-storage-items.data';
import {
  recentCurrencyRes,
  recentlyUsedCostCentersRes,
  recentlyUsedProjectRes,
  recentlyUsedRes,
  recentlyUsedResWithoutCurr,
} from 'src/app/core/mock-data/recently-used.data';
import { accountOptionData1 } from 'src/app/core/mock-data/account-option.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { apiAllCurrencies } from 'src/app/core/mock-data/currency.data';
import { expenseFieldResponse } from 'src/app/core/mock-data/expense-field.data';
import { fileObject4, fileObjectAdv1 } from 'src/app/core/mock-data/file-object.data';
import { txnCustomProperties } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { defaultTxnFieldValuesData } from 'src/app/core/mock-data/default-txn-field-values.data';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { expensePolicyData } from 'src/app/core/mock-data/expense-policy.data';
import { publicPolicyExpenseDataFromTxn } from 'src/app/core/mock-data/public-policy-expense.data';

export function TestCases4(getTestBed) {
  return describe('AddEditExpensePage-4', () => {
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

    xdescribe('setupFormInit():', () => {
      it('should setup the expense form', fakeAsync(() => {
        component.etxn$ = of(unflattenedTxnData);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.orgUserSettings$ = of(orgUserSettingsData);
        projectsService.getbyId.and.returnValue(of(apiV2ResponseMultiple.data[0]));
        categoriesService.getCategoryById.and.returnValue(of(orgCategoryData));
        component.autoSubmissionReportName$ = of('# JULY 23');
        component.reports$ = of(expectedErpt[0]);
        accountsService.getEtxnSelectedPaymentMode.and.returnValue(unflattenedAccount1Data);
        component.costCenters$ = of(expectedCCdata);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        recentlyUsedItemsService.getRecentCostCenters.and.returnValue(of(recentlyUsedCostCentersRes));
        component.paymentModes$ = of(accountOptionData1);
        component.orgUserSettings$ = of(orgUserSettingsData);
        paymentModesService.checkIfPaymentModeConfigurationsIsEnabled.and.returnValue(of(true));
        recentlyUsedItemsService.getRecentlyUsedProjects.and.returnValue(of(recentlyUsedProjectRes));
        authService.getEou.and.resolveTo(apiEouRes);
        currencyService.getAll.and.returnValue(of(apiAllCurrencies));
        recentlyUsedItemsService.getRecentCurrencies.and.returnValue(of(recentCurrencyRes));
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        fileService.findByTransactionId.and.returnValue(of(fileObject4));
        loaderService.showLoader.and.resolveTo();
        loaderService.hideLoader.and.resolveTo();
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomProperties);
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        spyOn(component, 'getAutofillCategory').and.returnValue(expectedAutoFillCategory);
        spyOn(component, 'setCategoryFromVendor');
        component.txnFields$ = of(defaultTxnFieldValuesData);
        fixture.detectChanges();

        component.setupFormInit();
        tick(500);
      }));
    });

    describe('addAttachments():', () => {
      it('should show add popup if the platform is android and open camera', fakeAsync(() => {
        platform.is.and.returnValue(false);
        fileService.getImageTypeFromDataUrl.and.returnValue('png');
        spyOn(component, 'attachReceipts');
        spyOn(component, 'showSnackBarToast');

        const popupSpy = jasmine.createSpyObj('popup', ['present', 'onWillDismiss']);
        popupSpy.onWillDismiss.and.resolveTo({
          data: {
            option: 'camera',
          },
        });

        popoverController.create.and.resolveTo(popupSpy);

        const captureReceiptModalSpy = jasmine.createSpyObj('captureReceiptModal', ['present', 'onWillDismiss']);

        captureReceiptModalSpy.onWillDismiss.and.resolveTo({
          data: {
            dataUrl: 'data-url',
          },
        });

        modalController.create.and.resolveTo(captureReceiptModalSpy);

        component.addAttachments(new Event('click'));
        tick(500);

        expect(popoverController.create).toHaveBeenCalledOnceWith({
          component: CameraOptionsPopupComponent,
          cssClass: 'camera-options-popover',
        });
        expect(modalController.create).toHaveBeenCalledOnceWith({
          component: CaptureReceiptComponent,
          componentProps: {
            isModal: true,
            allowGalleryUploads: false,
            allowBulkFyle: false,
          },
          cssClass: 'hide-modal',
        });
        expect(fileService.getImageTypeFromDataUrl).toHaveBeenCalledOnceWith('data-url');
        expect(component.attachReceipts).toHaveBeenCalledOnceWith({
          dataUrl: 'data-url',
          type: 'png',
          actionSource: 'camera',
        });
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Receipt added to Expense successfully' },
          'success',
          ['msb-success-with-camera-icon']
        );
        expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
          ToastContent: 'Receipt added to Expense successfully',
        });
      }));
    });

    describe('addExpense():', () => {
      it('should add an expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(expectedUnflattendedTxnData3));
        spyOn(component, 'trackAddExpense');
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        authService.getEou.and.resolveTo(apiEouRes);
        activatedRoute.snapshot.params.rp_id = 'rp_id';
        transactionOutboxService.addEntryAndSync.and.resolveTo(expectedUnflattendedTxnData3);
        component.fg.controls.report.setValue(expectedErpt[0]);
        fixture.detectChanges();

        component.addExpense('SAVE_EXPENSE').subscribe((etxn) => {
          Promise.resolve(etxn).then((res) => {
            expect(res).toEqual(expectedUnflattendedTxnData3);
          });
          expect(component.getCustomFields).toHaveBeenCalledOnceWith();
          expect(component.trackAddExpense).toHaveBeenCalledOnceWith();
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionOutboxService.addEntryAndSync).toHaveBeenCalledOnceWith(
            expectedUnflattendedTxnData3.tx,
            expectedUnflattendedTxnData3.dataUrls,
            [],
            'rprAfNrce73O'
          );
          done();
        });
      });

      it('should add expense to queue in offline mode', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        component.isConnected$ = of(false);
        spyOn(component, 'trackAddExpense');
        spyOn(component, 'generateEtxnFromFg').and.returnValue(
          of({ ...expectedUnflattendedTxnData3, dataUrls: [fileObjectAdv1] })
        );
        authService.getEou.and.resolveTo(apiEouRes);
        transactionOutboxService.addEntry.and.resolveTo();
        component.selectedCCCTransaction = 'tx12341';
        fixture.detectChanges();

        component.addExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toBeNull();
          done();
        });
      });
    });
  });
}
