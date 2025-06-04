import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, from, forkJoin, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { LoaderService } from '../services/loader.service';
import { map, catchError, finalize, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class VerifiedOrgAuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private loaderService: LoaderService
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return from(this.loaderService.showLoader()).pipe(
      switchMap(() =>
        forkJoin({
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
          finalize(() => this.loaderService.hideLoader())
        )
      )
    );
  }
}
