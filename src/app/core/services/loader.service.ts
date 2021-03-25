import {Injectable} from '@angular/core';
import {LoadingController} from '@ionic/angular';
import {noop} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  counter = 0;
  loading;

  constructor(private loadingController: LoadingController) { }

  async showLoader(message = 'Please wait...', duration = 1000 ) {
    this.counter++;
    if (this.counter === 1) {
      this.loading = await this.loadingController.create({
        message,
      //  duration
      });
      await this.loading.present();
    } 
    return this.loading;
  }

  hideLoader() {
    this.counter--;
    if (this.counter === 0) {
      return this.loading.dismiss().catch(noop);
    }
  }
}
