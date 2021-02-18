import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { from, throwError } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { switchMap, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage implements OnInit {

  email: string;
  name: string;
  success = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.email = this.activatedRoute.snapshot.params.email;
    this.name = this.activatedRoute.snapshot.params.name;
  }

  resendVerification() {
    from(this.loaderService.showLoader(`Re-Sending an activation link to ${this.email}...`)).pipe(
      switchMap(() => this.authService.resendVerification(this.email)),
      finalize(() => from(this.loaderService.hideLoader())),
      catchError((err) => {
        if (err.status) {
          this.router.navigate(['/', 'auth', 'disabled']);
        }
        return throwError(err);
      })
    ).subscribe(() => {
      this.success = true;
    });
  }
}
