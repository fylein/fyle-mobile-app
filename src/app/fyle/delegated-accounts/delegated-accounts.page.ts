import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, from, throwError } from 'rxjs';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { concatMap, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-delegated-accounts',
  templateUrl: './delegated-accounts.page.html',
  styleUrls: ['./delegated-accounts.page.scss'],
})
export class DelegatedAccountsPage implements OnInit {

  delegatedAccList;
  currentOrg;

  constructor(
    private orgUserService: OrgUserService,
    private offlineService: OfflineService,
    private router: Router,
    private loaderService: LoaderService,
    private activatedRoute: ActivatedRoute,
  ) { }

  switchToDelegatee(eou) {
    from(this.loaderService.showLoader('Switching Account')).pipe(
      concatMap(() => {
        return this.orgUserService.switchToDelegator(eou.ou);
      }),
      finalize(async () => {
        await this.loaderService.hideLoader();
      })
    ).subscribe(() => {
      this.router.navigate(['/', 'enterprise', 'my_dashboard']);
    });
  }

  ngOnInit() {

    const switchToOwn = this.activatedRoute.snapshot.params.switchToOwn;

    if (switchToOwn) {
      from(this.loaderService.showLoader('Switching Account')).pipe(
        concatMap(() => {
          return this.orgUserService.switchToDelegatee();
        }),
        finalize(async () => {
          await this.loaderService.hideLoader();
        })
      ).subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      });
    } else {
      const delegatedAccList$ = forkJoin({
        delegatedAcc: this.orgUserService.findDelegatedAccounts(),
        currentOrg: this.offlineService.getCurrentOrg()
      });

      delegatedAccList$.subscribe(res => {
        this.delegatedAccList = this.orgUserService.excludeByStatus(res.delegatedAcc, 'DISABLED');
        this.currentOrg = res.currentOrg;
      });
    }
  }

}
