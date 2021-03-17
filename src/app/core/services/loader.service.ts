import {Injectable} from '@angular/core';
import {LoadingController} from '@ionic/angular';
import {noop} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  loader;

  constructor(private loadingController: LoadingController) { }

  async showLoader(message = 'Please wait...', duration = 1000 ) {
    const loading = await this.loadingController.create({
      message,
      // duration
    });
    return await loading.present();
  }

  async displayLoader(message = 'Please wait...') {
    const loading = await this.loadingController.create({
      message
    });
    return await loading.present();
  }

  hideLoader() {
    return this.loadingController.dismiss().catch(noop);
  }

  async showLoadingHandler(message) {
    if (this.loader) {
      await this.loader.dismiss();
    } 

    this.loader = await this.loadingController.create({
      message
    });
    return await this.loader.present();
  }

  async hideLoadingHandler() {
    await this.loader.dismiss();
    this.loader = null;
    
    // if (this.loader != null) {
    //   this.loader.dismiss();
    //   this.loader = null;
    // }
  }
}
