import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthResponse } from '../models/auth-response.model';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  constructor() {}

  async login(): Promise<any> {
    const clientId = environment.ANDROID_CLIENT_ID;

    GoogleAuth.initialize({
      clientId: clientId,
    });

    try {
      const response = await GoogleAuth.signIn();
      return response;
    } catch (err) {
      return err;
    }
  }
}
