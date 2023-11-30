import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TransactionsOutboxService } from '../../../core/services/transactions-outbox.service';
import { TrackingService } from '../../../core/services/tracking.service';

@Component({
  selector: 'app-add-expense-popover',
  templateUrl: './add-expense-popover.component.html',
  styleUrls: ['./add-expense-popover.component.scss'],
})
export class AddExpensePopoverComponent implements OnInit {
  @Input() isInstaFyleEnabled: boolean;

  @Input() isMileageEnabled: boolean;

  @Input() isPerDiemEnabled: boolean;

  @Input() isBulkFyleEnabled: boolean;

  constructor(
    private popoverController: PopoverController,
    private router: Router,
    private transactionOutboxService: TransactionsOutboxService,
    private trackingService: TrackingService
  ) {}

  ngOnInit() {}

  async instafyle(event) {
    await this.popoverController.dismiss();
    await this.router.navigate([
      '/',
      'enterprise',
      'camera_overlay',
      {
        from: 'my_expenses',
      },
    ]);
  }

  async createExpense(event) {
    await this.popoverController.dismiss();
    this.trackingService.eventTrack('Click Add Expense');
    await this.router.navigate([
      '/',
      'enterprise',
      'add_edit_expense',
      {
        persist_filters: true,
      },
    ]);
  }

  async createMileage(event) {
    this.trackingService.eventTrack('Click Add Mileage');
    await this.popoverController.dismiss();
    await this.router.navigate([
      '/',
      'enterprise',
      'add_edit_mileage',
      {
        persist_filters: true,
      },
    ]);
  }

  async createPerDiem(event) {
    await this.popoverController.dismiss();
    await this.router.navigate([
      '/',
      'enterprise',
      'add_edit_per_diem',
      {
        persist_filters: true,
      },
    ]);
  }
}
