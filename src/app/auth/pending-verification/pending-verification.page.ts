import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { PageState } from 'src/app/core/models/page-state.enum';

@Component({
  selector: 'app-pending-verification',
  templateUrl: './pending-verification.page.html',
})
export class PendingVerificationPage implements OnInit {
  currentPageState: PageState;

  isLoading = false;

  hasTokenExpired = false;

  constructor(
    private routerAuthService: RouterAuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.hasTokenExpired = this.activatedRoute.snapshot.params.hasTokenExpired || false;
    this.currentPageState = PageState.notSent;
  }

  resendVerificationLink(email: string) {
    this.isLoading = true;
    const orgId = this.activatedRoute.snapshot.params.orgId;

    this.routerAuthService
      .resendVerificationLink(email, orgId)
      .pipe(tap(() => (this.isLoading = false)))
      .subscribe({
        next: () => (this.currentPageState = PageState.success),
        error: (err) => this.handleError(err),
      });
  }

  handleError(err: any) {
    if (err.status === 422) {
      this.router.navigate(['/', 'auth', 'disabled']);
    } else {
      this.currentPageState = PageState.failure;
    }
  }
}
