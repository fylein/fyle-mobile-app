import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By, DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { Observable, Subscription, combineLatest, of, throwError } from 'rxjs';
import { expensePolicyData } from 'src/app/core/mock-data/expense-policy.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { fileObject4, fileObjectAdv1 } from 'src/app/core/mock-data/file-object.data';
import { apiPersonalCardTxnsRes } from 'src/app/core/mock-data/personal-card-txns.data';
import { expectedErpt } from 'src/app/core/mock-data/report-unflattened.data';
import { txnStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { editExpTxn2, editExpTxn3, editExpTxn4, editExpTxn5, txnData2 } from 'src/app/core/mock-data/transaction.data';
import {
  expectedUnflattendedTxnData3,
  expectedUnflattendedTxnData4,
  newUnflattenedTxn,
  unflattenedExpenseWithCCCGroupId,
  unflattenedTransactionDataPersonalCard,
  unflattenedTxnData,
  unflattenedTxnDataWithReportID,
  unflattenedTxnDataWithReportID2,
  unflattenedTxnDataWithViolationUserReview,
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
import { txnCustomProperties } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { AddEditExpensePage } from './add-edit-expense.page';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import { getElementBySelector, getElementRef } from 'src/app/core/dom-helpers';
import { unflattenedData } from 'src/app/core/mock-data/data-transform.data';
import { apiExpenseRes, expenseList2 } from 'src/app/core/mock-data/expense.data';
import { reportUnflattenedData } from 'src/app/core/mock-data/report-v1.data';
import { outboxQueueData1 } from 'src/app/core/mock-data/outbox-queue.data';

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

      it('should show file size exceeded popover if uploaded file is larger than 5MB', fakeAsync(() => {
        spyOn(component, 'showSizeLimitExceededPopover');

        const myBlob = new Blob([new ArrayBuffer(100 * 100 * 1000)], { type: 'application/octet-stream' });
        const file = new File([myBlob], 'file');

        component.uploadFileCallback(file);
        tick(500);

        expect(component.showSizeLimitExceededPopover).toHaveBeenCalledOnceWith();
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

    it('trackAddExpense(): should track adding expense', fakeAsync(() => {
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
      expect(trackingService.createExpense).toHaveBeenCalledOnceWith({
        Type: 'Receipt',
        Amount: expectedUnflattendedTxnData4.tx.amount,
        Currency: expectedUnflattendedTxnData4.tx.currency,
        Category: expectedUnflattendedTxnData4.tx.org_category,
        Time_Spent: '300 secs',
        Used_Autofilled_Category: undefined,
        Used_Autofilled_Project: undefined,
        Used_Autofilled_CostCenter: true,
        Used_Autofilled_Currency: true,
        Instafyle: false,
      });
    }));

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
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(expectedUnflattendedTxnData3));
        spyOn(component, 'trackAddExpense');
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        authService.getEou.and.resolveTo(apiEouRes);
        activatedRoute.snapshot.params.rp_id = 'rp_id';
        transactionOutboxService.addEntryAndSync.and.resolveTo(outboxQueueData1[0]);
        component.fg.controls.report.setValue(expectedErpt[0]);
        fixture.detectChanges();

        component.addExpense('SAVE_EXPENSE').subscribe((etxn) => {
          Promise.resolve(etxn).then((res) => {
            expect(res).toEqual(outboxQueueData1[0]);
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
            outboxQueueData1[0].transaction,
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
        component.fg.controls.report.setValue(expectedErpt[0]);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(
          of({
            ...unflattenedTxnData,
            dataUrls: [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.pdf', type: 'application/pdf' }],
          })
        );
        authService.getEou.and.resolveTo(apiEouRes);
        transactionOutboxService.addEntry.and.resolveTo();
        component.selectedCCCTransaction = 'tx12341';
        fixture.detectChanges();

        component.addExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toBeNull();
          expect(component.getCustomFields).toHaveBeenCalledOnceWith();
          expect(component.trackAddExpense).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionOutboxService.addEntry).toHaveBeenCalledOnceWith(
            unflattenedTxnData.tx,
            [{ url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.pdf', type: 'pdf' }],
            [],
            'rprAfNrce73O'
          );
          done();
        });
      });

      it('should add expense with critical policy violation', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'trackAddExpense');
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(expectedUnflattendedTxnData3));
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'criticalPolicyViolationErrorHandler').and.returnValue(
          of({ etxn: expectedUnflattendedTxnData3, comment: null })
        );
        authService.getEou.and.resolveTo(apiEouRes);
        spyOn(component, 'trackCreateExpense');
        transactionOutboxService.addEntry.and.resolveTo();
        fixture.detectChanges();

        component.addExpense('SAVE_EXPENSE').subscribe((res) => {
          expect(res).toBeNull();
          expect(component.getCustomFields).toHaveBeenCalledOnceWith();
          expect(component.trackAddExpense).toHaveBeenCalledOnceWith();
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, jasmine.any(Observable), true);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.criticalPolicyViolationErrorHandler).toHaveBeenCalledOnceWith(
            {
              type: 'criticalPolicyViolations',
              policyViolations: [
                'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
              ],
              etxn: expectedUnflattendedTxnData3,
            },
            jasmine.any(Observable)
          );
          expect(authService.getEou).toHaveBeenCalledOnceWith();
          expect(component.trackCreateExpense).toHaveBeenCalledOnceWith(expectedUnflattendedTxnData3, false);
          expect(transactionOutboxService.addEntry).toHaveBeenCalledOnceWith(
            outboxQueueData1[0].transaction,
            [],
            [],
            undefined
          );
          done();
        });
      });

      it('should add expense with policy violations', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'trackAddExpense');
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(expectedUnflattendedTxnData4));
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'policyViolationErrorHandler').and.returnValue(
          of({
            etxn: expectedUnflattendedTxnData4,
            comment: 'continue',
          })
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
              etxn: expectedUnflattendedTxnData4,
            },
            jasmine.any(Observable)
          );
          expect(authService.getEou).toHaveBeenCalledOnceWith();
          expect(component.trackCreateExpense).toHaveBeenCalledOnceWith(expectedUnflattendedTxnData4, false);
          expect(transactionOutboxService.addEntry).toHaveBeenCalledOnceWith(
            expectedUnflattendedTxnData4.tx,
            [],
            ['continue'],
            undefined
          );
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
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
              component.etxn$,
              jasmine.any(Observable),
              true
            );
            expect(component.trackAddExpense).toHaveBeenCalledOnceWith();
          },
          error: (err) => expect(err).toBeTruthy(),
        });
        done();
      });
    });

    describe('saveAndMatchWithPersonalCardTxn():', () => {
      it('should save an expense and match with personal card', () => {
        const generateEtxnSpy = spyOn(component, 'generateEtxnFromFg');
        generateEtxnSpy
          .withArgs(component.etxn$, jasmine.any(Observable), true)
          .and.returnValue(of({ ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard }));
        generateEtxnSpy
          .withArgs(component.etxn$, jasmine.any(Observable))
          .and.returnValue(of({ ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard }));
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        activatedRoute.snapshot.params.personalCardTxn = JSON.stringify(apiPersonalCardTxnsRes.data[0]);
        transactionService.upsert.and.returnValue(of(unflattenedTransactionDataPersonalCard));
        personalCardsService.matchExpense.and.returnValue(
          of({
            id: expectedUnflattendedTxnData3.tx.id,
            transaction_split_group_id: expectedUnflattendedTxnData3.tx.split_group_id,
          })
        );
        spyOn(component, 'uploadAttachments').and.returnValue(of(fileObject4));
        spyOn(component, 'showSnackBarToast');
        fixture.detectChanges();

        component.saveAndMatchWithPersonalCardTxn();
        expect(component.getCustomFields).toHaveBeenCalledOnceWith();
        expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
        expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
        expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
        expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
        expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
        expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTransactionDataPersonalCard);
        expect(personalCardsService.matchExpense).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.split_group_id,
          apiPersonalCardTxnsRes.data[0].btxn_id
        );
        expect(component.uploadAttachments).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.split_group_id
        );
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Expense created successfully.' },
          'success',
          ['msb-success']
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'personal_cards']);
        expect(trackingService.newExpenseCreatedFromPersonalCard).toHaveBeenCalledOnceWith();
      });

      it('should save and match an expense with critical violation', () => {
        const expense = { ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard };
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(expense));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);

        component.isConnected$ = of(true);
        spyOn(component, 'criticalPolicyViolationErrorHandler').and.returnValue(of({ etxn: expense, comment: null }));
        activatedRoute.snapshot.params.personalCardTxn = JSON.stringify(apiPersonalCardTxnsRes.data[0]);
        transactionService.upsert.and.returnValue(of(unflattenedTransactionDataPersonalCard));
        personalCardsService.matchExpense.and.returnValue(
          of({
            id: expectedUnflattendedTxnData3.tx.id,
            transaction_split_group_id: expectedUnflattendedTxnData3.tx.split_group_id,
          })
        );
        spyOn(component, 'uploadAttachments').and.returnValue(of(fileObject4));
        spyOn(component, 'showSnackBarToast');
        fixture.detectChanges();

        component.saveAndMatchWithPersonalCardTxn();
        expect(component.getCustomFields).toHaveBeenCalledOnceWith();
        expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, jasmine.any(Observable), true);
        expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
        expect(component.criticalPolicyViolationErrorHandler).toHaveBeenCalledOnceWith(
          {
            type: 'criticalPolicyViolations',
            policyViolations: [
              'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
            ],
            etxn: expense,
          },
          jasmine.any(Observable)
        );
        expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTransactionDataPersonalCard);
        expect(personalCardsService.matchExpense).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.split_group_id,
          apiPersonalCardTxnsRes.data[0].btxn_id
        );
        expect(component.uploadAttachments).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.split_group_id
        );
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Expense created successfully.' },
          'success',
          ['msb-success']
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'personal_cards']);
        expect(trackingService.newExpenseCreatedFromPersonalCard).toHaveBeenCalledOnceWith();
      });

      it('it should save and match an expense with policy violation', () => {
        const expense = { ...expectedUnflattendedTxnData3, tx: unflattenedTransactionDataPersonalCard };
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(expense));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        component.isConnected$ = of(true);
        spyOn(component, 'policyViolationErrorHandler').and.returnValue(of({ etxn: expense, comment: 'comment' }));
        activatedRoute.snapshot.params.personalCardTxn = JSON.stringify(apiPersonalCardTxnsRes.data[0]);
        transactionService.upsert.and.returnValue(of(unflattenedTransactionDataPersonalCard));
        personalCardsService.matchExpense.and.returnValue(
          of({
            id: expectedUnflattendedTxnData3.tx.id,
            transaction_split_group_id: expectedUnflattendedTxnData3.tx.split_group_id,
          })
        );
        spyOn(component, 'uploadAttachments').and.returnValue(of(fileObject4));
        spyOn(component, 'showSnackBarToast');
        fixture.detectChanges();

        component.saveAndMatchWithPersonalCardTxn();
        expect(component.getCustomFields).toHaveBeenCalledOnceWith();
        expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, jasmine.any(Observable), true);
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
          jasmine.any(Observable)
        );
        expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTransactionDataPersonalCard);
        expect(personalCardsService.matchExpense).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.split_group_id,
          apiPersonalCardTxnsRes.data[0].btxn_id
        );
        expect(component.uploadAttachments).toHaveBeenCalledOnceWith(
          unflattenedTransactionDataPersonalCard.split_group_id
        );
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Expense created successfully.' },
          'success',
          ['msb-success']
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'personal_cards']);
        expect(trackingService.newExpenseCreatedFromPersonalCard).toHaveBeenCalledOnceWith();
      });
    });

    it('trackEditExpense(): should track edit expense event', () => {
      spyOn(component, 'getTimeSpentOnPage').and.returnValue(300);
      component.presetCategoryId = expectedUnflattendedTxnData3.tx.org_category_id;
      component.presetProjectId = expectedUnflattendedTxnData3.tx.project_id;
      component.presetCostCenterId = expectedUnflattendedTxnData3.tx.cost_center_id;
      component.presetCurrency = expectedUnflattendedTxnData3.tx.currency;
      fixture.detectChanges();

      component.trackEditExpense(expectedUnflattendedTxnData3);
      expect(trackingService.editExpense).toHaveBeenCalledOnceWith({
        Type: 'Receipt',
        Amount: expectedUnflattendedTxnData3.tx.amount,
        Currency: expectedUnflattendedTxnData3.tx.currency,
        Category: expectedUnflattendedTxnData3.tx.org_category,
        Time_Spent: '300 secs',
        Used_Autofilled_Category: undefined,
        Used_Autofilled_Project: undefined,
        Used_Autofilled_CostCenter: true,
        Used_Autofilled_Currency: true,
      });
      expect(component.getTimeSpentOnPage).toHaveBeenCalledTimes(1);
    });

    describe('editExpense():', () => {
      it('should edit an expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(newUnflattenedTxn));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        authService.getEou.and.resolveTo(apiEouRes);
        component.etxn$ = of(expectedUnflattendedTxnData3);
        transactionService.upsert.and.returnValue(of(txnData2));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
        component.fg.controls.report.setValue(expectedErpt[0]);
        reportService.addTransactions.and.returnValue(of(undefined));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe(() => {
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(newUnflattenedTxn);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(newUnflattenedTxn.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txNVtsqF8Siq');
          expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rprAfNrce73O', ['tx3qHxFNgRcZ']);
          done();
        });
      });

      it('should add transaction from report while editing expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnDataWithReportID));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        component.etxn$ = of(unflattenedTxnDataWithReportID);
        component.fg.controls.report.setValue(expectedErpt[0]);
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        reportService.removeTransaction.and.returnValue(of(undefined));
        reportService.addTransactions.and.returnValue(of(undefined));
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(unflattenedTxnDataWithReportID.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnDataWithReportID));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editExpTxn2);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(unflattenedTxnDataWithReportID);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnDataWithReportID.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txbO4Xaj4N53');
          expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txbO4Xaj4N53']);
          expect(reportService.removeTransaction).toHaveBeenCalledOnceWith('rpGpzBpAxtSn', 'txbO4Xaj4N53');
          done();
        });
      });

      it('should remove expense from report while editing and and ask for review', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnDataWithReportID2));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        component.etxn$ = of(unflattenedTxnDataWithReportID2);
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        reportService.removeTransaction.and.returnValue(of(undefined));
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(unflattenedTxnDataWithReportID2.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnDataWithReportID2));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editExpTxn3);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(unflattenedTxnDataWithReportID2);
          expect(reportService.removeTransaction).toHaveBeenCalledOnceWith('rpGpzBpAxtSn', 'txbO4Xaj4N53');
          expect(trackingService.removeFromExistingReportEditExpense).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnDataWithReportID2.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txbO4Xaj4N53');
          done();
        });
      });

      it('should edit an expense with critical policy violation and require user review', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnDataWithViolationUserReview));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'criticalPolicyViolationErrorHandler').and.returnValue(
          of({ etxn: unflattenedTxnDataWithViolationUserReview, comment: null })
        );
        component.etxn$ = of(unflattenedTxnDataWithViolationUserReview);
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.review.and.returnValue(of(null));
        transactionService.upsert.and.returnValue(of(unflattenedTxnDataWithViolationUserReview.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnDataWithViolationUserReview));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editExpTxn4);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.criticalPolicyViolationErrorHandler).toHaveBeenCalledOnceWith(
            {
              type: 'criticalPolicyViolations',
              policyViolations: [
                'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
              ],
              etxn: unflattenedTxnDataWithViolationUserReview,
            },
            jasmine.any(Observable)
          );
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(unflattenedTxnDataWithViolationUserReview);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnDataWithViolationUserReview.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txbO4Xaj4N53');
          expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnDataWithViolationUserReview.tx.id);
          done();
        });
      });

      it('should should edit an expense causing a policy violation', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnDataWithViolationUserReview));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'policyViolationErrorHandler').and.returnValue(
          of({ etxn: unflattenedTxnDataWithViolationUserReview, comment: 'comment' })
        );
        component.etxn$ = of(unflattenedTxnDataWithViolationUserReview);
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.review.and.returnValue(of(null));
        transactionService.upsert.and.returnValue(of(unflattenedTxnDataWithViolationUserReview.tx));
        statusService.findLatestComment.and.returnValue(of('a comment'));
        statusService.post.and.returnValue(of(txnStatusData));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnDataWithViolationUserReview));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editExpTxn5);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
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
              etxn: unflattenedTxnDataWithViolationUserReview,
            },
            jasmine.any(Observable)
          );
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(unflattenedTxnDataWithViolationUserReview);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnDataWithViolationUserReview.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txbO4Xaj4N53');
          expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnDataWithViolationUserReview.tx.id);
          expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
            unflattenedTxnDataWithViolationUserReview.tx.id,
            'transactions',
            unflattenedTxnDataWithViolationUserReview.tx.org_user_id
          );
          expect(statusService.post).toHaveBeenCalledOnceWith(
            'transactions',
            unflattenedTxnDataWithViolationUserReview.tx.id,
            { comment: 'comment' },
            true
          );
          done();
        });
      });

      it('should edit an expense with policy violation and same comment', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnDataWithViolationUserReview));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'policyViolationErrorHandler').and.returnValue(
          of({ etxn: unflattenedTxnDataWithViolationUserReview, comment: 'comment' })
        );
        component.etxn$ = of(unflattenedTxnDataWithViolationUserReview);
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.review.and.returnValue(of(null));
        transactionService.upsert.and.returnValue(of(unflattenedTxnDataWithViolationUserReview.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnDataWithViolationUserReview));
        statusService.findLatestComment.and.returnValue(of('comment'));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toEqual(editExpTxn5);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
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
              etxn: unflattenedTxnDataWithViolationUserReview,
            },
            jasmine.any(Observable)
          );
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledOnceWith(unflattenedTxnDataWithViolationUserReview);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnDataWithViolationUserReview.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txbO4Xaj4N53');
          expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnDataWithViolationUserReview.tx.id);
          expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
            unflattenedTxnDataWithViolationUserReview.tx.id,
            'transactions',
            unflattenedTxnDataWithViolationUserReview.tx.org_user_id
          );
          expect(statusService.post).not.toHaveBeenCalled();
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
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedExpenseWithCCCGroupId));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(null));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        component.etxn$ = of(unflattenedExpenseWithCCCGroupId);
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(unflattenedExpenseWithCCCGroupId.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
        component.selectedCCCTransaction = unflattenedExpenseWithCCCGroupId.tx;
        component.matchedCCCTransaction = unflattenedExpenseWithCCCGroupId;
        transactionService.matchCCCExpense.and.returnValue(of(null));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toBeNull();
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedExpenseWithCCCGroupId.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txbO4Xaj4N53');
          expect(transactionService.matchCCCExpense).toHaveBeenCalledOnceWith('tx3qHxFNgRcZ', 'txbO4Xaj4N53');
          done();
        });
      });

      it('should unmatch a matched expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedExpenseWithCCCGroupId));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(null));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        component.etxn$ = of(unflattenedExpenseWithCCCGroupId);
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(unflattenedExpenseWithCCCGroupId.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedExpenseWithCCCGroupId));
        component.selectedCCCTransaction = null;
        component.matchedCCCTransaction = unflattenedExpenseWithCCCGroupId;
        transactionService.unmatchCCCExpense.and.returnValue(of(null));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toBeNull();
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedExpenseWithCCCGroupId.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txbO4Xaj4N53');
          expect(transactionService.unmatchCCCExpense).toHaveBeenCalledOnceWith('txbO4Xaj4N53', undefined);
          done();
        });
      });

      it('should match a ccc expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedExpenseWithCCCGroupId));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(null));
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'trackEditExpense');
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        component.etxn$ = of(unflattenedExpenseWithCCCGroupId);
        authService.getEou.and.resolveTo(apiEouRes);
        transactionService.upsert.and.returnValue(of(unflattenedExpenseWithCCCGroupId.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedExpenseWithCCCGroupId));
        component.selectedCCCTransaction = unflattenedExpenseWithCCCGroupId.tx;
        component.matchedCCCTransaction = unflattenedExpenseWithCCCGroupId;
        transactionService.unmatchCCCExpense.and.returnValue(of(null));
        transactionService.matchCCCExpense.and.returnValue(of(null));
        fixture.detectChanges();

        component.editExpense('SAVE_AND_NEW_EXPENSE').subscribe((res) => {
          expect(res).toBeNull();
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable), true);
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(2);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedExpenseWithCCCGroupId.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('txbO4Xaj4N53');
          expect(transactionService.unmatchCCCExpense).toHaveBeenCalledOnceWith('txbO4Xaj4N53', undefined);
          expect(transactionService.matchCCCExpense).toHaveBeenCalledOnceWith('txbO4Xaj4N53', 'txbO4Xaj4N53');
          done();
        });
      });
    });
  });
}
