import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { from, noop } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor(private loadingController: LoadingController) { }

  async showLoader(message = 'Please wait...') {
    console.log('Loader shown');
    const loading = await this.loadingController.create({
      message
    });
    return await loading.present();
  }

  hideLoader() {
    return this.loadingController.dismiss().catch(noop);
  }
}
