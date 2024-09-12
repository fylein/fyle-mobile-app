import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { noop } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  constructor(private loadingController: LoadingController) {}

  async showLoader(message = 'Please wait...', duration = 1000, customLoaderUrl?: string): Promise<void> {
    const loading = await this.loadingController.create({
      message,
      duration,
      spinner: customLoaderUrl ? null : 'crescent',
      cssClass: customLoaderUrl ? 'custom-loader' : '',
    });

    if (customLoaderUrl) {
      loading.message = `
        <div class="custom-loading">
          <img src="${customLoaderUrl}" class="custom-loader-gif"/>
          <span>${message}</span>
        </div>
      `;
    }
    return await loading.present();
  }

  hideLoader(): Promise<boolean | void> {
    return this.loadingController.dismiss().catch(noop);
  }
}
