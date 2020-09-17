import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { from } from 'rxjs/internal/observable/from';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private authService: AuthService
  ) { }

  isPendingDetails() {
    return from(this.authService.getEou()).pipe(
      map(eou => eou.ou.status === 'PENDING_DETAILS')
    );
  }
}
