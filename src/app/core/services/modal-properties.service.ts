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
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.25, 0.5, 1],
      handle: false,
    };
    return properties;
  }
}
