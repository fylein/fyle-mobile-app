import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../core/services/loader.service';
import { AdvanceRequestService } from '../core/services/advance-request.service';
import { AuthService } from '../core/services/auth.service';
import { TransactionService } from '../core/services/transaction.service';
import { ReportService } from '../core/services/report.service';

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
        this.switchOrg();
      },
      async () => {
        await this.loaderService.hideLoader();
      }
    );
  }

  async redirectToExpenseModule() {
    await this.loaderService.showLoader('Loading....');
    this.transactionService.getETxn(this.activatedRoute.snapshot.params.id).subscribe(
      (res) => {
        const category = res.tx.org_category && res.tx.org_category.toLowerCase();

        let route = ['/', 'enterprise', 'view_expense'];
        if (category === 'mileage') {
          route = ['/', 'enterprise', 'view_mileage'];
        } else if (category === 'per diem') {
          route = ['/', 'enterprise', 'view_per_diem'];
        }

        this.router.navigate([...route, { id: this.activatedRoute.snapshot.params.id }]);
      },
      () => {
        this.switchOrg();
      },
      async () => {
        await this.loaderService.hideLoader();
      }
    );
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

  private switchOrg() {
    this.router.navigate(['/', 'auth', 'switch_org']);
  }
}
