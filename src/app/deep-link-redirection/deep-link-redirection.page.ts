import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../core/services/loader.service';
import { AdvanceRequestService } from '../core/services/advance-request.service';
import { AuthService } from '../core/services/auth.service';
import { TransactionService } from '../core/services/transaction.service';
import { ReportService } from '../core/services/report.service';
import { EMPTY, catchError, filter, finalize, from, shareReplay, switchMap } from 'rxjs';
import { DeepLinkService } from '../core/services/deep-link.service';

@Component({
  selector: 'app-deep-link-redirection',
  templateUrl: './deep-link-redirection.page.html',
  styleUrls: ['./deep-link-redirection.page.scss'],
})
export class DeepLinkRedirectionPage {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loaderService: LoaderService,
    private advanceRequestService: AdvanceRequestService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private reportService: ReportService,
    private deepLinkService: DeepLinkService
  ) {}

  ionViewWillEnter() {
    const subModule = this.activatedRoute.snapshot.params.sub_module;

    if (subModule === 'report') {
      this.redirectToReportModule();
    } else if (subModule === 'expense') {
      this.redirectToExpenseModule();
    } else if (subModule === 'advReq') {
      this.redirectToAdvReqModule();
    }
  }

  async redirectToAdvReqModule() {
    await this.loaderService.showLoader('Loading....');
    const currentEou = await this.authService.getEou();
    this.advanceRequestService.getEReq(this.activatedRoute.snapshot.params.id).subscribe(
      (res) => {
        const id = res.advance.id || res.areq.id;

        let route = ['/', 'enterprise', 'my_view_advance_request'];
        if (res.advance.id) {
          route = ['/', 'enterprise', 'my_view_advance'];
        } else if (res.ou.id !== currentEou.ou.id) {
          route = ['/', 'enterprise', 'view_team_advance'];
        }
        this.router.navigate([...route, { id }]);
      },
      () => {
        this.switchOrg();
      },
      async () => {
        await this.loaderService.hideLoader();
      }
    );
  }

  async redirectToExpenseModule() {
    const expenseOrgId = this.activatedRoute.snapshot.params.orgId;
    const txnId = this.activatedRoute.snapshot.params.id;

    if (!expenseOrgId) {
      this.transactionService.getETxnUnflattened(txnId).subscribe((etxn) => {
        const route = this.deepLinkService.getExpenseRoute(etxn);
        this.router.navigate([...route, { id: this.activatedRoute.snapshot.params.id }]);
      });
    } else {
      const eou$ = from(this.loaderService.showLoader('Loading....')).pipe(
        switchMap(() => from(this.authService.getEou())),
        catchError(() => {
          this.switchOrg();
          return EMPTY;
        }),
        shareReplay(1)
      );

      //If expenseOrgId is same as user orgId, then redirect to expense page
      eou$
        .pipe(
          filter((eou) => expenseOrgId === eou.ou.org_id),
          switchMap(() => this.transactionService.getETxnUnflattened(txnId)),
          finalize(() => from(this.loaderService.hideLoader()))
        )
        .subscribe({
          next: (etxn) => {
            const route = this.deepLinkService.getExpenseRoute(etxn);
            this.router.navigate([...route, { id: this.activatedRoute.snapshot.params.id }]);
          },
          error: () => this.switchOrg(),
        });

      //If expenseOrgId is different from user orgId, then redirect to switch org page with orgId and txnId
      eou$
        .pipe(
          filter((eou) => expenseOrgId !== eou.ou.org_id),
          finalize(() => from(this.loaderService.hideLoader()))
        )
        .subscribe(() =>
          this.router.navigate([
            '/',
            'auth',
            'switch_org',
            {
              txnId,
              orgId: expenseOrgId,
            },
          ])
        );
    }
  }

  async redirectToReportModule() {
    await this.loaderService.showLoader('Loading....');
    const currentEou = await this.authService.getEou();

    this.reportService.getERpt(this.activatedRoute.snapshot.params.id).subscribe(
      (res) => {
        if (currentEou.ou.id === res.rp.org_user_id) {
          this.router.navigate(['/', 'enterprise', 'my_view_report', { id: this.activatedRoute.snapshot.params.id }]);
        } else {
          this.router.navigate(['/', 'enterprise', 'view_team_report', { id: this.activatedRoute.snapshot.params.id }]);
        }
      },
      () => {
        this.switchOrg();
      },
      async () => {
        await this.loaderService.hideLoader();
      }
    );
  }

  switchOrg() {
    this.router.navigate(['/', 'auth', 'switch_org']);
  }
}
