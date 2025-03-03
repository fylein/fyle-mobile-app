import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MatLegacySnackBar as MatSnackBar,
  MatLegacySnackBarRef as MatSnackBarRef,
} from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { dismissExpenseSnackbarProps } from 'src/app/core/mock-data/snackbar-properties.data';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { PotentialDuplicatesPage } from './potential-duplicates.page';
import { apiExpenses1, expenseData } from 'src/app/core/mock-data/platform/v1/expense.data';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { cloneDeep } from 'lodash';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { expenseDuplicateSet } from 'src/app/core/mock-data/platform/v1/expense-duplicate-sets.data';
import { PopoverController } from '@ionic/angular';
import { DismissDialogComponent } from '../dashboard/tasks/dismiss-dialog/dismiss-dialog.component';

describe('PotentialDuplicatesPage', () => {
  let component: PotentialDuplicatesPage;
  let fixture: ComponentFixture<PotentialDuplicatesPage>;
  let router: jasmine.SpyObj<Router>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'dismissedIndividualExpenses',
      'dismissedDuplicateSet',
      'visitedMergeExpensesPageFromTask',
    ]);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', [
      'getExpenses',
      'getDuplicateSets',
      'dismissDuplicates',
    ]);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);

    TestBed.configureTestingModule({
      declarations: [PotentialDuplicatesPage],
      imports: [RouterTestingModule],
      providers: [
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
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PotentialDuplicatesPage);
    component = fixture.componentInstance;

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;

    component.loadData$ = new BehaviorSubject<void>(null);
    component.duplicateSets$ = of([]);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ionViewWillEnter(): ', () => {
    beforeEach(() => {
      expensesService.getExpenses.and.returnValue(of([expenseData, apiExpenses1[0]]));
      expensesService.getDuplicateSets.and.returnValue(of([expenseDuplicateSet]));
      spyOn(component, 'addExpenseDetailsToDuplicateSets').and.returnValue(apiExpenses1);
    });

    it('should populate duplicate sets', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(500);

      component.duplicateSets$.subscribe((res) => {
        expect(res).toEqual([apiExpenses1]);
      });

      const queryParams = {
        id: 'in.(tx5fBcPBAxLv,tx3nHShG60zq)',
      };

      expect(expensesService.getDuplicateSets).toHaveBeenCalledTimes(2);
      expect(expensesService.getExpenses).toHaveBeenCalledWith({
        offset: 0,
        ...queryParams,
      });
      expect(component.addExpenseDetailsToDuplicateSets).toHaveBeenCalledTimes(2);
    }));

    it('should go to tasks page if no duplicate sets are found', fakeAsync(() => {
      expensesService.getDuplicateSets.and.returnValue(of([]));
      expensesService.getExpenses.and.returnValue(of(null));
      spyOn(component, 'goToTasks');

      component.ionViewWillEnter();
      tick(500);

      expect(expensesService.getDuplicateSets).toHaveBeenCalledTimes(1);
      expect(component.goToTasks).toHaveBeenCalledTimes(1);
      expect(expensesService.getExpenses).toHaveBeenCalledTimes(1);
    }));
  });

  it('addExpenseDetailsToDuplicateSets(): should add expense details to duplicate sets', () => {
    const result = component.addExpenseDetailsToDuplicateSets(
      ['txcSFe6efB6R', 'txDDLtRaflUW'],
      [apiExpenses1[0], expenseData]
    );
    expect(result).toEqual([expenseData, apiExpenses1[0]]);
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

  it('dismissDuplicates(): should call dismissDuplicates on expensesService with the expenses ids', () => {
    const duplicateExpenseIds = ['txDDLtRaflUW'];
    const targetExpenseIds = ['txcSFe6efB6R'];

    expensesService.dismissDuplicates.and.returnValue(of(null));

    component.dismissDuplicates(duplicateExpenseIds, targetExpenseIds).subscribe(() => {
      expect(expensesService.dismissDuplicates).toHaveBeenCalledOnceWith(duplicateExpenseIds, targetExpenseIds);
    });
  });

  describe('dismiss():', () => {
    beforeEach(() => {
      component.duplicateSetData = cloneDeep([['txcSFe6efB6R', 'txDDLtRaflUW']]);
      component.selectedSet = 0;
      spyOn(component, 'showDismissedSuccessToast');
      spyOn(component, 'dismissDuplicates');
      component.duplicateExpenses = [[apiExpenses1[0], expenseData]];
      expensesService.dismissDuplicates.and.returnValue(of(null));
    });

    it('should dismiss a duplicate expense and show the dialog', async () => {
      const popoverResponse = { data: { status: 'success' } };
      const popoverSpy = jasmine.createSpyObj('Popover', ['present', 'onDidDismiss']);
      popoverSpy.onDidDismiss.and.resolveTo(popoverResponse);
      popoverController.create.and.resolveTo(popoverSpy);

      await component.dismiss(apiExpenses1[0]);

      expect(popoverController.create).toHaveBeenCalledWith({
        component: DismissDialogComponent,
        cssClass: 'dismiss-dialog',
        backdropDismiss: false,
        componentProps: {
          dismissMethod: jasmine.any(Function),
        },
      });

      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onDidDismiss).toHaveBeenCalledTimes(1);

      const dismissMethod = popoverController.create.calls.mostRecent().args[0].componentProps.dismissMethod;
      await dismissMethod();

      expect(component.dismissDuplicates).toHaveBeenCalledWith(['txcSFe6efB6R', 'txDDLtRaflUW'], ['txDDLtRaflUW']);

      if (popoverResponse.data?.status === 'success') {
        expect(component.duplicateExpenses[0].length).toEqual(1);
        expect(component.showDismissedSuccessToast).toHaveBeenCalledTimes(1);
      }
    });

    it('should not dismiss a duplicate expense if popover is dismissed without success status', async () => {
      const popoverResponse = { data: { status: 'error' } };
      const popoverSpy = jasmine.createSpyObj('Popover', ['present', 'onDidDismiss']);
      popoverSpy.onDidDismiss.and.resolveTo(popoverResponse);
      popoverController.create.and.resolveTo(popoverSpy);

      await component.dismiss(apiExpenses1[0]);

      expect(popoverController.create).toHaveBeenCalledWith({
        component: DismissDialogComponent,
        cssClass: 'dismiss-dialog',
        backdropDismiss: false,
        componentProps: {
          dismissMethod: jasmine.any(Function),
        },
      });

      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(component.duplicateExpenses[0].length).toEqual(2);
      expect(component.showDismissedSuccessToast).not.toHaveBeenCalled();
    });
  });

  describe('dismissAll(): ', () => {
    it('should dismiss all transactions and show the dialog', async () => {
      component.duplicateSetData = [['tx5fBcPBAxLv'], ['tx5fBcPBAxLv', 'tx3nHShG60zq']];
      component.selectedSet = 1;
      const popoverResponse = { data: { status: 'success' } };

      expensesService.dismissDuplicates.and.returnValue(of(null));
      spyOn(component, 'showDismissedSuccessToast');
      spyOn(component.loadData$, 'next');
      spyOn(component, 'dismissDuplicates');
      expensesService.getExpenses.and.returnValue(of([apiExpenses1[0], expenseData]));
      component.duplicateSets$ = of([[apiExpenses1[0]], [expenseData]]);

      const popoverSpy = jasmine.createSpyObj('Popover', ['present', 'onDidDismiss']);
      popoverSpy.onDidDismiss.and.resolveTo(popoverResponse);
      popoverController.create.and.resolveTo(popoverSpy);

      await component.dismissAll();

      expect(popoverController.create).toHaveBeenCalledWith({
        component: DismissDialogComponent,
        cssClass: 'dismiss-dialog',
        backdropDismiss: false,
        componentProps: {
          dismissMethod: jasmine.any(Function),
        },
      });

      const dismissMethod = popoverController.create.calls.mostRecent().args[0].componentProps.dismissMethod;
      await dismissMethod();

      expect(component.dismissDuplicates).toHaveBeenCalledWith(
        ['tx5fBcPBAxLv', 'tx3nHShG60zq'],
        ['tx5fBcPBAxLv', 'tx3nHShG60zq']
      );

      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onDidDismiss).toHaveBeenCalledTimes(1);

      if (popoverResponse.data?.status === 'success') {
        expect(component.selectedSet).toEqual(0);
        expect(trackingService.dismissedDuplicateSet).toHaveBeenCalledTimes(1);
        expect(component.showDismissedSuccessToast).toHaveBeenCalledTimes(1);
        expect(component.loadData$.next).toHaveBeenCalledTimes(1);
      }
    });

    it('should not perform actions if popover is dismissed without success status', async () => {
      component.duplicateSetData = [['tx5fBcPBAxLv'], ['tx5fBcPBAxLv', 'tx3nHShG60zq']];
      component.selectedSet = 1;
      const popoverResponse = { data: { status: 'error' } };

      spyOn(component, 'showDismissedSuccessToast');
      spyOn(component.loadData$, 'next');
      expensesService.getExpenses.and.returnValue(of([apiExpenses1[0], expenseData]));
      component.duplicateSets$ = of([[apiExpenses1[0]], [expenseData]]);

      const popoverSpy = jasmine.createSpyObj('Popover', ['present', 'onDidDismiss']);
      popoverSpy.onDidDismiss.and.resolveTo(popoverResponse);
      popoverController.create.and.resolveTo(popoverSpy);

      await component.dismissAll();

      expect(popoverController.create).toHaveBeenCalledWith({
        component: DismissDialogComponent,
        cssClass: 'dismiss-dialog',
        backdropDismiss: false,
        componentProps: {
          dismissMethod: jasmine.any(Function),
        },
      });

      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(component.selectedSet).toEqual(1);
      expect(trackingService.dismissedDuplicateSet).not.toHaveBeenCalled();
      expect(component.showDismissedSuccessToast).not.toHaveBeenCalled();
      expect(component.loadData$.next).not.toHaveBeenCalled();
    });
  });

  describe('mergeExpense():', () => {
    it('should merge expense', () => {
      component.duplicateSetData = [['txcSFe6efB6R', 'txDDLtRaflUW']];

      expensesService.getExpenses.and.returnValue(of([expenseData, apiExpenses1[0]]));

      component.mergeExpense();

      const queryParams = {
        id: `in.(${['txcSFe6efB6R', 'txDDLtRaflUW'].join(',')})`,
      };

      expect(expensesService.getExpenses).toHaveBeenCalledOnceWith({
        offset: 0,
        limit: 10,
        ...queryParams,
      });
      expect(trackingService.visitedMergeExpensesPageFromTask).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith([
        '/',
        'enterprise',
        'merge_expense',
        {
          expenseIDs: JSON.stringify(['txcSFe6efB6R', 'txDDLtRaflUW']),
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
    component.goToTransaction({ expense: apiExpenses1[0] });

    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'add_edit_expense',
      { id: apiExpenses1[0].id, persist_filters: true },
    ]);
  });
});
