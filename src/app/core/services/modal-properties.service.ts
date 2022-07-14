import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ModalPropertiesService {
  constructor(private modalController: ModalController) {}

  getModalDefaultProperties(cssClass = 'fy-modal') {
    const properties = {
      cssClass,
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    };
    return properties;
  }
}
