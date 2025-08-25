import { TitleCasePipe } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { Observable, Subscription, of, throwError } from 'rxjs';
import { expectedECccResponse } from 'src/app/core/mock-data/corporate-card-expense-unflattened.data';
import { matchedCCTransactionData, matchedCCTransactionData2 } from 'src/app/core/mock-data/matchedCCTransaction.data';
import { expensePolicyData, expensePolicyDataWoData } from 'src/app/core/mock-data/expense-policy.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { fileObject4 } from 'src/app/core/mock-data/file-object.data';
import { outboxQueueData1 } from 'src/app/core/mock-data/outbox-queue.data';
import { platformPersonalCardTxns } from 'src/app/core/mock-data/personal-card-txns.data';
import { expectedReportsPaginated } from 'src/app/core/mock-data/platform-report.data';
import {
  createExpenseProperties,
  createExpenseProperties2,
} from 'src/app/core/mock-data/track-expense-properties.data';
import { expenseStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { paymentModeDataAdvanceWallet } from 'src/app/core/test-data/accounts.service.spec.data';
import {
  editUnflattenedTransactionPlatform,
  editUnflattenedTransactionPlatform2,
  editUnflattenedTransactionPlatform3,
  personalCardTxn,
  editUnflattenedTransactionPlatformWithAdvanceWallet,
} from 'src/app/core/mock-data/transaction.data';
import {
  expectedUnflattendedTxnData3,
  expectedUnflattendedTxnData4,
  trackAddExpenseWoCurrency,
  trackCreateExpData,
  trackCreateExpDataWoCurrency,
  unflattenedTransactionDataPersonalCard,
  unflattenedTxnData,
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
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { PolicyService } from 'src/app/core/services/policy.service';
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
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { AdvanceWalletsService } from 'src/app/core/services/platform/v1/spender/advance-wallets.service';
import { txnCustomProperties } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { AddEditExpensePage } from './add-edit-expense.page';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import {
  transformedExpenseData,
  transformedExpenseDataWithReportId,
  transformedExpenseDataWithReportId2,
  transformedExpenseDataWithSubCategory,
  transformedExpenseWithMatchCCCData,
  transformedExpenseWithMatchCCCData2,
  transformedExpenseDataWithAdvanceWallet,
  transformedExpenseDataWithoutAdvanceWallet,
} from 'src/app/core/mock-data/transformed-expense.data';
import { cloneDeep } from 'lodash';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { MAX_FILE_SIZE } from 'src/app/core/constants';
import { expenseCommentData } from 'src/app/core/mock-data/expense-comment.data';

export function TestCases4(getTestBed) {
  return describe('AddEditExpensePage-4', () => {
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
    let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;
    let customInputsService: jasmine.SpyObj<CustomInputsService>;
    let customFieldsService: jasmine.SpyObj<CustomFieldsService>;
    let transactionService: jasmine.SpyObj<TransactionService>;
    let expensesService: jasmine.SpyObj<ExpensesService>;
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
    let advanceWalletsService: jasmine.SpyObj<AdvanceWalletsService>;

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
      spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
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
        PlatformEmployeeSettingsService,
      ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
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
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    describe('uploadFileCallback():', () => {
      it('should upload provided files', fakeAsync(() => {
        fileService.readFile.and.resolveTo('base');
        spyOn(component, 'attachReceipts');

        const myBlob = new Blob([new ArrayBuffer(100 * 100)], { type: 'application/octet-stream' });
        const file = new File([myBlob], 'file');

        component.uploadFileCallback(file);
        tick(500);

        expect(fileService.readFile).toHaveBeenCalledOnceWith(file);
        expect(trackingService.addAttachment).toHaveBeenCalledOnceWith({ type: file.type });
        expect(component.attachReceipts).toHaveBeenCalledOnceWith({
          type: file.type,
          dataUrl: 'base',
          actionSource: 'gallery_upload',
        });
      }));

      it('should show file size exceeded popover if uploaded file is larger than 11MB', fakeAsync(() => {
        spyOn(component, 'showSizeLimitExceededPopover');

        const newSize = MAX_FILE_SIZE + 1;
        const myBlob = new Blob([new ArrayBuffer(newSize)], { type: 'application/octet-stream' });
        const file = new File([myBlob], 'file');

        component.uploadFileCallback(file);
        tick(500);

        expect(component.showSizeLimitExceededPopover).toHaveBeenCalledOnceWith(MAX_FILE_SIZE);
      }));
    });

    it('onChangeCallback(): should call upload file callback', fakeAsync(() => {
      spyOn(component, 'uploadFileCallback');

      const mockFile = new File(['file contents'], 'test.png', { type: 'image/png' });
      const mockNativeElement = {
        files: [mockFile],
      } as unknown as HTMLInputElement;

      component.onChangeCallback(mockNativeElement);
      tick(500);

      expect(component.uploadFileCallback).toHaveBeenCalledOnceWith(mockFile);
    }));

    describe('addAttachments():', () => {
      it('should upload file if platform is ios', fakeAsync(() => {
        platform.is.and.returnValue(true);
        spyOn(component, 'onChangeCallback');
        fixture.detectChanges();

        const dummyNativeElement = document.createElement('input');

        component.fileUpload = {
          nativeElement: dummyNativeElement,
        } as DebugElement;

        const nativeElement = component.fileUpload.nativeElement;
        spyOn(nativeElement, 'click').and.callThrough();

        component.addAttachments(new Event('click'));
        fixture.detectChanges();
        tick(500);

        nativeElement.dispatchEvent(new Event('change'));

        expect(component.onChangeCallback).toHaveBeenCalledTimes(1);
        expect(nativeElement.click).toHaveBeenCalledTimes(1);
      }));

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

        component.mode = 'edit';

        modalController.create.and.resolveTo(captureReceiptModalSpy);

        component.addAttachments(new Event('click'));
        tick(500);

        expect(popoverController.create).toHaveBeenCalledOnceWith({
          component: CameraOptionsPopupComponent,
          cssClass: 'camera-options-popover',
          componentProps: {
            mode: component.mode,
          },
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
          { message: 'Receipt added to expense successfully' },
          'success',
          ['msb-success-with-camera-icon'],
        );
        expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
          ToastContent: 'Receipt added to expense successfully',
        });
      }));
    });

    describe('trackAddExpense():', () => {
      it('should track adding expense', fakeAsync(() => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(expectedUnflattendedTxnData4));
        spyOn(component, 'getTimeSpentOnPage').and.returnValue(300);
        component.presetCategoryId = expectedUnflattendedTxnData4.tx.org_category_id;
        component.presetProjectId = expectedUnflattendedTxnData4.tx.project_id;
        component.presetCostCenterId = expectedUnflattendedTxnData4.tx.cost_center_id;
        component.presetCurrency = expectedUnflattendedTxnData4.tx.currency;
        fixture.detectChanges();

        component.trackAddExpense();
        tick(500);
        expect(component.getCustomFields).toHaveBeenCalledOnceWith();
        expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, jasmine.any(Observable));
        expect(trackingService.createExpense).toHaveBeenCalledOnceWith(createExpenseProperties);
      }));

      it('should track adding expense where original currency is same as the preset currency', fakeAsync(() => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(trackAddExpenseWoCurrency));
        spyOn(component, 'getTimeSpentOnPage').and.returnValue(300);
        component.presetCategoryId = trackAddExpenseWoCurrency.tx.org_category_id;
        component.presetProjectId = trackAddExpenseWoCurrency.tx.project_id;
        component.presetCostCenterId = trackAddExpenseWoCurrency.tx.cost_center_id;
        component.presetCurrency = trackAddExpenseWoCurrency.tx.orig_currency;
        fixture.detectChanges();

        component.trackAddExpense();
        tick(500);
        expect(component.getCustomFields).toHaveBeenCalledOnceWith();
        expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, jasmine.any(Observable));
        expect(trackingService.createExpense).toHaveBeenCalledOnceWith(createExpenseProperties2);
      }));
    });

    it('showAddToReportSuccessToast(): should show success message on adding expense to report', () => {
      const modalSpy = jasmine.createSpyObj('expensesAddedToReportSnackBar', ['onAction']);
      modalSpy.onAction.and.returnValue(of(true));
      spyOn(component, 'showSnackBarToast').and.returnValue(modalSpy);

      component.showAddToReportSuccessToast('rpFE5X1Pqi9P');
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: 'Expense added to report successfully',
      });
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_report',
        { id: 'rpFE5X1Pqi9P', navigateBack: true },
      ]);
    });

    describe('addExpense():', () => {
      it('should add an expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        const mockEtxn = cloneDeep(expectedUnflattendedTxnData3);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(mockEtxn));
        spyOn(component, 'trackAddExpense');
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyDataWoData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        authService.getEou.and.resolveTo(apiEouRes);
        activatedRoute.snapshot.params.rp_id = 'rp_id';
        transactionOutboxService.addEntryAndSync.and.resolveTo(outboxQueueData1[0]);
        component.fg.controls.report.setValue(expectedReportsPaginated[0]);
        fixture.detectChanges();

        component.addExpense('SAVE_EXPENSE').subscribe((etxn) => {
          Promise.resolve(etxn).then((res) => {
            expect(res).toEqual(outboxQueueData1[0]);
          });
          expect(component.getCustomFields).toHaveBeenCalledOnceWith();
          expect(component.trackAddExpense).toHaveBeenCalledOnceWith();
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionOutboxService.addEntryAndSync).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should add expense to queue in offline mode', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        component.isConnected$ = of(false);
        spyOn(component, 'trackAddExpense');
        component.fg.controls.report.setValue(expectedReportsPaginated[0]);
        const mockEtxn = cloneDeep({
          ...unflattenedTxnData,
          dataUrls: [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.pdf', type: 'application/pdf' }],
        });
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(mockEtxn));
        authService.getEou.and.resolveTo(apiEouRes);
        transactionOutboxService.addEntry.and.resolveTo();
        component.selectedCCCTransaction = expectedECccResponse[0].ccce;
        fixture.detectChanges();

        component.addExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toBeNull();
          expect(component.getCustomFields).toHaveBeenCalledOnceWith();
          expect(component.trackAddExpense).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionOutboxService.addEntry).toHaveBeenCalledOnceWith(
            mockEtxn.tx,
            [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.pdf', type: 'pdf' }],
            [],
          );
          done();
        });
      });

      it('should add expense with critical policy violation', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'trackAddExpense');
        const mockEtxn = cloneDeep(expectedUnflattendedTxnData3);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(mockEtxn));
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'criticalPolicyViolationErrorHandler').and.returnValue(of({ etxn: mockEtxn, comment: null }));
        authService.getEou.and.resolveTo(apiEouRes);
        spyOn(component, 'trackCreateExpense');
        transactionOutboxService.addEntry.and.resolveTo();
        fixture.detectChanges();

        component.addExpense('SAVE_EXPENSE').subscribe((res) => {
          expect(res).toBeNull();
          expect(component.getCustomFields).toHaveBeenCalledOnceWith();
          expect(component.trackAddExpense).toHaveBeenCalledOnceWith();
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, jasmine.any(Observable));
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.criticalPolicyViolationErrorHandler).toHaveBeenCalledOnceWith(
            {
              type: 'criticalPolicyViolations',
              policyViolations: [
                'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
              ],
              etxn: mockEtxn,
            },
            jasmine.any(Observable),
          );
          expect(authService.getEou).toHaveBeenCalledOnceWith();
          expect(component.trackCreateExpense).toHaveBeenCalledOnceWith(expectedUnflattendedTxnData3, false);
          expect(transactionOutboxService.addEntry).toHaveBeenCalledOnceWith(outboxQueueData1[0].transaction, [], []);
          done();
        });
      });

      it('should add expense with policy violations', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'trackAddExpense');
        const mockEtxn = cloneDeep(expectedUnflattendedTxnData4);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(mockEtxn));
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'policyViolationErrorHandler').and.returnValue(
          of({
            etxn: mockEtxn,
            comment: 'continue',
          }),
        );
        authService.getEou.and.resolveTo(apiEouRes);
        spyOn(component, 'trackCreateExpense');
        transactionOutboxService.addEntry.and.resolveTo();

        component.addExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toBeNull();
          expect(component.getCustomFields).toHaveBeenCalledOnceWith();
          expect(component.trackAddExpense).toHaveBeenCalledOnceWith();
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.policyViolationErrorHandler).toHaveBeenCalledOnceWith(
            {
              type: 'policyViolations',
              policyViolations: [
                'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
              ],
              policyAction: expensePolicyData.data.final_desired_state,
              etxn: mockEtxn,
            },
            jasmine.any(Observable),
          );
          expect(authService.getEou).toHaveBeenCalledOnceWith();
          expect(component.trackCreateExpense).toHaveBeenCalledOnceWith(expectedUnflattendedTxnData4, false);
          expect(transactionOutboxService.addEntry).toHaveBeenCalledOnceWith(mockEtxn.tx, [], ['continue']);
          done();
        });
      });

      it('should thow error if expense cannot be generated', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(throwError(() => new Error('error')));
        spyOn(component, 'trackAddExpense');

        component.addExpense('SAVE_EXPENSE').subscribe({
          next: () => {
            expect(component.getCustomFields).toHaveBeenCalledOnceWith();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, jasmine.any(Observable));
            expect(component.trackAddExpense).toHaveBeenCalledOnceWith();
          },
          error: (err) => expect(err).toBeTruthy(),
        });
        done();
      });
    });

    describe('saveAndMatchWithPersonalCardTxn():', () => {
      beforeEach(() => {
        launchDarklyService.getVariation.and.returnValue(of(false));
      });

      it('should save an expense and match with personal card', () => {
        const generateEtxnSpy = spyOn(component, 'generateEtxnFromFg');
        generateEtxnSpy
          .withArgs(component.etxn$, jasmine.any(Observable))
          .and.returnValue(of({ ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard.tx }));
        generateEtxnSpy
          .withArgs(component.etxn$, jasmine.any(Observable))
          .and.returnValue(of({ ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard.tx }));
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyDataWoData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        activatedRoute.snapshot.params.personalCardTxn = JSON.stringify(platformPersonalCardTxns.data[0]);
        transactionService.upsert.and.returnValue(of(personalCardTxn));
        personalCardsService.matchExpense.and.returnValue(
          of({
            external_expense_id: expectedUnflattendedTxnData3.tx.id,
            transaction_split_group_id: expectedUnflattendedTxnData3.tx.split_group_id,
          }),
        );
        spyOn(component, 'uploadAttachments').and.returnValue(of(fileObject4));
        spyOn(component, 'showSnackBarToast');
        fixture.detectChanges();

        component.saveAndMatchWithPersonalCardTxn();
        expect(component.getCustomFields).toHaveBeenCalledOnceWith();
        expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
        expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
        expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
        expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
        expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
        expect(transactionService.upsert).toHaveBeenCalledTimes(1);
        expect(personalCardsService.matchExpense).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.tx.split_group_id,
          platformPersonalCardTxns.data[0].id,
        );
        expect(component.uploadAttachments).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.tx.split_group_id,
        );
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Expense created successfully.' },
          'success',
          ['msb-success'],
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'personal_cards'], {
          queryParams: { refresh: true },
        });
        expect(trackingService.newExpenseCreatedFromPersonalCard).toHaveBeenCalledOnceWith();
      });

      it('should save and match an expense with critical violation', () => {
        const expense = { ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard.tx };
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(expense));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);

        component.isConnected$ = of(true);
        spyOn(component, 'criticalPolicyViolationErrorHandler').and.returnValue(of({ etxn: expense, comment: null }));
        activatedRoute.snapshot.params.personalCardTxn = JSON.stringify(platformPersonalCardTxns.data[0]);
        transactionService.upsert.and.returnValue(of(personalCardTxn));
        personalCardsService.matchExpense.and.returnValue(
          of({
            external_expense_id: expectedUnflattendedTxnData3.tx.id,
            transaction_split_group_id: expectedUnflattendedTxnData3.tx.split_group_id,
          }),
        );
        spyOn(component, 'uploadAttachments').and.returnValue(of(fileObject4));
        spyOn(component, 'showSnackBarToast');
        fixture.detectChanges();

        component.saveAndMatchWithPersonalCardTxn();
        expect(component.getCustomFields).toHaveBeenCalledOnceWith();
        expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, jasmine.any(Observable));
        expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
        expect(component.criticalPolicyViolationErrorHandler).toHaveBeenCalledOnceWith(
          {
            type: 'criticalPolicyViolations',
            policyViolations: [
              'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
            ],
            etxn: expense,
          },
          jasmine.any(Observable),
        );
        expect(transactionService.upsert).toHaveBeenCalledTimes(1);
        expect(personalCardsService.matchExpense).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.tx.split_group_id,
          platformPersonalCardTxns.data[0].id,
        );
        expect(component.uploadAttachments).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.tx.split_group_id,
        );
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Expense created successfully.' },
          'success',
          ['msb-success'],
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'personal_cards'], {
          queryParams: { refresh: true },
        });
        expect(trackingService.newExpenseCreatedFromPersonalCard).toHaveBeenCalledOnceWith();
      });

      it('it should save and match an expense with policy violation', () => {
        const expense = { ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard.tx };
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(expense));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        component.isConnected$ = of(true);
        spyOn(component, 'policyViolationErrorHandler').and.returnValue(of({ etxn: expense, comment: 'comment' }));
        activatedRoute.snapshot.params.personalCardTxn = JSON.stringify(platformPersonalCardTxns.data[0]);
        transactionService.upsert.and.returnValue(of(personalCardTxn));
        personalCardsService.matchExpense.and.returnValue(
          of({
            external_expense_id: expectedUnflattendedTxnData3.tx.id,
            transaction_split_group_id: expectedUnflattendedTxnData3.tx.split_group_id,
          }),
        );
        spyOn(component, 'uploadAttachments').and.returnValue(of(fileObject4));
        spyOn(component, 'showSnackBarToast');
        fixture.detectChanges();

        component.saveAndMatchWithPersonalCardTxn();
        expect(component.getCustomFields).toHaveBeenCalledOnceWith();
        expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, jasmine.any(Observable));
        expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
        expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
        expect(component.policyViolationErrorHandler).toHaveBeenCalledOnceWith(
          {
            type: 'policyViolations',
            policyViolations: [
              'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
            ],
            policyAction: expensePolicyData.data.final_desired_state,
            etxn: expense,
          },
          jasmine.any(Observable),
        );
        expect(transactionService.upsert).toHaveBeenCalledTimes(1);
        expect(personalCardsService.matchExpense).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.tx.split_group_id,
          platformPersonalCardTxns.data[0].id,
        );
        expect(component.uploadAttachments).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.tx.split_group_id,
        );
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Expense created successfully.' },
          'success',
          ['msb-success'],
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'personal_cards'], {
          queryParams: { refresh: true },
        });
        expect(trackingService.newExpenseCreatedFromPersonalCard).toHaveBeenCalledOnceWith();
      });

      it('should match an expense while offline', () => {
        const generateEtxnSpy = spyOn(component, 'generateEtxnFromFg');
        generateEtxnSpy
          .withArgs(component.etxn$, jasmine.any(Observable))
          .and.returnValue(of({ ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard.tx }));
        generateEtxnSpy
          .withArgs(component.etxn$, jasmine.any(Observable))
          .and.returnValue(of({ ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard.tx }));
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        component.isConnected$ = of(false);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyDataWoData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        activatedRoute.snapshot.params.personalCardTxn = JSON.stringify(platformPersonalCardTxns.data[0]);
        transactionService.upsert.and.returnValue(of(personalCardTxn));
        personalCardsService.matchExpense.and.returnValue(
          of({
            external_expense_id: expectedUnflattendedTxnData3.tx.id,
            transaction_split_group_id: expectedUnflattendedTxnData3.tx.split_group_id,
          }),
        );
        spyOn(component, 'uploadAttachments').and.returnValue(of(fileObject4));
        spyOn(component, 'showSnackBarToast');
        fixture.detectChanges();

        component.saveAndMatchWithPersonalCardTxn();
        expect(component.getCustomFields).toHaveBeenCalledOnceWith();
        expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
        expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
        expect(transactionService.upsert).toHaveBeenCalledTimes(1);
        expect(personalCardsService.matchExpense).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.tx.split_group_id,
          platformPersonalCardTxns.data[0].id,
        );
        expect(component.uploadAttachments).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.tx.split_group_id,
        );
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Expense created successfully.' },
          'success',
          ['msb-success'],
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'personal_cards'], {
          queryParams: { refresh: true },
        });
        expect(trackingService.newExpenseCreatedFromPersonalCard).toHaveBeenCalledOnceWith();
      });

      it('should generate an expense in offline mode and match with a card', () => {
        const generateEtxnSpy = spyOn(component, 'generateEtxnFromFg');
        generateEtxnSpy
          .withArgs(component.etxn$, jasmine.any(Observable))
          .and.returnValue(of({ ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard.tx }));
        generateEtxnSpy
          .withArgs(component.etxn$, jasmine.any(Observable))
          .and.returnValue(of({ ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard.tx }));
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        component.isConnected$ = of(false);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyDataWoData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        activatedRoute.snapshot.params.personalCardTxn = JSON.stringify(platformPersonalCardTxns.data[0]);
        transactionService.upsert.and.returnValue(of(unflattenedTransactionDataPersonalCard.tx));
        personalCardsService.matchExpense.and.returnValue(
          of({
            external_expense_id: expectedUnflattendedTxnData3.tx.id,
            transaction_split_group_id: expectedUnflattendedTxnData3.tx.split_group_id,
          }),
        );
        spyOn(component, 'uploadAttachments').and.returnValue(of(fileObject4));
        spyOn(component, 'showSnackBarToast');
        fixture.detectChanges();

        component.saveAndMatchWithPersonalCardTxn();
        expect(component.getCustomFields).toHaveBeenCalledOnceWith();
        expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
        expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
        expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTransactionDataPersonalCard.tx);
        expect(personalCardsService.matchExpense).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.tx.split_group_id,
          platformPersonalCardTxns.data[0].id,
        );
        expect(component.uploadAttachments).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.tx.split_group_id,
        );
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Expense created successfully.' },
          'success',
          ['msb-success'],
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'personal_cards'], {
          queryParams: { refresh: true },
        });
        expect(trackingService.newExpenseCreatedFromPersonalCard).toHaveBeenCalledOnceWith();
      });
    });

    describe('trackEditExpense():', () => {
      it('should track edit expense event', () => {
        spyOn(component, 'getTimeSpentOnPage').and.returnValue(300);
        component.presetCategoryId = trackCreateExpDataWoCurrency.tx.org_category_id;
        component.presetProjectId = trackCreateExpDataWoCurrency.tx.project_id;
        component.presetCostCenterId = trackCreateExpDataWoCurrency.tx.cost_center_id;
        component.presetCurrency = trackCreateExpDataWoCurrency.tx.orig_currency;
        fixture.detectChanges();

        component.trackEditExpense(trackCreateExpData);
        expect(trackingService.editExpense).toHaveBeenCalledOnceWith({
          Type: 'Receipt',
          Amount: trackCreateExpDataWoCurrency.tx.amount,
          Currency: 'USD',
          Category: trackCreateExpDataWoCurrency.tx.org_category,
          Time_Spent: '300 secs',
          Used_Autofilled_Category: true,
          Used_Autofilled_Project: true,
          Used_Autofilled_CostCenter: true,
          Used_Autofilled_Currency: true,
        });
        expect(component.getTimeSpentOnPage).toHaveBeenCalledTimes(1);
      });

      it('should track edit expense event for an expense where the original currency is same as preset currency', () => {
        component.presetCategoryId = trackCreateExpDataWoCurrency.tx.org_category_id;
        component.presetCostCenterId = trackCreateExpDataWoCurrency.tx.cost_center_id;
        component.presetCurrency = trackCreateExpDataWoCurrency.tx.orig_currency;
        component.presetProjectId = trackCreateExpDataWoCurrency.tx.project_id;
        spyOn(component, 'getTimeSpentOnPage').and.returnValue(30);
        fixture.detectChanges();

        component.trackEditExpense(trackCreateExpDataWoCurrency);
        expect(trackingService.editExpense).toHaveBeenCalledOnceWith({
          Type: 'Receipt',
          Amount: trackCreateExpDataWoCurrency.tx.amount,
          Currency: trackCreateExpDataWoCurrency.tx.currency,
          Category: trackCreateExpDataWoCurrency.tx.org_category,
          Time_Spent: '30 secs',
          Used_Autofilled_Category: true,
          Used_Autofilled_Project: true,
          Used_Autofilled_CostCenter: true,
          Used_Autofilled_Currency: true,
        });
      });
    });

    describe('editExpense():', () => {
      it('should edit an expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(transformedExpenseData));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        authService.getEou.and.resolveTo(apiEouRes);
        component.etxn$ = of(transformedExpenseData);
        transactionService.upsert.and.returnValue(of(transformedExpenseData.tx));
        component.fg.controls.report.setValue(expectedReportsPaginated[0]);
        spenderReportsService.addExpenses.and.returnValue(of(undefined));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe(() => {
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(transformedExpenseData);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseData.tx);
          expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txvslh8aQMbu']);
          done();
        });
      });

      it('should add transaction from report while editing expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(transformedExpenseDataWithReportId));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        component.etxn$ = of(transformedExpenseDataWithReportId);
        component.fg.controls.report.setValue(expectedReportsPaginated[0]);
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        spenderReportsService.ejectExpenses.and.returnValue(of(undefined));
        spenderReportsService.addExpenses.and.returnValue(of(undefined));
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(transformedExpenseDataWithReportId.tx));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editUnflattenedTransactionPlatform2);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(transformedExpenseDataWithReportId);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseDataWithReportId.tx);
          expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txD5hIQgLuR5']);
          expect(spenderReportsService.ejectExpenses).toHaveBeenCalledOnceWith('rpbNc3kn5baq', 'txD5hIQgLuR5');
          done();
        });
      });

      it('should update transaction with advance_wallet_id while editing expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(transformedExpenseDataWithAdvanceWallet));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        component.etxn$ = of(transformedExpenseDataWithAdvanceWallet);
        component.fg.controls.paymentMode.setValue(paymentModeDataAdvanceWallet);
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        spenderReportsService.ejectExpenses.and.returnValue(of(undefined));
        spenderReportsService.addExpenses.and.returnValue(of(undefined));
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(transformedExpenseDataWithoutAdvanceWallet.tx));
        fixture.detectChanges();

        component.editExpense('SAVE_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editUnflattenedTransactionPlatformWithAdvanceWallet);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(transformedExpenseDataWithAdvanceWallet);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseDataWithAdvanceWallet.tx);
          done();
        });
      });

      it('should remove expense from report while editing and ask for review', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(transformedExpenseDataWithReportId2));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');

        component.etxn$ = of(transformedExpenseDataWithReportId2);
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        spenderReportsService.ejectExpenses.and.returnValue(of(undefined));
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(transformedExpenseDataWithReportId2.tx));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editUnflattenedTransactionPlatform3);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(transformedExpenseDataWithReportId2);
          expect(spenderReportsService.ejectExpenses).toHaveBeenCalledOnceWith('rplD17WeBlha', 'txD5hIQgLuR5');
          expect(trackingService.removeFromExistingReportEditExpense).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseDataWithReportId2.tx);
          done();
        });
      });

      it('should edit an expense with critical policy violation and require user review', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(transformedExpenseDataWithSubCategory));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        spyOn(component, 'getIsPolicyExpense').and.returnValue(false);
        policyService.getCriticalPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'criticalPolicyViolationErrorHandler').and.returnValue(
          of({ etxn: transformedExpenseDataWithSubCategory, comment: null }),
        );
        component.etxn$ = of(transformedExpenseDataWithSubCategory);
        authService.getEou.and.resolveTo(apiEouRes);

        transactionService.upsert.and.returnValue(of(transformedExpenseDataWithSubCategory.tx));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editUnflattenedTransactionPlatform);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.criticalPolicyViolationErrorHandler).toHaveBeenCalledOnceWith(
            {
              type: 'criticalPolicyViolations',
              policyViolations: [
                'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
              ],
              etxn: transformedExpenseDataWithSubCategory,
            },
            jasmine.any(Observable),
          );
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(transformedExpenseDataWithSubCategory);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseDataWithSubCategory.tx);
          expect(component.getIsPolicyExpense).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should should edit an expense causing a policy violation', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(transformedExpenseDataWithReportId));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        spyOn(component, 'getIsPolicyExpense').and.returnValue(true);
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'policyViolationErrorHandler').and.returnValue(
          of({ etxn: transformedExpenseDataWithReportId, comment: 'A comment' }),
        );
        component.etxn$ = of(transformedExpenseDataWithReportId);
        authService.getEou.and.resolveTo(apiEouRes);

        transactionService.upsert.and.returnValue(of(transformedExpenseDataWithReportId.tx));
        expenseCommentService.findLatestExpenseComment.and.returnValue(of('a comment'));
        expenseCommentService.post.and.returnValue(of([expenseCommentData]));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editUnflattenedTransactionPlatform2);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.policyViolationErrorHandler).toHaveBeenCalledOnceWith(
            {
              type: 'policyViolations',
              policyViolations: [
                'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
              ],
              policyAction: expensePolicyData.data.final_desired_state,
              etxn: transformedExpenseDataWithReportId,
            },
            jasmine.any(Observable),
          );
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(transformedExpenseDataWithReportId);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseDataWithReportId.tx);

          expect(expenseCommentService.findLatestExpenseComment).toHaveBeenCalledOnceWith(
            transformedExpenseDataWithReportId.tx.id,
            transformedExpenseDataWithReportId.tx.org_user_id,
          );
          expect(expenseCommentService.post).toHaveBeenCalledOnceWith([
            {
              expense_id: transformedExpenseDataWithReportId.tx.id,
              comment: 'A comment',
              notify: true,
            },
          ]);
          expect(component.getIsPolicyExpense).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should edit an expense with policy violation and same comment', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(transformedExpenseDataWithReportId2));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        spyOn(component, 'getIsPolicyExpense').and.returnValue(true);
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'policyViolationErrorHandler').and.returnValue(
          of({ etxn: transformedExpenseDataWithReportId2, comment: 'comment' }),
        );
        component.etxn$ = of(transformedExpenseDataWithReportId2);
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(transformedExpenseDataWithReportId2.tx));
        expenseCommentService.findLatestExpenseComment.and.returnValue(of('comment'));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editUnflattenedTransactionPlatform3);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.policyViolationErrorHandler).toHaveBeenCalledOnceWith(
            {
              type: 'policyViolations',
              policyViolations: [
                'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
              ],
              policyAction: expensePolicyData.data.final_desired_state,
              etxn: transformedExpenseDataWithReportId2,
            },
            jasmine.any(Observable),
          );
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(transformedExpenseDataWithReportId2);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseDataWithReportId2.tx);
          expect(expenseCommentService.findLatestExpenseComment).toHaveBeenCalledOnceWith(
            transformedExpenseDataWithReportId2.tx.id,
            transformedExpenseDataWithReportId2.tx.org_user_id,
          );
          done();
        });
      });

      it('should throw an error if expense object cannot be obtained', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(expectedUnflattendedTxnData3));
        spyOn(component, 'checkPolicyViolation').and.returnValue(throwError(() => new Error()));
        spyOn(component, 'trackPolicyCorrections');

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe({
          error: (err) => expect(err).toBeTruthy(),
        });
        done();
      });

      it('should match a normal expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(transformedExpenseWithMatchCCCData2));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(null));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        component.etxn$ = of(transformedExpenseWithMatchCCCData2);
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(transformedExpenseWithMatchCCCData2.tx));
        component.selectedCCCTransaction = matchedCCTransactionData;
        component.matchedCCCTransaction = matchedCCTransactionData;
        transactionService.matchCCCExpense.and.returnValue(of(null));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toBe(transformedExpenseWithMatchCCCData2.tx);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseWithMatchCCCData2.tx);
          expect(transactionService.matchCCCExpense).toHaveBeenCalledOnceWith('btxnSte7sVQCM8', 'txmF3wgfj0Bs');
          done();
        });
      });

      it('should unmatch a matched expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(transformedExpenseWithMatchCCCData));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(null));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        component.etxn$ = of(transformedExpenseWithMatchCCCData);
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(transformedExpenseWithMatchCCCData.tx));
        component.selectedCCCTransaction = null;
        component.matchedCCCTransaction = matchedCCTransactionData;
        transactionService.unmatchCCCExpense.and.returnValue(of(null));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toBe(transformedExpenseWithMatchCCCData.tx);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseWithMatchCCCData.tx);
          expect(transactionService.unmatchCCCExpense).toHaveBeenCalledOnceWith('btxnSte7sVQCM8', 'txmF3wgfj0Bs');
          done();
        });
      });

      it('should match a ccc expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(transformedExpenseWithMatchCCCData));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(null));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        component.etxn$ = of(transformedExpenseWithMatchCCCData);
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(transformedExpenseWithMatchCCCData.tx));
        component.selectedCCCTransaction = matchedCCTransactionData2;
        component.matchedCCCTransaction = matchedCCTransactionData2;
        transactionService.unmatchCCCExpense.and.returnValue(of(null));
        transactionService.matchCCCExpense.and.returnValue(of(null));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toBe(transformedExpenseWithMatchCCCData.tx);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseWithMatchCCCData.tx);
          expect(transactionService.unmatchCCCExpense).toHaveBeenCalledOnceWith('btxnBdS2Kpvzhy', 'txmF3wgfj0Bs');
          expect(transactionService.matchCCCExpense).toHaveBeenCalledOnceWith('btxnBdS2Kpvzhy', 'txmF3wgfj0Bs');
          done();
        });
      });
    });
  });
}
