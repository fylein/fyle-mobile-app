import { Injectable, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, from, forkJoin, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class VerifiedOrgAuthGuard {
  private authService = inject(AuthService);

  private router = inject(Router);

  private userService = inject(UserService);

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return forkJoin({
      eou: from(this.authService.getEou()),
      passwordStatus: this.userService.getUserPasswordStatus(),
    }).pipe(
      map(({ eou, passwordStatus }) => {
        const isPasswordSetRequired = passwordStatus.is_password_required && !passwordStatus.is_password_set;
        const isPendingDetails = eou?.ou?.status === 'PENDING_DETAILS';
        if (isPasswordSetRequired || (!isPasswordSetRequired && isPendingDetails)) {
          this.router.navigate(['/', 'auth', 'switch_org']);
          return false;
        }
        return !!eou;
      }),
      catchError(() => of(true)),
    );
  }
}
