import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { duplicateSetData1, duplicateSetData2 } from 'src/app/core/mock-data/duplicate-sets.data';
import { apiExpenseRes, etxncData, expenseData1 } from 'src/app/core/mock-data/expense.data';
import { dismissExpenseSnackbarProps } from 'src/app/core/mock-data/snackbar-properties.data';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { PotentialDuplicatesPage } from './potential-duplicates.page';

describe('PotentialDuplicatesPage', () => {
  let component: PotentialDuplicatesPage;
  let fixture: ComponentFixture<PotentialDuplicatesPage>;
  let handleDuplicates: jasmine.SpyObj<HandleDuplicatesService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let router: jasmine.SpyObj<Router>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    const handleDuplicatesSpy = jasmine.createSpyObj('HandleDuplicatesService', ['getDuplicateSets', 'dismissAll']);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getETxnc']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'dismissedIndividualExpenses',
      'dismissedDuplicateSet',
      'visitedMergeExpensesPageFromTask',
    ]);

    TestBed.configureTestingModule({
      declarations: [PotentialDuplicatesPage],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: HandleDuplicatesService,
          useValue: handleDuplicatesSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PotentialDuplicatesPage);
    component = fixture.componentInstance;

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    handleDuplicates = TestBed.inject(HandleDuplicatesService) as jasmine.SpyObj<HandleDuplicatesService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;

    component.loadData$ = new BehaviorSubject<void>(null);
    component.duplicateSets$ = of([]);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ionViewWillEnter(): ', () => {
    it('should populate duplicate sets', fakeAsync(() => {
      handleDuplicates.getDuplicateSets.and.returnValue(of([duplicateSetData1]));
      transactionService.getETxnc.and.returnValue(of(apiExpenseRes));
      spyOn(component, 'addExpenseDetailsToDuplicateSets').and.returnValue(apiExpenseRes);

      component.ionViewWillEnter();
      tick(500);

      component.duplicateSets$.subscribe((res) => {
        expect(res).toEqual([apiExpenseRes]);
      });

      expect(handleDuplicates.getDuplicateSets).toHaveBeenCalledTimes(2);
      expect(transactionService.getETxnc).toHaveBeenCalledWith({
        offset: 0,
        limit: 10,
        params: { tx_id: 'in.(tx5fBcPBAxLv)' },
      });
      expect(component.addExpenseDetailsToDuplicateSets).toHaveBeenCalledTimes(2);
    }));

    it('should go to tasks page if no duplicate sets are found', fakeAsync(() => {
      handleDuplicates.getDuplicateSets.and.returnValue(of([]));
      transactionService.getETxnc.and.returnValue(of(null));
      spyOn(component, 'goToTasks');

      component.ionViewWillEnter();
      tick(500);

      expect(handleDuplicates.getDuplicateSets).toHaveBeenCalledTimes(1);
      expect(component.goToTasks).toHaveBeenCalledTimes(1);
      expect(transactionService.getETxnc).toHaveBeenCalledTimes(1);
    }));
  });

  it('addExpenseDetailsToDuplicateSets(): should add expense details to duplicate sets', () => {
    const result = component.addExpenseDetailsToDuplicateSets(duplicateSetData1, [expenseData1, etxncData[0]]);

    expect(result).toEqual([expenseData1]);
  });

  it('next(): should go to the next selected item', () => {
    component.selectedSet = 0;

    component.next();

    expect(component.selectedSet).toEqual(1);
  });

  it('prev(): should go to the prev selected item', () => {
    component.selectedSet = 1;

    component.prev();

    expect(component.selectedSet).toEqual(0);
  });

  describe('dismiss():', () => {
    it('should dismiss a duplicate expense', () => {
      component.duplicateSetData = [duplicateSetData2];
      component.selectedSet = 0;
      handleDuplicates.dismissAll.and.returnValue(of(null));
      spyOn(component, 'showDismissedSuccessToast');
      component.duplicateExpenses = [[apiExpenseRes[0], expenseData1]];

      component.dismiss(apiExpenseRes[0]);

      expect(component.duplicateExpenses[0].length).toEqual(1);
      expect(handleDuplicates.dismissAll).toHaveBeenCalledOnceWith(['tx5fBcPBAxLv', 'tx3nHShG60zq'], ['tx3nHShG60zq']);
      expect(component.showDismissedSuccessToast).toHaveBeenCalledTimes(1);
    });
  });

  it('dismissAll(): should dismiss all transactions', () => {
    component.duplicateSetData = [duplicateSetData1, duplicateSetData2];
    component.selectedSet = 1;
    handleDuplicates.dismissAll.and.returnValue(of(null));
    spyOn(component, 'showDismissedSuccessToast');
    spyOn(component.loadData$, 'next');
    component.duplicateSets$ = of([[apiExpenseRes[0]], [expenseData1]]);

    component.dismissAll();

    expect(handleDuplicates.dismissAll).toHaveBeenCalledOnceWith(
      duplicateSetData2.transaction_ids,
      duplicateSetData2.transaction_ids
    );
    expect(component.selectedSet).toEqual(0);
    expect(trackingService.dismissedDuplicateSet).toHaveBeenCalledTimes(1);
    expect(component.showDismissedSuccessToast).toHaveBeenCalledTimes(1);
    expect(component.loadData$.next).toHaveBeenCalledTimes(1);
  });

  describe('mergeExpense():', () => {
    it('should merge expense', () => {
      component.duplicateSetData = [duplicateSetData2];
      transactionService.getETxnc.and.returnValue(of(apiExpenseRes));

      component.mergeExpense();

      expect(transactionService.getETxnc).toHaveBeenCalledOnceWith({
        offset: 0,
        limit: 10,
        params: {
          tx_id: `in.(${duplicateSetData2.transaction_ids.join(',')})`,
        },
      });
      expect(trackingService.visitedMergeExpensesPageFromTask).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'merge_expense',
        {
          selectedElements: JSON.stringify(apiExpenseRes),
          from: 'TASK',
        },
      ]);
    });
  });

  it('showDismissedSuccessToast(): should show dismissal successful toast', () => {
    matSnackBar.openFromComponent.and.returnValue({
      onAction: () => ({
        subscribe: () => {},
      }),
    } as MatSnackBarRef<ToastMessageComponent>);

    snackbarProperties.setSnackbarProperties.and.returnValue(dismissExpenseSnackbarProps);

    component.showDismissedSuccessToast();

    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...dismissExpenseSnackbarProps,
      panelClass: ['msb-success-with-camera-icon'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
      message: 'Expense dismissed',
    });
  });

  it('goToTasks(): should go to tasks page', () => {
    component.goToTasks();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
      queryParams: { state: 'tasks' },
      skipLocationChange: true,
    });
  });

  it('goToTransaction(): should go to transaction', () => {
    component.goToTransaction({ etxn: expenseData1 });

    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_expense',
      { id: expenseData1.tx_id, persist_filters: true },
    ]);
  });
});
