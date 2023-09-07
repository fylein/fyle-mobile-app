import { ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { TasksComponent } from './tasks.component';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ReportService } from 'src/app/core/services/report.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { finalize, of, tap } from 'rxjs';
import { apiExtendedReportRes } from 'src/app/core/mock-data/report.data';
import { noop } from 'lodash';
import { snackbarPropertiesRes2 } from 'src/app/core/mock-data/snackbar-properties.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { ToastType } from 'src/app/core/enums/toast-type.enum';

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
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let networkService: jasmine.SpyObj<NetworkService>;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(TasksComponent);
      component = fixture.componentInstance;
      tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
      transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      matBottomSheet = TestBed.inject(MatBottomSheet) as jasmine.SpyObj<MatBottomSheet>;
      matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
      snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    }));

    it('onPotentialDuplicatesTaskClick(): should navigate to potential duplicate page', () => {
      component.onPotentialDuplicatesTaskClick();
      expect(trackingService.duplicateTaskClicked).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/', 'enterprise', 'potential-duplicates']);
    });

    it('addTransactionsToReport(): should show loader, call reportService.addTransactions and hide the loader', (done) => {
      loaderService.showLoader.and.resolveTo();
      loaderService.hideLoader.and.resolveTo(true);

      reportService.addTransactions.and.returnValue(of(undefined));
      component
        .addTransactionsToReport(apiExtendedReportRes[0], ['tx5fBcPBAxLv'])
        .pipe(
          finalize(() => {
            expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
          }),
        )
        .subscribe((res) => {
          expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
          expect(reportService.addTransactions).toHaveBeenCalledOnceWith(apiExtendedReportRes[0].rp_id, [
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
  });
}
