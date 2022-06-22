import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { PageState } from 'src/app/core/models/page-state.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  currentPageState: PageState;

  isLoading = false;

  sentLinkAgain = false;

  fg: FormGroup;

  constructor(
    private routerAuthService: RouterAuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  get pageStates() {
    return PageState;
  }

  ionViewWillEnter() {
    this.currentPageState = PageState.notSent;
  }

  ngOnInit() {
    const email = this.activatedRoute.snapshot.params.email || '';
    this.fg = this.formBuilder.group({
      email: [email || '', Validators.compose([Validators.required, Validators.pattern('\\S+@\\S+\\.\\S{2,}')])],
    });
  }

  sendResetLink() {
    this.isLoading = true;
    const email = this.fg.controls.email.value;
    this.routerAuthService
      .sendResetPassword(email)
      .pipe(
        finalize(async () => {
          this.isLoading = false;
        }),
        catchError((err) => {
          if (err.status === 422) {
            this.router.navigate(['/', 'auth', 'disabled']);
          } else {
            this.currentPageState = PageState.failure;
          }
          return throwError(err);
        })
      )
      .subscribe(() => {
        this.currentPageState = PageState.success;
      });
  }
}
