import { Injectable, inject } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { noop } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingController = inject(LoadingController);

  private translocoService = inject(TranslocoService);

  async showLoader(message?: string, duration = 1000, customLoaderUrl?: string): Promise<void> {
    const loadingMessage = message || this.translocoService.translate('services.loader.pleaseWait');
    const loading = await this.loadingController.create({
      message: loadingMessage,
      duration,
      spinner: customLoaderUrl ? null : 'crescent',
      cssClass: customLoaderUrl ? 'custom-loading' : 'intermediate-loader',
    });

    if (customLoaderUrl) {
      loading.message = `
        <div class="custom-loading">
          <img src="${customLoaderUrl}" class="custom-loading-gif"/>
          <span>${loadingMessage}</span>
        </div>
      `;
    }
    return await loading.present();
  }

  hideLoader(): Promise<boolean | void> {
    return this.loadingController.dismiss().catch(noop);
  }
}
