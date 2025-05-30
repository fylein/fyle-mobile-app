import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class VerifiedOrgAuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.getEou().then((eou) => {
      if (eou?.ou?.status === 'PENDING_DETAILS') {
        this.router.navigate(['/', 'auth', 'switch_org']);
      }

      return !!eou;
    });
  }
}
