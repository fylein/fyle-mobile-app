import { Injectable } from '@angular/core';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  constructor(private googlePlus: GooglePlus) {}

  async login(): Promise<any> {
    // Need to put ios case here later
    const clientId = environment.ANDROID_CLIENT_ID;
    return this.googlePlus
      .login({
        webClientId: clientId,
        offline: false,
      })
      .then((res) => {
        this.googlePlus.logout();
        return res;
      })
      .catch((err) => err);
  }
}
