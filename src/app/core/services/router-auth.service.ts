import { Injectable } from '@angular/core';
import { RouterApiService } from './router-api.service';

@Injectable({
  providedIn: 'root'
})
export class RouterAuthService {

  constructor(
    private routerApiService: RouterApiService
  ) { }

  checkEmailExists(email) {
    return this.routerApiService.post('/auth/basic/email_exists', {
      email
    });
  } 
}
