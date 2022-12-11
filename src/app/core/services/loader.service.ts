import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { noop } from 'rxjs/internal/util/noop';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  constructor(private loadingController: LoadingController) {}

  async showLoader(message = 'Please wait...', duration = 1000) {
    const loading = await this.loadingController.create({
      message,
      duration,
    });
    return await loading.present();
  }

  hideLoader() {
    return this.loadingController.dismiss().catch(noop);
  }
}
