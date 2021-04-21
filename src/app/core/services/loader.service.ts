import {Injectable} from '@angular/core';
import {LoadingController} from '@ionic/angular';
import {noop} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  counter = 0;
  loading: HTMLIonLoadingElement;

  constructor(private loadingController: LoadingController) { }

  async showLoader(message = 'Please wait...') {
    this.counter++;
    console.log("---show-----,",this.counter);
    /**
     * Creating loader and displaying loader when value of counter is 1.
     * This will allow us to show only one loader at a time, not multiple loader is a single page/after an API call.
     * This condition will make sure that only one loader is present in the page at a time.
     */
    if (this.counter === 1) {
      this.loading = await this.loadingController.create({
        message
      });
      await this.loading.present();
    }
    return this.loading;
  }

  hideLoader() {
    this.counter--;
    console.log("---hide-----,",this.counter);

    /**
     * Hiding loader if value of counter is 0.
     * This will make sure that we are hiding only the current active loader in the page.
     */
    if (this.counter === 0) {
      return this.loading.dismiss().catch(noop);
    }
  }
}
