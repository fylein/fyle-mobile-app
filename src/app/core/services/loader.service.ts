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
    console.log("----------inside show laoder---------");
    this.counter++;
    if (this.counter === 1) {
      this.loading = await this.loadingController.create({
        message,
      //  duration
      });
      await this.loading.present();
    }
    console.log("-------vfhdvbiudvdv hdo df");
    return this.loading;
  }

  hideLoader() {
    console.log("----------inside hide laoder---------", this.counter);
    this.counter--;
    if (this.counter === 0) {
      console.log("----------inside hide dkjdicbdvd---------", this.counter);
      return this.loading.dismiss().catch(noop);
    }
  }
}
