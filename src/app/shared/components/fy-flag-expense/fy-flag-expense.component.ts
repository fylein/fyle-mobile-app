import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { PopoverController } from '@ionic/angular';
import { FlagUnflagConfirmationComponent } from './flag-unflag-confirmation/flag-unflag-confirmation.component';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from, noop } from 'rxjs';
import { switchMap, concatMap, finalize } from 'rxjs/operators';
import { StatusService } from 'src/app/core/services/status.service';

@Component({
  selector: 'app-fy-flag-expense',
  templateUrl: './fy-flag-expense.component.html',
  styleUrls: ['./fy-flag-expense.component.scss'],
})
export class FyFlagExpenseComponent implements OnInit {

  @Input() etxn;
  @Output() notify: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private transactionService: TransactionService,
    private popoverController: PopoverController,
    private loaderService: LoaderService,
    private statusService: StatusService
  ) { }

  async flagUnflag() {
    const confirmationPopup = await this.popoverController.create({
      component: FlagUnflagConfirmationComponent,
      componentProps: {
        title: this.etxn.tx_manual_flag ?  'Unflag' : 'Flag'
      },
      cssClass: 'dialog-popover'
    });

    confirmationPopup.present();

    const { data } = await confirmationPopup.onDidDismiss();
    if (data && data.message) {
      from(this.loaderService.showLoader('Please wait')).pipe(
        switchMap(() => {
          const comment = {
            comment: data.message
          };
          return this.statusService.post('transactions', this.etxn.tx_id, comment, true);
        }),
        concatMap(() => {
          // tslint:disable-next-line: max-line-length
          return this.etxn.tx_manual_flag ?  this.transactionService.manualUnflag(this.etxn.tx_id) : this.transactionService.manualFlag(this.etxn.tx_id);
        }),
        finalize(() => {
          this.notify.emit(true);
          this.loaderService.hideLoader();
        })
      ).subscribe(noop);
    }
  }

  ngOnInit() {
  }

}
