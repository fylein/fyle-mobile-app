import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor(private loadingController: LoadingController) { }

  async showLoader(message = 'Please wait...') {
    console.log('***********'+ message);
    const loading = await this.loadingController.create({
      message
    });
    return await loading.present();
  }

  hideLoader() {
    console.log('++++++++++');
    return this.loadingController.dismiss();
  }
}
