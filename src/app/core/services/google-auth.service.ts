import { Injectable } from '@angular/core';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth-response.model';

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
      .then((res: AuthResponse) => {
        this.googlePlus.logout();
        return res;
      })
      .catch((err: Error) => err);
  }
}
