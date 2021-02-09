import {Component, OnInit, Input} from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {Router} from '@angular/router';
import {FyleModeComponent} from '../fyle-mode/fyle-mode.component';
import {CameraDirection, CameraResultType, CameraSource, Plugins} from '@capacitor/core';
import {TransactionsOutboxService} from '../../../core/services/transactions-outbox.service';
import {TrackingService} from '../../../core/services/tracking.service';

const {Camera} = Plugins;

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
  isAutoFyling = false;
  bulkAutoCount = 0;

  constructor(
    private popoverController: PopoverController,
    private router: Router,
    private transactionOutboxService: TransactionsOutboxService,
    private trackingService: TrackingService
  ) {
  }

  ngOnInit() {
  }

  async takeAutoFylePicture(mode) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear,
        resultType: CameraResultType.DataUrl
      });

      if (image) {
        const source = mode === 'bulk' ? 'BULK_AUTO' : 'MOBILE_AUTO';
        const txn = {
          billable: false,
          skip_reimbursement: false,
          state: 'DRAFT',
          source,
          txn_dt: new Date(),
          org_category: 'Unspecified'
        };

        const dataUrls = [{
          url: image.dataUrl,
          type: 'image'
        }];

        this.trackingService.createExpense({Asset: 'Mobile', Category: 'AutoFyle'});

        this.transactionOutboxService.addEntry(txn, dataUrls);

        if (mode === 'bulk') {
          this.bulkAutoCount++;
          await this.takeAutoFylePicture('bulk');
        } else {
          await this.popoverController.dismiss({
            reload: true
          });
        }
      }
    } catch (e) {
      await this.popoverController.dismiss({
        reload: true
      });
    }
  }

  async doAutoFyle() {
    if (this.isBulkFyleEnabled) {
      await this.popoverController.dismiss();
      this.isAutoFyling = true;
      const fyleModePopover = await this.popoverController.create({
        component: FyleModeComponent,
        cssClass: 'dialog-popover'
      });

      await fyleModePopover.present();

      const {data} = await fyleModePopover.onDidDismiss();

      if (data && data.mode === 'bulk') {
        await this.takeAutoFylePicture( 'bulk');
      } else if (data && data.mode === 'single') {
        await this.takeAutoFylePicture( 'single');
      }
    } else {
      await this.takeAutoFylePicture( 'single');
    }
  }

  async instafyle(event) {
    if (this.isInstaFyleEnabled) {
      await this.popoverController.dismiss();
      this.router.navigate(['/', 'enterprise', 'camera_overlay', {
        from: 'my_expenses'
      }]);
    } else {
      await this.doAutoFyle();
    }
  }

  async createExpense(event) {
    await this.popoverController.dismiss();
    this.trackingService.eventTrack('Click Add Expense', {Asset: 'Mobile'});
    this.router.navigate(['/', 'enterprise', 'add_edit_expense', {
      persist_filters: true
    }]);
  }

  async createMileage(event) {
    this.trackingService.eventTrack('Click Add Mileage', {Asset: 'Mobile'});
    await this.popoverController.dismiss();
    this.router.navigate(['/', 'enterprise', 'add_edit_mileage', {
      persist_filters: true
    }]);
  }

  async createPerDiem(event) {
    await this.popoverController.dismiss();
    this.router.navigate(['/', 'enterprise', 'add_edit_per_diem', {
      persist_filters: true
    }]);
  }

}
