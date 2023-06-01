import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { PopoverController } from '@ionic/angular';
import { from, noop } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { OverlayResponse } from '../models/overlay-response.modal';

@Injectable({
  providedIn: 'root',
})
export class BackButtonService {
  constructor(private popoverController: PopoverController) {}

  showAppCloseAlert() {
    const exitAppPopover = this.popoverController.create({
      componentProps: {
        title: 'Exit Fyle App',
        message: 'Are you sure you want to exit the app?',
        primaryCta: {
          text: 'OK',
          action: 'close',
        },
        secondaryCta: {
          text: 'Cancel',
          action: 'cancel',
        },
      },
      component: PopupAlertComponent,
      cssClass: 'pop-up-in-center',
    });

    from(exitAppPopover)
      .pipe(
        tap((exitAppPopover) => exitAppPopover.present()),
        switchMap((exitAppPopover) => exitAppPopover.onWillDismiss()),
        map((popoverDetails: OverlayResponse<{ action?: string }>) => {
          if (popoverDetails?.data?.action === 'close') {
            return App.exitApp();
          }
        })
      )
      .subscribe(noop);
  }
}
