import { ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { TasksComponent } from './tasks.component';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ReportService } from 'src/app/core/services/report.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { finalize, of, tap } from 'rxjs';
import { apiExtendedReportRes } from 'src/app/core/mock-data/report.data';
import { cloneDeep, noop } from 'lodash';
import { snackbarPropertiesRes2 } from 'src/app/core/mock-data/snackbar-properties.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { ToastType } from 'src/app/core/enums/toast-type.enum';
import { AddTxnToReportDialogComponent } from '../../my-expenses/add-txn-to-report-dialog/add-txn-to-report-dialog.component';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { expenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { unreportedExpensesQueryParams } from 'src/app/core/mock-data/platform/v1/expenses-query-params.data';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { orgSettingsPendingRestrictions } from 'src/app/core/mock-data/org-settings.data';
import { commuteDetailsResponseData } from 'src/app/core/mock-data/commute-details-response.data';
import { SpenderReportsService } from 'src/app/core/services/platform/v1/spender/reports.service';

export function TestCases3(getTestBed) {
  return describe('test case set 3', () => {
    let component: TasksComponent;
    let fixture: ComponentFixture<TasksComponent>;
    let tasksService: jasmine.SpyObj<TasksService>;
    let transactionService: jasmine.SpyObj<TransactionService>;
    let reportService: jasmine.SpyObj<ReportService>;
    let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let matBottomSheet: jasmine.SpyObj<MatBottomSheet>;
    let matSnackBar: jasmine.SpyObj<MatSnackBar>;
    let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
    let router: jasmine.SpyObj<Router>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let expensesService: jasmine.SpyObj<ExpensesService>;
    let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
    let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(TasksComponent);
      component = fixture.componentInstance;
      tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
      transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
      orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
      expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      matBottomSheet = TestBed.inject(MatBottomSheet) as jasmine.SpyObj<MatBottomSheet>;
      matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
      snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
      spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
      orgSettingsService.get.and.returnValue(of(orgSettingsPendingRestrictions));
    }));

    it('onPotentialDuplicatesTaskClick(): should navigate to potential duplicate page', () => {
      component.onPotentialDuplicatesTaskClick();
      expect(trackingService.duplicateTaskClicked).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'potential-duplicates']);
    });

    it('addTransactionsToReport(): should show loader, call spenderReportsService.addExpenses and hide the loader', (done) => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo(true);

      spenderReportsService.addExpenses.and.returnValue(of(undefined));
      component
        .addTransactionsToReport(apiExtendedReportRes[0], ['tx5fBcPBAxLv'])
        .pipe(
          finalize(() => {
            expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
          })
        )
        .subscribe((res) => {
          expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
          expect(spenderReportsService.addExpenses).toHaveBeenCalledOnceWith(apiExtendedReportRes[0].rp_id, [
            'tx5fBcPBAxLv',
          ]);
          expect(res).toEqual(apiExtendedReportRes[0]);
          done();
        });
    });

    it('showAddToReportSuccessToast(): should show success message on adding expense to report', () => {
      const modalSpy = jasmine.createSpyObj('expensesAddedToReportSnackBar', ['onAction']);
      modalSpy.onAction.and.returnValue(of(true));
      spyOn(component, 'doRefresh');
      matSnackBar.openFromComponent.and.returnValue(modalSpy);
      snackbarProperties.setSnackbarProperties.and.returnValue(snackbarPropertiesRes2);

      const message = 'Expenses added to report successfully';
      component.showAddToReportSuccessToast({ message: message, report: apiExtendedReportRes[0] });
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarPropertiesRes2,
        panelClass: ['msb-success-with-camera-icon'],
      });
      expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith(ToastType.SUCCESS, {
        message: message,
        redirectionText: 'View Report',
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: message,
      });
      expect(component.doRefresh).toHaveBeenCalledTimes(1);

      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'my_view_report',
        { id: 'rprAfNrce73O', navigateBack: true },
      ]);
    });

    describe('showOldReportsMatBottomSheet(): ', () => {
      beforeEach(() => {
        reportService.getAllExtendedReports.and.returnValue(of(apiExtendedReportRes));
        expensesService.getAllExpenses.and.returnValue(of([expenseData]));
        spyOn(component, 'showAddToReportSuccessToast');
        orgSettingsService.get.and.returnValue(of(orgSettingsPendingRestrictions));
      });

      it('should call matBottomSheet.open and call showAddToReportSuccessToast if data.report is defined', fakeAsync(() => {
        spyOn(component, 'addTransactionsToReport').and.returnValue(of(apiExtendedReportRes[0]));
        matBottomSheet.open.and.returnValue({
          afterDismissed: () =>
            of({
              report: apiExtendedReportRes[0],
            }),
        } as MatBottomSheetRef<AddTxnToReportDialogComponent>);

        component.showOldReportsMatBottomSheet();
        tick(100);

        expect(matBottomSheet.open).toHaveBeenCalledOnceWith(AddTxnToReportDialogComponent as any, {
          data: { openReports: apiExtendedReportRes },
          panelClass: ['mat-bottom-sheet-1'],
        });
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith(unreportedExpensesQueryParams);
        expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
          queryParams: { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' },
        });
        expect(component.addTransactionsToReport).toHaveBeenCalledOnceWith(apiExtendedReportRes[0], ['txcSFe6efB6R']);
        expect(component.showAddToReportSuccessToast).toHaveBeenCalledOnceWith({
          message: 'Expenses added to report successfully',
          report: apiExtendedReportRes[0],
        });
      }));

      it('should call matBottomSheet.open and call showAddToReportSuccessToast if report_approvals is defined and report is pending', fakeAsync(() => {
        const mockReport = cloneDeep(apiExtendedReportRes);
        mockReport[0].report_approvals = {
          out3t2X258rd: {
            rank: 0,
            state: 'APPROVAL_PENDING',
          },
        };
        reportService.getAllExtendedReports.and.returnValue(of(mockReport));
        spyOn(component, 'addTransactionsToReport').and.returnValue(of(mockReport[0]));
        matBottomSheet.open.and.returnValue({
          afterDismissed: () =>
            of({
              report: mockReport[0],
            }),
        } as MatBottomSheetRef<AddTxnToReportDialogComponent>);

        component.showOldReportsMatBottomSheet();
        tick(100);

        expect(matBottomSheet.open).toHaveBeenCalledOnceWith(AddTxnToReportDialogComponent as any, {
          data: { openReports: mockReport },
          panelClass: ['mat-bottom-sheet-1'],
        });
        expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith(unreportedExpensesQueryParams);
        expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
          queryParams: { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' },
        });
        expect(component.addTransactionsToReport).toHaveBeenCalledOnceWith(mockReport[0], ['txcSFe6efB6R']);
        expect(component.showAddToReportSuccessToast).toHaveBeenCalledOnceWith({
          message: 'Expenses added to report successfully',
          report: mockReport[0],
        });
      }));

      it('should call matBottomSheet.open and call showAddToReportSuccessToast if data.report is defined and rp_state is draft', fakeAsync(() => {
        const mockExtendedReportRes = cloneDeep(apiExtendedReportRes);
        mockExtendedReportRes[0].rp_state = 'DRAFT';
        reportService.getAllExtendedReports.and.returnValue(of(mockExtendedReportRes));
        spyOn(component, 'addTransactionsToReport').and.returnValue(of(mockExtendedReportRes[0]));
        matBottomSheet.open.and.returnValue({
          afterDismissed: () =>
            of({
              report: mockExtendedReportRes[0],
            }),
        } as MatBottomSheetRef<AddTxnToReportDialogComponent>);

        component.showOldReportsMatBottomSheet();
        tick(100);

        expect(matBottomSheet.open).toHaveBeenCalledOnceWith(AddTxnToReportDialogComponent as any, {
          data: { openReports: mockExtendedReportRes },
          panelClass: ['mat-bottom-sheet-1'],
        });
        expect(expensesService.getAllExpenses).toHaveBeenCalledOnceWith(unreportedExpensesQueryParams);
        expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
          queryParams: { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' },
        });
        expect(component.addTransactionsToReport).toHaveBeenCalledOnceWith(mockExtendedReportRes[0], ['txcSFe6efB6R']);
        expect(component.showAddToReportSuccessToast).toHaveBeenCalledOnceWith({
          message: 'Expenses added to an existing draft report',
          report: mockExtendedReportRes[0],
        });
      }));

      it('should call matBottomSheet.open and should not call showAddToReportSuccessToast if data.report is null', fakeAsync(() => {
        spyOn(component, 'addTransactionsToReport');
        orgSettingsService.get.and.returnValue(of(orgSettingsPendingRestrictions));
        matBottomSheet.open.and.returnValue({
          afterDismissed: () =>
            of({
              report: null,
            }),
        } as MatBottomSheetRef<AddTxnToReportDialogComponent>);

        component.showOldReportsMatBottomSheet();
        tick(100);

        expect(matBottomSheet.open).toHaveBeenCalledOnceWith(AddTxnToReportDialogComponent as any, {
          data: { openReports: apiExtendedReportRes },
          panelClass: ['mat-bottom-sheet-1'],
        });
        expect(expensesService.getAllExpenses).not.toHaveBeenCalled();
        expect(reportService.getAllExtendedReports).toHaveBeenCalledOnceWith({
          queryParams: { rp_state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' },
        });
        expect(component.addTransactionsToReport).not.toHaveBeenCalled();
        expect(component.showAddToReportSuccessToast).not.toHaveBeenCalled();
      }));
    });

    it('onExpensesToReportTaskClick(): should call showOldReportsMatBottomSheet once', () => {
      spyOn(component, 'showOldReportsMatBottomSheet');
      component.onExpensesToReportTaskClick();
      expect(component.showOldReportsMatBottomSheet).toHaveBeenCalledTimes(1);
    });

    it('autoSubmissionInfoCardClicked(): should call trackingService.autoSubmissionInfoCardClicked once', () => {
      component.autoSubmissionInfoCardClicked(true);
      expect(trackingService.autoSubmissionInfoCardClicked).toHaveBeenCalledOnceWith({
        isSeparateCard: true,
      });
    });

    describe('showToastMessage(): ', () => {
      it('should show success snackbar with message', () => {
        const message = 'Profile saved successfully';
        const successToastProperties = {
          data: {
            icon: 'check-square-fill',
            showCloseButton: true,
            message,
          },
          duration: 3000,
        };

        snackbarProperties.setSnackbarProperties.and.returnValue(successToastProperties);
        component.showToastMessage(message, 'success');

        expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
          ...successToastProperties,
          panelClass: 'msb-success',
        });
        expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', { message });
        expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
          ToastContent: message,
        });
      });

      it('should show error snackbar with message', () => {
        const message = 'Something went wrong';
        const failureToastProperties = {
          data: {
            icon: 'warning-fill',
            showCloseButton: true,
            message,
          },
          duration: 3000,
        };

        snackbarProperties.setSnackbarProperties.and.returnValue(failureToastProperties);
        component.showToastMessage(message, 'failure');

        expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
          ...failureToastProperties,
          panelClass: 'msb-failure',
        });
        expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('failure', { message });
        expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
          ToastContent: message,
        });
      });
    });

    it('onCommuteDetailsTaskClick(): should show toast message and refresh the tasks if commute details are saved', fakeAsync(() => {
      spyOn(component, 'showToastMessage');
      spyOn(component, 'doRefresh');
      const commuteDetailsModalSpy = jasmine.createSpyObj('commuteDetailsModal', ['present', 'onWillDismiss']);
      commuteDetailsModalSpy.onWillDismiss.and.resolveTo({
        data: { action: 'save', commuteDetails: commuteDetailsResponseData.data[0] },
      });
      modalController.create.and.resolveTo(commuteDetailsModalSpy);

      component.onCommuteDetailsTaskClick();
      tick(100);

      expect(component.showToastMessage).toHaveBeenCalledOnceWith('Commute details saved successfully', 'success');
      expect(trackingService.commuteDeductionDetailsAddedFromSpenderTask).toHaveBeenCalledOnceWith(
        commuteDetailsResponseData.data[0]
      );
      expect(component.doRefresh).toHaveBeenCalledTimes(1);
    }));
  });
}
