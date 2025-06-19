import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { PopoverController } from '@ionic/angular';
import { from, noop } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { OverlayResponse } from '../models/overlay-response.modal';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class BackButtonService {
  constructor(private popoverController: PopoverController, private translocoService: TranslocoService) {}

  showAppCloseAlert(): void {
    const exitAppPopover = this.popoverController.create({
      componentProps: {
        title: this.translocoService.translate<string>('services.backButton.title'),
        message: this.translocoService.translate<string>('services.backButton.message'),
        primaryCta: {
          text: this.translocoService.translate<string>('services.backButton.primaryCtaText'),
          action: 'close',
        },
        secondaryCta: {
          text: this.translocoService.translate('services.backButton.secondaryCtaText'),
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
