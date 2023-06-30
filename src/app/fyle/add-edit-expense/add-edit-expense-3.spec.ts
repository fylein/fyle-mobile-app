import { TitleCasePipe } from '@angular/common';
import { ComponentFixture } from '@angular/core/testing';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { Subscription, of } from 'rxjs';
import { costCenterApiRes1 } from 'src/app/core/mock-data/cost-centers.data';
import { customFieldData2, expectedCustomField } from 'src/app/core/mock-data/custom-field.data';
import { fileObject4 } from 'src/app/core/mock-data/file-object.data';
import {
  expectedAutoFillCategory,
  expectedAutoFillCategory2,
  filteredCategoriesData,
  orgCategoryData,
} from 'src/app/core/mock-data/org-category.data';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { extractedData } from 'src/app/core/mock-data/parsed-receipt.data';
import { platformPolicyExpenseData1 } from 'src/app/core/mock-data/platform-policy-expense.data';
import { expensePolicyData, publicPolicyExpenseData1 } from 'src/app/core/mock-data/public-policy-expense.data';
import { recentlyUsedRes } from 'src/app/core/mock-data/recently-used.data';
import {
  draftUnflattendedTxn,
  unflattenedTxn,
  unflattenedExpData,
} from 'src/app/core/mock-data/unflattened-expense.data';
import {
  expectedUnflattendedTxnData2,
  expectedUnflattendedTxnData3,
  unflattenedTxnData,
  unflattenedTxnData2,
  unflattenedTxnDataWithoutCategoryData,
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
import { AddEditExpensePage } from './add-edit-expense.page';
import { orgSettingsData } from 'src/app/core/test-data/accounts.service.spec.data';
import { recentUsedCategoriesRes } from '../../core/mock-data/org-category-list-item.data';

export function TestCases3(getTestBed) {
  return describe('AddEditExpensePage-3', () => {
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
    let platform: Platform;
    let titleCasePipe: jasmine.SpyObj<TitleCasePipe>;
    let handleDuplicates: jasmine.SpyObj<HandleDuplicatesService>;
    let paymentModesService: jasmine.SpyObj<PaymentModesService>;
    let taxGroupService: jasmine.SpyObj<TaxGroupService>;
    let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let launchDarklyService: jasmine.SpyObj<LaunchDarklyService>;

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
      platform = TestBed.inject(Platform);
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

    describe('checkPolicyViolation():', () => {
      it('should check if there are any policy violations and in case category is present', (done) => {
        policyService.transformTo.and.returnValue(platformPolicyExpenseData1);
        transactionService.checkPolicy.and.returnValue(of(expensePolicyData));
        component.checkPolicyViolation({ tx: publicPolicyExpenseData1, dataUrls: ['url1'] }).subscribe((res) => {
          expect(res).toEqual(expensePolicyData);
          expect(policyService.transformTo).toHaveBeenCalledOnceWith({ ...publicPolicyExpenseData1, num_files: 1 });
          expect(transactionService.checkPolicy).toHaveBeenCalledOnceWith(platformPolicyExpenseData1);
          done();
        });
      });

      it('should check for policy violations and populate category if not present in expense', (done) => {
        policyService.transformTo.and.returnValue(platformPolicyExpenseData1);
        transactionService.checkPolicy.and.returnValue(of(expensePolicyData));
        categoriesService.getCategoryByName.and.returnValue(of(orgCategoryData));
        component
          .checkPolicyViolation({ tx: { ...publicPolicyExpenseData1, org_category_id: null }, dataUrls: ['url1'] })
          .subscribe((res) => {
            expect(res).toEqual(expensePolicyData);
            expect(policyService.transformTo).toHaveBeenCalledOnceWith({
              ...publicPolicyExpenseData1,
              num_files: 1,
              org_category_id: 16566,
            });
            expect(transactionService.checkPolicy).toHaveBeenCalledOnceWith(platformPolicyExpenseData1);
            expect(categoriesService.getCategoryByName).toHaveBeenCalledOnceWith('Unspecified');
            done();
          });
      });
    });

    describe('parseFile(): ', () => {
      it('should parse a pdf for expense information', () => {
        component.orgUserSettings$ = of(orgUserSettingsData);
        spyOn(component, 'getParsedReceipt').and.resolveTo(extractedData);
        component.filteredCategories$ = of(filteredCategoriesData);
        currencyService.getHomeCurrency.and.returnValue(of('INR'));
        component.inpageExtractedData = null;
        dateService.isSameDate.and.returnValue(true);
        component.fg.controls.dateOfSpend.setValue(new Date('2023-02-24T12:03:57.680Z'));
        component.fg.controls.currencyObj.setValue({
          amount: null,
          currency: 'USD',
        });

        fixture.detectChanges();

        component.parseFile({
          url: ';base64,url1',
          type: 'pdf',
        });

        expect(component.getParsedReceipt).toHaveBeenCalledOnceWith('url1', 'pdf');
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(component.inpageExtractedData).toEqual(null);
        expect(component.fg.controls.currencyObj.value).toEqual({
          amount: null,
          currency: 'USD',
        });
        expect(component.fg.controls.category.value).toEqual(null);
      });

      it('should parse an image for expense information given there is pre-existing data', () => {
        component.orgUserSettings$ = of(orgUserSettingsData);
        spyOn(component, 'getParsedReceipt').and.resolveTo(extractedData);
        component.filteredCategories$ = of(filteredCategoriesData);
        currencyService.getHomeCurrency.and.returnValue(of('USD'));
        component.inpageExtractedData = {
          amount: 100,
        };
        dateService.isSameDate.and.returnValue(true);
        component.fg.controls.dateOfSpend.setValue(new Date('2023-02-24T12:03:57.680Z'));
        component.fg.controls.currencyObj.setValue({
          amount: null,
          currency: 'USD',
        });

        fixture.detectChanges();

        component.parseFile({
          url: ';base64,url1',
          type: 'image',
        });
        expect(component.getParsedReceipt).toHaveBeenCalledOnceWith('url1', 'image');
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(component.inpageExtractedData).toEqual({ amount: 100 });
        expect(component.fg.controls.currencyObj.value).toEqual({
          amount: null,
          currency: 'USD',
        });
        expect(component.fg.controls.category.value).toEqual(null);
      });
    });

    describe('getAutofillCategory():', () => {
      it('should get auto fill category for an expense', () => {
        {
          const result = component.getAutofillCategory({
            isAutofillsEnabled: true,
            recentValue: recentlyUsedRes,
            recentCategories: recentUsedCategoriesRes,
            etxn: unflattenedTxn,
            category: orgCategoryData,
          });

          expect(result).toEqual(expectedAutoFillCategory);
        }
      });

      it('should get auto fill category for DRAFT expense', () => {
        const result = component.getAutofillCategory({
          isAutofillsEnabled: true,
          recentValue: recentlyUsedRes,
          recentCategories: recentUsedCategoriesRes,
          etxn: draftUnflattendedTxn,
          category: orgCategoryData,
        });

        expect(result).toEqual(expectedAutoFillCategory2);
      });
    });

    describe('generateEtxnFromFg():', () => {
      it('should generate expense object from input in the form', (done) => {
        fileService.findByTransactionId.and.returnValue(of(fileObject4));
        fileService.downloadUrl.and.returnValue(of('url1'));
        spyOn(component, 'getReceiptDetails').and.returnValue({
          type: 'pdf',
          thumbnail: 'thumbnail',
        });
        component.fg.controls.costCenter.setValue(costCenterApiRes1[0]);
        component.fg.controls.location_1.setValue('loc1');
        component.fg.controls.location_2.setValue('loc2');
        component.fg.controls.currencyObj.setValue({
          amount: 500,
          currency: 'USD',
        });
        component.inpageExtractedData = extractedData.data;
        fixture.detectChanges();

        component
          .generateEtxnFromFg(of(unflattenedExpData), of([expectedCustomField[0], expectedCustomField[2]]))
          .subscribe((res) => {
            expect(res).toEqual(expectedUnflattendedTxnData2);
            expect(fileService.findByTransactionId).toHaveBeenCalledOnceWith(unflattenedExpData.tx.id);
            expect(fileService.downloadUrl).toHaveBeenCalledOnceWith(fileObject4[0].id);
            expect(component.getReceiptDetails).toHaveBeenCalledOnceWith(fileObject4[0]);
            done();
          });
      });

      it('should generate expense object from form if the expense is a policy txn and has location data', (done) => {
        fileService.findByTransactionId.and.returnValue(of(fileObject4));
        fileService.downloadUrl.and.returnValue(of('url1'));
        dateService.getUTCDate.and.returnValue(new Date('2017-07-25T00:00:00.000Z'));
        spyOn(component, 'getReceiptDetails').and.returnValue({
          type: 'pdf',
          thumbnail: 'thumbnail',
        });
        component.fg.controls.costCenter.setValue(costCenterApiRes1[0]);
        component.fg.controls.location_1.setValue('loc1');
        component.fg.controls.category.setValue({
          name: 'TRAVEL',
          sub_category: 'TAXI',
        });
        component.fg.controls.currencyObj.setValue({
          amount: 100,
          currency: 'USD',
        });

        component.generateEtxnFromFg(of(unflattenedTxnData2), of(customFieldData2), true).subscribe((res) => {
          expect(res).toEqual(expectedUnflattendedTxnData3);
          expect(fileService.findByTransactionId).toHaveBeenCalledOnceWith(unflattenedTxnData2.tx.id);
          expect(fileService.downloadUrl).toHaveBeenCalledOnceWith(fileObject4[0].id);
          expect(component.getReceiptDetails).toHaveBeenCalledOnceWith(fileObject4[0]);
          expect(dateService.getUTCDate).toHaveBeenCalledOnceWith(new Date('2023-02-23T16:24:01.335Z'));
          done();
        });
      });
    });

    describe('getCategoryOnAdd():', () => {
      it('should return category if provided as parameter', (done) => {
        component.getCategoryOnAdd(orgCategoryData).subscribe((res) => {
          expect(res).toEqual(orgCategoryData);
          done();
        });
      });

      it('should return null if category is not extracted', (done) => {
        orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedCategories$ = of(recentUsedCategoriesRes);
        component.etxn$ = of(unflattenedTxnData);
        spyOn(component, 'getAutofillCategory').and.returnValue(expectedAutoFillCategory);
        fixture.detectChanges();

        component.getCategoryOnAdd(undefined).subscribe((res) => {
          expect(res).toBeNull();
          expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should return the extracted category', (done) => {
        orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));
        orgSettingsService.get.and.returnValue(of(orgSettingsData));
        component.recentlyUsedValues$ = of(recentlyUsedRes);
        component.recentlyUsedCategories$ = of(recentUsedCategoriesRes);
        component.etxn$ = of(unflattenedTxnDataWithoutCategoryData);
        spyOn(component, 'getAutofillCategory').and.returnValue(expectedAutoFillCategory);
        fixture.detectChanges();

        component.getCategoryOnAdd(undefined).subscribe((res) => {
          expect(res).toEqual(expectedAutoFillCategory);
          expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
          expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
          expect(component.getAutofillCategory).toHaveBeenCalledOnceWith({
            isAutofillsEnabled: true,
            recentValue: recentlyUsedRes,
            recentCategories: recentUsedCategoriesRes,
            etxn: unflattenedTxnDataWithoutCategoryData,
            category: null,
          });
          done();
        });
      });
    });
  });
}
