import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor(private loadingController: LoadingController) { }

  async showLoader(message = 'Please wait...') {
    const loading = await this.loadingController.create({
      message
    });
    return await loading.present();
  }

  hideLoader() {
    return this.loadingController.dismiss();
  }
}
