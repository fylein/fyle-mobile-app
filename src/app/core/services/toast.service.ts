import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastController: ToastController
  ) { }

  addToast(config: {message: string, type: string}) {
    let message;

    if (config.type === 'success') {
      message = '<ion-icon name="checkbox"></ion-icon> ' + config.message;
    } else if (config.type === 'danger') {
      message = '<ion-icon name="alert-circle"></ion-icon> ' + config.message;
    }

    this.toastController.create({
      message: message,
      duration: 1000,
      position: 'bottom',
      color: config.type,
      cssClass: 'toast',
      animated: true
    }).then(toast => toast.present());
  }
}
