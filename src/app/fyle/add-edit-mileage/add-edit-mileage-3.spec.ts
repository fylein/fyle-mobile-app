import { TitleCasePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, Observable, Subject, Subscription, of, throwError } from 'rxjs';
import { costCentersData } from 'src/app/core/mock-data/cost-centers.data';
import { defaultTxnFieldValuesData4 } from 'src/app/core/mock-data/default-txn-field-values.data';
import { expenseFieldsMapResponse, txnFieldsData } from 'src/app/core/mock-data/expense-fields-map.data';
import { expensePolicyData, expensePolicyDataWoData } from 'src/app/core/mock-data/expense-policy.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { locationData1, locationData2 } from 'src/app/core/mock-data/location.data';
import { orgCategoryListItemData1 } from 'src/app/core/mock-data/org-category-list-item.data';
import {
  mileageCategories2,
  orgCategoryData,
  sortedCategory,
  transformedOrgCategories,
} from 'src/app/core/mock-data/org-category.data';
import { outboxQueueData1 } from 'src/app/core/mock-data/outbox-queue.data';
import { expectedErpt } from 'src/app/core/mock-data/report-unflattened.data';
import { createExpenseProperties4, editExpenseProperties1 } from 'src/app/core/mock-data/track-expense-properties.data';
import { txnStatusData } from 'src/app/core/mock-data/transaction-status.data';
import {
  editTransaction2,
  editTransaction3,
  editTransaction4,
  editTransaction5,
  editTransaction6,
  editUnflattenedTransaction,
} from 'src/app/core/mock-data/transaction.data';
import { txnCustomPropertiesData4 } from 'src/app/core/mock-data/txn-custom-properties.data';
import {
  expenseTrackCreate,
  newExpFromFg,
  newExpenseMileageData2,
  unflattendedTxnWithPolicyAmount,
  unflattenedTxnData,
  unflattenedTxnDataWithReportID,
  unflattenedTxnDataWithReportID2UserReview,
  unflattenedTxnDataWithSubCategory,
  unflattenedTxnWithTrackData,
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
import { expectedProjectsResponse } from 'src/app/core/test-data/projects.spec.data';
import { AddEditMileagePage } from './add-edit-mileage.page';

export function TestCases3(getTestBed) {
  return describe('AddEditMileage-3', () => {
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

    describe('addExpense():', () => {
      it('should add expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomPropertiesData4));
        spyOn(component, 'getCalculatedDistance').and.returnValue(of('10'));
        component.isConnected$ = of(true);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnData));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyDataWoData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        authService.getEou.and.resolveTo(apiEouRes);
        spyOn(component, 'trackCreateExpense');
        spyOn(component, 'getFormValues').and.returnValue({
          report: expectedErpt[0],
        });
        transactionOutboxService.addEntryAndSync.and.resolveTo(outboxQueueData1[0]);
        fixture.detectChanges();

        component.addExpense('SAVE_MILEAGE').subscribe((res) => {
          expect(res).toEqual(unflattenedTxnData);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.getCalculatedDistance).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackCreateExpense).toHaveBeenCalledTimes(1);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(transactionOutboxService.addEntryAndSync).toHaveBeenCalledOnceWith(
            unflattenedTxnData.tx,
            unflattenedTxnData.dataUrls as any,
            [],
            expectedErpt[0].rp.id
          );
          done();
        });
      });

      it('should add expense with critical policy violation', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomPropertiesData4));
        spyOn(component, 'getCalculatedDistance').and.returnValue(of('10'));
        component.isConnected$ = of(true);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnData));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyDataWoData));
        policyService.getCriticalPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        authService.getEou.and.resolveTo(apiEouRes);
        spyOn(component, 'criticalPolicyViolationHandler').and.returnValue(
          of({
            etxn: unflattenedTxnData,
            comment: null,
          })
        );
        spyOn(component, 'trackCreateExpense');
        spyOn(component, 'getFormValues').and.returnValue(null);
        transactionOutboxService.addEntryAndSync.and.resolveTo(outboxQueueData1[0]);
        fixture.detectChanges();

        component.addExpense('SAVE_EXPENSE').subscribe((res) => {
          expect(res).toEqual(unflattenedTxnData);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.getCalculatedDistance).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.criticalPolicyViolationHandler).toHaveBeenCalledOnceWith({
            type: 'criticalPolicyViolations',
            policyViolations: [
              'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
            ],
            etxn: unflattenedTxnData,
          });
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackCreateExpense).toHaveBeenCalledTimes(1);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(transactionOutboxService.addEntryAndSync).toHaveBeenCalledOnceWith(
            unflattenedTxnData.tx,
            unflattenedTxnData.dataUrls as any,
            [],
            undefined
          );
          done();
        });
      });

      it('should add expense with policy violation and comments', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomPropertiesData4));
        spyOn(component, 'getCalculatedDistance').and.returnValue(of('10'));
        component.isConnected$ = of(true);
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattendedTxnWithPolicyAmount));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        authService.getEou.and.resolveTo(apiEouRes);
        spyOn(component, 'policyViolationHandler').and.returnValue(
          of({
            etxn: unflattendedTxnWithPolicyAmount,
            comment: 'A comment',
          })
        );
        spyOn(component, 'trackCreateExpense');
        spyOn(component, 'getFormValues').and.returnValue(null);
        transactionOutboxService.addEntryAndSync.and.resolveTo(outboxQueueData1[0]);
        fixture.detectChanges();

        component.addExpense('SAVE_EXPENSE').subscribe((res) => {
          expect(res).toEqual(unflattendedTxnWithPolicyAmount);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.getCalculatedDistance).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.policyViolationHandler).toHaveBeenCalledOnceWith({
            type: 'policyViolations',
            policyAction: expensePolicyData.data.final_desired_state,
            policyViolations: [
              'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
            ],
            etxn: unflattendedTxnWithPolicyAmount,
          });
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackCreateExpense).toHaveBeenCalledTimes(1);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(transactionOutboxService.addEntryAndSync).toHaveBeenCalledOnceWith(
            unflattendedTxnWithPolicyAmount.tx,
            unflattendedTxnWithPolicyAmount.dataUrls as any,
            ['A comment'],
            undefined
          );
          done();
        });
      });

      it('should add expense in offline mode', (done) => {
        component.isConnected$ = of(false);
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomPropertiesData4));
        spyOn(component, 'getCalculatedDistance').and.returnValue(of('10'));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnData));
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyDataWoData));
        spyOn(component, 'trackCreateExpense');
        authService.getEou.and.resolveTo(apiEouRes);
        spyOn(component, 'getFormValues').and.returnValue({
          report: expectedErpt[0],
        });
        transactionOutboxService.addEntryAndSync.and.resolveTo(outboxQueueData1[0]);
        fixture.detectChanges();

        component.addExpense('SAVE_MILEAGE').subscribe((res) => {
          expect(res).toEqual(unflattenedTxnData);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.getCalculatedDistance).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackCreateExpense).toHaveBeenCalledTimes(1);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(transactionOutboxService.addEntryAndSync).toHaveBeenCalledOnceWith(
            unflattenedTxnData.tx,
            unflattenedTxnData.dataUrls as any,
            [],
            expectedErpt[0].rp.id
          );
          done();
        });
      });

      it('should throw an error if expense cannot be generated', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomPropertiesData4));
        spyOn(component, 'getCalculatedDistance').and.returnValue(of('10'));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(throwError(() => new Error('error')));

        component.addExpense('SAVE_MILEAGE').subscribe({
          next: () => {
            expect(component.getCustomFields).toHaveBeenCalledTimes(1);
            expect(component.getCalculatedDistance).toHaveBeenCalledTimes(1);
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
              component.etxn$,
              jasmine.any(Observable),
              jasmine.any(Observable)
            );
          },
          error: (err) => {
            expect(err).toBeTruthy();
          },
        });
        done();
      });
    });

    describe('setupFilteredCategories():', () => {
      it('should set up filtered categories', fakeAsync(() => {
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        spyOn(component, 'getFormValues').and.returnValue({
          sub_category: orgCategoryData,
        });

        component.setupFilteredCategories(of(sortedCategory));
        tick(500);

        component.fg.controls.project.setValue(expectedProjectsResponse[0]);
        fixture.detectChanges();

        tick(500);

        component.filteredCategories$.subscribe((res) => {
          expect(res).toEqual(orgCategoryListItemData1);
        });

        expect(component.getFormValues).toHaveBeenCalledTimes(1);
      }));

      it('should set up filtered categories and set default billable value if project is removed', fakeAsync(() => {
        projectsService.getAllowedOrgCategoryIds.and.returnValue(transformedOrgCategories);
        spyOn(component, 'getFormValues').and.returnValue({
          sub_category: orgCategoryData,
        });

        component.setupFilteredCategories(of(sortedCategory));
        tick(500);

        component.fg.controls.project.setValue(null);
        fixture.detectChanges();

        tick(500);

        component.filteredCategories$.subscribe((res) => {
          expect(res).toEqual(orgCategoryListItemData1);
        });

        expect(component.getFormValues).toHaveBeenCalledTimes(1);
      }));
    });

    it('getTransactionFields(): should get transaction fields', (done) => {
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse));
      spyOn(component, 'getMileageCategories').and.returnValue(
        of({
          defaultMileageCategory: mileageCategories2[0],
          mileageCategories: [mileageCategories2[1]],
        })
      );
      expenseFieldsService.filterByOrgCategoryId.and.returnValue(of(txnFieldsData));

      component.getTransactionFields().subscribe((res) => {
        expect(res).toEqual(txnFieldsData);
        expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(1);
        expect(component.getMileageCategories).toHaveBeenCalledTimes(1);
        expect(expenseFieldsService.filterByOrgCategoryId).toHaveBeenCalledOnceWith(
          expenseFieldsMapResponse,
          ['purpose', 'txn_dt', 'cost_center_id', 'project_id', 'distance', 'billable'],
          mileageCategories2[0]
        );
        done();
      });
    });

    it('setupTfcDefaultValues(): should setup default txn fields ', () => {
      expenseFieldsService.getAllMap.and.returnValue(of(expenseFieldsMapResponse));
      spyOn(component, 'getMileageCategories').and.returnValue(
        of({
          defaultMileageCategory: mileageCategories2[0],
          mileageCategories: [mileageCategories2[1]],
        })
      );
      expenseFieldsService.filterByOrgCategoryId.and.returnValue(of(txnFieldsData));
      expenseFieldsService.getDefaultTxnFieldValues.and.returnValue(defaultTxnFieldValuesData4);
      component.fg.controls.project.setValue(expectedProjectsResponse[0]);

      component.setupTfcDefaultValues();
      expect(expenseFieldsService.getAllMap).toHaveBeenCalledTimes(1);
      expect(component.getMileageCategories).toHaveBeenCalledTimes(1);
      expect(expenseFieldsService.filterByOrgCategoryId).toHaveBeenCalledOnceWith(
        expenseFieldsMapResponse,
        ['purpose', 'txn_dt', 'cost_center_id', 'distance', 'billable'],
        mileageCategories2[0]
      );
      expect(expenseFieldsService.getDefaultTxnFieldValues).toHaveBeenCalledOnceWith(txnFieldsData);
    });

    it('trackEditExpense(): should track edit expense event', () => {
      spyOn(component, 'getTimeSpentOnPage').and.returnValue(300);
      component.presetProjectId = expectedProjectsResponse[0].project_id;
      component.presetCostCenterId = costCentersData[0].id;
      component.presetVehicleType = 'car';
      component.presetLocation = 'Kolkata';
      fixture.detectChanges();

      component.trackEditExpense(unflattenedTxnWithTrackData);
      expect(trackingService.editExpense).toHaveBeenCalledOnceWith(editExpenseProperties1);
    });

    const mileageControl = new FormControl();
    describe('editExpense():', () => {
      it('should edit an expense', (done) => {
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomPropertiesData4));
        const mileageControl = new FormControl();
        mileageControl.setValue({
          mileageLocations: [locationData1, locationData2],
        });
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'getFormControl').and.returnValue(mileageControl);
        spyOn(component, 'getEditCalculatedDistance').and.returnValue(of(12));
        spyOn(component, 'trackEditExpense');
        authService.getEou.and.resolveTo(apiEouRes);
        reportService.addTransactions.and.returnValue(of(null));
        reportService.removeTransaction.and.returnValue(of(null));
      });

      it('should edit an expense', (done) => {
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(newExpFromFg));
        component.isConnected$ = of(true);
        component.etxn$ = of(newExpFromFg);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(null));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        transactionService.upsert.and.returnValue(of(newExpFromFg.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(cloneDeep(unflattenedTxnDataWithSubCategory)));
        spyOn(component, 'getFormValues').and.returnValue({
          report: expectedErpt[0],
        });
        spyOn(component, 'getIsPolicyExpense').and.returnValue(false);
        fixture.detectChanges();

        component.editExpense('SAVE_MILEAGE').subscribe((res) => {
          expect(res).toEqual(editUnflattenedTransaction);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(component.getFormControl).toHaveBeenCalledOnceWith('route');
          expect(component.getEditCalculatedDistance).toHaveBeenCalledOnceWith(mileageControl);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith(newExpFromFg);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(newExpFromFg.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(newExpFromFg.tx.id);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(component.getIsPolicyExpense).toHaveBeenCalledTimes(2);
          expect(reportService.addTransactions).toHaveBeenCalledOnceWith(expectedErpt[0].rp.id, [
            unflattenedTxnData.tx.id,
          ]);
          expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should edit an expense and add it to the report', (done) => {
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnDataWithReportID));
        component.isConnected$ = of(true);
        component.etxn$ = of(unflattenedTxnDataWithReportID);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(null));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        spyOn(component, 'getFormValues').and.returnValue({
          report: expectedErpt[0],
        });
        spyOn(component, 'getIsPolicyExpense').and.returnValue(false);
        transactionService.upsert.and.returnValue(of(unflattenedTxnDataWithReportID.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnDataWithReportID));
        fixture.detectChanges();

        component.editExpense('SAVE_MILEAGE').subscribe((res) => {
          expect(res).toEqual(editTransaction3);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(component.getFormControl).toHaveBeenCalledOnceWith('route');
          expect(component.getEditCalculatedDistance).toHaveBeenCalledOnceWith(mileageControl);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnDataWithReportID.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnDataWithReportID.tx.id);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(reportService.removeTransaction).toHaveBeenCalledOnceWith(
            unflattenedTxnDataWithReportID.tx.report_id,
            unflattenedTxnDataWithReportID.tx.id
          );
          expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txbO4Xaj4N53']);
          expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should edit an expense to remove transaction from report', (done) => {
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedTxnDataWithReportID2UserReview));
        component.isConnected$ = of(true);
        component.etxn$ = of(unflattenedTxnDataWithReportID2UserReview);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(null));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        spyOn(component, 'getFormValues').and.returnValue({
          report: null,
        });
        transactionService.upsert.and.returnValue(of(unflattenedTxnDataWithReportID2UserReview.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnDataWithReportID2UserReview));
        transactionService.review.and.returnValue(of(null));
        fixture.detectChanges();

        component.editExpense('SAVE_MILEAGE').subscribe((res) => {
          expect(res).toEqual(editTransaction4);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(component.getFormControl).toHaveBeenCalledOnceWith('route');
          expect(component.getEditCalculatedDistance).toHaveBeenCalledOnceWith(mileageControl);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnDataWithReportID2UserReview.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(
            unflattenedTxnDataWithReportID2UserReview.tx.id
          );
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(reportService.removeTransaction).toHaveBeenCalledOnceWith(
            unflattenedTxnDataWithReportID2UserReview.tx.report_id,
            unflattenedTxnDataWithReportID2UserReview.tx.id
          );
          expect(trackingService.removeFromExistingReportEditExpense).toHaveBeenCalledTimes(1);
          expect(transactionService.review).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should edit an expense with critical policy violations', (done) => {
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(newExpFromFg));
        component.isConnected$ = of(true);
        component.etxn$ = of(unflattenedTxnDataWithReportID);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(null));
        policyService.getCriticalPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'criticalPolicyViolationHandler').and.returnValue(
          of({ etxn: cloneDeep(unflattenedTxnDataWithSubCategory) })
        );
        transactionService.upsert.and.returnValue(of(newExpFromFg.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(cloneDeep(unflattenedTxnDataWithSubCategory)));
        spyOn(component, 'getFormValues').and.returnValue({
          report: expectedErpt[0],
        });

        spyOn(component, 'getIsPolicyExpense').and.returnValue(true);
        fixture.detectChanges();

        component.editExpense('SAVE_MILEAGE').subscribe((res) => {
          expect(res).toEqual(editTransaction2);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(component.getFormControl).toHaveBeenCalledOnceWith('route');
          expect(component.getEditCalculatedDistance).toHaveBeenCalledOnceWith(mileageControl);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith(newExpFromFg);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.criticalPolicyViolationHandler).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should edit an expense with policy violation adding a comment to the expense as well', (done) => {
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(newExpFromFg));
        component.isConnected$ = of(true);
        component.etxn$ = of(unflattenedTxnDataWithReportID);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'policyViolationHandler').and.returnValue(
          of({
            etxn: unflattenedTxnData,
            comment: 'A comment',
          })
        );
        transactionService.upsert.and.returnValue(of(newExpFromFg.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(cloneDeep(unflattenedTxnDataWithSubCategory)));
        spyOn(component, 'getFormValues').and.returnValue({
          report: expectedErpt[0],
        });
        spyOn(component, 'getIsPolicyExpense').and.returnValue(true);
        statusService.findLatestComment.and.returnValue(of('A comment'));
        fixture.detectChanges();

        component.editExpense('SAVE_MILEAGE').subscribe((res) => {
          expect(res).toEqual(editTransaction5);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(component.getEditCalculatedDistance).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.policyViolationHandler).toHaveBeenCalledOnceWith({
            type: 'policyViolations',
            policyViolations: [
              'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
            ],
            policyAction: expensePolicyData.data.final_desired_state,
            etxn: newExpFromFg,
          });
          expect(component.trackEditExpense).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(newExpFromFg.tx.id);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
            unflattenedTxnData.tx.id,
            'transactions',
            unflattenedTxnData.tx.org_user_id
          );
          done();
        });
      });

      it('should edit an expense with policy violation adding a new comment', (done) => {
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(newExpFromFg));
        component.isConnected$ = of(true);
        component.etxn$ = of(unflattenedTxnDataWithReportID);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([
          'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
        ]);
        spyOn(component, 'policyViolationHandler').and.returnValue(
          of({
            etxn: unflattenedTxnData,
            comment: 'A comment',
          })
        );
        transactionService.upsert.and.returnValue(of(newExpFromFg.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(cloneDeep(unflattenedTxnDataWithSubCategory)));
        spyOn(component, 'getFormValues').and.returnValue({
          report: expectedErpt[0],
        });

        spyOn(component, 'getIsPolicyExpense').and.returnValue(true);
        statusService.findLatestComment.and.returnValue(of(null));
        statusService.post.and.returnValue(of(txnStatusData));
        fixture.detectChanges();

        component.editExpense('SAVE_MILEAGE').subscribe((res) => {
          expect(res).toEqual(editTransaction5);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(component.getEditCalculatedDistance).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.policyViolationHandler).toHaveBeenCalledOnceWith({
            type: 'policyViolations',
            policyViolations: [
              'The expense will be flagged when the total amount of all expenses in category Others in a month exceeds: INR 3000.',
            ],
            policyAction: expensePolicyData.data.final_desired_state,
            etxn: newExpFromFg,
          });
          expect(component.trackEditExpense).toHaveBeenCalledTimes(1);
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(newExpFromFg.tx.id);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
            unflattenedTxnData.tx.id,
            'transactions',
            unflattenedTxnData.tx.org_user_id
          );
          expect(statusService.post).toHaveBeenCalledOnceWith(
            'transactions',
            unflattenedTxnData.tx.id,
            { comment: 'A comment' },
            true
          );
          done();
        });
      });

      it('should throw an error if expense cannot be generated', (done) => {
        spyOn(component, 'generateEtxnFromFg').and.returnValue(throwError(() => new Error('error')));

        component.editExpense('SAVE_MILEAGE').subscribe({
          next: () => {
            expect(component.getCustomFields).toHaveBeenCalledTimes(1);
            expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
            expect(component.getFormControl).toHaveBeenCalledOnceWith('route');
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
              component.etxn$,
              jasmine.any(Observable),
              jasmine.any(Observable)
            );
          },
          error: (err) => {
            expect(err).toBeTruthy();
          },
        });
        done();
      });

      it('should edit an expense in offline mode', (done) => {
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(newExpFromFg));
        component.isConnected$ = of(false);
        component.etxn$ = of(newExpFromFg);
        spyOn(component, 'getFormValues').and.returnValue({
          report: expectedErpt[0],
        });

        spyOn(component, 'getIsPolicyExpense').and.returnValue(false);
        transactionService.upsert.and.returnValue(of(unflattenedTxnDataWithReportID.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnDataWithReportID));
        fixture.detectChanges();

        component.editExpense('SAVE_MILEAGE').subscribe((res) => {
          expect(res).toEqual(editTransaction6);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(component.getFormControl).toHaveBeenCalledOnceWith('route');
          expect(component.getEditCalculatedDistance).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(
            component.etxn$,
            jasmine.any(Observable),
            jasmine.any(Observable)
          );
          expect(authService.getEou).toHaveBeenCalledTimes(1);
          expect(component.trackEditExpense).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(newExpFromFg.tx);
          expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(newExpFromFg.tx.id);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          expect(component.getIsPolicyExpense).toHaveBeenCalledTimes(2);
          expect(reportService.addTransactions).toHaveBeenCalledOnceWith(expectedErpt[0].rp.id, ['txbO4Xaj4N53']);
          expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    describe('getCalculatedDistance():', () => {
      it('should calculate distance between two location for a single trip', (done) => {
        component.isConnected$ = of(true);
        const mileageControl = new FormControl();
        mileageControl.setValue({
          mileageLocations: [locationData1, locationData2],
        });
        spyOn(component, 'getFormControl').and.returnValue(mileageControl);
        mileageService.getDistance.and.returnValue(of(400000));
        spyOn(component, 'getFormValues').and.returnValue({
          route: {
            roundTrip: false,
            mileageLocations: [locationData1, locationData2],
          },
        });
        component.etxn$ = of(unflattenedTxnData);
        fixture.detectChanges();

        component.getCalculatedDistance().subscribe((res) => {
          expect(res).toEqual('400.00');
          expect(component.getFormControl).toHaveBeenCalledOnceWith('route');
          expect(mileageService.getDistance).toHaveBeenCalledOnceWith([locationData1, locationData2]);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should calculate distance between two location for a round trip in MILES', (done) => {
        component.isConnected$ = of(true);
        const mileageControl = new FormControl();
        mileageControl.setValue({
          mileageLocations: [locationData1, locationData2],
        });
        spyOn(component, 'getFormControl').and.returnValue(mileageControl);
        mileageService.getDistance.and.returnValue(of(60000));
        spyOn(component, 'getFormValues').and.returnValue({
          route: {
            roundTrip: true,
            mileageLocations: [locationData1, locationData2],
          },
        });
        component.etxn$ = of(newExpenseMileageData2);
        fixture.detectChanges();

        component.getCalculatedDistance().subscribe((res) => {
          expect(res).toEqual('74.56');
          expect(component.getFormControl).toHaveBeenCalledOnceWith('route');
          expect(mileageService.getDistance).toHaveBeenCalledOnceWith([locationData1, locationData2]);
          expect(component.getFormValues).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should return null if offline', (done) => {
        component.isConnected$ = of(false);
        component.etxn$ = of(newExpenseMileageData2);

        component.getCalculatedDistance().subscribe((res) => {
          expect(res).toBeNull();
          done();
        });
      });

      it('should return null if distance could not be determined', (done) => {
        component.isConnected$ = of(true);
        const mileageControl = new FormControl();
        mileageControl.setValue({
          mileageLocations: [locationData1, locationData2],
        });
        spyOn(component, 'getFormControl').and.returnValue(mileageControl);
        mileageService.getDistance.and.returnValue(of(null));
        component.etxn$ = of(newExpenseMileageData2);

        component.getCalculatedDistance().subscribe((res) => {
          expect(res).toBeNull();
          expect(component.getFormControl).toHaveBeenCalledOnceWith('route');
          expect(mileageService.getDistance).toHaveBeenCalledOnceWith([locationData1, locationData2]);
          done();
        });
      });
    });

    it('trackCreateExpense(): should track create expense event', () => {
      component.presetProjectId = 3943;
      component.presetCostCenterId = 16744;
      component.presetVehicleType = 'CAR';
      component.presetLocation = 'kolkata';
      spyOn(component, 'getTimeSpentOnPage').and.returnValue(30);
      fixture.detectChanges();

      component.trackCreateExpense(expenseTrackCreate);

      expect(component.getTimeSpentOnPage).toHaveBeenCalledTimes(1);
      expect(trackingService.createExpense).toHaveBeenCalledOnceWith(createExpenseProperties4);
    });
  });
}
