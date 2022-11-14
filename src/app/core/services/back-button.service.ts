import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { PopoverController } from '@ionic/angular';
import { from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';

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
      component: PopupAlertComponentComponent,
      cssClass: 'pop-up-in-center',
    });

    from(exitAppPopover)
      .pipe(
        tap((exitAppPopover) => exitAppPopover.present()),
        switchMap((exitAppPopover) => exitAppPopover.onWillDismiss())
      )
      .subscribe((popoverDetails) => {
        if (popoverDetails?.data?.action === 'close') {
          App.exitApp();
        }
      });
  }
}
