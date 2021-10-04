import { Component, OnInit, Input } from '@angular/core';
import { PopupService } from 'src/app/core/services/popup.service';
import { PopoverController } from '@ionic/angular';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { from, noop } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { switchMap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ActionConfirmationPopoverComponent } from '../action-confirmation-popover/action-confirmation-popover.component';

@Component({
  selector: 'app-action-popover',
  templateUrl: './action-popover.component.html',
  styleUrls: ['./action-popover.component.scss'],
})
export class ActionPopoverComponent implements OnInit {
  @Input() actions;

  constructor(
    private popupService: PopupService,
    private popoverController: PopoverController,
    private tripRequestsService: TripRequestsService,
    private loaderService: LoaderService,
    private reouter: Router
  ) {}

  async openRejectRequestPoup() {
    this.popoverController.dismiss();

    const actionConfirmationPopover = await this.popoverController.create({
      component: ActionConfirmationPopoverComponent,
      componentProps: {
        type: 'REJECT',
      },
      cssClass: 'dialog-popover',
    });

    await actionConfirmationPopover.present();

    const { data } = await actionConfirmationPopover.onDidDismiss();
    if (data && data.message) {
      from(this.loaderService.showLoader('Rejecting Trip'))
        .pipe(
          switchMap(() => {
            const status = {
              comment: data.message,
            };

            const addStatusPayload = {
              status,
              notify: false,
            };

            return this.tripRequestsService.reject(this.actions.id, addStatusPayload);
          }),
          finalize(() => {
            this.loaderService.hideLoader();
            this.reouter.navigate(['/', 'enterprise', 'team_trips']);
          })
        )
        .subscribe(noop);
    }
  }

  async openSendBackRequestPoup() {
    this.popoverController.dismiss();

    const actionConfirmationPopover = await this.popoverController.create({
      component: ActionConfirmationPopoverComponent,
      componentProps: {
        type: 'SEND_BACK',
      },
      cssClass: 'dialog-popover',
    });

    await actionConfirmationPopover.present();

    const { data } = await actionConfirmationPopover.onDidDismiss();
    if (data && data.message) {
      from(this.loaderService.showLoader('Sending Back'))
        .pipe(
          switchMap(() => {
            const addStatusPayload = {
              status: {
                comment: data.message,
              },
              notify: false,
            };

            return this.tripRequestsService.inquire(this.actions.id, addStatusPayload);
          }),
          finalize(() => {
            this.loaderService.hideLoader();
            this.reouter.navigate(['/', 'enterprise', 'team_trips']);
          })
        )
        .subscribe(noop);
    }
  }

  async approveTrip() {
    this.popoverController.dismiss();
    const popupResult = await this.popupService.showPopup({
      header: 'Approve Trip Request',
      message: 'Are you sure you want to approve this trip request?',
      primaryCta: {
        text: 'OK',
      },
    });

    if (popupResult === 'primary') {
      from(this.loaderService.showLoader('Approving trip request'))
        .pipe(
          switchMap(() => this.tripRequestsService.approve(this.actions.id)),
          finalize(() => {
            this.loaderService.hideLoader();
            this.reouter.navigate(['/', 'enterprise', 'team_trips']);
          })
        )
        .subscribe(noop);
    }
  }

  ngOnInit() {}
}
