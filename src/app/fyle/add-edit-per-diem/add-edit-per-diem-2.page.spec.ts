import { ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { AddEditPerDiemPage } from './add-edit-per-diem.page';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { DateService } from 'src/app/core/services/date.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { StatusService } from 'src/app/core/services/status.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';

import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { orgCategoryData, orgCategoryData1, perDiemCategory } from 'src/app/core/mock-data/org-category.data';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { unflattenedTxnDataPerDiem } from 'src/app/core/mock-data/unflattened-expense.data';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { apiV2ResponseMultiple } from 'src/app/core/test-data/projects.spec.data';
import { dependentCustomFields2, expenseFieldResponse } from 'src/app/core/mock-data/expense-field.data';
import { etxnData } from 'src/app/core/mock-data/expense.data';
import {
  TxnCustomProperties3,
  expectedTxnCustomProperties,
  txnCustomPropertiesData,
} from 'src/app/core/mock-data/txn-custom-properties.data';
import { dependentCustomProperties } from 'src/app/core/mock-data/custom-property.data';
import { cloneDeep, omit } from 'lodash';
import { perDiemCustomInputsData1 } from 'src/app/core/mock-data/per-diem-custom-inputs.data';

export function TestCases2(getTestBed) {
  return fdescribe('add-edit-per-diem test cases set 2', () => {
    let component: AddEditPerDiemPage;
    let fixture: ComponentFixture<AddEditPerDiemPage>;
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
    let popoverController: jasmine.SpyObj<PopoverController>;
    let currencyService: jasmine.SpyObj<CurrencyService>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let navController: jasmine.SpyObj<NavController>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let recentlyUsedItemsService: jasmine.SpyObj<RecentlyUsedItemsService>;
    let tokenService: jasmine.SpyObj<TokenService>;
    let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
    let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
    let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
    let matSnackBar: jasmine.SpyObj<MatSnackBar>;
    let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
    let platform: Platform;
    let paymentModesService: jasmine.SpyObj<PaymentModesService>;
    let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let perDiemService: jasmine.SpyObj<PerDiemService>;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(AddEditPerDiemPage);
      component = fixture.componentInstance;

      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      formBuilder = TestBed.inject(FormBuilder);
      categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
      customFieldsService = TestBed.inject(CustomFieldsService) as jasmine.SpyObj<CustomFieldsService>;
      transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
      policyService = TestBed.inject(PolicyService) as jasmine.SpyObj<PolicyService>;
      transactionOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      statusService = TestBed.inject(StatusService) as jasmine.SpyObj<StatusService>;
      popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
      currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      navController = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      recentlyUsedItemsService = TestBed.inject(RecentlyUsedItemsService) as jasmine.SpyObj<RecentlyUsedItemsService>;
      tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
      expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
      modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
      orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
      matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
      snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
      platform = TestBed.inject(Platform);
      paymentModesService = TestBed.inject(PaymentModesService) as jasmine.SpyObj<PaymentModesService>;
      orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
      storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
      perDiemService = TestBed.inject(PerDiemService) as jasmine.SpyObj<PerDiemService>;

      component.fg = formBuilder.group({
        currencyObj: [
          {
            value: null,
            disabled: true,
          },
        ],
        paymentMode: [, Validators.required],
        project: [],
        sub_category: [],
        per_diem_rate: [, Validators.required],
        purpose: [],
        num_days: [, Validators.compose([Validators.required, Validators.min(0)])],
        report: [],
        from_dt: [],
        to_dt: [, component.customDateValidator.bind(component)],
        custom_inputs: new FormArray([]),
        duplicate_detection_reason: [],
        billable: [],
        costCenter: [],
        project_dependent_fields: formBuilder.array([]),
        cost_center_dependent_fields: formBuilder.array([]),
      });
    }));

    it('getNewExpense(): should return new expense object', () => {
      spyOn(component, 'getPerDiemCategories').and.returnValue(
        of({
          defaultPerDiemCategory: perDiemCategory,
          perDiemCategories: [perDiemCategory],
        })
      );
      currencyService.getHomeCurrency.and.returnValue(of('USD'));
      authService.getEou.and.resolveTo(apiEouRes);

      component.getNewExpense().subscribe((res) => {
        expect(component.getPerDiemCategories).toHaveBeenCalledTimes(1);
        expect(currencyService.getHomeCurrency).toHaveBeenCalledTimes(1);
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(res).toEqual(unflattenedTxnDataPerDiem);
      });
    });

    it('getEditExpense(): should call transactionService.getETxnUnflattened and return unflattened transaction data', () => {
      transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
      activatedRoute.snapshot.params = { id: 'tx5n59fvxk4z' };

      component.getEditExpense().subscribe((res) => {
        expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith('tx5n59fvxk4z');
        expect(res).toEqual(unflattenedTxnData);
      });
    });

    it('setupFilteredCategories(): should setup filteredCategories$', () => {
      component.fg.patchValue({
        sub_category: {
          id: 247980,
        },
        project: 13795,
      });
      projectsService.getAllowedOrgCategoryIds.and.returnValue([orgCategoryData]);
      component.billableDefaultValue = false;
      spyOn(component.fg.controls.sub_category, 'reset');
      component.setupFilteredCategories(of(orgCategoryData1));
      expect(projectsService.getAllowedOrgCategoryIds).toHaveBeenCalledOnceWith(13795, orgCategoryData1);
      expect(component.fg.controls.sub_category.reset).toHaveBeenCalledTimes(1);
    });

    it('getTimeSpentOnPage(): should get time spent on page', () => {
      component.expenseStartTime = 164577000;
      fixture.detectChanges();

      const result = component.getTimeSpentOnPage();
      const endTime = (new Date().getTime() - component.expenseStartTime) / 1000;
      expect(result).toEqual(endTime);
    });

    fdescribe('getCustomInputs():', () => {
      const mockCategoryData = cloneDeep(orgCategoryData);
      mockCategoryData.id = 16577;
      beforeEach(() => {
        component.fg.patchValue({
          sub_category: {
            id: 247980,
          },
        });
        customInputsService.getAll.and.returnValue(of([...dependentCustomFields2, ...expenseFieldResponse]));
        spyOn(component, 'getPerDiemCategories').and.returnValue(
          of({
            defaultPerDiemCategory: perDiemCategory,
            perDiemCategories: [perDiemCategory],
          })
        );
        component.etxn$ = of(unflattenedTxnData);
        categoriesService.getAll.and.returnValue(of([mockCategoryData]));
        customFieldsService.standardizeCustomFields.and.returnValue(cloneDeep(expectedTxnCustomProperties));
        customInputsService.filterByCategory.and.returnValue(expenseFieldResponse);
        component.isConnected$ = of(true);
      });

      it('should update dependentFields$ correctly', () => {
        component.getCustomInputs();
        component.dependentFields$.subscribe((dependentFields) => {
          expect(dependentFields).toEqual(dependentCustomFields2);
        });
      });

      it('should return custom inputs if etxn.tx.org_category_id is defined', () => {
        component.fg.value.custom_inputs = dependentCustomProperties;
        component.getCustomInputs().subscribe((res) => {
          expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
          expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith(
            dependentCustomProperties,
            expenseFieldResponse
          );
          expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 16577);
          const expenseFieldWithoutControl = res.map(({ control, ...otherProps }) => ({ ...otherProps }));
          const expectedExpenseFieldWithControl = perDiemCustomInputsData1.map(({ control, ...otherProps }) => ({
            ...otherProps,
          }));
          expect(expenseFieldWithoutControl).toEqual(expectedExpenseFieldWithControl);
          const controlValues = res.map(({ control }) => control.value);
          const expectedControlValues = perDiemCustomInputsData1.map(({ control }) => control.value);
          expect(controlValues).toEqual(expectedControlValues);
        });
      });

      it('should return custom inputs if etxn.tx.org_category_id is undefined', () => {
        component.fg.value.custom_inputs = undefined;
        const mockEtxn = cloneDeep(unflattenedTxnData);
        mockEtxn.tx.org_category_id = undefined;
        component.etxn$ = of(mockEtxn);
        categoriesService.getAll.and.returnValue(of([orgCategoryData]));
        component.getCustomInputs().subscribe((res) => {
          expect(customInputsService.getAll).toHaveBeenCalledOnceWith(true);
          expect(component.getPerDiemCategories).toHaveBeenCalledTimes(1);
          expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith([], expenseFieldResponse);
          expect(customInputsService.filterByCategory).toHaveBeenCalledOnceWith(expenseFieldResponse, 38912);
          const expenseFieldWithoutControl = res.map(({ control, ...otherProps }) => ({ ...otherProps }));
          const expectedExpenseFieldWithControl = perDiemCustomInputsData1.map(({ control, ...otherProps }) => ({
            ...otherProps,
          }));
          expect(expenseFieldWithoutControl).toEqual(expectedExpenseFieldWithControl);
          const controlValues = res.map(({ control }) => control.value);
          const expectedControlValues = perDiemCustomInputsData1.map(({ control }) => control.value);
          expect(controlValues).toEqual(expectedControlValues);
        });
      });
    });
  });
}
