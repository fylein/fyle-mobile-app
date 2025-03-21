import { Component } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Params, Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, noop } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { DismissDialogComponent } from '../dashboard/tasks/dismiss-dialog/dismiss-dialog.component';
import { PopoverController } from '@ionic/angular';
import { OverlayResponse } from 'src/app/core/models/overlay-response.modal';

@Component({
  selector: 'app-potential-duplicates',
  templateUrl: './potential-duplicates.page.html',
  styleUrls: ['./potential-duplicates.page.scss'],
})
export class PotentialDuplicatesPage {
  duplicateSets$: Observable<Expense[][]>;

  loadData$ = new BehaviorSubject<void>(null);

  selectedSet = 0;

  duplicateSetData: string[][];

  duplicateExpenses: Expense[][];

  isLoading = true;

  constructor(
    private expensesService: ExpensesService,
    private router: Router,
    private snackbarProperties: SnackbarPropertiesService,
    private matSnackBar: MatSnackBar,
    private trackingService: TrackingService,
    private popoverController: PopoverController
  ) {}

  ionViewWillEnter(): void {
    this.selectedSet = 0;

    this.duplicateSets$ = this.loadData$.pipe(
      switchMap(() =>
        this.getDuplicates().pipe(
          tap((duplicateSets) => {
            this.duplicateSetData = duplicateSets;
            if (this.duplicateSetData.length === 0) {
              this.goToTasks();
              return EMPTY;
            }
          }),
          switchMap((duplicateSets) => {
            const duplicateIds = duplicateSets.reduce((acc, curVal) => acc.concat(curVal), []);

            const queryParams = {
              id: `in.(${duplicateIds.join(',')})`,
            };

            return this.expensesService
              .getExpenses({
                offset: 0,
                ...queryParams,
              })
              .pipe(
                map((expenses) => {
                  const expensesArray = expenses as [];
                  return duplicateSets.map((duplicateSet) =>
                    this.addExpenseDetailsToDuplicateSets(duplicateSet, expensesArray)
                  );
                })
              );
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
      )
    );
    this.duplicateSets$.subscribe((duplicateExpenses) => {
      this.duplicateExpenses = duplicateExpenses;
    });
  }

  getDuplicates(): Observable<string[][]> {
    return this.expensesService
      .getDuplicateSets()
      .pipe(map((duplicateSets) => duplicateSets.map((value) => value.expense_ids)));
  }

  addExpenseDetailsToDuplicateSets(duplicateSet: string[], expensesArray: Expense[]): Expense[] {
    return duplicateSet.map(
      (expenseId) => expensesArray[expensesArray.findIndex((duplicateTxn: Expense) => expenseId === duplicateTxn.id)]
    );
  }

  next(): void {
    this.selectedSet++;
  }

  prev(): void {
    this.selectedSet--;
  }

  dismissDuplicates(duplicateExpenseIds: string[], targetExpenseIds: string[]): Observable<void> {
    return this.expensesService.dismissDuplicates(duplicateExpenseIds, targetExpenseIds);
  }

  async dismiss(expense: Expense): Promise<void> {
    const targetExpenseIds = [expense.id];
    const duplicateExpenseIds = this.duplicateSetData[this.selectedSet];

    const popover = await this.popoverController.create({
      component: DismissDialogComponent,
      cssClass: 'dismiss-dialog',
      backdropDismiss: false,
      componentProps: {
        dismissMethod: () => this.dismissDuplicates(duplicateExpenseIds, targetExpenseIds),
      },
    });

    await popover.present();

    const popoverResponse = (await popover.onDidDismiss()) as OverlayResponse<{ status: string }>;

    if (popoverResponse.data?.status === 'success') {
      this.trackingService.dismissedIndividualExpenses();
      this.showDismissedSuccessToast();
      this.duplicateSetData[this.selectedSet] = this.duplicateSetData[this.selectedSet].filter(
        (expId) => expId !== expense.id
      );
      this.duplicateExpenses[this.selectedSet] = this.duplicateExpenses[this.selectedSet].filter(
        (exp) => exp.id !== expense.id
      );
    }
  }

  async dismissAll(): Promise<void> {
    const expenseIds = this.duplicateSetData[this.selectedSet];

    const popover = await this.popoverController.create({
      component: DismissDialogComponent,
      cssClass: 'dismiss-dialog',
      backdropDismiss: false,
      componentProps: {
        dismissMethod: () => this.dismissDuplicates(expenseIds, expenseIds),
      },
    });

    await popover.present();

    const popoverResponse = (await popover.onDidDismiss()) as OverlayResponse<{ status: string }>;

    if (popoverResponse.data?.status === 'success') {
      if (this.selectedSet !== 0) {
        this.selectedSet--;
      }
      this.trackingService.dismissedDuplicateSet();
      this.showDismissedSuccessToast();
      this.loadData$.next();
      this.duplicateSets$.subscribe((duplicateExpenses) => {
        this.duplicateExpenses = duplicateExpenses;
      });
    }
  }

  mergeExpense(): void {
    const selectedTxnIds = this.duplicateSetData[this.selectedSet];

    const queryParams = {
      id: `in.(${selectedTxnIds.join(',')})`,
    };

    this.expensesService
      .getExpenses({
        offset: 0,
        limit: 10,
        ...queryParams,
      })
      .subscribe((selectedExpenses) => {
        const expenseIDs = selectedExpenses.map((expense) => expense.id);
        this.trackingService.visitedMergeExpensesPageFromTask();
        this.router.navigate([
          '/',
          'enterprise',
          'merge_expense',
          {
            expenseIDs: JSON.stringify(expenseIDs),
            from: 'TASK',
          },
        ]);
      });
  }

  showDismissedSuccessToast(): void {
    const toastMessageData = {
      message: 'Expense dismissed',
    };
    this.matSnackBar
      .openFromComponent(ToastMessageComponent, {
        ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
        panelClass: ['msb-success-with-camera-icon'],
      })
      .onAction()
      .subscribe(noop);
  }

  goToTasks(): void {
    const queryParams: Params = { state: 'tasks' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
      skipLocationChange: true,
    });
  }

  goToTransaction(event: { expense: Expense }): void {
    this.router.navigate(['/', 'enterprise', 'add_edit_expense', { id: event.expense.id, persist_filters: true }]);
  }
}
