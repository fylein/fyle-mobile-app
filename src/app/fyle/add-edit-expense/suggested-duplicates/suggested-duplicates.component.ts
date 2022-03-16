import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { noop } from 'rxjs';
import { HandleDuplicatesService } from 'src/app/core/services/handle-duplicates.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

@Component({
  selector: 'app-suggested-duplicates',
  templateUrl: './suggested-duplicates.component.html',
  styleUrls: ['./suggested-duplicates.component.scss'],
})
export class SuggestedDuplicatesComponent implements OnInit {
  @Input() duplicateExpenses = [];

  constructor(
    private modalController: ModalController,
    private handleDuplicates: HandleDuplicatesService,
    private transaction: TransactionService,
    private router: Router,
    private snackbarProperties: SnackbarPropertiesService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  dismissAll() {
    const txnIds = this.duplicateExpenses.map((expense) => expense.tx_id);
    this.handleDuplicates.dismissAll(txnIds, txnIds).subscribe(() => {
      this.showDismissedSuccessToast();
      this.modalController.dismiss({
        action: 'dismissed',
      });
    });
  }

  mergeExpense() {
    const txnIds = this.duplicateExpenses.map((expense) => expense.tx_id);
    const params = {
      tx_id: `in.(${txnIds.toString()})`,
    };
    this.transaction.getETxnc({ offset: 0, limit: 10, params }).subscribe((selectedExpenses) => {
      this.router.navigate(['/', 'enterprise', 'merge_expense'], {
        state: { selectedElements: selectedExpenses, from: 'EDIT_EXPENSE' },
      });
    });
  }

  showDismissedSuccessToast() {
    const toastMessageData = {
      message: 'Duplicates was successfully dismissed',
    };
    this.matSnackBar
      .openFromComponent(ToastMessageComponent, {
        ...this.snackbarProperties.setSnackbarProperties('success', toastMessageData),
        panelClass: ['msb-success-with-camera-icon'],
      })
      .onAction()
      .subscribe(noop);
  }
}
