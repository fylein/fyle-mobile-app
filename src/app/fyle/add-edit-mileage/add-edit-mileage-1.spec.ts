import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { BehaviorSubject, Subject, Subscription, of } from 'rxjs';
import { ExpenseType } from 'src/app/core/enums/expense-type.enum';
import { accountOptionData1 } from 'src/app/core/mock-data/account-option.data';
import { criticalPolicyViolation2 } from 'src/app/core/mock-data/crtical-policy-violations.data';
import { policyExpense2 } from 'src/app/core/mock-data/expense.data';
import { individualExpPolicyStateData2 } from 'src/app/core/mock-data/individual-expense-policy-state.data';
import { locationData1, locationData2, locationData3 } from 'src/app/core/mock-data/location.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import { mileageCategories, transformedOrgCategoryById } from 'src/app/core/mock-data/org-category.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { outboxQueueData1 } from 'src/app/core/mock-data/outbox-queue.data';
import { splitPolicyExp4 } from 'src/app/core/mock-data/policy-violation.data';
import { txnData2 } from 'src/app/core/mock-data/transaction.data';
import {
  mileageCategoryUnflattenedExpense,
  newExpenseMileageData2,
  perDiemCategoryUnflattenedExpense,
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
import {
  multiplePaymentModesData,
  multiplePaymentModesWithoutAdvData,
  orgSettingsData,
} from 'src/app/core/test-data/accounts.service.spec.data';
import { estatusData1 } from 'src/app/core/test-data/status.service.spec.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { FyPolicyViolationComponent } from 'src/app/shared/components/fy-policy-violation/fy-policy-violation.component';
import { AddEditMileagePage } from './add-edit-mileage.page';
import { extendedAccountData1 } from 'src/app/core/mock-data/extended-account.data';

export function TestCases1(getTestBed) {
  return describe('AddEditMileage-1', () => {
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

    it('getPolicyDetails(): should get policy details', () => {
      policyService.getSpenderExpensePolicyViolations.and.returnValue(of(individualExpPolicyStateData2));

      component.getPolicyDetails();

      expect(component.policyDetails).toEqual(individualExpPolicyStateData2);
      expect(policyService.getSpenderExpensePolicyViolations).toHaveBeenCalledOnceWith(
        activatedRoute.snapshot.params.id
      );
    });

    it('showFields(): should show expanded view', () => {
      component.showFields();

      expect(trackingService.showMoreClicked).toHaveBeenCalledOnceWith({
        source: 'Add Mileage page',
      });
      expect(component.isExpandedView).toBeTrue();
    });

    it('hideFields(): should disable expanded view', () => {
      component.hideFields();

      expect(trackingService.hideMoreClicked).toHaveBeenCalledOnceWith({
        source: 'Add Mileage page',
      });
      expect(component.isExpandedView).toBeFalse();
    });

    it('should scroll input into view on keydown', () => {
      const inputElement = document.createElement('input');
      spyOn(inputElement, 'scrollIntoView');
      spyOn(component, 'getActiveElement').and.returnValue(inputElement);

      component.scrollInputIntoView();

      expect(inputElement.scrollIntoView).toHaveBeenCalledOnceWith({
        block: 'center',
      });

      expect(component.getActiveElement).toHaveBeenCalledTimes(1);
    });

    it('getActiveElement(): should return active element in DOM', () => {
      const result = component.getActiveElement();

      expect(result).toEqual(document.activeElement);
    });

    describe('openCommentsModal():', () => {
      it('should add comment to the expense and track the event', fakeAsync(() => {
        modalProperties.getModalDefaultProperties.and.returnValue(properties);
        component.etxn$ = of(unflattenedTxnData);
        fixture.detectChanges();

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

      it('should view comment in the expense and track the event', fakeAsync(() => {
        modalProperties.getModalDefaultProperties.and.returnValue(properties);
        component.etxn$ = of(unflattenedTxnData);
        fixture.detectChanges();

        const modalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);
        modalSpy.onDidDismiss.and.resolveTo({ data: null });
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

    describe('goToTransaction():', () => {
      const txnIds = ['txfCdl3TEZ7K'];
      it('should navigate to add-edit mileage if category is mileage', () => {
        component.goToTransaction(mileageCategoryUnflattenedExpense, txnIds, 0);

        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_mileage',
          {
            id: mileageCategoryUnflattenedExpense.tx.id,
            txnIds: JSON.stringify(txnIds),
            activeIndex: 0,
          },
        ]);
      });

      it('should navigate to per diem expense form if the category is per diem', () => {
        component.goToTransaction(perDiemCategoryUnflattenedExpense, txnIds, 0);

        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_per_diem',
          {
            id: perDiemCategoryUnflattenedExpense.tx.id,
            txnIds: JSON.stringify(txnIds),
            activeIndex: 0,
          },
        ]);
      });

      it('should navigate to expense form', () => {
        component.goToTransaction(unflattenedTxnData, txnIds, 0);

        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'add_edit_expense',
          {
            id: unflattenedTxnData.tx.id,
            txnIds: JSON.stringify(txnIds),
            activeIndex: 0,
          },
        ]);
      });
    });

    describe('getProjectCategoryIds():', () => {
      it('should return MILEAGE category IDs', (done) => {
        categoriesService.getAll.and.returnValue(of(mileageCategories));

        component.getProjectCategoryIds().subscribe((res) => {
          expect(res).toEqual(['141295', '141300']);
          expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should return an empty array if there are no MILEAGE categories', (done) => {
        categoriesService.getAll.and.returnValue(of(transformedOrgCategoryById));

        component.getProjectCategoryIds().subscribe((res) => {
          expect(res).toEqual([]);
          expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('saveExpenseAndGotoNext():', () => {
      it('should add a new expense and close the form', () => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'close');
        component.activeIndex = 0;
        component.reviewList = ['id1'];
        component.mode = 'add';
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoNext();
        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_MILEAGE');
        expect(component.close).toHaveBeenCalledTimes(1);
      });

      it('should add a new expense and go to the next expense if not the first one in list', () => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'goToNext');
        component.activeIndex = 0;
        component.mode = 'add';
        component.reviewList = ['id1', 'id2'];
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoNext();
        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_MILEAGE');
        expect(component.goToNext).toHaveBeenCalledTimes(1);
      });

      it('should save an edited expense and close the form', () => {
        spyOn(component, 'editExpense').and.returnValue(of(txnData2));
        spyOn(component, 'close');
        component.activeIndex = 0;
        component.mode = 'edit';
        component.reviewList = ['id1'];
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoNext();
        expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_MILEAGE');
        expect(component.close).toHaveBeenCalledTimes(1);
      });

      it('should save an edited expense and go to the next expense', () => {
        spyOn(component, 'editExpense').and.returnValue(of(txnData2));
        spyOn(component, 'goToNext');
        component.activeIndex = 0;
        component.mode = 'edit';
        component.reviewList = ['id1', 'id2'];
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoNext();
        expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_NEXT_MILEAGE');
        expect(component.goToNext).toHaveBeenCalledTimes(1);
      });

      it('should show validation errors if the form is not valid', () => {
        spyOn(component, 'showFormValidationErrors');

        component.saveExpenseAndGotoNext();

        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      });
    });

    it('getTimeSpentOnPage(): should get time spent on page', () => {
      component.expenseStartTime = 164577000;
      fixture.detectChanges();

      const result = component.getTimeSpentOnPage();
      const time = (new Date().getTime() - component.expenseStartTime) / 1000;
      expect(result).toEqual(time);
    });

    it('reloadCurrentRoute(): should reload the current load', fakeAsync(() => {
      component.reloadCurrentRoute();
      tick(500);

      expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/enterprise/my_expenses', { skipLocationChange: true });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'add_edit_mileage']);
    }));

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

    describe('ionViewWillLeave(): ', () => {
      it('should unsubscribe and complete observable as component leaves', () => {
        const dependentFieldSpy = jasmine.createSpyObj('DependentFieldComponent', ['ngOnDestroy']);

        component.projectDependentFieldsRef = dependentFieldSpy;
        component.costCenterDependentFieldsRef = dependentFieldSpy;
        spyOn(component.hardwareBackButtonAction, 'unsubscribe');
        spyOn(component.onPageExit$, 'next');
        spyOn(component.onPageExit$, 'complete');
        fixture.detectChanges();

        component.ionViewWillLeave();

        expect(dependentFieldSpy.ngOnDestroy).toHaveBeenCalledTimes(2);
        expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalledTimes(1);
        expect(component.onPageExit$.next).toHaveBeenCalledOnceWith(null);
        expect(component.onPageExit$.complete).toHaveBeenCalledTimes(1);
      });

      it('should unsubscribe remaining observables as dependent fields are not present', () => {
        component.projectDependentFieldsRef = null;
        component.costCenterDependentFieldsRef = null;
        spyOn(component.hardwareBackButtonAction, 'unsubscribe');
        spyOn(component.onPageExit$, 'next');
        spyOn(component.onPageExit$, 'complete');

        fixture.detectChanges();

        component.ionViewWillLeave();

        expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalledTimes(1);
        expect(component.onPageExit$.next).toHaveBeenCalledOnceWith(null);
        expect(component.onPageExit$.complete).toHaveBeenCalledTimes(1);
      });
    });

    describe('getDeleteReportParams():', () => {
      let header = 'Header';
      let body = 'Body';
      let ctaText = 'cta';
      let ctaLoadingText = 'loading';

      it('should get config params for delete report modal and call method to remove txn from report', () => {
        reportService.removeTransaction.and.returnValue(of());

        const result = component.getDeleteReportParams({
          header,
          body,
          ctaText,
          ctaLoadingText,
          removeMileageFromReport: true,
          reportId: 'rp123',
          id: 'txn123',
        });

        result.componentProps.deleteMethod();
        expect(reportService.removeTransaction).toHaveBeenCalledOnceWith('rp123', 'txn123');
      });

      it('should get config params for delete report modal and call method to delete expense', () => {
        transactionService.delete.and.returnValue(of(policyExpense2));

        const result = component.getDeleteReportParams({
          header,
          body,
          ctaText,
          ctaLoadingText,
          removeMileageFromReport: false,
          id: 'txn123',
        });

        result.componentProps.deleteMethod();
        expect(transactionService.delete).toHaveBeenCalledOnceWith('txn123');
      });
    });

    describe('deleteExpense():', () => {
      let header = 'Delete Mileage';
      let body = 'Are you sure you want to delete this mileage expense?';
      let ctaText = 'Delete';
      let ctaLoadingText = 'Deleting';

      it('should delete mileage from report and navigate back to the report', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        component.isRedirectedFromReport = true;
        fixture.detectChanges();

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: 'success',
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);

        header = 'Remove Mileage';
        body = 'Are you sure you want to remove this mileage expense from this report?';
        ctaText = 'Remove';
        ctaLoadingText = 'Removing';

        component.deleteExpense('rpFE5X1Pqi9P');
        tick(500);

        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_view_report', { id: 'rpFE5X1Pqi9P' }]);
        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith({
          header,
          body,
          ctaText,
          ctaLoadingText,
          removeMileageFromReport: true,
          id: 'txyeiYbLDSOy',
          reportId: 'rpFE5X1Pqi9P',
        });
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams({
            header,
            body,
            ctaText,
            ctaLoadingText,
            removeMileageFromReport: true,
            id: 'txyeiYbLDSOy',
            reportId: 'rpFE5X1Pqi9P',
          })
        );
      }));

      it('should delete mileage and go to the next transaction', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        spyOn(component, 'goToTransaction');
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
        component.reviewList = ['txfCdl3TEZ7K', 'txCYDX0peUw5'];
        component.activeIndex = 0;
        component.isRedirectedFromReport = true;
        activatedRoute.snapshot.params.id = JSON.stringify('txfCdl3TEZ7K');
        fixture.detectChanges();

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: 'success',
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        fixture.detectChanges();

        component.deleteExpense();
        tick(500);

        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith({
          header: 'Delete Mileage',
          body: 'Are you sure you want to delete this mileage expense?',
          ctaText: 'Delete',
          ctaLoadingText: 'Deleting',
          id: '"txfCdl3TEZ7K"',
          reportId: undefined,
          removeMileageFromReport: undefined,
        });
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams({ header, body, ctaText, ctaLoadingText })
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

      it('should delete mileage and go to my expenses page if not redirected from report', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        component.isRedirectedFromReport = false;
        activatedRoute.snapshot.params.id = JSON.stringify('txfCdl3TEZ7K');
        fixture.detectChanges();

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: 'success',
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        fixture.detectChanges();

        component.deleteExpense();
        tick(500);

        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith({
          header: 'Delete Mileage',
          body: 'Are you sure you want to delete this mileage expense?',
          ctaText: 'Delete',
          ctaLoadingText: 'Deleting',
          id: '"txfCdl3TEZ7K"',
          reportId: undefined,
          removeMileageFromReport: undefined,
        });
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams({
            header,
            body,
            ctaText,
            ctaLoadingText,
            reportId: undefined,
            removeMileageFromReport: false,
          })
        );
      }));

      it('should track event in case the delete operation fails', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        component.isRedirectedFromReport = false;
        activatedRoute.snapshot.params.id = JSON.stringify('txfCdl3TEZ7K');
        fixture.detectChanges();

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: null,
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        fixture.detectChanges();

        component.deleteExpense();
        tick(500);

        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith({
          header: 'Delete Mileage',
          body: 'Are you sure you want to delete this mileage expense?',
          ctaText: 'Delete',
          ctaLoadingText: 'Deleting',
          id: '"txfCdl3TEZ7K"',
          reportId: undefined,
          removeMileageFromReport: undefined,
        });
        expect(trackingService.clickDeleteExpense).toHaveBeenCalledOnceWith({ Type: 'Mileage' });
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams({
            header,
            body,
            ctaText,
            ctaLoadingText,
            reportId: undefined,
            removeMileageFromReport: false,
          })
        );
      }));
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

    it('trackPolicyCorrections(): should track policy corrections', () => {
      component.isCriticalPolicyViolated$ = of(true);
      component.comments$ = of(estatusData1);
      component.fg.markAsDirty();

      fixture.detectChanges();

      component.trackPolicyCorrections();
      expect(trackingService.policyCorrection).toHaveBeenCalledWith({ Violation: 'Critical', Mode: 'Edit Expense' });
      expect(trackingService.policyCorrection).toHaveBeenCalledWith({ Violation: 'Regular', Mode: 'Edit Expense' });
    });

    describe('saveExpenseAndGotoPrev():', () => {
      it('should add a new expense and close the form', () => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'close');
        component.activeIndex = 0;
        component.mode = 'add';
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_MILEAGE');
        expect(component.close).toHaveBeenCalledTimes(1);
      });

      it('should add a new expense and go to the previous expense in the report', () => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'goToPrev');
        component.activeIndex = 1;
        component.mode = 'add';
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_MILEAGE');
        expect(component.goToPrev).toHaveBeenCalledTimes(1);
      });

      it('should save an edited expense and close the form', () => {
        spyOn(component, 'editExpense').and.returnValue(of(txnData2));
        spyOn(component, 'close');
        component.activeIndex = 0;
        component.mode = 'edit';
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoPrev();
        expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_MILEAGE');
        expect(component.close).toHaveBeenCalledTimes(1);
      });

      it('should save an edited expense and go to the previous expense', () => {
        spyOn(component, 'editExpense').and.returnValue(of(txnData2));
        spyOn(component, 'goToPrev');
        component.activeIndex = 1;
        component.mode = 'edit';
        Object.defineProperty(component.fg, 'valid', {
          get: () => true,
        });
        fixture.detectChanges();

        component.saveExpenseAndGotoPrev();
        expect(component.editExpense).toHaveBeenCalledOnceWith('SAVE_AND_PREV_MILEAGE');
        expect(component.goToPrev).toHaveBeenCalledTimes(1);
      });

      it('should show validation errors if the form is not valid', () => {
        spyOn(component, 'showFormValidationErrors');

        component.saveExpenseAndGotoPrev();

        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      });
    });

    describe('customDateValidator():', () => {
      it('should return null when the date is within the valid range', () => {
        const control = new FormControl('2023-06-15');
        const result = component.customDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return an error object when the date is after the upper bound of the valid range', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2);
        const control = new FormControl(tomorrow.toDateString());
        const result = component.customDateValidator(control);
        expect(result).toEqual({ invalidDateSelection: true });
      });
    });

    it('getEditExpense(): should return an unflattened expense to edit', (done) => {
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
      activatedRoute.snapshot.params.id = unflattenedTxnData.tx.id;
      component.getEditExpense().subscribe((res) => {
        expect(res).toEqual(unflattenedTxnData);
        done();
      });
    });

    describe('checkAvailableAdvance():', () => {
      it('should setup balance available flag', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesData));
        component.checkAvailableAdvance();
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
        component.checkAvailableAdvance();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getEMyAccounts).not.toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[1]);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return false when account type changes to null', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(null));
        component.checkAvailableAdvance();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getEMyAccounts).not.toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(null);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return false when account type changes to null', fakeAsync(() => {
        accountsService.getEMyAccounts.and.returnValue(of(extendedAccountData1));
        component.checkAvailableAdvance();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[0]);
        fixture.detectChanges();

        tick(500);
      }));
    });

    it('getPaymentModes(): should get payment modes', (done) => {
      accountsService.getEMyAccounts.and.returnValue(of(multiplePaymentModesData));
      orgSettingsService.get.and.returnValue(of(orgSettingsData));
      orgUserSettingsService.getAllowedPaymentModes.and.returnValue(
        of(orgUserSettingsData.payment_mode_settings.allowed_payment_modes)
      );
      paymentModesService.checkIfPaymentModeConfigurationsIsEnabled.and.returnValue(of(true));
      accountsService.getPaymentModes.and.returnValue(accountOptionData1);
      component.etxn$ = of(unflattenedTxnData);
      fixture.detectChanges();

      const config = {
        etxn: unflattenedTxnData,
        orgSettings: orgSettingsData,
        expenseType: ExpenseType.MILEAGE,
        isPaymentModeConfigurationsEnabled: true,
      };

      component.getPaymentModes().subscribe((res) => {
        expect(res).toEqual(accountOptionData1);
        expect(accountsService.getEMyAccounts).toHaveBeenCalledTimes(1);
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(orgUserSettingsService.getAllowedPaymentModes).toHaveBeenCalledTimes(1);
        expect(paymentModesService.checkIfPaymentModeConfigurationsIsEnabled).toHaveBeenCalledTimes(1);
        expect(accountsService.getPaymentModes).toHaveBeenCalledOnceWith(
          multiplePaymentModesData,
          orgUserSettingsData.payment_mode_settings.allowed_payment_modes,
          config
        );
        done();
      });
    });

    describe('close():', () => {
      it('should navigate back to the previous page if redirected from report', () => {
        component.isRedirectedFromReport = true;
        fixture.detectChanges();

        component.close();

        expect(navController.back).toHaveBeenCalledTimes(1);
      });

      it('should navigate to my expense page if the user was not redirected from report', () => {
        component.isRedirectedFromReport = false;
        fixture.detectChanges();

        component.close();

        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
      });
    });

    describe('getEditCalculatedDistance():', () => {
      it('should get distance in edit mode for a single trip', (done) => {
        mileageService.getDistance.and.returnValue(of(5));
        component.etxn$ = of(unflattenedTxnData);
        spyOn(component, 'getFormValues').and.returnValue({
          route: null,
        });
        fixture.detectChanges();

        component
          .getEditCalculatedDistance({
            value: { mileageLocations: [locationData1, locationData2] },
          })
          .subscribe((res) => {
            expect(res).toEqual('0.01');
            expect(mileageService.getDistance).toHaveBeenCalledOnceWith([locationData1, locationData2]);
            done();
          });
      });

      it('should get distance in edit mode for a round trip', (done) => {
        mileageService.getDistance.and.returnValue(of(10000));
        component.etxn$ = of(newExpenseMileageData2);
        spyOn(component, 'getFormValues').and.returnValue({
          route: {
            roundTrip: true,
            mileageLocations: [],
            distance: 0,
          },
        });
        fixture.detectChanges();

        component
          .getEditCalculatedDistance({
            value: { mileageLocations: [locationData1, locationData3] },
          })
          .subscribe((res) => {
            expect(res).toEqual('12.43');
            expect(mileageService.getDistance).toHaveBeenCalledOnceWith([locationData1, locationData3]);
            done();
          });
      });

      it('should return null if location is not specified', (done) => {
        mileageService.getDistance.and.returnValue(of(null));
        spyOn(component, 'getFormValues').and.returnValue(null);
        component.etxn$ = of(unflattenedTxnData);
        fixture.detectChanges();

        component
          .getEditCalculatedDistance({
            value: null,
          })
          .subscribe((res) => {
            expect(res).toEqual('0.00');
            expect(mileageService.getDistance).toHaveBeenCalledTimes(1);
            expect(component.getFormValues).toHaveBeenCalledTimes(1);
            done();
          });
      });
    });
  });
}
