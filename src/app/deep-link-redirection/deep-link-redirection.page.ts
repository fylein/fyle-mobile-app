import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../core/services/loader.service';
import { AdvanceRequestService } from '../core/services/advance-request.service';
import { AuthService } from '../core/services/auth.service';
import { TransactionService } from '../core/services/transaction.service';
import { EMPTY, catchError, filter, finalize, from, shareReplay, switchMap, map } from 'rxjs';
import { DeepLinkService } from '../core/services/deep-link.service';
import { ExpensesService } from '../core/services/platform/v1/spender/expenses.service';
import { SpenderReportsService } from '../core/services/platform/v1/spender/reports.service';
import { ApproverReportsService } from '../core/services/platform/v1/approver/reports.service';
import { IonContent } from '@ionic/angular/standalone';


@Component({
  selector: 'app-deep-link-redirection',
  templateUrl: './deep-link-redirection.page.html',
  styleUrls: ['./deep-link-redirection.page.scss'],
  imports: [
    IonContent
  ],
})
export class DeepLinkRedirectionPage {
  private activatedRoute = inject(ActivatedRoute);

  private router = inject(Router);

  private loaderService = inject(LoaderService);

  private advanceRequestService = inject(AdvanceRequestService);

  private transactionService = inject(TransactionService);

  private authService = inject(AuthService);

  private deepLinkService = inject(DeepLinkService);

  private expensesService = inject(ExpensesService);

  private approverReportsService = inject(ApproverReportsService);

  private spenderReportsService = inject(SpenderReportsService);

  ionViewWillEnter(): void {
    const subModule = this.activatedRoute.snapshot.params.sub_module as string;

    if (subModule === 'report') {
      this.redirectToReportModule();
    } else if (subModule === 'expense') {
      this.redirectToExpenseModule();
    } else if (subModule === 'advReq') {
      this.redirectToAdvReqModule();
    } else if (subModule === 'my_dashboard') {
      this.redirectToDashboardModule();
    }
  }

  async redirectToDashboardModule(): Promise<void> {
    const openSMSOptInDialog = this.activatedRoute.snapshot.params.openSMSOptInDialog as string;
    const orgId = this.activatedRoute.snapshot.params.orgId as string;

    const eou$ = from(this.loaderService.showLoader('Loading....')).pipe(
      switchMap(() => from(this.authService.getEou())),
      catchError(() => {
        this.switchOrg();
        return EMPTY;
      }),
      shareReplay(1),
    );

    // If orgId is the same as the current user orgId, then redirect to the dashboard page
    eou$
      .pipe(
        filter((eou) => orgId === eou.ou.org_id),
        finalize(() => from(this.loaderService.hideLoader())),
      )
      .subscribe({
        next: () => {
          this.router.navigate([
            '/',
            'enterprise',
            'my_dashboard',
            {
              openSMSOptInDialog,
            },
          ]);
        },
        error: () => this.switchOrg(),
      });

    // If orgId is the diferent from the current user orgId, then redirect to switch org with orgId and openSMSOptInDialog
    eou$
      .pipe(
        filter((eou) => orgId !== eou.ou.org_id),
        finalize(() => from(this.loaderService.hideLoader())),
      )
      .subscribe({
        next: () => {
          this.router.navigate([
            '/',
            'auth',
            'switch_org',
            {
              openSMSOptInDialog,
              orgId,
            },
          ]);
        },
        error: () => this.switchOrg(),
      });
  }

  async redirectToAdvReqModule(): Promise<void> {
    await this.loaderService.showLoader('Loading....');
    const currentEou = await this.authService.getEou();
    this.advanceRequestService.getEReq(this.activatedRoute.snapshot.params.id as string).subscribe(
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
      },
    );
  }

  async redirectToExpenseModule(): Promise<void> {
    const expenseOrgId = this.activatedRoute.snapshot.params.orgId as string;
    const txnId = this.activatedRoute.snapshot.params.id as string;

    if (!expenseOrgId) {
      this.expensesService.getExpenseById(txnId).subscribe((expense) => {
        const etxn = this.transactionService.transformExpense(expense);
        const route = this.deepLinkService.getExpenseRoute(etxn);
        this.router.navigate([...route, { id: txnId }]);
      });
    } else {
      const eou$ = from(this.loaderService.showLoader('Loading....')).pipe(
        switchMap(() => from(this.authService.getEou())),
        catchError(() => {
          this.switchOrg();
          return EMPTY;
        }),
        shareReplay(1),
      );

      // If expenseOrgId is the same as user orgId, then redirect to the expense page
      eou$
        .pipe(
          filter((eou) => expenseOrgId === eou.ou.org_id),
          switchMap(() => this.expensesService.getExpenseById(txnId)),
          map((expense) => this.transactionService.transformExpense(expense)),
          finalize(() => from(this.loaderService.hideLoader())),
        )
        .subscribe({
          next: (etxn) => {
            const route = this.deepLinkService.getExpenseRoute(etxn);
            this.router.navigate([...route, { id: txnId }]);
          },
          error: () => this.switchOrg(),
        });

      //If expenseOrgId is different from user orgId, then redirect to switch org page with orgId and txnId
      eou$
        .pipe(
          filter((eou) => expenseOrgId !== eou.ou.org_id),
          finalize(() => from(this.loaderService.hideLoader())),
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
          ]),
        );
    }
  }

  async redirectToReportModule(): Promise<void> {
    await this.loaderService.showLoader('Loading....');

    const spenderReport$ = this.spenderReportsService.getReportById(this.activatedRoute.snapshot.params.id as string);
    const approverReport$ = this.approverReportsService.getReportById(this.activatedRoute.snapshot.params.id as string);
    spenderReport$.subscribe(
      (spenderReport) => {
        if (spenderReport) {
          this.router.navigate([
            '/',
            'enterprise',
            'my_view_report',
            { id: this.activatedRoute.snapshot.params.id as string },
          ]);
        } else {
          approverReport$.subscribe((approverReport) => {
            if (approverReport) {
              this.router.navigate([
                '/',
                'enterprise',
                'view_team_report',
                { id: this.activatedRoute.snapshot.params.id as string },
              ]);
            } else {
              this.switchOrg();
            }
          });
        }
      },
      () => {
        this.switchOrg();
      },
      async () => {
        await this.loaderService.hideLoader();
      },
    );
  }

  switchOrg(): void {
    this.router.navigate(['/', 'auth', 'switch_org']);
  }
}
