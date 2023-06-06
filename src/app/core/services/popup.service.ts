import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { FyPopupComponent } from 'src/app/shared/components/fy-popup/fy-popup.component';
import { PopupConfig } from 'src/app/shared/components/fy-popup/popup.model';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  constructor(private popoverController: PopoverController) {}

  async showPopup(popupConfig: PopupConfig) {
    const popup = await this.popoverController.create({
      componentProps: {
        config: popupConfig,
      },
      component: FyPopupComponent,
      cssClass: 'dialog-popover',
    });

    await popup.present();

    const { data } = await popup?.onWillDismiss<{ action: string }>();

    return data && data.action;
  }
}
