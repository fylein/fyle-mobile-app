import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ModalPropertiesService {

  constructor(
    private modalController: ModalController
  ) { }

  getModalDefaultProperties() {
    const properties = {
      cssClass: 'fixed-height',
      showBackdrop: true,
      swipeToClose: true,
      backdropDismiss: true,
      animated: true,
    };
    return properties;
  }

  getModalAutoHeightProperties() {
    const properties = {
      cssClass: 'auto-height',
      showBackdrop: true,
      swipeToClose: true,
      backdropDismiss: true,
      animated: true,
    };
    return properties;
  }

}
