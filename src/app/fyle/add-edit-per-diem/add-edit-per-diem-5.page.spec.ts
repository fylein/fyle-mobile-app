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
import { Observable, Subject, Subscription, finalize, of } from 'rxjs';
import { outboxQueueData1 } from 'src/app/core/mock-data/outbox-queue.data';
import { unflattenedTxnData } from 'src/app/core/mock-data/unflattened-txn.data';
import { perDiemFormValuesData10 } from 'src/app/core/mock-data/per-diem-form-value.data';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { expenseData1 } from 'src/app/core/mock-data/expense.data';
import { properties } from 'src/app/core/mock-data/modal-properties.data';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { getElementRef } from 'src/app/core/dom-helpers';
import { individualExpPolicyStateData1 } from 'src/app/core/mock-data/individual-expense-policy-state.data';
import { PerDiemRedirectedFrom } from 'src/app/core/models/per-diem-redirected-from.enum';

export function TestCases5(getTestBed) {
  return describe('add-edit-per-diem test cases set 5', () => {
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

    function setMockFormValidity(isValid: boolean) {
      Object.defineProperty(component.fg, 'valid', {
        get: () => isValid,
      });
    }

    it('reloadCurrentRoute(): should reload the current route', fakeAsync(() => {
      component.reloadCurrentRoute();
      tick(100);

      expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/enterprise/my_expenses', { skipLocationChange: true });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'add_edit_per_diem']);
    }));

    describe('saveAndNewExpense():', () => {
      beforeEach(() => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'editExpense').and.returnValue(of(unflattenedTxnData.tx));
        component.fg = formBuilder.group({
          ...perDiemFormValuesData10,
        });
        spyOn(component, 'goBack');
        spyOn(component, 'reloadCurrentRoute');
      });

      it('should add expense and reload current route if form and payment mode is valid', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        component.saveAndNewExpense();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEW_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.goBack).not.toHaveBeenCalled();
        expect(component.reloadCurrentRoute).toHaveBeenCalledTimes(1);
      });

      it('should add expense and go back if form and payment mode is valid and user is in edit mode', () => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(false));
        component.mode = 'edit';
        component.saveAndNewExpense();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEW_PER_DIEM);
        expect(component.goBack).toHaveBeenCalledTimes(1);
        expect(component.reloadCurrentRoute).not.toHaveBeenCalled();
      });

      it('should mark all fields as touched and scroll to invalid element if form is invalid', fakeAsync(() => {
        spyOn(component, 'checkIfInvalidPaymentMode').and.returnValue(of(true));
        spyOn(component, 'showFormValidationErrors');
        spyOn(component.fg, 'markAllAsTouched');
        component.saveAndNewExpense();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
        expect(component.invalidPaymentMode).toBeTrue();
        tick(3000);
        expect(component.invalidPaymentMode).toBeFalse();
      }));
    });

    describe('saveExpenseAndGotoPrev():', () => {
      beforeEach(() => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'editExpense').and.returnValue(of(unflattenedTxnData.tx));
        spyOn(component, 'close');
        spyOn(component, 'goToPrev');
        spyOn(component, 'showFormValidationErrors');
        component.activeIndex = 0;
        component.mode = 'add';
      });

      it('should close the current page if form is valid, user is in add mode and expense is the first one in list', () => {
        setMockFormValidity(true);
        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).toHaveBeenCalledTimes(1);
        expect(component.goToPrev).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should go to previous page if form is valid, user is in add mode and expense is not the first one in list', () => {
        setMockFormValidity(true);
        component.activeIndex = 1;
        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToPrev).toHaveBeenCalledTimes(1);
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should close the current page if form is valid, user is in edit mode and expense is the first one in list', () => {
        setMockFormValidity(true);
        component.mode = 'edit';
        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM);
        expect(component.close).toHaveBeenCalledTimes(1);
        expect(component.goToPrev).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should go to previous page if form is valid, user is in edit mode and expense is not the first one in list', () => {
        setMockFormValidity(true);
        component.activeIndex = 1;
        component.mode = 'edit';
        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_PREV_PER_DIEM);
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToPrev).toHaveBeenCalledTimes(1);
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should show validation errors if the form is not valid', () => {
        setMockFormValidity(false);
        component.saveExpenseAndGotoPrev();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToPrev).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      });
    });

    describe('saveExpenseAndGotoNext():', () => {
      beforeEach(() => {
        spyOn(component, 'addExpense').and.returnValue(of(outboxQueueData1[0]));
        spyOn(component, 'editExpense').and.returnValue(of(unflattenedTxnData.tx));
        spyOn(component, 'close');
        spyOn(component, 'goToNext');
        spyOn(component, 'showFormValidationErrors');
        component.activeIndex = 0;
        component.mode = 'add';
        component.reviewList = ['txSEM4DtjyKR'];
      });

      it('should close the current page if form is valid, user is in add mode and expense is the first one in list', () => {
        setMockFormValidity(true);
        component.saveExpenseAndGotoNext();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).toHaveBeenCalledTimes(1);
        expect(component.goToNext).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should go to next page if form is valid, user is in add mode and expense is not the first one in list', () => {
        setMockFormValidity(true);
        component.activeIndex = 1;
        component.saveExpenseAndGotoNext();
        expect(component.addExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM);
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToNext).toHaveBeenCalledTimes(1);
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should close the current page if form is valid, user is in edit mode and expense is the first one in list', () => {
        setMockFormValidity(true);
        component.mode = 'edit';
        component.saveExpenseAndGotoNext();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM);
        expect(component.close).toHaveBeenCalledTimes(1);
        expect(component.goToNext).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should go to next page if form is valid, user is in edit mode and expense is not the first one in list', () => {
        setMockFormValidity(true);
        component.activeIndex = 1;
        component.mode = 'edit';
        component.saveExpenseAndGotoNext();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).toHaveBeenCalledOnceWith(PerDiemRedirectedFrom.SAVE_AND_NEXT_PER_DIEM);
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToNext).toHaveBeenCalledTimes(1);
        expect(component.showFormValidationErrors).not.toHaveBeenCalled();
      });

      it('should show validation errors if the form is not valid', () => {
        setMockFormValidity(false);
        component.saveExpenseAndGotoNext();
        expect(component.addExpense).not.toHaveBeenCalled();
        expect(component.editExpense).not.toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
        expect(component.goToNext).not.toHaveBeenCalled();
        expect(component.showFormValidationErrors).toHaveBeenCalledTimes(1);
      });
    });

    it('close(): should navigate to my expenses page', () => {
      component.close();
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
    });

    describe('getDeleteReportParams():', () => {
      it('should return modal params and method to remove expense from report if removePerDiemFromReport is true', () => {
        reportService.removeTransaction.and.returnValue(of());

        component
          .getDeleteReportParams(
            { header: 'Header', body: 'body', ctaText: 'Action', ctaLoadingText: 'Loading' },
            true,
            'tx5n59fvxk4z',
            'rpFE5X1Pqi9P',
          )
          .componentProps.deleteMethod();
        expect(reportService.removeTransaction).toHaveBeenCalledOnceWith('rpFE5X1Pqi9P', 'tx5n59fvxk4z');
        expect(transactionService.delete).not.toHaveBeenCalled();
      });

      it('should return modal params and method to delete expense if removePerDiemFromReport is false', () => {
        transactionService.delete.and.returnValue(of(expenseData1));
        component
          .getDeleteReportParams(
            { header: 'Header', body: 'body', ctaText: 'Action', ctaLoadingText: 'Loading' },
            false,
            'tx5n59fvxk4z',
          )
          .componentProps.deleteMethod();
        expect(transactionService.delete).toHaveBeenCalledOnceWith('tx5n59fvxk4z');
        expect(reportService.removeTransaction).not.toHaveBeenCalled();
      });
    });

    describe('deleteExpense():', () => {
      beforeEach(() => {
        activatedRoute.snapshot.params = {
          id: 'tx5n59fvxk4z',
        };
      });

      it('should delete expense and navigate to my_view_report if deleting directly from report', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: 'success',
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        component.isRedirectedFromReport = true;

        const header = 'Remove Per Diem';
        const body = 'Are you sure you want to remove this Per Diem expense from this report?';
        const ctaText = 'Remove';
        const ctaLoadingText = 'Removing';

        component.deleteExpense('rpFE5X1Pqi9P');
        tick(100);

        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_view_report', { id: 'rpFE5X1Pqi9P' }]);
        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith(
          { header, body, ctaText, ctaLoadingText },
          true,
          'tx5n59fvxk4z',
          'rpFE5X1Pqi9P',
        );
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams(
            { header, body, ctaText, ctaLoadingText },
            true,
            'tx5n59fvxk4z',
            'rpFE5X1Pqi9P',
          ),
        );
      }));

      it('should delete expense and navigate to my expenses page if not redirected from report', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: 'success',
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        component.isRedirectedFromReport = false;

        const header = 'Delete Per Diem';
        const body = 'Are you sure you want to delete this Per Diem expense?';
        const ctaText = 'Delete';
        const ctaLoadingText = 'Deleting';

        component.deleteExpense();
        tick(100);

        expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_expenses']);
        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith(
          { header, body, ctaText, ctaLoadingText },
          undefined,
          'tx5n59fvxk4z',
          undefined,
        );
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams(
            { header, body, ctaText, ctaLoadingText },
            undefined,
            'tx5n59fvxk4z',
            undefined,
          ),
        );
      }));

      it('should go to next expense if delete is successful and expense is not the last one in list', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        spyOn(component, 'goToTransaction');
        transactionService.getETxnUnflattened.and.returnValue(of(unflattenedTxnData));
        component.reviewList = ['txfCdl3TEZ7K', 'txCYDX0peUw5'];
        component.activeIndex = 0;

        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: 'success',
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        component.isRedirectedFromReport = true;

        const header = 'Delete Per Diem';
        const body = 'Are you sure you want to delete this Per Diem expense?';
        const ctaText = 'Delete';
        const ctaLoadingText = 'Deleting';

        component.deleteExpense();
        tick(100);

        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith(
          { header, body, ctaText, ctaLoadingText },
          undefined,
          'tx5n59fvxk4z',
          undefined,
        );
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams(
            { header, body, ctaText, ctaLoadingText },
            undefined,
            'tx5n59fvxk4z',
            undefined,
          ),
        );
        expect(transactionService.getETxnUnflattened).toHaveBeenCalledOnceWith(
          component.reviewList[+component.activeIndex],
        );
        expect(component.goToTransaction).toHaveBeenCalledOnceWith(
          unflattenedTxnData,
          component.reviewList,
          +component.activeIndex,
        );
      }));

      it('should track clickDeleteExpense if popover fails and user is in add mode', fakeAsync(() => {
        spyOn(component, 'getDeleteReportParams');
        const deletePopoverSpy = jasmine.createSpyObj('deletePopover', ['present', 'onDidDismiss']);

        deletePopoverSpy.onDidDismiss.and.resolveTo({
          data: {
            status: 'failure',
          },
        });

        popoverController.create.and.resolveTo(deletePopoverSpy);
        component.isRedirectedFromReport = true;

        const header = 'Remove Per Diem';
        const body = 'Are you sure you want to remove this Per Diem expense from this report?';
        const ctaText = 'Remove';
        const ctaLoadingText = 'Removing';

        component.deleteExpense('rpFE5X1Pqi9P');
        tick(100);

        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.getDeleteReportParams).toHaveBeenCalledOnceWith(
          { header, body, ctaText, ctaLoadingText },
          true,
          'tx5n59fvxk4z',
          'rpFE5X1Pqi9P',
        );
        expect(popoverController.create).toHaveBeenCalledOnceWith(
          component.getDeleteReportParams(
            { header, body, ctaText, ctaLoadingText },
            true,
            'tx5n59fvxk4z',
            'rpFE5X1Pqi9P',
          ),
        );
        expect(trackingService.clickDeleteExpense).toHaveBeenCalledOnceWith({ Type: 'Per Diem' });
      }));
    });

    describe('openCommentsModal():', () => {
      it('should add comment if data.updated is defined', fakeAsync(() => {
        component.etxn$ = of(unflattenedTxnData);
        modalProperties.getModalDefaultProperties.and.returnValue(properties);
        const modalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);

        modalSpy.onDidDismiss.and.resolveTo({ data: { updated: 'comment' } });

        modalController.create.and.resolveTo(modalSpy);

        component.openCommentsModal();
        tick(100);

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
        expect(trackingService.viewComment).not.toHaveBeenCalled();
      }));

      it('should view comment if data.updated is undefined', fakeAsync(() => {
        component.etxn$ = of(unflattenedTxnData);
        modalProperties.getModalDefaultProperties.and.returnValue(properties);
        const modalSpy = jasmine.createSpyObj('modal', ['present', 'onDidDismiss']);

        modalSpy.onDidDismiss.and.resolveTo({ data: {} });

        modalController.create.and.resolveTo(modalSpy);

        component.openCommentsModal();
        tick(100);

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
        expect(trackingService.addComment).not.toHaveBeenCalled();
      }));
    });

    it('hideFields(): should track hideMoreClicked and set isExpandedView to false', () => {
      component.isExpandedView = true;
      component.hideFields();
      expect(component.isExpandedView).toBeFalse();
      expect(trackingService.hideMoreClicked).toHaveBeenCalledOnceWith({
        source: 'Add Edit Per Diem page',
      });
    });

    it('showFields(): should track showMoreClicked and set isExpandedView to true', () => {
      component.isExpandedView = false;
      component.showFields();
      expect(component.isExpandedView).toBeTrue();
      expect(trackingService.showMoreClicked).toHaveBeenCalledOnceWith({
        source: 'Add Edit Per Diem page',
      });
    });

    it('getPolicyDetails(): should call getSpenderExpensePolicyViolations and update policyDetails', () => {
      activatedRoute.snapshot.params = {
        id: 'tx5n59fvxk4z',
      };
      policyService.getSpenderExpensePolicyViolations.and.returnValue(of([individualExpPolicyStateData1]));
      component.getPolicyDetails();
      expect(policyService.getSpenderExpensePolicyViolations).toHaveBeenCalledOnceWith('tx5n59fvxk4z');
      expect(component.policyDetails).toEqual([individualExpPolicyStateData1]);
    });

    describe('ionViewWillLeave():', () => {
      it('should unsubscribe and complete observable as component leaves', () => {
        const dependentFieldSpy = jasmine.createSpyObj('DependentFieldComponent', ['ngOnDestroy']);

        component.projectDependentFieldsRef = dependentFieldSpy;
        component.costCenterDependentFieldsRef = dependentFieldSpy;
        component.hardwareBackButtonAction = new Subscription();
        component.onPageExit$ = new Subject();
        spyOn(component.hardwareBackButtonAction, 'unsubscribe');
        spyOn(component.onPageExit$, 'next');
        spyOn(component.onPageExit$, 'complete');

        component.ionViewWillLeave();

        expect(dependentFieldSpy.ngOnDestroy).toHaveBeenCalledTimes(2);
        expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalledTimes(1);
        expect(component.onPageExit$.next).toHaveBeenCalledOnceWith(null);
        expect(component.onPageExit$.complete).toHaveBeenCalledTimes(1);
      });

      it('should unsubscribe remaining observables as dependent fields are not present', () => {
        component.projectDependentFieldsRef = null;
        component.costCenterDependentFieldsRef = null;
        component.hardwareBackButtonAction = new Subscription();
        spyOn(component.hardwareBackButtonAction, 'unsubscribe');
        component.onPageExit$ = new Subject();
        spyOn(component.onPageExit$, 'next');
        spyOn(component.onPageExit$, 'complete');

        component.ionViewWillLeave();

        expect(component.hardwareBackButtonAction.unsubscribe).toHaveBeenCalledTimes(1);
        expect(component.onPageExit$.next).toHaveBeenCalledOnceWith(null);
        expect(component.onPageExit$.complete).toHaveBeenCalledTimes(1);
      });
    });
  });
}
