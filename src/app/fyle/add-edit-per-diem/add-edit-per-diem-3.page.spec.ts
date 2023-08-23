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
import { multiplePaymentModesData, unflattenedAccount2Data } from 'src/app/core/test-data/accounts.service.spec.data';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { of } from 'rxjs';
import { currencyObjData5, currencyObjData6 } from 'src/app/core/mock-data/currency-obj.data';
import { before, cloneDeep } from 'lodash';
import {
  perDiemFormValuesData10,
  perDiemFormValuesData8,
  perDiemFormValuesData9,
} from 'src/app/core/mock-data/per-diem-form-value.data';
import { expectedTxnCustomProperties, txnCustomProperties4 } from 'src/app/core/mock-data/txn-custom-properties.data';
import { perDiemTransaction } from 'src/app/core/mock-data/transaction.data';
import { perDiemCustomInputsData2 } from 'src/app/core/mock-data/per-diem-custom-inputs.data';
import { expenseFieldResponse } from 'src/app/core/mock-data/expense-field.data';
import { platformPolicyExpenseData1 } from 'src/app/core/mock-data/platform-policy-expense.data';
import { expensePolicyData } from 'src/app/core/mock-data/expense-policy.data';
import { orgCategoryData } from 'src/app/core/mock-data/org-category.data';
import { publicPolicyExpenseData1 } from 'src/app/core/mock-data/public-policy-expense.data';
import { fileObject4 } from 'src/app/core/mock-data/file-object.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import { criticalPolicyViolation2 } from 'src/app/core/mock-data/crtical-policy-violations.data';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { splitPolicyExp4 } from 'src/app/core/mock-data/policy-violation.data';
import { FyPolicyViolationComponent } from 'src/app/shared/components/fy-policy-violation/fy-policy-violation.component';

export function TestCases3(getTestBed) {
  return describe('add-edit-per-diem test cases set 3', () => {
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

    describe('isPaymentModeValid():', () => {
      it('should return false if snapshot.params.id is undefined', (done) => {
        activatedRoute.snapshot.params.id = undefined;
        component.fg.controls.paymentMode.setValue(multiplePaymentModesData[0]);
        component.isPaymentModeValid().subscribe((res) => {
          expect(res).toBeFalse();
          done();
        });
      });

      it('should return true if tentative_balance_amount is lesser than currencyObj.amount', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        const mockPaymentMode = cloneDeep(unflattenedAccount2Data);
        mockPaymentMode.acc.tentative_balance_amount = 0;
        component.fg.value.paymentMode = mockPaymentMode;
        component.fg.value.currencyObj = currencyObjData5;
        component.isPaymentModeValid().subscribe((res) => {
          expect(res).toBeTrue();
          done();
        });
      });

      it('should return true if acc_id equals to source_account_id and tentative_balance_amount + tx_amount is lesser than currencyObj.amount', (done) => {
        const mockTxnData = cloneDeep(unflattenedTxnData);
        mockTxnData.tx.source_account_id = unflattenedAccount2Data.acc.id;
        mockTxnData.tx.state = 'COMPLETE';
        mockTxnData.tx.amount = 7;
        component.etxn$ = of(mockTxnData);
        const mockPaymentMode = cloneDeep(unflattenedAccount2Data);
        mockPaymentMode.acc.tentative_balance_amount = 0;
        component.fg.value.paymentMode = mockPaymentMode;
        component.fg.value.currencyObj = currencyObjData5;
        component.isPaymentModeValid().subscribe((res) => {
          expect(res).toBeTrue();
          done();
        });
      });

      it('should return false if paymentMode.acc is undefined', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        const mockPaymentMode = cloneDeep(unflattenedAccount2Data);
        mockPaymentMode.acc = undefined;
        component.fg.value.paymentMode = mockPaymentMode;
        component.isPaymentModeValid().subscribe((res) => {
          expect(res).toBeFalse();
          done();
        });
      });

      it('should return false if paymentMode is undefined', (done) => {
        component.etxn$ = of(unflattenedTxnData);
        component.fg.value.paymentMode = undefined;
        component.isPaymentModeValid().subscribe((res) => {
          expect(res).toBeFalse();
          done();
        });
      });
    });

    describe('generateEtxnFromFg():', () => {
      beforeEach(() => {
        spyOn(component, 'getFormValues').and.returnValue(perDiemFormValuesData8);
        component.fg.controls.currencyObj.setValue(currencyObjData6);
      });

      it('should return etxn object from form data', (done) => {
        const etxn = of(unflattenedTxnData);
        const customProperties = of(cloneDeep(expectedTxnCustomProperties));
        dateService.getUTCDate.and.returnValues(
          new Date('2023-02-13T17:00:00.000Z'),
          new Date('2023-08-01T17:00:00.000Z'),
          new Date('2023-08-03T17:00:00.000Z')
        );

        const expectedEtxn = component.generateEtxnFromFg(etxn, customProperties);

        expectedEtxn.subscribe((res) => {
          expect(dateService.getUTCDate).toHaveBeenCalledTimes(3);
          expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-02-13T17:00:00.000Z'));
          expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-08-01'));
          expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-08-03'));
          expect(res.tx).toEqual({ ...unflattenedTxnData.tx, ...perDiemTransaction });
          expect(res.ou).toEqual(unflattenedTxnData.ou);
          expect(res.dataUrls).toEqual([]);
          done();
        });
      });

      it('should return etxn object from form data', (done) => {
        component.getFormValues = jasmine.createSpy().and.returnValue(perDiemFormValuesData9);
        const etxn = of(unflattenedTxnData);
        const customProperties = of(cloneDeep(expectedTxnCustomProperties));
        dateService.getUTCDate.and.returnValues(
          new Date('2023-02-13T17:00:00.000Z'),
          new Date('2023-08-01T17:00:00.000Z'),
          new Date('2023-08-03T17:00:00.000Z')
        );

        const expectedEtxn = component.generateEtxnFromFg(etxn, customProperties);

        expectedEtxn.subscribe((res) => {
          expect(dateService.getUTCDate).toHaveBeenCalledTimes(3);
          expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-02-13T17:00:00.000Z'));
          expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-08-01'));
          expect(dateService.getUTCDate).toHaveBeenCalledWith(new Date('2023-08-03'));
          expect(res.tx).toEqual({ ...unflattenedTxnData.tx, ...perDiemTransaction, org_category_id: 16577 });
          expect(res.ou).toEqual(unflattenedTxnData.ou);
          expect(res.dataUrls).toEqual([]);
          done();
        });
      });
    });

    it('getCustomFields(): should return custom fields', (done) => {
      spyOn(component, 'getFormValues').and.returnValue(perDiemFormValuesData10);
      customFieldsService.standardizeCustomFields.and.returnValue(expectedTxnCustomProperties);
      component.customInputs$ = of(perDiemCustomInputsData2);
      component.dependentFields$ = of(expenseFieldResponse);
      const expectedCustomFields = component.getCustomFields();
      expectedCustomFields.subscribe((res) => {
        expect(customFieldsService.standardizeCustomFields).toHaveBeenCalledOnceWith(
          [
            {
              name: 'location1',
              value: null,
            },
          ],
          expenseFieldResponse
        );
        expect(res).toEqual(txnCustomProperties4);
        done();
      });
    });

    it('checkPolicyViolation(): should call transactionService.checkPolicy to check policy violation', (done) => {
      policyService.transformTo.and.returnValue(platformPolicyExpenseData1);
      transactionService.checkPolicy.and.returnValue(of(expensePolicyData));

      component
        .checkPolicyViolation({ tx: unflattenedTxnData.tx, dataUrls: fileObject4, ou: unflattenedTxnData.ou })
        .subscribe((res) => {
          expect(policyService.transformTo).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
          expect(transactionService.checkPolicy).toHaveBeenCalledOnceWith(platformPolicyExpenseData1);
          expect(res).toEqual(expensePolicyData);
          done();
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
  });
}
