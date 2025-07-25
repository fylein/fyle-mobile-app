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
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { PaymentModesService } from 'src/app/core/services/payment-modes.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { ReportService } from 'src/app/core/services/report.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ExpenseCommentService } from 'src/app/core/services/platform/v1/spender/expense-comment.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';

import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerDiemService } from 'src/app/core/services/per-diem.service';
import { Observable, finalize, of } from 'rxjs';
import { estatusData1 } from 'src/app/core/test-data/status.service.spec.data';
import { unflattenedTxnData, unflattenedTxnData2 } from 'src/app/core/mock-data/unflattened-txn.data';
import { criticalPolicyViolation1 } from 'src/app/core/mock-data/crtical-policy-violations.data';
import { policyViolation1 } from 'src/app/core/mock-data/policy-violation.data';
import { unflattenedExpData } from 'src/app/core/mock-data/unflattened-expense.data';
import { expensePolicyData } from 'src/app/core/mock-data/expense-policy.data';
import { txnCustomProperties4 } from 'src/app/core/mock-data/txn-custom-properties.data';
import { txnCustomProperties } from 'src/app/core/test-data/dependent-fields.service.spec.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { perDiemFormValuesData10 } from 'src/app/core/mock-data/per-diem-form-value.data';
import { expectedReportsPaginated } from 'src/app/core/mock-data/platform-report.data';
import { txnStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { createExpenseProperties3, editExpenseProperties } from 'src/app/core/mock-data/track-expense-properties.data';
import { expectedErptPlatform } from 'src/app/core/mock-data/report-unflattened.data';
import { expenseStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { editExpensePropertiesPlatform } from 'src/app/core/mock-data/track-expense-properties.data';
import { cloneDeep } from 'lodash';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { snackbarPropertiesRes2 } from 'src/app/core/mock-data/snackbar-properties.data';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { outboxQueueData1 } from 'src/app/core/mock-data/outbox-queue.data';
import { PerDiemRedirectedFrom } from 'src/app/core/models/per-diem-redirected-from.enum';
import {
  platformExpenseData,
  platformExpenseDataForAdvanceWallet,
} from 'src/app/core/mock-data/platform/v1/expense.data';
import {
  transformedExpenseData,
  transformedExpenseDataWithSubCategory,
  transformedExpenseDataWithoutAdvanceWallet,
} from 'src/app/core/mock-data/transformed-expense.data';
import { paymentModeDataAdvanceWallet } from 'src/app/core/test-data/accounts.service.spec.data';
import { editUnflattenedTransactionPlatformWithAdvanceWallet } from 'src/app/core/mock-data/transaction.data';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';
import { expenseCommentData } from 'src/app/core/mock-data/expense-comment.data';

export function TestCases4(getTestBed) {
  return describe('add-edit-per-diem test cases set 4', () => {
    let component: AddEditPerDiemPage;
    let fixture: ComponentFixture<AddEditPerDiemPage>;
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
    let expensesService: jasmine.SpyObj<ExpensesService>;
    let policyService: jasmine.SpyObj<PolicyService>;
    let transactionOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
    let router: jasmine.SpyObj<Router>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let expenseCommentService: jasmine.SpyObj<ExpenseCommentService>;
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
    let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
    let storageService: jasmine.SpyObj<StorageService>;
    let perDiemService: jasmine.SpyObj<PerDiemService>;
    let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(AddEditPerDiemPage);
      component = fixture.componentInstance;

      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      formBuilder = TestBed.inject(UntypedFormBuilder);
      categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
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
      platformEmployeeSettingsService = TestBed.inject(
        PlatformEmployeeSettingsService
      ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
      storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
      perDiemService = TestBed.inject(PerDiemService) as jasmine.SpyObj<PerDiemService>;
      spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
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
        custom_inputs: new UntypedFormArray([]),
        billable: [],
        costCenter: [],
        project_dependent_fields: formBuilder.array([]),
        cost_center_dependent_fields: formBuilder.array([]),
      });
    }));

    it('trackPolicyCorrections(): should track policy corrections', () => {
      component.isCriticalPolicyViolated$ = of(true);
      component.comments$ = of(estatusData1);
      component.fg.markAsDirty();

      fixture.detectChanges();

      component.trackPolicyCorrections();
      expect(trackingService.policyCorrection).toHaveBeenCalledWith({ Violation: 'Critical', Mode: 'Edit Expense' });
      expect(trackingService.policyCorrection).toHaveBeenCalledWith({ Violation: 'Regular', Mode: 'Edit Expense' });
    });

    describe('editExpenseCriticalPolicyViolationErrorHandler():', () => {
      it('should return txn with permission to continue with critical violations from user', (done) => {
        loaderService.showLoader.and.resolveTo();
        component.etxn$ = of(unflattenedTxnData2);
        spyOn(component, 'continueWithCriticalPolicyViolation').and.resolveTo(true);

        component
          .editExpenseCriticalPolicyViolationHandler({
            policyViolations: criticalPolicyViolation1,
            etxn: unflattenedTxnData,
          })
          .subscribe((res) => {
            expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
            expect(component.continueWithCriticalPolicyViolation).toHaveBeenCalledOnceWith(criticalPolicyViolation1);
            expect(res).toEqual({ etxn: unflattenedTxnData });
            done();
          });
      });

      it('should throw error if policy violation check errors fails', (done) => {
        loaderService.showLoader.and.resolveTo();
        component.etxn$ = of(unflattenedTxnData2);
        spyOn(component, 'continueWithCriticalPolicyViolation').and.resolveTo(false);

        component
          .editExpenseCriticalPolicyViolationHandler({
            policyViolations: criticalPolicyViolation1,
            etxn: unflattenedTxnData,
          })
          .subscribe({
            next: () => {},
            error: (error) => {
              expect(error).toBeTruthy();
              expect(error).toEqual('unhandledError');
              done();
            },
          });
      });
    });

    describe('editExpensePolicyViolationErrorHandler():', () => {
      it('should return txn if user wants to continue with violations', (done) => {
        loaderService.showLoader.and.resolveTo();
        component.etxn$ = of(unflattenedTxnData2);
        spyOn(component, 'continueWithPolicyViolations').and.resolveTo({ comment: 'comment' });

        component
          .editExpensePolicyViolationHandler({
            policyViolations: criticalPolicyViolation1,
            policyAction: policyViolation1.data.final_desired_state,
            etxn: unflattenedTxnData,
          })
          .subscribe((res) => {
            expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
            expect(component.continueWithPolicyViolations).toHaveBeenCalledOnceWith(
              criticalPolicyViolation1,
              policyViolation1.data.final_desired_state
            );
            expect(res).toEqual({ etxn: unflattenedTxnData, comment: 'comment' });
            done();
          });
      });

      it('should add default policy violation comment if user wants to continue with violations without providing a comment', (done) => {
        loaderService.showLoader.and.resolveTo();
        component.etxn$ = of(unflattenedTxnData2);
        spyOn(component, 'continueWithPolicyViolations').and.resolveTo({ comment: '' });
        spyOn(component, 'generateEtxnFromFg').and.returnValue(of(unflattenedExpData));

        component
          .editExpensePolicyViolationHandler({
            policyViolations: criticalPolicyViolation1,
            policyAction: policyViolation1.data.final_desired_state,
            etxn: unflattenedTxnData,
          })
          .subscribe((res) => {
            expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
            expect(component.continueWithPolicyViolations).toHaveBeenCalledOnceWith(
              criticalPolicyViolation1,
              policyViolation1.data.final_desired_state
            );
            expect(res).toEqual({ etxn: unflattenedTxnData, comment: 'No policy violation explanation provided' });
            done();
          });
      });

      it('should throw an error if policy check fails', (done) => {
        loaderService.showLoader.and.resolveTo();
        component.etxn$ = of(unflattenedTxnData2);
        spyOn(component, 'continueWithPolicyViolations').and.resolveTo(null);

        component
          .editExpensePolicyViolationHandler({
            policyViolations: criticalPolicyViolation1,
            policyAction: policyViolation1.data.final_desired_state,
          })
          .subscribe({
            next: () => {},
            error: (error) => {
              expect(error).toBeTruthy();
              expect(error).toEqual('unhandledError');
              done();
            },
          });
      });
    });

    describe('editExpense(): for advance wallet', () => {
      it('should update transaction with advance_wallet_id while editing expense', (done) => {
        const tx = {
          ...transformedExpenseDataWithSubCategory.tx,
          source_account_id: null,
          skip_reimbursement: true,
          advance_wallet_id: 'areq1234',
        };
        const etxn$ = of({
          tx,
          ou: transformedExpenseDataWithSubCategory.ou,
          dataUrls: [],
        });
        spyOn(component, 'getCustomFields').and.returnValue(of(txnCustomProperties));
        spyOn(component, 'generateEtxnFromFg').and.returnValue(etxn$);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        spyOn(component, 'trackPolicyCorrections');

        component.etxn$ = etxn$;
        component.fg.controls.paymentMode.setValue(paymentModeDataAdvanceWallet);
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        spenderReportsService.ejectExpenses.and.returnValue(of(undefined));
        spenderReportsService.addExpenses.and.returnValue(of(undefined));
        transactionService.upsert.and.returnValue(of(tx));
        expensesService.getExpenseById.and.returnValue(of(platformExpenseDataForAdvanceWallet));
        transactionService.transformExpense.and.returnValue(transformedExpenseDataWithoutAdvanceWallet);
        expensesService.post.and.returnValue(of(null));
        fixture.detectChanges();

        component.editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM).subscribe((res) => {
          expect(res).toEqual(editUnflattenedTransactionPlatformWithAdvanceWallet);
          expect(component.getCustomFields).toHaveBeenCalledTimes(1);
          expect(component.generateEtxnFromFg).toHaveBeenCalledWith(component.etxn$, jasmine.any(Observable));
          expect(component.generateEtxnFromFg).toHaveBeenCalledTimes(1);
          expect(component.checkPolicyViolation).toHaveBeenCalledTimes(1);
          expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
          expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
          expect(component.trackPolicyCorrections).toHaveBeenCalledTimes(1);
          expect(transactionService.upsert).toHaveBeenCalledOnceWith(tx);
          expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(tx.id);
          expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseDataForAdvanceWallet);
          done();
        });
      });
    });

    describe('editExpense():', () => {
      const etxn$ = of({ tx: transformedExpenseData.tx, ou: transformedExpenseData.ou, dataUrls: [] });
      const customFields$ = of(txnCustomProperties4);
      beforeEach(() => {
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'generateEtxnFromFg').and.returnValue(etxn$);
        spyOn(component, 'getCustomFields').and.returnValue(customFields$);
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue(['The expense will be flagged']);
        policyService.getPolicyRules.and.returnValue(['The expense will be flagged']);
        spyOn(component, 'editExpenseCriticalPolicyViolationHandler').and.returnValue(
          of({ etxn: transformedExpenseData })
        );
        spyOn(component, 'editExpensePolicyViolationHandler').and.returnValue(
          of({ etxn: transformedExpenseData, comment: 'comment' })
        );
        authService.getEou.and.resolveTo(apiEouRes);
        spyOn(component, 'getFormValues').and.returnValue({
          ...perDiemFormValuesData10,
          report: expectedReportsPaginated[0],
        });
        transactionService.upsert.and.returnValue(of(transformedExpenseData.tx));
        expensesService.getExpenseById.and.returnValue(of(platformExpenseData));
        transactionService.transformExpense.and.returnValue(transformedExpenseData);
        spenderReportsService.addExpenses.and.returnValue(of(undefined));
        spenderReportsService.ejectExpenses.and.returnValue(of(undefined));
        expenseCommentService.findLatestExpenseComment.and.returnValue(of('comment1'));
        expenseCommentService.post.and.returnValue(of([expenseCommentData]));
        component.etxn$ = of(transformedExpenseData);
        spyOn(component, 'getTimeSpentOnPage').and.returnValue(180);
        component.presetProjectId = 316443;
        component.presetCostCenterId = 13795;
      });

      it('should throw criticalPolicyViolations error and save the edited expense', (done) => {
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            })
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: transformedExpenseData.tx,
              ou: transformedExpenseData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).not.toHaveBeenCalled();
            expect(component.editExpenseCriticalPolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'criticalPolicyViolations',
              policyViolations: ['The expense will be flagged'],
              etxn: { tx: transformedExpenseData.tx, ou: transformedExpenseData.ou, dataUrls: [] },
            });
            expect(component.editExpensePolicyViolationHandler).not.toHaveBeenCalled();
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseData.tx);
            expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(platformExpenseData.id);
            expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
            expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txvslh8aQMbu']);
            expect(spenderReportsService.ejectExpenses).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(res).toEqual(transformedExpenseData.tx);
            done();
          });
      });

      it('should throw criticalPolicyViolations error and save the edited expense in new report and remove the expense from previous report if reportId is different', (done) => {
        const mockTxnData = cloneDeep(transformedExpenseData);
        mockTxnData.tx.report_id = 'rpbNc3kn5baq';
        component.etxn$ = of(mockTxnData);
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            })
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: transformedExpenseData.tx,
              ou: transformedExpenseData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).not.toHaveBeenCalled();
            expect(component.editExpenseCriticalPolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'criticalPolicyViolations',
              policyViolations: ['The expense will be flagged'],
              etxn: { tx: transformedExpenseData.tx, ou: transformedExpenseData.ou, dataUrls: [] },
            });
            expect(component.editExpensePolicyViolationHandler).not.toHaveBeenCalled();
            expect(trackingService.editExpense).toHaveBeenCalledOnceWith(editExpensePropertiesPlatform);
            expect(trackingService.viewExpense).not.toHaveBeenCalled();
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseData.tx);
            expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(platformExpenseData.id);
            expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
            expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txvslh8aQMbu']);
            expect(spenderReportsService.ejectExpenses).toHaveBeenCalledOnceWith('rpbNc3kn5baq', 'txvslh8aQMbu');
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(res).toEqual(transformedExpenseData.tx);
            done();
          });
      });

      it('should throw criticalPolicyViolations error and save the edited expense and remove the expense from previous report if reportId field is empty in form', (done) => {
        const mockTxnData = cloneDeep(transformedExpenseData);
        mockTxnData.tx.report_id = 'rp8eUleN29dc';
        component.etxn$ = of(mockTxnData);
        component.getFormValues = jasmine.createSpy().and.returnValue(perDiemFormValuesData10);
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            })
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: transformedExpenseData.tx,
              ou: transformedExpenseData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).not.toHaveBeenCalled();
            expect(component.editExpenseCriticalPolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'criticalPolicyViolations',
              policyViolations: ['The expense will be flagged'],
              etxn: { tx: transformedExpenseData.tx, ou: transformedExpenseData.ou, dataUrls: [] },
            });
            expect(component.editExpensePolicyViolationHandler).not.toHaveBeenCalled();
            expect(trackingService.editExpense).toHaveBeenCalledOnceWith(editExpensePropertiesPlatform);
            expect(trackingService.viewExpense).not.toHaveBeenCalled();
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseData.tx);
            expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(platformExpenseData.id);
            expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
            expect(spenderReportsService.addExpenses).not.toHaveBeenCalled();
            expect(spenderReportsService.ejectExpenses).toHaveBeenCalledOnceWith('rp8eUleN29dc', 'txvslh8aQMbu');
            expect(trackingService.addToExistingReportAddEditExpense).not.toHaveBeenCalled();
            expect(trackingService.removeFromExistingReportEditExpense).toHaveBeenCalledTimes(1);
            expect(res).toEqual(transformedExpenseData.tx);
            done();
          });
      });

      it('should throw policyViolations error and save the edited expense', (done) => {
        policyService.getCriticalPolicyRules.and.returnValue([]);
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            })
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: transformedExpenseData.tx,
              ou: transformedExpenseData.ou,
              dataUrls: [],
            });

            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'policyViolations',
              policyViolations: ['The expense will be flagged'],
              policyAction: expensePolicyData.data.final_desired_state,
              etxn: { tx: transformedExpenseData.tx, ou: transformedExpenseData.ou, dataUrls: [] },
            });
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseData.tx);
            expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(platformExpenseData.id);
            expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
            expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txvslh8aQMbu']);
            expect(spenderReportsService.ejectExpenses).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(expenseCommentService.findLatestExpenseComment).toHaveBeenCalledOnceWith(
              transformedExpenseData.tx.id,
              transformedExpenseData.tx.org_user_id
            );
            expect(expenseCommentService.post).toHaveBeenCalledOnceWith([
              {
                expense_id: transformedExpenseData.tx.id,
                comment: 'comment',
                notify: true,
              },
            ]);
            expect(res).toEqual(transformedExpenseData.tx);
            done();
          });
      });

      it('should throw policyViolations error and save the edited expense if policyViolations.data is undefined', (done) => {
        policyService.getCriticalPolicyRules.and.returnValue([]);
        const mockExpensePolicyData = cloneDeep(expensePolicyData);
        mockExpensePolicyData.data = undefined;
        component.checkPolicyViolation = jasmine.createSpy().and.returnValue(of(mockExpensePolicyData));
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            })
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: transformedExpenseData.tx,
              ou: transformedExpenseData.ou,
              dataUrls: [],
            });

            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'policyViolations',
              policyViolations: ['The expense will be flagged'],
              policyAction: undefined,
              etxn: { tx: transformedExpenseData.tx, ou: transformedExpenseData.ou, dataUrls: [] },
            });
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseData.tx);
            expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(platformExpenseData.id);
            expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
            expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txvslh8aQMbu']);
            expect(spenderReportsService.ejectExpenses).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(expenseCommentService.findLatestExpenseComment).toHaveBeenCalledOnceWith(
              transformedExpenseData.tx.id,
              transformedExpenseData.tx.org_user_id
            );
            expect(expenseCommentService.post).toHaveBeenCalledOnceWith([
              {
                expense_id: transformedExpenseData.tx.id,
                comment: 'comment',
                notify: true,
              },
            ]);
            expect(res).toEqual(transformedExpenseData.tx);
            done();
          });
      });

      it('should throw policyViolations error and save the edited expense if policyViolations is undefined', (done) => {
        policyService.getCriticalPolicyRules.and.returnValue([]);
        component.checkPolicyViolation = jasmine.createSpy().and.returnValue(of(undefined));
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            })
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: transformedExpenseData.tx,
              ou: transformedExpenseData.ou,
              dataUrls: [],
            });

            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'policyViolations',
              policyViolations: ['The expense will be flagged'],
              policyAction: undefined,
              etxn: { tx: transformedExpenseData.tx, ou: transformedExpenseData.ou, dataUrls: [] },
            });
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseData.tx);
            expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(platformExpenseData.id);
            expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
            expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txvslh8aQMbu']);
            expect(spenderReportsService.ejectExpenses).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(expenseCommentService.findLatestExpenseComment).toHaveBeenCalledOnceWith(
              transformedExpenseData.tx.id,
              transformedExpenseData.tx.org_user_id
            );
            expect(expenseCommentService.post).toHaveBeenCalledOnceWith([
              {
                expense_id: transformedExpenseData.tx.id,
                comment: 'comment',
                notify: true,
              },
            ]);
            expect(res).toEqual(transformedExpenseData.tx);
            done();
          });
      });

      it('should throw policyViolations error and save the edited expense and should not call expenseCommentService.post if err.comment is equal to latest comment', (done) => {
        policyService.getCriticalPolicyRules.and.returnValue([]);
        expenseCommentService.findLatestExpenseComment.and.returnValue(of('comment'));
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            })
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: transformedExpenseData.tx,
              ou: transformedExpenseData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'policyViolations',
              policyViolations: ['The expense will be flagged'],
              policyAction: expensePolicyData.data.final_desired_state,
              etxn: { tx: transformedExpenseData.tx, ou: transformedExpenseData.ou, dataUrls: [] },
            });
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseData.tx);
            expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(platformExpenseData.id);
            expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
            expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txvslh8aQMbu']);
            expect(spenderReportsService.ejectExpenses).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(expenseCommentService.findLatestExpenseComment).toHaveBeenCalledOnceWith(
              transformedExpenseData.tx.id,
              transformedExpenseData.tx.org_user_id
            );
            expect(expenseCommentService.post).not.toHaveBeenCalled();
            expect(res).toEqual(transformedExpenseData.tx);
            done();
          });
      });

      it('should throw policyViolations error and save the edited expense', (done) => {
        policyService.getCriticalPolicyRules.and.returnValue([]);
        const mockTxnData = cloneDeep(transformedExpenseData);
        mockTxnData.tx.policy_amount = 0.00009;
        component.editExpensePolicyViolationHandler = jasmine
          .createSpy()
          .and.returnValue(of({ etxn: mockTxnData, comment: 'comment' }));
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            })
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: transformedExpenseData.tx,
              ou: transformedExpenseData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'policyViolations',
              policyViolations: ['The expense will be flagged'],
              policyAction: expensePolicyData.data.final_desired_state,
              etxn: { tx: transformedExpenseData.tx, ou: transformedExpenseData.ou, dataUrls: [] },
            });
            expect(trackingService.editExpense).toHaveBeenCalledOnceWith(editExpensePropertiesPlatform);
            expect(trackingService.viewExpense).not.toHaveBeenCalled();
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(mockTxnData.tx);
            expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(platformExpenseData.id);
            expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
            expect(spenderReportsService.addExpenses).not.toHaveBeenCalled();
            expect(spenderReportsService.ejectExpenses).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).not.toHaveBeenCalled();
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(expenseCommentService.findLatestExpenseComment).toHaveBeenCalledOnceWith(
              transformedExpenseData.tx.id,
              transformedExpenseData.tx.org_user_id
            );
            expect(expenseCommentService.post).toHaveBeenCalledOnceWith([
              {
                expense_id: transformedExpenseData.tx.id,
                comment: 'comment',
                notify: true,
              },
            ]);
            expect(res).toEqual(transformedExpenseData.tx);
            done();
          });
      });

      it('should return etxn object and save the edited expense if policyRules is empty array', (done) => {
        policyService.getCriticalPolicyRules.and.returnValue([]);
        policyService.getPolicyRules.and.returnValue([]);
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            })
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: transformedExpenseData.tx,
              ou: transformedExpenseData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).not.toHaveBeenCalled();
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseData.tx);
            expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(platformExpenseData.id);
            expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
            expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txvslh8aQMbu']);
            expect(spenderReportsService.ejectExpenses).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(res).toEqual(transformedExpenseData.tx);
            done();
          });
      });

      it('should throw error and save the expense if any call fails', (done) => {
        const error = new Error('unhandledError');
        policyService.getCriticalPolicyRules.and.throwError(error);
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            })
          )
          .subscribe({
            next: (res) => {
              expect(component.savePerDiemLoader).toBeTrue();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
              expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
              expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
                tx: transformedExpenseData.tx,
                ou: transformedExpenseData.ou,
                dataUrls: [],
              });
              expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
              expect(policyService.getPolicyRules).not.toHaveBeenCalled();
              expect(component.editExpenseCriticalPolicyViolationHandler).toHaveBeenCalledOnceWith({
                type: 'criticalPolicyViolations',
                policyViolations: ['The expense will be flagged'],
                etxn: { tx: transformedExpenseData.tx, ou: transformedExpenseData.ou, dataUrls: [] },
              });
              expect(component.editExpensePolicyViolationHandler).not.toHaveBeenCalled();
              expect(trackingService.editExpense).not.toHaveBeenCalled();
              expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
              expect(transactionService.upsert).toHaveBeenCalledOnceWith(transformedExpenseData.tx);
              expect(expensesService.getExpenseById).toHaveBeenCalledOnceWith(platformExpenseData.id);
              expect(transactionService.transformExpense).toHaveBeenCalledOnceWith(platformExpenseData);
              expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith('rprAfNrce73O', ['txvslh8aQMbu']);
              expect(spenderReportsService.ejectExpenses).not.toHaveBeenCalled();
              expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
              expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
              expect(res).toEqual(transformedExpenseData.tx);
            },
            error: (err) => {
              expect(err).toBeTruthy();
              expect(err).toEqual(error);
              done();
            },
          });
      });
    });

    it('showAddToReportSuccessToast(): should show success message on adding expense to report', () => {
      const modalSpy = jasmine.createSpyObj('expensesAddedToReportSnackBar', ['onAction']);
      modalSpy.onAction.and.returnValue(of(true));
      matSnackBar.openFromComponent.and.returnValue(modalSpy);
      snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes2);

      component.showAddToReportSuccessToast('rpFE5X1Pqi9P');
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarPropertiesRes2,
        panelClass: ['msb-success-with-camera-icon'],
      });
      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith(ToastType.SUCCESS, {
        message: 'Per diem expense added to report successfully',
        redirectionText: 'View Report',
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: 'Per diem expense added to report successfully',
      });

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_report',
        { id: 'rpFE5X1Pqi9P', navigateBack: true },
      ]);
    });

    it('showFormValidationErrors(): should show form validation errors', () => {
      component.fg = formBuilder.group({
        ...perDiemFormValuesData10,
      });
      Object.defineProperty(component.fg, 'valid', {
        get: () => false,
      });
      spyOn(component.fg, 'markAllAsTouched');

      fixture.detectChanges();

      component.showFormValidationErrors();
      expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
    });

    describe('savePerDiem():', () => {
      beforeEach(() => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'editExpense').and.returnValue(of(unflattenedTxnData.tx));
        component.fg = formBuilder.group({
          ...perDiemFormValuesData10,
        });
        spyOn(component, 'goBack');
      });

      it('should add expense and go back if form and payment mode is valid', () => {
        component.savePerDiem();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.goBack).toHaveBeenCalledTimes(1);
      });

      it('should add expense and go back if form and payment mode is valid and user is in edit mode', () => {
        component.mode = 'edit';
        component.savePerDiem();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_PER_DIEM);
        expect(component.goBack).toHaveBeenCalledTimes(1);
      });

      it('should mark all fields as touched and scroll to invalid element if form is invalid', fakeAsync(() => {
        Object.defineProperty(component.fg, 'valid', {
          get: () => false,
        });
        spyOn(component, 'showFormValidationErrors');
        spyOn(component.fg, 'markAllAsTouched');
        component.savePerDiem();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      }));
    });
  });
}
