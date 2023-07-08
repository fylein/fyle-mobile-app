import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../core/services/loader.service';
import { AdvanceRequestService } from '../core/services/advance-request.service';
import { AuthService } from '../core/services/auth.service';
import { TransactionService } from '../core/services/transaction.service';
import { ReportService } from '../core/services/report.service';
import { finalize, forkJoin, from, switchMap } from 'rxjs';
import { UnflattenedTransaction } from '../core/models/unflattened-transaction.model';

@Component({
  selector: 'app-deep-link-redirection',
  templateUrl: './deep-link-redirection.page.html',
  styleUrls: ['./deep-link-redirection.page.scss'],
})
export class DeepLinkRedirectionPage implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loaderService: LoaderService,
    private advanceRequestService: AdvanceRequestService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
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
        this.goToSwitchOrgPage();
      },
      async () => {
        await this.loaderService.hideLoader();
      }
    );
  }

  async redirectToExpenseModule() {
    from(this.loaderService.showLoader('Loading....'))
      .pipe(
        switchMap(() =>
          forkJoin({
            eou: from(this.authService.getEou()),
            etxn: this.transactionService.getETxnUnflattened(this.activatedRoute.snapshot.params.id),
          })
        ),
        finalize(() => from(this.loaderService.hideLoader()))
      )
      .subscribe({
        next: ({ eou, etxn }) => {
          const route = this.getExpenseRoute(etxn);
          if (eou.ou.org_id === etxn.ou.org_id) {
            this.router.navigate([...route, { id: this.activatedRoute.snapshot.params.id }]);
          } else {
            //Switch to different org and get transaction)
            this.router.navigate([
              '/',
              'auth',
              'switch_org',
              {
                txnId: this.activatedRoute.snapshot.params.id,
                orgId: etxn.ou.org_id,
                route: route[2],
              },
            ]);
          }
        },
        error: () => this.goToSwitchOrgPage(),
      });
  }

  getExpenseRoute(etxn: UnflattenedTransaction) {
    const category = etxn.tx.org_category?.toLowerCase();
    const canEditTxn = ['DRAFT', 'DRAFT_INQUIRY', 'COMPLETE', 'APPROVER_PENDING'].includes(etxn.tx.state);

    let route = [];
    if (canEditTxn) {
      route = ['/', 'enterprise', 'add_edit_expense'];
      if (category === 'mileage') {
        route = ['/', 'enterprise', 'add_edit_mileage'];
      } else if (category === 'per diem') {
        route = ['/', 'enterprise', 'add_edit_per_diem'];
      }
    } else {
      route = ['/', 'enterprise', 'view_expense'];
      if (category === 'mileage') {
        route = ['/', 'enterprise', 'view_mileage'];
      } else if (category === 'per diem') {
        route = ['/', 'enterprise', 'view_per_diem'];
      }
    }

    return route;
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
        this.goToSwitchOrgPage();
      },
      async () => {
        await this.loaderService.hideLoader();
      }
    );
  }

  goToSwitchOrgPage() {
    this.router.navigate(['/', 'auth', 'switch_org']);
  }
}
