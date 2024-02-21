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
import { Observable, finalize, of } from 'rxjs';
import { estatusData1 } from 'src/app/core/test-data/status.service.spec.data';
import { unflattenedTxnData, unflattenedTxnData2 } from 'src/app/core/mock-data/unflattened-txn.data';
import { criticalPolicyViolation1 } from 'src/app/core/mock-data/crtical-policy-violations.data';
import { policyViolation1 } from 'src/app/core/mock-data/policy-violation.data';
import { unflattenedExpData } from 'src/app/core/mock-data/unflattened-expense.data';
import { expensePolicyData } from 'src/app/core/mock-data/expense-policy.data';
import { txnCustomProperties4 } from 'src/app/core/mock-data/txn-custom-properties.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { perDiemFormValuesData10 } from 'src/app/core/mock-data/per-diem-form-value.data';
import { extendedReportParam } from 'src/app/core/mock-data/report-unflattened.data';
import { txnStatusData } from 'src/app/core/mock-data/transaction-status.data';
import { createExpenseProperties3, editExpenseProperties } from 'src/app/core/mock-data/track-expense-properties.data';
import { cloneDeep } from 'lodash';
import { UnflattenedTransaction } from 'src/app/core/models/unflattened-transaction.model';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { snackbarPropertiesRes2 } from 'src/app/core/mock-data/snackbar-properties.data';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { outboxQueueData1 } from 'src/app/core/mock-data/outbox-queue.data';
import { PerDiemRedirectedFrom } from 'src/app/core/models/per-diem-redirected-from.enum';

export function TestCases4(getTestBed) {
  return describe('add-edit-per-diem test cases set 4', () => {
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
              policyViolation1.data.final_desired_state,
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
              policyViolation1.data.final_desired_state,
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

    describe('editExpense():', () => {
      const etxn$ = of({ tx: unflattenedTxnData.tx, ou: unflattenedTxnData.ou, dataUrls: [] });
      const customFields$ = of(txnCustomProperties4);
      beforeEach(() => {
        spyOn(component, 'trackPolicyCorrections');
        spyOn(component, 'generateEtxnFromFg').and.returnValue(etxn$);
        spyOn(component, 'getCustomFields').and.returnValue(customFields$);
        component.isConnected$ = of(true);
        spyOn(component, 'checkPolicyViolation').and.returnValue(of(expensePolicyData));
        policyService.getCriticalPolicyRules.and.returnValue(['The expense will be flagged']);
        policyService.getPolicyRules.and.returnValue(['The expense will be flagged']);
        spyOn(component, 'editExpenseCriticalPolicyViolationHandler').and.returnValue(of({ etxn: unflattenedTxnData }));
        spyOn(component, 'editExpensePolicyViolationHandler').and.returnValue(
          of({ etxn: unflattenedTxnData, comment: 'comment' }),
        );
        authService.getEou.and.resolveTo(apiEouRes);
        spyOn(component, 'getFormValues').and.returnValue({
          ...perDiemFormValuesData10,
          report: extendedReportParam[0],
        });
        transactionService.upsert.and.returnValue(of(unflattenedTxnData.tx));
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
        reportService.addTransactions.and.returnValue(of(undefined));
        reportService.removeTransaction.and.returnValue(of(undefined));
        transactionService.review.and.returnValue(of(null));
        statusService.findLatestComment.and.returnValue(of('comment1'));
        statusService.post.and.returnValue(of(txnStatusData));
        component.etxn$ = of(unflattenedTxnData);
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
            }),
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: unflattenedTxnData.tx,
              ou: unflattenedTxnData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).not.toHaveBeenCalled();
            expect(component.editExpenseCriticalPolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'criticalPolicyViolations',
              policyViolations: ['The expense will be flagged'],
              etxn: { tx: unflattenedTxnData.tx, ou: unflattenedTxnData.ou, dataUrls: [] },
            });
            expect(component.editExpensePolicyViolationHandler).not.toHaveBeenCalled();
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
            expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rp5eUkeNm9wB', ['tx3qHxFNgRcZ']);
            expect(reportService.removeTransaction).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(res).toEqual(unflattenedTxnData.tx);
            done();
          });
      });

      it('should throw criticalPolicyViolations error and save the edited expense in new report and remove the expense from previous report if reportId is different', (done) => {
        const mockTxnData = cloneDeep(unflattenedTxnData);
        mockTxnData.tx.report_id = 'rp8eUleN29dc';
        component.etxn$ = of(mockTxnData);
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            }),
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: unflattenedTxnData.tx,
              ou: unflattenedTxnData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).not.toHaveBeenCalled();
            expect(component.editExpenseCriticalPolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'criticalPolicyViolations',
              policyViolations: ['The expense will be flagged'],
              etxn: { tx: unflattenedTxnData.tx, ou: unflattenedTxnData.ou, dataUrls: [] },
            });
            expect(component.editExpensePolicyViolationHandler).not.toHaveBeenCalled();
            expect(trackingService.editExpense).toHaveBeenCalledOnceWith(editExpenseProperties);
            expect(trackingService.viewExpense).not.toHaveBeenCalled();
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
            expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rp5eUkeNm9wB', ['tx3qHxFNgRcZ']);
            expect(reportService.removeTransaction).toHaveBeenCalledOnceWith('rp8eUleN29dc', 'tx3qHxFNgRcZ');
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(res).toEqual(unflattenedTxnData.tx);
            done();
          });
      });

      it('should throw criticalPolicyViolations error and save the edited expense and remove the expense from previous report if reportId field is empty in form', (done) => {
        const mockTxnData = cloneDeep(unflattenedTxnData);
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
            }),
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: unflattenedTxnData.tx,
              ou: unflattenedTxnData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).not.toHaveBeenCalled();
            expect(component.editExpenseCriticalPolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'criticalPolicyViolations',
              policyViolations: ['The expense will be flagged'],
              etxn: { tx: unflattenedTxnData.tx, ou: unflattenedTxnData.ou, dataUrls: [] },
            });
            expect(component.editExpensePolicyViolationHandler).not.toHaveBeenCalled();
            expect(trackingService.editExpense).toHaveBeenCalledOnceWith(editExpenseProperties);
            expect(trackingService.viewExpense).not.toHaveBeenCalled();
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
            expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(reportService.addTransactions).not.toHaveBeenCalled();
            expect(reportService.removeTransaction).toHaveBeenCalledOnceWith('rp8eUleN29dc', 'tx3qHxFNgRcZ');
            expect(trackingService.addToExistingReportAddEditExpense).not.toHaveBeenCalled();
            expect(trackingService.removeFromExistingReportEditExpense).toHaveBeenCalledTimes(1);
            expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(res).toEqual(unflattenedTxnData.tx);
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
            }),
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: unflattenedTxnData.tx,
              ou: unflattenedTxnData.ou,
              dataUrls: [],
            });

            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'policyViolations',
              policyViolations: ['The expense will be flagged'],
              policyAction: expensePolicyData.data.final_desired_state,
              etxn: { tx: unflattenedTxnData.tx, ou: unflattenedTxnData.ou, dataUrls: [] },
            });
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
            expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rp5eUkeNm9wB', ['tx3qHxFNgRcZ']);
            expect(reportService.removeTransaction).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
              unflattenedTxnData.tx.id,
              'transactions',
              unflattenedTxnData.tx.org_user_id,
            );
            expect(statusService.post).toHaveBeenCalledOnceWith(
              'transactions',
              unflattenedTxnData.tx.id,
              { comment: 'comment' },
              true,
            );
            expect(res).toEqual(unflattenedTxnData.tx);
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
            }),
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: unflattenedTxnData.tx,
              ou: unflattenedTxnData.ou,
              dataUrls: [],
            });

            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'policyViolations',
              policyViolations: ['The expense will be flagged'],
              policyAction: undefined,
              etxn: { tx: unflattenedTxnData.tx, ou: unflattenedTxnData.ou, dataUrls: [] },
            });
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
            expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rp5eUkeNm9wB', ['tx3qHxFNgRcZ']);
            expect(reportService.removeTransaction).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
              unflattenedTxnData.tx.id,
              'transactions',
              unflattenedTxnData.tx.org_user_id,
            );
            expect(statusService.post).toHaveBeenCalledOnceWith(
              'transactions',
              unflattenedTxnData.tx.id,
              { comment: 'comment' },
              true,
            );
            expect(res).toEqual(unflattenedTxnData.tx);
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
            }),
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: unflattenedTxnData.tx,
              ou: unflattenedTxnData.ou,
              dataUrls: [],
            });

            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'policyViolations',
              policyViolations: ['The expense will be flagged'],
              policyAction: undefined,
              etxn: { tx: unflattenedTxnData.tx, ou: unflattenedTxnData.ou, dataUrls: [] },
            });
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
            expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rp5eUkeNm9wB', ['tx3qHxFNgRcZ']);
            expect(reportService.removeTransaction).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
              unflattenedTxnData.tx.id,
              'transactions',
              unflattenedTxnData.tx.org_user_id,
            );
            expect(statusService.post).toHaveBeenCalledOnceWith(
              'transactions',
              unflattenedTxnData.tx.id,
              { comment: 'comment' },
              true,
            );
            expect(res).toEqual(unflattenedTxnData.tx);
            done();
          });
      });

      it('should throw policyViolations error and save the edited expense and should not call statusService.post if err.comment is equal to latest comment', (done) => {
        policyService.getCriticalPolicyRules.and.returnValue([]);
        statusService.findLatestComment.and.returnValue(of('comment'));
        component
          .editExpense(PerDiemRedirectedFrom.SAVE_PER_DIEM)
          .pipe(
            finalize(() => {
              expect(component.savePerDiemLoader).toBeFalse();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            }),
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: unflattenedTxnData.tx,
              ou: unflattenedTxnData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'policyViolations',
              policyViolations: ['The expense will be flagged'],
              policyAction: expensePolicyData.data.final_desired_state,
              etxn: { tx: unflattenedTxnData.tx, ou: unflattenedTxnData.ou, dataUrls: [] },
            });
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
            expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rp5eUkeNm9wB', ['tx3qHxFNgRcZ']);
            expect(reportService.removeTransaction).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
              unflattenedTxnData.tx.id,
              'transactions',
              unflattenedTxnData.tx.org_user_id,
            );
            expect(statusService.post).not.toHaveBeenCalled();
            expect(res).toEqual(unflattenedTxnData.tx);
            done();
          });
      });

      it('should throw policyViolations error and save the edited expense and should not call transactionService.review if critical policy is violated', (done) => {
        policyService.getCriticalPolicyRules.and.returnValue([]);
        const mockTxnData = cloneDeep(unflattenedTxnData);
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
            }),
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: unflattenedTxnData.tx,
              ou: unflattenedTxnData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).toHaveBeenCalledOnceWith({
              type: 'policyViolations',
              policyViolations: ['The expense will be flagged'],
              policyAction: expensePolicyData.data.final_desired_state,
              etxn: { tx: unflattenedTxnData.tx, ou: unflattenedTxnData.ou, dataUrls: [] },
            });
            expect(trackingService.editExpense).toHaveBeenCalledOnceWith(editExpenseProperties);
            expect(trackingService.viewExpense).not.toHaveBeenCalled();
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(mockTxnData.tx);
            expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(reportService.addTransactions).not.toHaveBeenCalled();
            expect(reportService.removeTransaction).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).not.toHaveBeenCalled();
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(transactionService.review).not.toHaveBeenCalled();
            expect(statusService.findLatestComment).toHaveBeenCalledOnceWith(
              unflattenedTxnData.tx.id,
              'transactions',
              unflattenedTxnData.tx.org_user_id,
            );
            expect(statusService.post).toHaveBeenCalledOnceWith(
              'transactions',
              unflattenedTxnData.tx.id,
              { comment: 'comment' },
              true,
            );
            expect(res).toEqual(unflattenedTxnData.tx);
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
            }),
          )
          .subscribe((res) => {
            expect(component.savePerDiemLoader).toBeTrue();
            expect(component.saveAndNextPerDiemLoader).toBeFalse();
            expect(component.saveAndPrevPerDiemLoader).toBeFalse();
            expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
            expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
              tx: unflattenedTxnData.tx,
              ou: unflattenedTxnData.ou,
              dataUrls: [],
            });
            expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
            expect(policyService.getPolicyRules).toHaveBeenCalledTimes(1);
            expect(component.editExpenseCriticalPolicyViolationHandler).not.toHaveBeenCalled();
            expect(component.editExpensePolicyViolationHandler).not.toHaveBeenCalled();
            expect(trackingService.editExpense).not.toHaveBeenCalled();
            expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
            expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
            expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rp5eUkeNm9wB', ['tx3qHxFNgRcZ']);
            expect(reportService.removeTransaction).not.toHaveBeenCalled();
            expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
            expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
            expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
            expect(res).toEqual(unflattenedTxnData.tx);
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
            }),
          )
          .subscribe({
            next: (res) => {
              expect(component.savePerDiemLoader).toBeTrue();
              expect(component.saveAndNextPerDiemLoader).toBeFalse();
              expect(component.saveAndPrevPerDiemLoader).toBeFalse();
              expect(component.generateEtxnFromFg).toHaveBeenCalledOnceWith(component.etxn$, customFields$);
              expect(component.checkPolicyViolation).toHaveBeenCalledOnceWith({
                tx: unflattenedTxnData.tx,
                ou: unflattenedTxnData.ou,
                dataUrls: [],
              });
              expect(policyService.getCriticalPolicyRules).toHaveBeenCalledTimes(1);
              expect(policyService.getPolicyRules).not.toHaveBeenCalled();
              expect(component.editExpenseCriticalPolicyViolationHandler).toHaveBeenCalledOnceWith({
                type: 'criticalPolicyViolations',
                policyViolations: ['The expense will be flagged'],
                etxn: { tx: unflattenedTxnData.tx, ou: unflattenedTxnData.ou, dataUrls: [] },
              });
              expect(component.editExpensePolicyViolationHandler).not.toHaveBeenCalled();
              expect(trackingService.editExpense).not.toHaveBeenCalled();
              expect(trackingService.viewExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
              expect(transactionService.upsert).toHaveBeenCalledOnceWith(unflattenedTxnData.tx);
              expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
              expect(reportService.addTransactions).toHaveBeenCalledOnceWith('rp5eUkeNm9wB', ['tx3qHxFNgRcZ']);
              expect(reportService.removeTransaction).not.toHaveBeenCalled();
              expect(trackingService.addToExistingReportAddEditExpense).toHaveBeenCalledTimes(1);
              expect(trackingService.removeFromExistingReportEditExpense).not.toHaveBeenCalled();
              expect(transactionService.review).toHaveBeenCalledOnceWith(unflattenedTxnData.tx.id);
              expect(res).toEqual(unflattenedTxnData.tx);
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
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        component.savePerDiem();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.goBack).toHaveBeenCalledTimes(1);
      });

      it('should add expense and go back if form and payment mode is valid and user is in edit mode', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        component.mode = 'edit';
        component.savePerDiem();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_PER_DIEM);
        expect(component.goBack).toHaveBeenCalledTimes(1);
      });

      it('should mark all fields as touched and scroll to invalid element if form is invalid', fakeAsync(() => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(true));
        Object.defineProperty(component.fg, 'valid', {
          get: () => false,
        });
        spyOn(component, 'showFormValidationErrors');
        spyOn(component.fg, 'markAllAsTouched');
        component.savePerDiem();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
        expect(component.invalidPaymentMode).toBeTrue();
        tick(3000);
        expect(component.invalidPaymentMode).toBeFalse();
      }));
    });
  });
}
