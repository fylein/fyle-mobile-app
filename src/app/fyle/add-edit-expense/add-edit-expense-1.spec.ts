import { TitleCasePipe } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { Subscription, of } from 'rxjs';
import { AccountType } from 'src/app/core/enums/account-type.enum';
import { actionSheetOptionsData } from 'src/app/core/mock-data/action-sheet-options.data';
import { expectedECccResponse } from 'src/app/core/mock-data/corporate-card-expense-unflattened.data';
import { costCenterApiRes1, expectedCCdata } from 'src/app/core/mock-data/cost-centers.data';
import { customFieldData1 } from 'src/app/core/mock-data/custom-field.data';
import { expenseFieldObjData, txnFieldData } from 'src/app/core/mock-data/expense-field-obj.data';
import { txnFieldsMap2 } from 'src/app/core/mock-data/expense-fields-map.data';
import { expenseData1 } from 'src/app/core/mock-data/expense.data';
import { categorieListRes } from 'src/app/core/mock-data/org-category-list-item.data';
import { orgSettingsRes, orgSettingsParamsWithAdvanceWallet } from 'src/app/core/mock-data/org-settings.data';
import {
  getMarkDismissModalParamsData1,
  getMarkDismissModalParamsData2,
} from 'src/app/core/mock-data/popover-params.data';
import { expectedReportsPaginated } from 'src/app/core/mock-data/platform-report.data';
import { expenseResponseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import {
  unflattenedExpData,
  unflattenedTxn,
  unflattenedExpDataWithAdvanceWallet,
  unflattenedExpDataWithAdvanceWalletWithoutId,
} from 'src/app/core/mock-data/unflattened-expense.data';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
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
import { AdvanceWalletsService } from 'src/app/core/services/platform/v1/spender/advance-wallets.service';
import {
  orgSettingsData,
  unflattenedAccount1Data,
  paymentModeDataAdvanceWallet,
} from 'src/app/core/test-data/accounts.service.spec.data';
import { projectsV1Data } from 'src/app/core/test-data/projects.spec.data';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { AddEditExpensePage } from './add-edit-expense.page';
import { platformExpenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { expenseFieldResponse } from 'src/app/core/mock-data/expense-field.data';
import { expectedProjects4 } from 'src/app/core/mock-data/extended-projects.data';
import { sortedCategory } from 'src/app/core/mock-data/org-category.data';
import { CostCentersService } from 'src/app/core/services/cost-centers.service';
import { employeeSettingsData } from 'src/app/core/mock-data/employee-settings.data';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

export function TestCases1(getTestBed) {
  return describe('AddEditExpensePage-1', () => {
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
    let platform: Platform;
    let titleCasePipe: jasmine.SpyObj<TitleCasePipe>;
    let paymentModesService: jasmine.SpyObj<PaymentModesService>;
    let taxGroupService: jasmine.SpyObj<TaxGroupService>;
    let costCentersService: jasmine.SpyObj<CostCentersService>;
    let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
    let advanceWalletsService: jasmine.SpyObj<AdvanceWalletsService>;
    let translocoService: jasmine.SpyObj<TranslocoService>;
    beforeEach(() => {
      const TestBed = getTestBed();
      TestBed.compileComponents();
      const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
        config: {
          reRenderOnLangChange: true,
        },
        langChanges$: of('en'),
        _loadDependencies: () => Promise.resolve(),
      });
      TestBed.configureTestingModule({
        imports: [TranslocoModule],
        providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
      });
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
      platform = TestBed.inject(Platform);
      titleCasePipe = TestBed.inject(TitleCasePipe) as jasmine.SpyObj<TitleCasePipe>;
      paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
      taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
      costCentersService = TestBed.inject(CostCentersService) as jasmine.SpyObj<CostCentersService>;
      platformEmployeeSettingsService = TestBed.inject(
        PlatformEmployeeSettingsService
      ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
      storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
      launchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
      translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
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

    function setFormValid() {
      Object.defineProperty(component.fg, 'valid', {
        get: () => true,
      });
    }

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('scrollInputIntoView(): should scroll input into view on keydown', () => {
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

    describe('goBack():', () => {
      it('should go back to the report if redirected from the report page', () => {
        activatedRoute.snapshot.params.isRedirectedFromReport = true;

        fixture.detectChanges();

        navController.back.and.returnValue(null);
        component.goBack();
        expect(navController.back).toHaveBeenCalledTimes(1);
      });

      it('should go back to my expenses page if it is not redirected from report and no filters are applied', () => {
        activatedRoute.snapshot.params.persist_filters = false;

        component.isRedirectedFromReport = false;
        fixture.detectChanges();
        component.goBack();
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
      });
    });

    describe('showClosePopup(): ', () => {
      beforeEach(() => {
        component.presetCurrency = 'USD';
        component.fg.controls.category.setValue('Category');
        fixture.detectChanges();
      });

      it('should show close popup and automatically go back if action is continue', fakeAsync(() => {
        const unsavedChangesPopOverSpy = jasmine.createSpyObj('unsavedChangesPopOver', ['present', 'onWillDismiss']);
        unsavedChangesPopOverSpy.onWillDismiss.and.resolveTo({
          data: {
            action: 'continue',
          },
        });
        popoverController.create.and.resolveTo(unsavedChangesPopOverSpy);
        navController.back.and.returnValue(null);

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

      it('should show close popup and go back to expense page if navigate back is false', fakeAsync(() => {
        const unsavedChangesPopOverSpy = jasmine.createSpyObj('unsavedChangesPopOver', ['present', 'onWillDismiss']);
        unsavedChangesPopOverSpy.onWillDismiss.and.resolveTo({
          data: {
            action: 'continue',
          },
        });
        popoverController.create.and.resolveTo(unsavedChangesPopOverSpy);
        spyOn(component, 'goBack');
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
        expect(component.goBack).toHaveBeenCalledTimes(1);
      }));

      it('should navigate back to previous page if form is not valid', fakeAsync(() => {
        component.presetCategoryId = null;
        component.presetProjectId = null;
        component.presetCostCenterId = null;
        component.presetCurrency = null;
        activatedRoute.snapshot.params.dataUrl = null;
        Object.defineProperty(component.fg, 'touched', {
          get: () => false,
        });

        fixture.detectChanges();

        component.showClosePopup();
        tick(500);

        expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Receipt' });
        expect(navController.back).toHaveBeenCalledTimes(1);
      }));

      it('should navigate back to my expenses if the form in not valid', fakeAsync(() => {
        component.presetCategoryId = null;
        component.presetProjectId = null;
        component.presetCostCenterId = null;
        component.presetCurrency = null;
        component.navigateBack = false;
        activatedRoute.snapshot.params.dataUrl = null;
        spyOn(component, 'goBack');
        Object.defineProperty(component.fg, 'touched', {
          get: () => false,
        });

        fixture.detectChanges();

        component.showClosePopup();
        tick(500);

        expect(component.goBack).toHaveBeenCalledTimes(1);
      }));
    });

    describe('merchantValidator():', () => {
      it('should check field value and return null if name less 250 characters', () => {
        component.fg.controls.vendor_id.setValue({
          display_name: 'name',
        });
        const result = component.merchantValidator(component.fg.controls.vendor_id);
        expect(result).toBeNull();
      });

      it('should return error message if value greater than 250 characters', () => {
        component.fg.controls.vendor_id.setValue({
          display_name: `ipb91YrRQA9R5XwvntwdBaDwTtd3WooG
          6aCbmHGgPjBwwGeJxtnZyLYoM1DqKxKY
          Q2uJzbFIxPlBEzmsisyF1H2KHtmU6K0W
          EJoXAkQVyAJJCTsgA57BbB0NOoQ4DzG3
          h6BloyPTkkrevuTmGh75eTZ5egsAGtdS
          HuZVfVxjsH4ZRloC72S5KGIbJcwDh8fF
          7JgOeoqVd4HT2ykWcUp2Tavk0GXtteK6
          z2oijtR8EOSKi3CwGKvktaQhajBKef8u
          40aK3qQj1hH70ZnGLX4HhXS1e3LeNmxw
          MNnf6RVZDgZnLcAFyGwhhUk52VgMt4YP`,
        });

        const result = component.merchantValidator(component.fg.controls.vendor_id);
        expect(result).toEqual({ merchantNameSize: 'Length is greater than 250' });
      });

      it('should return null if valid value is set as id', () => {
        component.fg.controls.vendor_id.setValue({
          display_name: null,
        });

        const result = component.merchantValidator(component.fg.controls.vendor_id);
        expect(result).toBeNull();
      });
    });

    describe('checkIfInvalidPaymentMode():', () => {
      it('should check for invalid payment mode', (done) => {
        component.etxn$ = of(unflattenedExpData);
        orgSettingsService.get.and.returnValue(of(orgSettingsRes));

        component.fg.controls.paymentMode.setValue(unflattenedAccount1Data);
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
          amount: 500,
        });
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeFalse();
          done();
        });
      });

      it('should check for invalid payment in case of Advance accounts', (done) => {
        component.etxn$ = of({
          ...unflattenedExpData,
          tx: { ...unflattenedExpData.tx, advance_wallet_id: 'accfziaxbGFVW' },
        });
        orgSettingsService.get.and.returnValue(
          of({
            ...orgSettingsRes,
            advances: { ...orgSettingsRes.advances, advance_wallets_enabled: true },
          })
        );

        component.fg.controls.paymentMode.setValue({
          id: 'accfziaxbGFVW',
          balance_amount: 0,
        });
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
          amount: 1000,
        });
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeTrue();
          expect(paymentModesService.showInvalidPaymentModeToast).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should check for invalid payment in case of Advance wallets', (done) => {
        component.etxn$ = of(unflattenedExpDataWithAdvanceWallet);
        orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithAdvanceWallet));

        component.fg.controls.paymentMode.setValue(paymentModeDataAdvanceWallet);
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
          amount: 2500,
        });
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeTrue();
          expect(paymentModesService.showInvalidPaymentModeToast).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should check for invalid payment while adding expense', (done) => {
        component.etxn$ = of(unflattenedExpDataWithAdvanceWalletWithoutId);
        orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithAdvanceWallet));

        component.fg.controls.paymentMode.setValue(paymentModeDataAdvanceWallet);
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
          amount: 2500,
        });
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeTrue();
          expect(paymentModesService.showInvalidPaymentModeToast).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should check for invalid payment payment mode is not set', (done) => {
        component.etxn$ = of(unflattenedExpDataWithAdvanceWalletWithoutId);
        orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithAdvanceWallet));

        component.fg.controls.paymentMode.setValue(null);
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
          amount: 2500,
        });
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeFalse();
          expect(paymentModesService.showInvalidPaymentModeToast).not.toHaveBeenCalled();
          done();
        });
      });

      it('should check for invalid payment mode if the source account ID matches with the account type', (done) => {
        component.etxn$ = of({
          ...unflattenedExpData,
          tx: { ...unflattenedExpData.tx, advance_wallet_id: 'accZ1IWjhjLv4' },
        });
        orgSettingsService.get.and.returnValue(
          of({
            ...orgSettingsRes,
            advances: { ...orgSettingsRes.advances, advance_wallets_enabled: true },
          })
        );

        component.fg.controls.paymentMode.setValue({
          id: 'accZ1IWjhjLv4',
          balance_amount: 100,
        });
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
          amount: 1000,
        });
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeTrue();
          expect(paymentModesService.showInvalidPaymentModeToast).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should check for invalid payment mode with null orgSettings', (done) => {
        component.etxn$ = of(unflattenedExpData);
        orgSettingsService.get.and.returnValue(of(null));

        component.fg.controls.paymentMode.setValue(unflattenedAccount1Data);
        component.fg.controls.currencyObj.setValue({
          currency: 'USD',
          amount: 500,
        });
        fixture.detectChanges();

        component.checkIfInvalidPaymentMode().subscribe((res) => {
          expect(res).toBeFalse();
          done();
        });
      });
    });

    describe('setUpTaxCalculations(): ', () => {
      it('should setup tax amount in the form if currency changes', fakeAsync(() => {
        currencyService.getAmountWithCurrencyFraction.and.returnValue(82.5);
        component.setUpTaxCalculations();
        tick(500);

        component.fg.controls.currencyObj.setValue({
          amount: 100,
          currency: 'USD',
        });

        component.fg.controls.tax_group.setValue({
          percentage: 0.05,
        });
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.tax_amount.value).toEqual(82.5);
        expect(currencyService.getAmountWithCurrencyFraction).toHaveBeenCalledOnceWith(4.761904761904759, 'USD');
      }));

      it('should set tax amount to null if tax group not specified', fakeAsync(() => {
        component.setUpTaxCalculations();
        tick(500);
        component.fg.controls.currencyObj.setValue({
          amount: 100,
          currency: 'USD',
        });

        component.fg.controls.tax_group.setValue(null);
        expect(component.fg.controls.tax_amount.value).toBeNull();
      }));
    });

    describe('unmatchExpense():', () => {
      it('should show popup and selected txns if primary action is selected', fakeAsync(() => {
        popupService.showPopup.and.resolveTo('primary');

        component.unmatchExpense(unflattenedExpData);
        tick(500);

        expect(popupService.showPopup).toHaveBeenCalledOnceWith({
          header: 'Unmatch?',
          message: 'This will remove the mapping between corporate card expense and this expense.',
          primaryCta: {
            text: 'UNMATCH',
          },
        });
        expect(component.showSelectedTransaction).toBeFalse();
        expect(component.isDraftExpense).toBeTrue();
        expect(component.selectedCCCTransaction).toBeNull();
        expect(component.canChangeMatchingCCCTransaction).toBeTrue();
      }));

      it('should show popup and other settings if it is a CCC txn and draft is enabled', fakeAsync(() => {
        popupService.showPopup.and.resolveTo('primary');
        component.isSplitExpensesPresent = true;
        component.isDraftExpenseEnabled = true;
        component.isSplitExpensesPresent = true;
        component.alreadyApprovedExpenses = expenseResponseData;
        fixture.detectChanges();

        component.unmatchExpense({
          ...unflattenedTxnData,
          tx: { ...unflattenedTxnData.tx, state: 'APPROVER_PENDING' },
        });
        tick(500);

        expect(popupService.showPopup).toHaveBeenCalledOnceWith({
          header: 'Unmatch?',
          message:
            'Unmatching the card transaction from this split expense will also unmatch it from the other splits associated with the expense.',
          primaryCta: {
            text: 'UNMATCH',
          },
        });
        expect(component.isDraftExpense).toBeFalse();
        expect(component.canChangeMatchingCCCTransaction).toBeFalse();
        expect(component.selectedCCCTransaction).toBeNull();
      }));
    });

    it('setupNetworkWatcher(): should setup network watching', (done) => {
      networkService.connectivityWatcher.and.returnValue(null);
      networkService.isOnline.and.returnValue(of(true));

      component.setupNetworkWatcher();
      expect(networkService.connectivityWatcher).toHaveBeenCalledWith(new EventEmitter<boolean>());
      expect(networkService.isOnline).toHaveBeenCalled();
      component.isConnected$.subscribe((res) => {
        expect(res).toBeTrue();
        done();
      });
    });

    it('showSplitBlockedPopover(): should show split blocked popover with message', fakeAsync(() => {
      const splitBlockedPopoverSpy = jasmine.createSpyObj('splitBlockedPopover', ['present']);

      popoverController.create.and.resolveTo(splitBlockedPopoverSpy);

      const message =
        'Looks like the tax amount is more than the expense amount. Please correct the tax amount before splitting it.';
      component.showSplitBlockedPopover(message);
      tick(500);

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: PopupAlertComponent,
        componentProps: {
          title: 'Expense cannot be split',
          message,
          primaryCta: {
            text: 'OK',
          },
        },
        cssClass: 'pop-up-in-center',
      });
    }));

    describe('openSplitExpenseModal():', () => {
      beforeEach(() => {
        expenseFieldsService.getAllEnabled.and.returnValue(of(expenseFieldResponse));
      });

      it('should open split expense modal by navigating to split expense', () => {
        spyOn(component, 'getCustomFields').and.returnValue(of(customFieldData1));
        component.txnFields$ = of(expenseFieldObjData);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedExpData));
        const splitConfig = {
          category: {
            is_visible: !!expenseFieldObjData.org_category_id,
            value: component.getFormValues().category,
            is_mandatory: expenseFieldObjData.org_category_id?.is_mandatory || false,
          },
          project: {
            is_visible: component.isProjectEnabled,
            value: component.getFormValues().project,
            is_mandatory: expenseFieldObjData.project_id?.is_mandatory || false,
          },
          costCenter: {
            is_visible: component.isCostCenterEnabled,
            value: component.getFormValues().costCenter,
            is_mandatory: expenseFieldObjData.cost_center_id?.is_mandatory || false,
          },
        };

        component.openSplitExpenseModal();
        expect(component.getCustomFields).toHaveBeenCalledTimes(1);
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'split_expense',
          {
            splitConfig: JSON.stringify(splitConfig),
            txnFields: JSON.stringify(txnFieldsMap2),
            txn: JSON.stringify(unflattenedExpData.tx),
            currencyObj: JSON.stringify(component.fg.controls.currencyObj.value),
            fileObjs: JSON.stringify(unflattenedExpData.dataUrls),
            selectedCCCTransaction: null,
            selectedReportId: null,
            selectedProject: null,
            expenseFields: JSON.stringify(expenseFieldResponse),
          },
        ]);
      });

      it('should navigate to split expense with selected CCC txns and report ID', () => {
        spyOn(component, 'getCustomFields').and.returnValue(of(customFieldData1));
        component.txnFields$ = of(expenseFieldObjData);
        component.selectedCCCTransaction = expectedECccResponse[0].ccce;
        component.fg.controls.report.setValue(expectedReportsPaginated[0]);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedExpData));
        fixture.detectChanges();
        const splitConfig = {
          category: {
            is_visible: !!expenseFieldObjData.org_category_id,
            value: component.getFormValues().category,
            is_mandatory: expenseFieldObjData.org_category_id?.is_mandatory || false,
          },
          project: {
            is_visible: component.isProjectEnabled,
            value: component.getFormValues().project,
            is_mandatory: expenseFieldObjData.project_id?.is_mandatory || false,
          },
          costCenter: {
            is_visible: component.isCostCenterEnabled,
            value: component.getFormValues().costCenter,
            is_mandatory: expenseFieldObjData.cost_center_id?.is_mandatory || false,
          },
        };

        component.openSplitExpenseModal();
        expect(component.getCustomFields).toHaveBeenCalledTimes(1);
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'split_expense',
          {
            splitConfig: JSON.stringify(splitConfig),
            txnFields: JSON.stringify(txnFieldsMap2),
            txn: JSON.stringify(unflattenedExpData.tx),
            currencyObj: JSON.stringify(component.fg.controls.currencyObj.value),
            fileObjs: JSON.stringify(unflattenedExpData.dataUrls),
            selectedCCCTransaction: JSON.stringify(expectedECccResponse[0].ccce),
            selectedReportId: JSON.stringify('rprAfNrce73O'),
            selectedProject: null,
            expenseFields: JSON.stringify(expenseFieldResponse),
          },
        ]);
      });

      it('should show split blocked popover if expense is already reported and report is selected as null in edit expense form', () => {
        spyOn(component, 'getCustomFields').and.returnValue(of(customFieldData1));
        customInputsService.getAll.and.returnValue(of(null));
        component.txnFields$ = of(expenseFieldObjData);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(
          of({ ...unflattenedExpData, tx: { ...unflattenedExpData.tx, report_id: 'rprAfNrce73O' } })
        );
        component.fg.controls.report.setValue(null);
        spyOn(component, 'showSplitBlockedPopover');

        component.openSplitExpenseModal();
        expect(component.getCustomFields).toHaveBeenCalledTimes(1);
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.showSplitBlockedPopover).toHaveBeenCalledOnceWith(
          'Looks like you have removed this expense from the report. Please select a report for this expense before splitting it.'
        );
      });

      it('should show split blocked popover if expense is already reported and report.rp is null in edit expense form', () => {
        spyOn(component, 'getCustomFields').and.returnValue(of(customFieldData1));
        customInputsService.getAll.and.returnValue(of(null));
        component.txnFields$ = of(expenseFieldObjData);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(
          of({ ...unflattenedExpData, tx: { ...unflattenedExpData.tx, report_id: 'rprAfNrce73O' } })
        );
        component.fg.controls.report.setValue(null);
        spyOn(component, 'showSplitBlockedPopover');

        component.openSplitExpenseModal();
        expect(component.getCustomFields).toHaveBeenCalledTimes(1);
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.showSplitBlockedPopover).toHaveBeenCalledOnceWith(
          'Looks like you have removed this expense from the report. Please select a report for this expense before splitting it.'
        );
      });

      it('should show split blocked popover if expense is already reported and report.rp.id is null in edit expense form', () => {
        spyOn(component, 'getCustomFields').and.returnValue(of(customFieldData1));
        customInputsService.getAll.and.returnValue(of(null));
        component.txnFields$ = of(expenseFieldObjData);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(
          of({ ...unflattenedExpData, tx: { ...unflattenedExpData.tx, report_id: 'rprAfNrce73O' } })
        );
        component.fg.controls.report.setValue({ ...expectedReportsPaginated[0], id: null });
        spyOn(component, 'showSplitBlockedPopover');

        component.openSplitExpenseModal();
        expect(component.getCustomFields).toHaveBeenCalledTimes(1);
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.showSplitBlockedPopover).toHaveBeenCalledOnceWith(
          'Looks like you have removed this expense from the report. Please select a report for this expense before splitting it.'
        );
      });

      it('should show split blocked popover if amount is less than tax amount', () => {
        spyOn(component, 'getCustomFields').and.returnValue(of(customFieldData1));
        customInputsService.getAll.and.returnValue(of(null));
        component.txnFields$ = of(expenseFieldObjData);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(
          of({ ...unflattenedExpData, tx: { ...unflattenedExpData.tx, amount: 10, tax_amount: 12 } })
        );
        component.fg.controls.report.setValue(null);
        spyOn(component, 'showSplitBlockedPopover');

        component.openSplitExpenseModal();
        expect(component.getCustomFields).toHaveBeenCalledTimes(1);
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.showSplitBlockedPopover).toHaveBeenCalledOnceWith(
          'Looks like the tax amount is more than the expense amount. Please correct the tax amount before splitting it.'
        );
      });

      it('should not block split if it is a credit charge and tax amount is present', () => {
        spyOn(component, 'getCustomFields').and.returnValue(of(customFieldData1));
        customInputsService.getAll.and.returnValue(of(null));
        component.txnFields$ = of(expenseFieldObjData);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(
          of({ ...unflattenedExpData, tx: { ...unflattenedExpData.tx, amount: -100, tax_amount: -12 } })
        );
        component.fg.controls.report.setValue(null);
        spyOn(component, 'showSplitBlockedPopover');

        component.openSplitExpenseModal();
        expect(component.getCustomFields).toHaveBeenCalledTimes(1);
        expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
        expect(component.showSplitBlockedPopover).not.toHaveBeenCalled();
      });
    });

    describe('markCCCAsPersonal():', () => {
      it('should mark a CCC txn as personal', (done) => {
        trackingService.deleteExpense.and.returnValue(null);
        corporateCreditCardExpenseService.markPersonal.and.returnValue(of(null));

        component.markCCCAsPersonal().subscribe(() => {
          expect(trackingService.deleteExpense).toHaveBeenCalledOnceWith({ Type: 'Marked Personal' });
          expect(corporateCreditCardExpenseService.markPersonal).toHaveBeenCalledOnceWith(
            component.corporateCreditCardExpenseGroupId
          );
          done();
        });
      });
    });

    describe('dismissCCC():', () => {
      it('should dismiss CCC txn', (done) => {
        trackingService.deleteExpense.and.returnValue(null);
        corporateCreditCardExpenseService.dismissCreditTransaction.and.returnValue(of(null));

        component.dismissCCC(expenseData1.tx_corporate_credit_card_expense_group_id).subscribe(() => {
          expect(trackingService.deleteExpense).toHaveBeenCalledOnceWith({ Type: 'Dismiss as Card Payment' });
          expect(corporateCreditCardExpenseService.dismissCreditTransaction).toHaveBeenCalledOnceWith(
            expenseData1.tx_corporate_credit_card_expense_group_id
          );
          done();
        });
      });
    });

    it('getRemoveCCCExpModalParams(): should return params for remove CCC expense modal', (done) => {
      const mockUnlinkResponse = {
        data: {
          user_created_expense: platformExpenseData,
          auto_created_expense: platformExpenseData,
        },
      };
      transactionService.removeCorporateCardExpense.and.returnValue(of(mockUnlinkResponse));
      const header = 'Remove Card Expense';
      const body = 'removed';
      const ctaText = 'Confirm';
      const ctaLoadingText = 'Confirming';

      const result = component.getRemoveCCCExpModalParams(header, body, ctaText, ctaLoadingText);
      result.componentProps.deleteMethod().subscribe((res) => {
        expect(res).toEqual(mockUnlinkResponse);
        expect(transactionService.removeCorporateCardExpense).toHaveBeenCalledOnceWith(
          activatedRoute.snapshot.params.id
        );
        done();
      });
    });

    describe('removeCorporateCardExpense():', () => {
      it('should remove CCC expense', fakeAsync(() => {
        component.etxn$ = of(unflattenedTxnData);
        spyOn(component, 'goBack');
        transactionService.getRemoveCardExpenseDialogBody.and.returnValue('removed');
        spyOn(component, 'getRemoveCCCExpModalParams');
        spyOn(component, 'showSnackBarToast');

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
        deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

        popoverController.create.and.resolveTo(deletePopoverSpy);

        component.removeCorporateCardExpense();
        tick(500);

        const header = 'Remove Card Expense';
        const body = 'removed';
        const ctaText = 'Confirm';
        const ctaLoadingText = 'Confirming';

        expect(transactionService.getRemoveCardExpenseDialogBody).toHaveBeenCalledTimes(1);
        expect(component.getRemoveCCCExpModalParams).toHaveBeenCalledOnceWith(header, body, ctaText, ctaLoadingText);
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getRemoveCCCExpModalParams(header, body, ctaText, ctaLoadingText)
        );
        expect(trackingService.unlinkCorporateCardExpense).toHaveBeenCalledTimes(1);
        expect(component.goBack).toHaveBeenCalledOnceWith();
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Successfully removed the card details from the expense.' },
          'information',
          ['msb-info']
        );
        expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
          ToastContent: 'Successfully removed the card details from the expense.',
        });
      }));

      it('should go back to my expenses page if etxn is undefined', fakeAsync(() => {
        component.etxn$ = of(undefined);
        spyOn(component, 'goBack');
        transactionService.getRemoveCardExpenseDialogBody.and.returnValue('removed');
        spyOn(component, 'getRemoveCCCExpModalParams');
        spyOn(component, 'showSnackBarToast');

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
        deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

        popoverController.create.and.resolveTo(deletePopoverSpy);

        component.removeCorporateCardExpense();
        tick(500);

        expect(component.goBack).toHaveBeenCalledTimes(1);
      }));

      it('navigate back to report if redirected from report after removing txn', fakeAsync(() => {
        const txn = { ...unflattenedTxn, tx: { ...unflattenedTxn.tx, report_id: 'rpFE5X1Pqi9P' } };
        component.etxn$ = of(txn);
        transactionService.getRemoveCardExpenseDialogBody.and.returnValue('removed');
        spyOn(component, 'getRemoveCCCExpModalParams');
        spyOn(component, 'showSnackBarToast');

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
        deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

        popoverController.create.and.resolveTo(deletePopoverSpy);

        component.removeCorporateCardExpense();
        tick(500);

        const header = 'Remove Card Expense';
        const body = 'removed';
        const ctaText = 'Confirm';
        const ctaLoadingText = 'Confirming';

        expect(transactionService.getRemoveCardExpenseDialogBody).toHaveBeenCalledTimes(1);
        expect(component.getRemoveCCCExpModalParams).toHaveBeenCalledOnceWith(header, body, ctaText, ctaLoadingText);
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getRemoveCCCExpModalParams(header, body, ctaText, ctaLoadingText)
        );
        expect(trackingService.unlinkCorporateCardExpense).toHaveBeenCalledTimes(1);

        expect(router.navigate).toHaveBeenCalledOnceWith([
          '/',
          'enterprise',
          'my_view_report',
          { id: 'rpFE5X1Pqi9P', navigateBack: true },
        ]);
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Successfully removed the card details from the expense.' },
          'information',
          ['msb-info']
        );
        expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
          ToastContent: 'Successfully removed the card details from the expense.',
        });
      }));

      it('should show remove CCC expense popup but take no action', fakeAsync(() => {
        const txn = { ...unflattenedTxn, tx: { ...unflattenedTxn.tx, report_id: 'rpFE5X1Pqi9P' } };
        component.etxn$ = of(txn);
        transactionService.getRemoveCardExpenseDialogBody.and.returnValue('removed');
        spyOn(component, 'getRemoveCCCExpModalParams');
        spyOn(component, 'showSnackBarToast');

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
        deletePopoverSpy.onDidDismiss.and.resolveTo({ data: null });

        popoverController.create.and.resolveTo(deletePopoverSpy);

        component.removeCorporateCardExpense();
        tick(500);

        const header = 'Remove Card Expense';
        const body = 'removed';
        const ctaText = 'Confirm';
        const ctaLoadingText = 'Confirming';

        expect(transactionService.getRemoveCardExpenseDialogBody).toHaveBeenCalledTimes(1);
        expect(component.getRemoveCCCExpModalParams).toHaveBeenCalledOnceWith(header, body, ctaText, ctaLoadingText);
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getRemoveCCCExpModalParams(header, body, ctaText, ctaLoadingText)
        );
        expect(trackingService.unlinkCorporateCardExpense).not.toHaveBeenCalled();
        expect(component.showSnackBarToast).not.toHaveBeenCalled();
      }));

      it('should go back to expenses page if no expense is found', fakeAsync(() => {
        component.etxn$ = of(unflattenedTxnData);
        transactionService.getRemoveCardExpenseDialogBody.and.returnValue('removed');
        spyOn(component, 'getRemoveCCCExpModalParams');
        spyOn(component, 'showSnackBarToast');
        fixture.detectChanges();

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
        deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

        popoverController.create.and.resolveTo(deletePopoverSpy);

        component.removeCorporateCardExpense();
        tick(500);

        const header = 'Remove Card Expense';
        const body = 'removed';
        const ctaText = 'Confirm';
        const ctaLoadingText = 'Confirming';

        expect(transactionService.getRemoveCardExpenseDialogBody).toHaveBeenCalledTimes(1);
        expect(component.getRemoveCCCExpModalParams).toHaveBeenCalledOnceWith(header, body, ctaText, ctaLoadingText);
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getRemoveCCCExpModalParams(header, body, ctaText, ctaLoadingText)
        );
        expect(trackingService.unlinkCorporateCardExpense).toHaveBeenCalledTimes(1);
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Successfully removed the card details from the expense.' },
          'information',
          ['msb-info']
        );
        expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
          ToastContent: 'Successfully removed the card details from the expense.',
        });
      }));
    });

    describe('markPeronsalOrDismiss(): ', () => {
      it('should dismiss txn as specified', fakeAsync(() => {
        spyOn(component, 'getMarkDismissModalParams');
        spyOn(component, 'showSnackBarToast');
        component.etxn$ = of(unflattenedTxn);

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
        deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

        popoverController.create.and.resolveTo(deletePopoverSpy);

        fixture.detectChanges();

        component.markPeronsalOrDismiss('dismiss');
        tick(500);

        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getMarkDismissModalParams(getMarkDismissModalParamsData1, true)
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith({ message: 'Dismissed expense' }, 'information', [
          'msb-info',
        ]);
        expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: 'Dismissed expense' });
      }));

      it('should mark txn as personal', fakeAsync(() => {
        spyOn(component, 'getMarkDismissModalParams');
        spyOn(component, 'showSnackBarToast');
        component.etxn$ = of(unflattenedTxn);

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
        deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        component.isExpenseMatchedForDebitCCCE = true;

        fixture.detectChanges();

        component.markPeronsalOrDismiss('personal');
        tick(500);

        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getMarkDismissModalParams(getMarkDismissModalParamsData2, true)
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Marked expense as Personal' },
          'information',
          ['msb-info']
        );
        expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
          ToastContent: 'Marked expense as Personal',
        });
      }));

      it('should mark txn as personal if CCC group id is null', fakeAsync(() => {
        spyOn(component, 'getMarkDismissModalParams');
        spyOn(component, 'showSnackBarToast');
        component.etxn$ = of(null);

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);
        deletePopoverSpy.onDidDismiss.and.resolveTo({ data: { status: 'success' } });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        component.isExpenseMatchedForDebitCCCE = true;

        fixture.detectChanges();

        component.markPeronsalOrDismiss('personal');
        tick(500);

        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getMarkDismissModalParams(getMarkDismissModalParamsData2, true)
        );
        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
        expect(component.showSnackBarToast).toHaveBeenCalledOnceWith(
          { message: 'Marked expense as Personal' },
          'information',
          ['msb-info']
        );
        expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
          ToastContent: 'Marked expense as Personal',
        });
        expect(component.corporateCreditCardExpenseGroupId).toBeUndefined();
      }));
    });

    it('removeCCCHandler(): should call method to remove CCC expense', () => {
      spyOn(component, 'removeCorporateCardExpense');

      component.removeCCCHandler();
      expect(component.removeCorporateCardExpense).toHaveBeenCalledTimes(1);
    });

    it('markPersonalHandler(): should call method to mark expense as personal', () => {
      spyOn(component, 'markPeronsalOrDismiss');

      component.markPersonalHandler();
      expect(component.markPeronsalOrDismiss).toHaveBeenCalledOnceWith('personal');
    });

    it('markDismissHandler(): should call method to dismiss the expense', () => {
      spyOn(component, 'markPeronsalOrDismiss');

      component.markDismissHandler();
      expect(component.markPeronsalOrDismiss).toHaveBeenCalledOnceWith('dismiss');
    });

    describe('splitExpenseHandler():', () => {
      beforeEach(() => {
        component.pendingTransactionAllowedToReportAndSplit = true;
      });

      it('should call method to display split expense modal and split by category', () => {
        setFormValid();

        spyOn(component, 'openSplitExpenseModal');

        component.splitExpenseHandler();

        expect(component.openSplitExpenseModal).toHaveBeenCalledOnceWith();
      });

      it('should validation errors if any inside the form', () => {
        spyOn(component, 'showFormValidationErrors');

        component.splitExpenseHandler();

        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      });

      it('should show toast message if pendingTransactionAllowedToReportAndSplit is false', () => {
        spyOn(component, 'showTransactionPendingToast');

        component.pendingTransactionAllowedToReportAndSplit = false;

        component.splitExpenseHandler();

        expect(component.showTransactionPendingToast).toHaveBeenCalledTimes(1);
      });
    });

    describe('getActionSheetOptions():', () => {
      it('should get all action sheet options', (done) => {
        orgSettingsService.get.and.returnValue(
          of({
            ...orgSettingsData,
            expense_settings: { ...orgSettingsData.expense_settings, split_expense_settings: { enabled: true } },
          })
        );
        component.isCccExpense = 'tx3qHxFNgRcZ';
        component.canDismissCCCE = true;
        component.isCorporateCreditCardEnabled = true;
        component.canRemoveCardExpense = true;
        component.isExpenseMatchedForDebitCCCE = true;
        spyOn(component, 'splitExpenseHandler');
        spyOn(component, 'markPersonalHandler');
        spyOn(component, 'markDismissHandler');
        spyOn(component, 'removeCCCHandler');
        fixture.detectChanges();

        let actionSheetOptions;

        component.getActionSheetOptions().subscribe((res) => {
          actionSheetOptions = res;
          expect(res.length).toEqual(4);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        });

        actionSheetOptions[0].handler();
        expect(component.splitExpenseHandler).toHaveBeenCalledTimes(1);
        actionSheetOptions[1].handler();
        expect(component.markPersonalHandler).toHaveBeenCalledTimes(1);
        actionSheetOptions[2].handler();
        expect(component.markDismissHandler).toHaveBeenCalledTimes(1);
        actionSheetOptions[3].handler();
        expect(component.removeCCCHandler).toHaveBeenCalledTimes(1);
        done();
      });

      it('should get action sheet options when split expense is not allowed', (done) => {
        orgSettingsService.get.and.returnValue(
          of({
            ...orgSettingsData,
            expense_settings: { ...orgSettingsData.expense_settings, split_expense_settings: { enabled: false } },
          })
        );
        component.isCccExpense = 'tx3qHxFNgRcZ';
        component.canDismissCCCE = true;
        component.isCorporateCreditCardEnabled = true;
        component.canRemoveCardExpense = true;
        component.isExpenseMatchedForDebitCCCE = true;
        spyOn(component, 'markPersonalHandler');
        spyOn(component, 'markDismissHandler');
        spyOn(component, 'removeCCCHandler');

        component.getActionSheetOptions().subscribe((res) => {
          expect(res.length).toEqual(3);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should get actions sheet options if ccc expense is not allowed', (done) => {
        orgSettingsService.get.and.returnValue(
          of({
            ...orgSettingsData,
            expense_settings: { ...orgSettingsData.expense_settings, split_expense_settings: { enabled: false } },
          })
        );
        component.isCccExpense = 'tx3qHxFNgRcZ';
        component.canDismissCCCE = true;
        component.isCorporateCreditCardEnabled = true;
        component.canRemoveCardExpense = true;
        component.isExpenseMatchedForDebitCCCE = true;
        spyOn(component, 'removeCCCHandler');

        component.getActionSheetOptions().subscribe((res) => {
          expect(res.length).toEqual(3);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should get action sheet options when ccc expenses are allowed but they cannot be dismissed or removed', (done) => {
        orgSettingsService.get.and.returnValue(
          of({
            ...orgSettingsData,
            expense_settings: { ...orgSettingsData.expense_settings, split_expense_settings: { enabled: false } },
          })
        );
        component.isCccExpense = 'tx3qHxFNgRcZ';
        component.canDismissCCCE = false;
        component.isCorporateCreditCardEnabled = true;
        component.canRemoveCardExpense = false;
        component.isExpenseMatchedForDebitCCCE = true;
        launchDarklyService.getVariation.and.returnValue(of(true));
        spyOn(component, 'markPersonalHandler');

        component.getActionSheetOptions().subscribe((res) => {
          expect(res.length).toEqual(1);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('showMoreActions(): should show action sheet', fakeAsync(() => {
      component.actionSheetOptions$ = of(actionSheetOptionsData);

      const actionSheetSpy = jasmine.createSpyObj('actionSheet', ['present']);
      actionSheetController.create.and.resolveTo(actionSheetSpy);

      component.showMoreActions();
      tick(500);

      expect(actionSheetController.create).toHaveBeenCalledOnceWith({
        header: 'MORE ACTIONS',
        mode: 'md',
        cssClass: 'fy-action-sheet',
        buttons: actionSheetOptionsData,
      });
    }));

    describe('setupCostCenters():', () => {
      it('should return list of cost centers if enabled', (done) => {
        component.employeeSettings$ = of(employeeSettingsData);
        orgSettingsService.get.and.returnValue(of(orgSettingsRes));
        costCentersService.getAllActive.and.returnValue(of(costCenterApiRes1));
        fixture.detectChanges();

        component.setupCostCenters();

        component.isCostCentersEnabled$.subscribe((res) => {
          expect(res).toBeTrue();
        });

        component.costCenters$.subscribe((res) => {
          expect(res).toEqual(expectedCCdata);
        });

        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(costCentersService.getAllActive).toHaveBeenCalledTimes(1);
        done();
      });

      it('should return empty array if cost centers are not enabled', (done) => {
        component.employeeSettings$ = of(employeeSettingsData);
        orgSettingsService.get.and.returnValue(
          of({ ...orgSettingsRes, cost_centers: { ...orgSettingsRes.cost_centers, enabled: false } })
        );
        costCentersService.getAllActive.and.returnValue(of(costCenterApiRes1));
        fixture.detectChanges();

        component.setupCostCenters();

        component.isCostCentersEnabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.costCenters$.subscribe((res) => {
          expect(res).toEqual([]);
        });

        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('showFormValidationErrors(): should show form validation errors', () => {
      spyOn(component.fg, 'markAllAsTouched');

      fixture.detectChanges();

      component.showFormValidationErrors();
      expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
    });
  });
}
