import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetController,
  ModalController,
  NavController,
  Platform,
  PopoverController,
} from '@ionic/angular/standalone';
import { BehaviorSubject, Subject, Subscription, of } from 'rxjs';
import { accountOptionData1 } from 'src/app/core/mock-data/account-option.data';
import { expectedECccResponse } from 'src/app/core/mock-data/corporate-card-expense-unflattened.data';
import { costCentersData, expectedCCdata, expectedCCdata2 } from 'src/app/core/mock-data/cost-centers.data';
import { apiAllCurrencies } from 'src/app/core/mock-data/currency.data';
import { projectDependentFields } from 'src/app/core/mock-data/dependent-field.data';
import { dependentCustomFields2, expenseFieldResponse } from 'src/app/core/mock-data/expense-field.data';
import { expenseFieldObjData } from 'src/app/core/mock-data/expense-field-obj.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { categorieListRes, recentUsedCategoriesRes } from 'src/app/core/mock-data/org-category-list-item.data';

import {
  orgCategoryData,
  orgCategoryData1,
  sortedCategory,
  transformedOrgCategories,
} from 'src/app/core/mock-data/org-category.data';
import {
  orgSettingsWithProjectAndAutofill,
  orgSettingsWoTaxAndRtf,
  taxSettingsData,
  taxSettingsData2,
  orgSettingsParamsWithAdvanceWallet,
  orgSettingsWithProjectCategoryRestrictions,
} from 'src/app/core/mock-data/org-settings.data';
import {
  employeeSettingsData,
  employeeSettingsWoDefaultProject,
  employeeSettingsData2,
} from 'src/app/core/mock-data/employee-settings.data';
import {
  recentCurrencyRes,
  recentlyUsedCostCentersRes,
  recentlyUsedProjectRes,
  recentlyUsedRes,
} from 'src/app/core/mock-data/recently-used.data';
import { reportOptionsData, reportOptionsData2, reportOptionsData3 } from 'src/app/core/mock-data/report-options.data';
import { expectedReportsPaginated } from 'src/app/core/mock-data/platform-report.data';
import { expectedTaxGroupData, taxGroupData } from 'src/app/core/mock-data/tax-group.data';
import { TxnCustomProperties3, txnCustomPropertiesData } from 'src/app/core/mock-data/txn-custom-properties.data';
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
  unflattenedTxnWithCategory,
} from 'src/app/core/mock-data/unflattened-txn.data';
import { CostCenter } from 'src/app/core/models/v1/cost-center.model';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
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
import { PlatformOrgSettingsService } from 'src/app/core/services/platform/v1/spender/org-settings.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TaxGroupService } from 'src/app/core/services/tax-group.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { AdvanceWalletsService } from 'src/app/core/services/platform/v1/spender/advance-wallets.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import {
  multiplePaymentModesData,
  multiplePaymentModesWithoutAdvData,
  orgSettingsData,
  unflattenedAccount1Data,
  advanceWallet1Data,
} from 'src/app/core/test-data/accounts.service.spec.data';
import { filledCustomProperties } from 'src/app/core/test-data/custom-inputs.spec.data';
import { txnCustomProperties, txnCustomProperties2 } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { apiV2ResponseMultiple, expectedProjectsResponse } from 'src/app/core/test-data/projects.spec.data';
import { getEstatusApiResponse } from 'src/app/core/test-data/status.service.spec.data';
import { AddEditExpensePage } from './add-edit-expense.page';
import { txnFieldsData2, txnFieldsFlightData } from 'src/app/core/mock-data/expense-fields-map.data';
import {
  expenseData,
  platformExpenseData,
  platformExpenseWithExtractedData,
  splitExpensesData,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { matchedCCTransactionData } from 'src/app/core/mock-data/matchedCCTransaction.data';
import { cloneDeep } from 'lodash';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { generateUrlsBulkData1 } from 'src/app/core/mock-data/generate-urls-bulk-response.data';
import { receiptInfoData2 } from 'src/app/core/mock-data/receipt-info.data';

export function TestCases5(getTestBed) {
  return describe('AddEditExpensePage-5', () => {
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
    let platformReportService: jasmine.SpyObj<SpenderReportsService>;
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
    let spenderFileService: jasmine.SpyObj<SpenderFileService>;
    let popoverController: jasmine.SpyObj<PopoverController>;
    let currencyService: jasmine.SpyObj<CurrencyService>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let navController: jasmine.SpyObj<NavController>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
    let recentlyUsedItemsService: jasmine.SpyObj<RecentlyUsedItemsService>;
    let tokenService: jasmine.SpyObj<TokenService>;
    let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
    let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
    let actionSheetController: jasmine.SpyObj<ActionSheetController>;
    let orgSettingsService: jasmine.SpyObj<PlatformOrgSettingsService>;
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
    let expensesService: jasmine.SpyObj<ExpensesService>;
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
      platformReportService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
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
      spenderFileService = TestBed.inject(SpenderFileService) as jasmine.SpyObj<SpenderFileService>;
      popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
      currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      recentLocalStorageItemsService = TestBed.inject(
        RecentLocalStorageItemsService,
      ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
      recentlyUsedItemsService = TestBed.inject(RecentlyUsedItemsService) as jasmine.SpyObj<RecentlyUsedItemsService>;
      tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
      expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
      modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
      actionSheetController = TestBed.inject(ActionSheetController) as jasmine.SpyObj<ActionSheetController>;
      orgSettingsService = TestBed.inject(PlatformOrgSettingsService) as jasmine.SpyObj<PlatformOrgSettingsService>;
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
      expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
      advanceWalletsService = TestBed.inject(AdvanceWalletsService) as jasmine.SpyObj<AdvanceWalletsService>;
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
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    describe('getMarkDismissModalParams():', () => {
      it('should get modal params with method to mark as personal', (done) => {
        spyOn(component, 'markCCCAsPersonal').and.returnValue(of(null));
        activatedRoute.snapshot.params.id = 'txfCdl3TEZ7K';
        component.corporateCreditCardExpenseGroupId = 'btxnBdS2Kpvzhy';
        fixture.detectChanges();

        component
          .getMarkDismissModalParams(
            {
              header: 'Header',
              body: 'body',
              ctaText: 'Done',
              ctaLoadingText: 'Loading',
            },
            true,
          )
          .componentProps.deleteMethod()
          .subscribe(() => {
            expect(component.markCCCAsPersonal).toHaveBeenCalledOnceWith();
            done();
          });
      });

      it('should get modal params with method to dismiss expense', (done) => {
        spyOn(component, 'dismissCCC').and.returnValue(of(null));
        activatedRoute.snapshot.params.id = 'txfCdl3TEZ7K';
        component.matchedCCCTransaction = matchedCCTransactionData;
        fixture.detectChanges();

        component
          .getMarkDismissModalParams(
            {
              header: 'Header',
              body: 'body',
              ctaText: 'Done',
              ctaLoadingText: 'Loading',
            },
            false,
          )
          .componentProps.deleteMethod()
          .subscribe(() => {
            expect(component.dismissCCC).toHaveBeenCalledOnceWith('btxnSte7sVQCM8');
            done();
          });
      });

      it('should get modal params with method to dismiss expense if matched expense does not exist', (done) => {
        spyOn(component, 'dismissCCC').and.returnValue(of(null));
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
            false,
          )
          .componentProps.deleteMethod()
          .subscribe(() => {
            expect(component.dismissCCC).toHaveBeenCalledOnceWith(undefined);
            done();
          });
      });

      it('should get modal params with method to dismiss expense if matched expense does not exist', (done) => {
        spyOn(component, 'dismissCCC').and.returnValue(of(null));
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
            false,
          )
          .componentProps.deleteMethod()
          .subscribe(() => {
            expect(component.dismissCCC).toHaveBeenCalledOnceWith(undefined);
            done();
          });
      });
    });

    describe('setupBalanceFlag():', () => {
      it('should setup balance available flag', fakeAsync(() => {
        accountsService.getMyAccounts.and.returnValue(of(multiplePaymentModesData));
        advanceWalletsService.getAllAdvanceWallets.and.returnValue(of([]));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getMyAccounts).toHaveBeenCalledOnceWith();
          expect(advanceWalletsService.getAllAdvanceWallets).toHaveBeenCalledOnceWith();
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[0]);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return false in advance balance if payment mode is not personal', fakeAsync(() => {
        accountsService.getMyAccounts.and.returnValue(of(multiplePaymentModesData));
        advanceWalletsService.getAllAdvanceWallets.and.returnValue(of([]));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getMyAccounts).toHaveBeenCalledOnceWith();
          expect(advanceWalletsService.getAllAdvanceWallets).toHaveBeenCalledOnceWith();
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[1]);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return false when account changes to null', fakeAsync(() => {
        accountsService.getMyAccounts.and.returnValue(of(null));
        advanceWalletsService.getAllAdvanceWallets.and.returnValue(of([]));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getMyAccounts).toHaveBeenCalledOnceWith();
          expect(advanceWalletsService.getAllAdvanceWallets).toHaveBeenCalledOnceWith();
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(null);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return false when orgSettings is null', fakeAsync(() => {
        accountsService.getMyAccounts.and.returnValue(of(multiplePaymentModesData));
        advanceWalletsService.getAllAdvanceWallets.and.returnValue(of([]));
        orgSettingsService.get.and.returnValue(of(null));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getMyAccounts).toHaveBeenCalledOnceWith();
          expect(advanceWalletsService.getAllAdvanceWallets).toHaveBeenCalledOnceWith();
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[0]);
        fixture.detectChanges();

        tick(500);
      }));

      it('should return true for advance wallets', fakeAsync(() => {
        accountsService.getMyAccounts.and.returnValue(of(multiplePaymentModesWithoutAdvData));
        advanceWalletsService.getAllAdvanceWallets.and.returnValue(of(advanceWallet1Data));
        orgSettingsService.get.and.returnValue(of(orgSettingsParamsWithAdvanceWallet));
        component.setupBalanceFlag();
        tick(500);

        component.isBalanceAvailableInAnyAdvanceAccount$.subscribe((res) => {
          expect(res).toBeFalse();
          expect(accountsService.getMyAccounts).toHaveBeenCalledOnceWith();
          expect(advanceWalletsService.getAllAdvanceWallets).toHaveBeenCalledOnceWith();
          expect(orgSettingsService.get).toHaveBeenCalledOnceWith();
        });
        component.fg.controls.paymentMode.setValue(multiplePaymentModesWithoutAdvData[0]);
        fixture.detectChanges();

        tick(500);
      }));
    });

    describe('setupFilteredCategories():', () => {
      beforeEach(() => {
        component.mode = 'add';
        component.isProjectCategoryRestrictionsEnabled$ = of(true);
        component.txnFields$ = of(expenseFieldObjData);
      });

      it('should get filtered categories for a project', fakeAsync(() => {
        component.etxn$ = of(unflattenedTxnData);
        component.activeCategories$ = of(sortedCategory);

        projectsService.getbyId.and.returnValue(of(apiV2ResponseMultiple.data[0]));
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.setupFilteredCategories();
        tick(500);

        const secondProject = apiV2ResponseMultiple.data[1] || expectedProjectsResponse[1];
        component.fg.controls.project.setValue(secondProject);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
        expect(projectsService.getbyId).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.project_id, sortedCategory);
        expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledWith(secondProject, sortedCategory, true);
      }));

      it('should get updated filtered categories for changing an existing project', fakeAsync(() => {
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        component.fg.controls.project.setValue(expectedProjectsResponse[0]);
        component.fg.controls.category.setValue(orgCategoryData);
        projectsService.getbyId.and.returnValue(of(expectedProjectsResponse[0]));
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.setupFilteredCategories();
        tick(500);

        const secondProject = expectedProjectsResponse[1];
        component.fg.controls.project.setValue(secondProject);
        fixture.detectChanges();
        tick(500);

        expect(projectsService.getbyId).toHaveBeenCalledOnceWith(257528, sortedCategory);
        expect(component.fg.controls.billable.value).toBeFalse();
        expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledWith(secondProject, sortedCategory, true);
      }));

      it('should return all active categories when project is null', fakeAsync(() => {
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        component.fg.controls.project.reset();
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.setupFilteredCategories();
        tick(500);

        component.fg.controls.project.setValue(null);
        fixture.detectChanges();
        tick(500);

        expect(projectsService.getAllowedOrgCategoryIds).not.toHaveBeenCalled();
      }));

      it('should not reset billable when project is null and user has not interacted with the project', fakeAsync(() => {
        component.showBillable = true;
        component.recentCategoriesOriginal = [];
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.fg.controls.billable.setValue(true);

        component.setupFilteredCategories();
        tick(500);

        component.fg.controls.project.setValue(null);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeTrue();
      }));

      it('should set billable to false when user clears the project', fakeAsync(() => {
        component.showBillable = true;
        component.recentCategoriesOriginal = [];
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.fg.controls.billable.setValue(true);

        component.setupFilteredCategories();
        tick(500);

        component.fg.controls.project.markAsDirty();
        component.fg.controls.project.setValue(null);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should use project default_billable when user changes project even if expenseLevelBillable is true', fakeAsync(() => {
        component.showBillable = true;
        component.recentCategoriesOriginal = [];
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.expenseLevelBillable = true;
        component.fg.controls.billable.setValue(true);

        component.setupFilteredCategories();
        tick(500);

        const projectWithNonBillable = {
          ...expectedProjectsResponse[0],
          default_billable: false,
        };
        component.fg.controls.project.markAsDirty();
        component.fg.controls.project.setValue(projectWithNonBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should set billable to true when project with default_billable true is selected', fakeAsync(() => {
        component.showBillable = true;
        component.recentCategoriesOriginal = [];
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.setupFilteredCategories();
        tick(500);

        const projectWithBillable = {
          ...expectedProjectsResponse[0],
          default_billable: true,
        };
        component.fg.controls.project.setValue(projectWithBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeTrue();
      }));

      it('should set billable to false when project with default_billable false is selected', fakeAsync(() => {
        component.showBillable = true;
        component.recentCategoriesOriginal = [];
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.setupFilteredCategories();
        tick(500);

        const projectWithNonBillable = {
          ...expectedProjectsResponse[0],
          default_billable: false,
        };
        component.fg.controls.project.setValue(projectWithNonBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should set billable to false when project with default_billable null is selected', fakeAsync(() => {
        component.showBillable = true;
        component.recentCategoriesOriginal = [];
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.setupFilteredCategories();
        tick(500);

        const projectWithNullBillable = {
          ...expectedProjectsResponse[0],
          default_billable: null,
        };
        component.fg.controls.project.setValue(projectWithNullBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should set billable to false when showBillable is false regardless of project default_billable', fakeAsync(() => {
        component.showBillable = false;
        component.recentCategoriesOriginal = [];
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        component.setupFilteredCategories();
        tick(500);

        const projectWithBillable = {
          ...expectedProjectsResponse[0],
          default_billable: true,
        };
        component.fg.controls.project.setValue(projectWithBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should not override saved expense billable with project default_billable in edit mode', fakeAsync(() => {
        component.mode = 'edit';
        component.showBillable = true;
        component.recentCategoriesOriginal = [];
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);

        component.expenseLevelBillable = false;
        component.fg.controls.billable.setValue(null);

        component.setupFilteredCategories();
        tick(500);

        const projectWithBillable = {
          ...expectedProjectsResponse[0],
          default_billable: true,
        };
        component.fg.controls.project.setValue(projectWithBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should set billable from project default_billable in edit mode when billable is unset', fakeAsync(() => {
        component.mode = 'edit';
        component.showBillable = true;
        component.recentCategoriesOriginal = [];
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);

        component.fg.controls.billable.setValue(null);

        component.setupFilteredCategories();
        tick(500);

        const projectWithBillable = {
          ...expectedProjectsResponse[0],
          default_billable: true,
        };
        component.fg.controls.project.setValue(projectWithBillable);
        fixture.detectChanges();
        tick(500);

        expect(component.fg.controls.billable.value).toBeTrue();
      }));

      it('should filter recentCategories based on project_org_category_ids when restrictions are enabled', fakeAsync(() => {
        component.isProjectCategoryRestrictionsEnabled$ = of(true);
        component.etxn$ = of(unflattenedTxnData);
        component.activeCategories$ = of(sortedCategory);
        component.recentCategoriesOriginal = recentUsedCategoriesRes;
        projectsService.getbyId.and.returnValue(of(apiV2ResponseMultiple.data[0]));
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);

        const projectWithRestrictions = {
          project_org_category_ids: [89469, 16576],
        };

        const expectedRecentCategories = recentUsedCategoriesRes.filter((category) =>
          projectWithRestrictions.project_org_category_ids.includes(category.value.id),
        );

        component.setupFilteredCategories();
        tick(500);

        component.fg.controls.project.setValue(projectWithRestrictions);
        fixture.detectChanges();
        tick(500);

        expect(component.recentCategories).toEqual(expectedRecentCategories);
      }));

      it('should set recentCategories to undefined if recentCategoriesOriginal is not present when restrictions are enabled', fakeAsync(() => {
        component.isProjectCategoryRestrictionsEnabled$ = of(true);
        component.etxn$ = of(unflattenedTxnData);
        component.activeCategories$ = of(sortedCategory);
        component.recentCategoriesOriginal = null;
        projectsService.getbyId.and.returnValue(of(apiV2ResponseMultiple.data[0]));
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);

        const projectWithRestrictions = {
          project_org_category_ids: [89469, 16576],
        };

        component.setupFilteredCategories();
        tick(500);

        component.fg.controls.project.setValue(projectWithRestrictions);
        fixture.detectChanges();
        tick(500);

        expect(component.recentCategories).toBeUndefined();
      }));
    });

    describe('updateFormForExpenseFields(): billable defaulting', () => {
      beforeEach(() => {
        component.etxn$ = of(unflattenedExpWoProject);
        expenseFieldsService.getDefaultTxnFieldValues.and.returnValue({});
      });

      it('should set billable to false when billable is disabled at org level', fakeAsync(() => {
        component.fg.controls.project.setValue({
          ...expectedProjectsResponse[0],
          default_billable: true,
        });
        component.fg.controls.billable.setValue(true);

        // Using 'as any' to pass partial ExpenseField for testing
        component.updateFormForExpenseFields(of({ billable: { is_enabled: false } } as any));
        tick(1);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should set billable to false when project is null even if billable is enabled at org level', fakeAsync(() => {
        component.fg.controls.project.setValue(null);
        component.fg.controls.billable.setValue(true);

        // Using 'as any' to pass partial ExpenseField for testing
        component.updateFormForExpenseFields(of({ billable: { is_enabled: true } } as any));
        tick(1);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should use project default_billable when user changes project (project control is dirty)', fakeAsync(() => {
        component.showBillable = true;
        component.expenseLevelBillable = false;

        component.fg.controls.project.setValue({
          ...expectedProjectsResponse[0],
          default_billable: true,
        });
        component.fg.controls.project.markAsDirty();
        component.fg.controls.billable.setValue(false);

        // Using 'as any' to pass partial ExpenseField for testing
        component.updateFormForExpenseFields(of({ billable: { is_enabled: true } } as any));
        tick(1);

        expect(component.fg.controls.billable.value).toBeTrue();
      }));

      it('should use expenseLevelBillable when project is not dirty', fakeAsync(() => {
        component.showBillable = true;
        component.expenseLevelBillable = true;

        component.fg.controls.project.setValue({
          ...expectedProjectsResponse[0],
          default_billable: false,
        });
        component.fg.controls.billable.setValue(false);

        // Using 'as any' to pass partial ExpenseField for testing
        component.updateFormForExpenseFields(of({ billable: { is_enabled: true } } as any));
        tick(1);

        expect(component.fg.controls.billable.value).toBeTrue();
      }));

      it('should not override billable when user has interacted with billable control (billable control is dirty)', fakeAsync(() => {
        component.showBillable = true;
        component.expenseLevelBillable = false;

        component.fg.controls.project.setValue({
          ...expectedProjectsResponse[0],
          default_billable: false,
        });
        component.fg.controls.billable.setValue(true);
        component.fg.controls.billable.markAsDirty();

        // Using 'as any' to pass partial ExpenseField for testing
        component.updateFormForExpenseFields(of({ billable: { is_enabled: true } } as any));
        tick(1);

        expect(component.fg.controls.billable.value).toBeTrue();
      }));

      it('should set billable to false when project default_billable is null and user changes project', fakeAsync(() => {
        component.showBillable = true;
        component.expenseLevelBillable = true;

        component.fg.controls.project.setValue({
          ...expectedProjectsResponse[0],
          default_billable: null,
        });
        component.fg.controls.project.markAsDirty();
        component.fg.controls.billable.setValue(true);

        // Using 'as any' to pass partial ExpenseField for testing
        component.updateFormForExpenseFields(of({ billable: { is_enabled: true } } as any));
        tick(1);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));

      it('should set billable to false when expenseLevelBillable and project default_billable are null', fakeAsync(() => {
        component.showBillable = true;
        component.expenseLevelBillable = null;

        component.fg.controls.project.setValue({
          ...expectedProjectsResponse[0],
          default_billable: null,
        });
        component.fg.controls.billable.setValue(true);

        // Using 'as any' to pass partial ExpenseField for testing
        component.updateFormForExpenseFields(of({ billable: { is_enabled: true } } as any));
        tick(1);

        expect(component.fg.controls.billable.value).toBeFalse();
      }));
    });

    describe('setupCustomFields():', () => {
      it('should setup custom fields using category', fakeAsync(() => {
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        component.mode = 'add';
        spyOn(component, 'getCategoryOnAdd').and.returnValue(of(orgCategoryData));
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomProperties);
        component.isConnected$ = of(true);
        component.isLoading = false;
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
          expect(categoriesService.getCategoryById).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.category_id);
          done();
        });
      });

      it('should return null if category is not present in expense', (done) => {
        component.etxn$ = of({ ...unflattenedTxnData, tx: { ...unflattenedTxnData.tx, category_id: null } });
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
        component.activeCategories$ = of(sortedCategory);
        projectsService.getbyId.and.returnValue(of(expectedProjectsResponse[0]));
        fixture.detectChanges();

        component.getSelectedProjects().subscribe((res) => {
          expect(res).toEqual(expectedProjectsResponse[0]);
          expect(projectsService.getbyId).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.project_id, sortedCategory);
          done();
        });
      });

      it('should return project from the default ID specified in org', (done) => {
        component.etxn$ = of(unflattenedExpWoProject);
        component.activeCategories$ = of(sortedCategory);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.employeeSettings$ = of(employeeSettingsData);
        projectsService.getbyId.and.returnValue(of(expectedProjectsResponse[0]));
        fixture.detectChanges();

        component.getSelectedProjects().subscribe((res) => {
          expect(res).toEqual(expectedProjectsResponse[0]);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          expect(projectsService.getbyId).toHaveBeenCalledOnceWith(
            employeeSettingsData.default_project_id,
            sortedCategory,
          );
          done();
        });
      });

      it('should return null if no project ID is available', (done) => {
        component.etxn$ = of(unflattenedExpWoProject);
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.employeeSettings$ = of(employeeSettingsWoDefaultProject);

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
          expect(res).toEqual(expectedReportsPaginated[0]);
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
          expect(res).toEqual(expectedReportsPaginated[1]);
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
          accountOptionData1,
        );
        done();
      });
    });

    describe('getDefaultPaymentModes():', () => {
      it('should get default payment modes', (done) => {
        component.paymentModes$ = of(accountOptionData1);
        component.employeeSettings$ = of(employeeSettingsData);
        component.isCreatedFromCCC = true;
        platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        fixture.detectChanges();

        component.getDefaultPaymentModes().subscribe((res) => {
          expect(res).toEqual(accountOptionData1[0].value);
          done();
        });
      });

      it('should return the first item in account options if expense was not created from CCC', (done) => {
        component.paymentModes$ = of(accountOptionData1);
        component.employeeSettings$ = of(employeeSettingsData2);
        component.isCreatedFromCCC = false;
        platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData2));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        fixture.detectChanges();

        component.getDefaultPaymentModes().subscribe((res) => {
          expect(res).toEqual(accountOptionData1[0].value);
          done();
        });
      });
    });

    it('getRecentProjects(): should get recent projects', (done) => {
      component.activeCategories$ = of(sortedCategory);
      component.recentlyUsedValues$ = of(recentlyUsedRes);
      component.isProjectCategoryRestrictionsEnabled$ = of(true);
      component.etxn$ = of(unflattenedTxnWithCategory);
      authService.getEou.and.resolveTo(apiEouRes);
      recentlyUsedItemsService.getRecentlyUsedProjects.and.returnValue(of(recentlyUsedProjectRes));
      fixture.detectChanges();

      component.getRecentProjects().subscribe((res) => {
        expect(res).toEqual(recentlyUsedProjectRes);
        expect(authService.getEou).toHaveBeenCalledOnceWith();
        expect(recentlyUsedItemsService.getRecentlyUsedProjects).toHaveBeenCalledOnceWith({
          recentValues: recentlyUsedRes,
          eou: apiEouRes,
          categoryIds: [`${unflattenedTxnWithCategory.tx.category_id}`],
          isProjectCategoryRestrictionsEnabled: true,
          activeCategoryList: sortedCategory,
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
        component.platformExpense$ = of(platformExpenseWithExtractedData);
        fixture.detectChanges();

        component.getReceiptCount().subscribe((res) => {
          expect(res).toEqual(1);
          done();
        });
      });

      it('should return 0 if no receipts are returned', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        component.platformExpense$ = of(platformExpenseData);
        fixture.detectChanges();

        component.getReceiptCount().subscribe((res) => {
          expect(res).toEqual(0);
          done();
        });
      });

      it('should return 0 if new expense is being created', (done) => {
        component.etxn$ = of({ tx: {} });
        fixture.detectChanges();

        component.getReceiptCount().subscribe((res) => {
          expect(res).toEqual(0);
          expect(expensesService.getExpenseById).not.toHaveBeenCalled();
          done();
        });
      });
    });

    describe('setupFormInit():', () => {
      it('should setup form', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedReportsPaginated[0]));
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
        component.etxn$ = of(unflattenedTxnData);
        component.taxGroups$ = of(taxGroupData);
        component.employeeSettings$ = of(employeeSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of(recentUsedCategoriesRes);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);

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
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: recentUsedCategoriesRes,
          etxn: unflattenedTxnData,
          category: orgCategoryData,
        });
      }));

      //TODO: Reduce the number of test by moving it to beforeEach
      it('should setup form and set payment mode as default payment mode if selectedPaymentMode is undefined', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedReportsPaginated[0]));
        spyOn(component, 'getSelectedPaymentModes').and.returnValue(of(undefined));
        spyOn(component, 'getRecentCostCenters').and.returnValue(of(recentlyUsedCostCentersRes));
        spyOn(component, 'getRecentProjects').and.returnValue(of(recentlyUsedProjectRes));
        spyOn(component, 'getRecentCurrencies').and.returnValue(of(recentCurrencyRes));
        spyOn(component, 'getDefaultPaymentModes').and.returnValue(of(accountOptionData1[1].value));
        spyOn(component, 'getSelectedCostCenters').and.returnValue(of(costCentersData[0]));
        spyOn(component, 'getReceiptCount').and.returnValue(of(1));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        component.etxn$ = of(unflattenedTxnData);
        component.taxGroups$ = of(taxGroupData);
        component.employeeSettings$ = of(employeeSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of(recentUsedCategoriesRes);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
        spyOn(component, 'getAutofillCategory');
        customFieldsService.standardizeCustomFields.and.returnValue(txnCustomProperties);
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        fixture.detectChanges();

        component.setupFormInit();
        tick(1000);

        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: recentUsedCategoriesRes,
          etxn: unflattenedTxnData,
          category: orgCategoryData,
        });
        expect(component.fg.value.paymentMode).toEqual(accountOptionData1[1].value);
      }));

      it('should setup form if custom field has a date type field', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedReportsPaginated[0]));
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
        component.etxn$ = of({
          ...unflattenedTxnData,
          tx: {
            ...unflattenedTxnData.tx,
            custom_properties: [
              {
                name: 'Arrival',
                value: '2021-06-01',
              },
            ],
          },
        });
        component.taxGroups$ = of(taxGroupData);
        component.employeeSettings$ = of(employeeSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of(recentUsedCategoriesRes);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
        spyOn(component, 'getAutofillCategory');
        customFieldsService.standardizeCustomFields.and.returnValue([
          ...txnCustomProperties,
          {
            type: 'DATE',
            name: 'Arrival',
            value: '2023-06-01',
          },
        ]);
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        fixture.detectChanges();

        component.setupFormInit();
        tick(1000);
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: recentUsedCategoriesRes,
          etxn: {
            ...unflattenedTxnData,
            tx: {
              ...unflattenedTxnData.tx,
              custom_properties: [
                {
                  name: 'Arrival',
                  value: '2021-06-01',
                },
              ],
            },
          },
          category: orgCategoryData,
        });
      }));

      it('should setup up form for a draft expense with policy violation', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedReportsPaginated[0]));
        spyOn(component, 'getSelectedPaymentModes').and.returnValue(of(unflattenedAccount1Data));
        spyOn(component, 'getRecentCostCenters').and.returnValue(of(recentlyUsedCostCentersRes));
        spyOn(component, 'getRecentProjects').and.returnValue(of(recentlyUsedProjectRes));
        spyOn(component, 'getRecentCurrencies').and.returnValue(of(recentCurrencyRes));
        spyOn(component, 'getDefaultPaymentModes').and.returnValue(of(accountOptionData1[1].value));
        spyOn(component, 'getSelectedCostCenters').and.returnValue(of(costCentersData[0]));
        spyOn(component, 'getReceiptCount').and.returnValue(of(1));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        orgSettingsService.get.and.returnValue(of(orgSettingsWithProjectCategoryRestrictions));
        customInputsService.getAll.and.returnValue(of(expenseFieldResponse));
        component.etxn$ = of(unflattenedExp2);
        component.taxGroups$ = of(taxGroupData);
        component.employeeSettings$ = of(employeeSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of(recentUsedCategoriesRes);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
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
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.parseFile).toHaveBeenCalledTimes(1);
        expect(component.attachedReceiptsCount).toEqual(1);
      }));

      it('setup form without currency and amount', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedReportsPaginated[0]));
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
        component.etxn$ = of(setupFormExpenseWoCurrency);
        component.taxGroups$ = of(taxGroupData);
        component.employeeSettings$ = of(employeeSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of([]);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
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
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, undefined);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: [],
          etxn: setupFormExpenseWoCurrency,
          category: orgCategoryData,
        });
      }));

      it('setup form without amount and same currency as home currency', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedReportsPaginated[0]));
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
        component.etxn$ = of(setupFormExpenseWoCurrency2);
        component.taxGroups$ = of(taxGroupData);
        component.employeeSettings$ = of(employeeSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of([]);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
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
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: [],
          etxn: setupFormExpenseWoCurrency2,
          category: orgCategoryData,
        });
      }));

      it('setup form for an expense with different currencies and DRAFT state', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedReportsPaginated[0]));
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
        component.etxn$ = of(setupFormExpenseWoCurrency3);
        component.taxGroups$ = of(taxGroupData);
        component.employeeSettings$ = of(employeeSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of([]);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
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
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: [],
          etxn: setupFormExpenseWoCurrency3,
          category: orgCategoryData,
        });
      }));

      it('setup form for an expense with different currencies and DRAFT state if recently used categories are undefined', fakeAsync(() => {
        spyOn(component, 'getSelectedProjects').and.returnValue(of(expectedProjectsResponse[0]));
        spyOn(component, 'getSelectedCategory').and.returnValue(of(orgCategoryData));
        spyOn(component, 'getSelectedReport').and.returnValue(of(expectedReportsPaginated[0]));
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
        component.etxn$ = of(setupFormExpenseWoCurrency3);
        component.taxGroups$ = of(taxGroupData);
        component.employeeSettings$ = of(employeeSettingsData);
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedProjects$ = of(recentlyUsedProjectRes);
        component.recentlyUsedCurrencies$ = of(recentCurrencyRes);
        component.recentlyUsedCostCenters$ = of(recentlyUsedCostCentersRes);
        component.recentlyUsedCategories$ = of(undefined);
        component.selectedCostCenter$ = new BehaviorSubject<CostCenter>(costCentersData[0]);
        spyOn(component, 'getAutofillCategory');
        customFieldsService.standardizeCustomFields.and.returnValue(TxnCustomProperties3);
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        fixture.detectChanges();

        component.setupFormInit();
        tick(1000);

        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledTimes(1);
        expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
        expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: undefined,
          etxn: setupFormExpenseWoCurrency3,
          category: orgCategoryData,
        });
      }));
    });

    it('getProjectDependentFields(): should get project dependent fields', () => {
      component.fg = formBuilder.group({
        project_dependent_fields: [],
      });

      component.fg.controls.project_dependent_fields.setValue(txnCustomPropertiesData);

      const result = component.getProjectDependentFields();
      expect(result).toEqual(txnCustomPropertiesData);
    });

    it('getCostCenterDependentFields(): should get cost center dependent fields', () => {
      component.fg = formBuilder.group({
        cost_center_dependent_fields: [],
      });

      component.fg.controls.cost_center_dependent_fields.setValue(txnCustomPropertiesData);

      const result = component.getCostCenterDependentFields();
      expect(result).toEqual(txnCustomPropertiesData);
    });

    it('getCustomFields(): should get custom fields data', () => {
      component.dependentFields$ = of(dependentCustomFields2);
      customFieldsService.standardizeCustomFields.and.returnValue(txnCustomProperties2);
      spyOn(component, 'getProjectDependentFields').and.returnValue([]);
      spyOn(component, 'getCostCenterDependentFields').and.returnValue([]);

      component.customInputs$ = of(txnCustomPropertiesData);
      component.fg = formBuilder.group({
        project_dependent_fields: [],
        custom_inputs: [],
        cost_center_dependent_fields: [],
      });
      component.fg.controls.custom_inputs.setValue(projectDependentFields);
      fixture.detectChanges();

      component.getCustomFields().subscribe(() => {
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], dependentCustomFields2);
        expect(component.getProjectDependentFields).toHaveBeenCalledTimes(1);
        expect(component.getCostCenterDependentFields).toHaveBeenCalledTimes(1);
      });
    });

    describe('ionViewWillEnter():', () => {
      beforeEach(() => {
        categoriesService.getAll.and.returnValue(of(orgCategoryData1));
      });

      it('should setup class variables', (done) => {
        component.isConnected$ = of(true);
        component.txnFields$ = of(txnFieldsData2);
        component.filteredCategories$ = of();
        component.platformExpense$ = of(expenseData);

        spyOn(component, 'initClassObservables').and.returnValue(null);
        tokenService.getClusterDomain.and.resolveTo('domain');
        categoriesService.getSystemCategories.and.returnValue(['Bus', 'Airlines', 'Lodging', 'Train']);
        categoriesService.getBreakfastSystemCategories.and.returnValue(['Lodging']);
        reportService.getAutoSubmissionReportName.and.returnValue(of('Jun #23'));
        spyOn(component, 'setupSelectedProjectObservable');
        spyOn(component, 'setupSelectedCostCenterObservable');
        spyOn(component, 'getCCCpaymentMode');
        spyOn(component, 'setUpTaxCalculations');
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        accountsService.getMyAccounts.and.returnValue(of(multiplePaymentModesData));
        spyOn(component, 'setupNetworkWatcher');
        taxGroupService.get.and.returnValue(of(taxGroupData));
        recentlyUsedItemsService.getRecentlyUsed.and.returnValue(of(recentlyUsedRes));
        component.individualProjectIds$ = of([]);
        component.isIndividualProjectsEnabled$ = of(false);
        projectsService.getProjectCount.and.returnValue(of(2));
        spyOn(component, 'setupCostCenters');
        storageService.get.and.resolveTo(true);
        spyOn(component, 'setupBalanceFlag');
        expenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));
        spyOn(component, 'getNewExpenseObservable').and.returnValue(of(expectedExpenseObservable));
        spyOn(component, 'getEditExpenseObservable').and.returnValue(of(expectedUnflattendedTxnData1));
        fileService.getReceiptsDetails.and.returnValue({
          type: 'pdf',
          thumbnail: 'img/fy-pdf.svg',
        });
        spenderFileService.generateUrlsBulk.and.returnValue(of(generateUrlsBulkData1));
        spyOn(component, 'getReceiptDetails').and.returnValue({
          type: 'jpeg',
          thumbnail: 'thumbnail',
        });
        spyOn(component, 'getPaymentModes');
        spyOn(component, 'setupFilteredCategories');
        spyOn(component, 'setupExpenseFields');

        platformReportService.getAllReportsByParams.and.returnValue(of(expectedReportsPaginated));
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
        expect(component.getCCCpaymentMode).toHaveBeenCalledTimes(1);
        expect(component.setUpTaxCalculations).toHaveBeenCalledTimes(1);

        expect(orgSettingsService.get).toHaveBeenCalledTimes(2);
        expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(accountsService.getMyAccounts).toHaveBeenCalledTimes(1);

        component.isRTFEnabled$.subscribe((isRTFEnabled) => {
          expect(isRTFEnabled).toBeTrue();
        });

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
        expect(expenseCommentService.getTransformedComments).toHaveBeenCalledTimes(1);

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

        component.platformExpense$.subscribe((expense) => {
          expect(expense).toEqual(expenseData);
        });

        expect(component.pendingTransactionAllowedToReportAndSplit).toBeTrue();

        component.attachments$.subscribe((res) => {
          expect(res).toEqual(receiptInfoData2);
          expect(spenderFileService.generateUrlsBulk).toHaveBeenCalledOnceWith(expenseData.file_ids);
        });

        expect(fileService.getReceiptsDetails).toHaveBeenCalledOnceWith(
          generateUrlsBulkData1[0].name,
          generateUrlsBulkData1[0].download_url,
        );

        component.flightJourneyTravelClassOptions$.subscribe((res) => {
          expect(res).toBeUndefined();
        });

        expect(component.setupFilteredCategories).toHaveBeenCalledTimes(1);
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

        expect(platformReportService.getAllReportsByParams).toHaveBeenCalledOnceWith({
          state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        });
        expect(component.setupFormInit).toHaveBeenCalledTimes(1);
        expect(component.setupCustomFields).toHaveBeenCalledTimes(1);
        expect(component.clearCategoryOnValueChange).toHaveBeenCalledTimes(1);
        expect(component.getActionSheetOptions).toHaveBeenCalledTimes(1);
        expect(component.getDuplicateExpenses).toHaveBeenCalledTimes(1);
        expect(component.getPolicyDetails).toHaveBeenCalledTimes(1);
        done();
      });
      // TODO: need to figure out ` TypeError: You provided 'undefined' where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`
      xit('should set flightJourneyTravelClassOptions$', (done) => {
        component.isConnected$ = of(true);
        component.txnFields$ = of(txnFieldsFlightData);
        component.filteredCategories$ = of();

        spyOn(component, 'initClassObservables').and.returnValue(null);
        tokenService.getClusterDomain.and.resolveTo('domain');
        categoriesService.getSystemCategories.and.returnValue(['Bus', 'Airlines', 'Lodging', 'Train']);
        categoriesService.getBreakfastSystemCategories.and.returnValue(['Lodging']);
        reportService.getAutoSubmissionReportName.and.returnValue(of('Jun #23'));
        spyOn(component, 'setupSelectedProjectObservable');
        spyOn(component, 'setupSelectedCostCenterObservable');
        spyOn(component, 'getCCCpaymentMode');
        spyOn(component, 'setUpTaxCalculations');
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        accountsService.getMyAccounts.and.returnValue(of(multiplePaymentModesData));
        spyOn(component, 'setupNetworkWatcher');
        taxGroupService.get.and.returnValue(of(taxGroupData));
        recentlyUsedItemsService.getRecentlyUsed.and.returnValue(of(recentlyUsedRes));
        component.individualProjectIds$ = of([]);
        component.isIndividualProjectsEnabled$ = of(false);
        projectsService.getProjectCount.and.returnValue(of(2));
        spyOn(component, 'setupCostCenters');
        storageService.get.and.resolveTo(true);
        spyOn(component, 'setupBalanceFlag');
        expenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));
        spyOn(component, 'getNewExpenseObservable').and.returnValue(of(expectedExpenseObservable));
        spyOn(component, 'getEditExpenseObservable').and.returnValue(of(expectedUnflattendedTxnData1));
        spenderFileService.generateUrlsBulk.and.returnValue(of(generateUrlsBulkData1));
        fileService.downloadUrl.and.returnValue(of('url'));
        spyOn(component, 'getReceiptDetails').and.returnValue({
          type: 'jpeg',
          thumbnail: 'thumbnail',
        });
        spyOn(component, 'getPaymentModes');
        spyOn(component, 'setupFilteredCategories');
        spyOn(component, 'setupExpenseFields');

        platformReportService.getAllReportsByParams.and.returnValue(of(expectedReportsPaginated));
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
        component.flightJourneyTravelClassOptions$.subscribe((res) => {
          expect(res).toEqual([
            {
              label: 'economy',
              value: 'economy',
            },
            {
              label: 'business',
              value: 'business',
            },
          ]);
          done();
        });
      });

      it('should setup class variables for offline mode', (done) => {
        component.isConnected$ = of(false);
        component.txnFields$ = of(expenseFieldObjData);
        component.filteredCategories$ = of(categorieListRes);
        component.etxn$ = of(unflattenedExpenseWithCCCGroupId2);
        activatedRoute.snapshot.params.bankTxn = JSON.stringify(expectedECccResponse[0]);
        activatedRoute.snapshot.params.id = null;

        spyOn(component, 'initClassObservables').and.returnValue(null);
        tokenService.getClusterDomain.and.resolveTo('domain');
        categoriesService.getSystemCategories.and.returnValue(['Bus', 'Airlines', 'Lodging', 'Train']);
        categoriesService.getBreakfastSystemCategories.and.returnValue(['Lodging']);
        reportService.getAutoSubmissionReportName.and.returnValue(of('Jun #23'));
        spyOn(component, 'setupSelectedProjectObservable');
        spyOn(component, 'setupSelectedCostCenterObservable');
        spyOn(component, 'getCCCpaymentMode');
        spyOn(component, 'setUpTaxCalculations');

        orgSettingsService.get.and.returnValue(of(orgSettingsWoTaxAndRtf));
        platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        accountsService.getMyAccounts.and.returnValue(of(multiplePaymentModesData));
        spyOn(component, 'setupNetworkWatcher');
        taxGroupService.get.and.returnValue(of(taxGroupData));
        recentlyUsedItemsService.getRecentlyUsed.and.returnValue(of(recentlyUsedRes));
        component.individualProjectIds$ = of([]);
        component.isIndividualProjectsEnabled$ = of(true);
        projectsService.getProjectCount.and.returnValue(of(2));
        spyOn(component, 'setupCostCenters');
        storageService.get.and.resolveTo(true);
        spyOn(component, 'setupBalanceFlag');
        expenseCommentService.getTransformedComments.and.returnValue(of(getEstatusApiResponse));
        spyOn(component, 'getNewExpenseObservable').and.returnValue(of(expectedExpenseObservable));
        spyOn(component, 'getEditExpenseObservable').and.returnValue(of(expectedUnflattendedTxnData1));
        expensesService.getSplitExpenses.and.returnValue(of(splitExpensesData));
        spenderFileService.generateUrlsBulk.and.returnValue(of(generateUrlsBulkData1));
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

        platformReportService.getAllReportsByParams.and.returnValue(of(expectedReportsPaginated));
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
        expect(component.getCCCpaymentMode).toHaveBeenCalledTimes(1);
        expect(component.setUpTaxCalculations).toHaveBeenCalledTimes(1);

        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(accountsService.getMyAccounts).toHaveBeenCalledTimes(1);

        component.isRTFEnabled$.subscribe((isRTFEnabled) => {
          expect(isRTFEnabled).toBeFalse();
        });

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
        expect(expenseCommentService.getTransformedComments).toHaveBeenCalledTimes(1);

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
          expect(res).toBeFalse();
        });

        expect(component.platformExpense$).toBeUndefined();
        expect(component.pendingTransactionAllowedToReportAndSplit).toBeTrue();
        expect(expensesService.getExpenseById).not.toHaveBeenCalled();

        component.attachments$.subscribe((res) => {
          expect(res).toEqual([]);
        });

        expect(spenderFileService.generateUrlsBulk).not.toHaveBeenCalled();
        expect(spenderFileService.generateUrlsBulk).not.toHaveBeenCalled();
        expect(fileService.getReceiptsDetails).not.toHaveBeenCalled();

        component.flightJourneyTravelClassOptions$.subscribe((res) => {
          expect(res).toBeUndefined();
        });

        expect(component.setupFilteredCategories).toHaveBeenCalledTimes(1);
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

        component.isAmountCapped$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isAmountDisabled$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        component.isCriticalPolicyViolated$.subscribe((res) => {
          expect(res).toBeFalse();
        });

        expect(platformReportService.getAllReportsByParams).toHaveBeenCalledOnceWith({
          state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
        });
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
