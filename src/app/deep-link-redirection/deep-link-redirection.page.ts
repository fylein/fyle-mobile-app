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
  imports: [IonContent],
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
    } else if (subModule === 'manage_corporate_cards') {
      this.redirectToCorporateCardsModule();
    } else if (subModule === 'my_expenses') {
      this.redirectToMyExpensesModule();
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

  async redirectToCorporateCardsModule(): Promise<void> {
    const orgId = this.activatedRoute.snapshot.params.orgId as string;
    const pushNotificationType = this.activatedRoute.snapshot.params.push_notification_type as string;
    const openVirtualCards =
      pushNotificationType === 'VIRTUAL_CARD_CREATED' || pushNotificationType === 'VIRTUAL_CARD_DELETED';

    const eou$ = from(this.loaderService.showLoader('Loading....')).pipe(
      switchMap(() => from(this.authService.getEou())),
      catchError(() => {
        this.switchOrg();
        return EMPTY;
      }),
      shareReplay(1),
    );

    // If no orgId is provided or orgId matches the current user's org, navigate directly to manage corporate cards
    eou$
      .pipe(
        filter((eou) => !orgId || orgId === eou.ou.org_id),
        finalize(() => from(this.loaderService.hideLoader())),
      )
      .subscribe({
        next: () => {
          this.router.navigate([
            '/',
            'enterprise',
            'manage_corporate_cards',
            {
              openVirtualCards,
            },
          ]);
        },
        error: () => this.switchOrg(),
      });

    // If orgId is provided and different from the current user orgId, redirect to switch org
    eou$
      .pipe(
        filter((eou) => !!orgId && orgId !== eou.ou.org_id),
        finalize(() => from(this.loaderService.hideLoader())),
      )
      .subscribe({
        next: () => {
          this.router.navigate([
            '/',
            'auth',
            'switch_org',
            {
              orgId,
              openVirtualCards,
            },
          ]);
        },
        error: () => this.switchOrg(),
      });
  }

  async redirectToMyExpensesModule(): Promise<void> {
    const orgId = this.activatedRoute.snapshot.params.orgId as string;
    const filters = this.activatedRoute.snapshot.params.filters as string;

    if (!orgId) {
      this.router.navigate(['/', 'enterprise', 'my_expenses'], {
        queryParams: filters ? { filters } : {},
      });
      return;
    }

    const eou$ = from(this.loaderService.showLoader('Loading....')).pipe(
      switchMap(() => from(this.authService.getEou())),
      catchError(() => {
        this.switchOrg();
        return EMPTY;
      }),
      shareReplay(1),
    );

    eou$
      .pipe(
        filter((eou) => orgId === eou.ou.org_id),
        finalize(() => from(this.loaderService.hideLoader())),
      )
      .subscribe({
        next: () =>
          this.router.navigate(['/', 'enterprise', 'my_expenses'], {
            queryParams: filters ? { filters } : {},
          }),
        error: () => this.switchOrg(),
      });

    eou$
      .pipe(
        filter((eou) => orgId !== eou.ou.org_id),
        finalize(() => from(this.loaderService.hideLoader())),
      )
      .subscribe({
        next: () =>
          this.router.navigate([
            '/',
            'auth',
            'switch_org',
            {
              orgId,
              my_expenses_filters: filters,
            },
          ]),
        error: () => this.switchOrg(),
      });
  }

  async redirectToAdvReqModule(): Promise<void> {
    await this.loaderService.showLoader('Loading....');
    let currentEou;
    try {
      currentEou = await this.authService.getEou();
    } catch {
      await this.loaderService.hideLoader();
      this.switchOrg();
      return;
    }
    const orgId = this.activatedRoute.snapshot.params.orgId as string;
    const pushNotificationType = this.activatedRoute.snapshot.params.push_notification_type as string;
    if (orgId && orgId !== currentEou.ou.org_id) {
      await this.loaderService.hideLoader();
      this.router.navigate([
        '/',
        'auth',
        'switch_org',
        {
          orgId,
          advReqId: this.activatedRoute.snapshot.params.id as string,
        },
      ]);
      return;
    }
    this.advanceRequestService.getEReq(this.activatedRoute.snapshot.params.id as string).subscribe(
      (res) => {
        const id = res.advance.id || res.areq.id;

        let route = ['/', 'enterprise', 'my_view_advance_request'];
        if (res.advance.id) {
          route = ['/', 'enterprise', 'my_view_advance'];
        } else if (res.ou.id !== currentEou.ou.id) {
          route = ['/', 'enterprise', 'view_team_advance'];
        }
        const params: Record<string, string> = { id };
        if (pushNotificationType) {
          params.push_notification_type = pushNotificationType;
        }
        this.router.navigate([...route, params]);
      },
      async () => {
        await this.loaderService.hideLoader();
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
    const pushNotificationType = this.activatedRoute.snapshot.params.push_notification_type as string;

    if (!expenseOrgId) {
      this.expensesService.getExpenseById(txnId).subscribe((expense) => {
        const etxn = this.transactionService.transformExpense(expense);
        const route = this.deepLinkService.getExpenseRoute(etxn);
        const params: Record<string, string> = { id: txnId };
        if (pushNotificationType) {
          params.push_notification_type = pushNotificationType;
        }
        this.router.navigate([...route, params]);
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

    const orgId = this.activatedRoute.snapshot.params.orgId as string;
    const reportId = this.activatedRoute.snapshot.params.id as string;
    if (orgId) {
      const currentEou = await this.authService.getEou();
      if (orgId !== currentEou.ou.org_id) {
        await this.loaderService.hideLoader();
        this.router.navigate([
          '/',
          'auth',
          'switch_org',
          {
            orgId,
            reportId,
          },
        ]);
        return;
      }
    }

    const spenderReport$ = this.spenderReportsService.getReportById(reportId);
    const approverReport$ = this.approverReportsService.getReportById(reportId);
    const pushNotificationType = this.activatedRoute.snapshot.params.push_notification_type as string;

    spenderReport$.subscribe(
      (spenderReport) => {
        if (spenderReport) {
          const params: Record<string, string> = { id: reportId };
          if (pushNotificationType) {
            params.push_notification_type = pushNotificationType;
          }
          this.router.navigate(['/', 'enterprise', 'my_view_report', params]);
        } else {
          approverReport$.subscribe((approverReport) => {
            if (approverReport) {
              const params: Record<string, string> = { id: reportId };
              if (pushNotificationType) {
                params.push_notification_type = pushNotificationType;
              }
              this.router.navigate(['/', 'enterprise', 'view_team_report', params]);
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
