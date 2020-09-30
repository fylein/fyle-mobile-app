import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrgUserService {

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) { }

  postUser(user: User) {
    return this.apiService.post('/users', user);
  }

  markActive() {
    return this.apiService.post('/orgusers/current/mark_active').pipe(
      switchMap(() => {
        return this.authService.refreshEou();
      })
    );
  }
}
