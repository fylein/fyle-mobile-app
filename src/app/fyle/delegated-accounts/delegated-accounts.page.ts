import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@sentry/angular';
import { forkJoin, from, fromEvent } from 'rxjs';
import { concatMap, distinctUntilChanged, finalize, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OrgService } from 'src/app/core/services/org.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { globalCacheBusterNotifier } from 'ts-cacheable';

@Component({
  selector: 'app-delegated-accounts',
  templateUrl: './delegated-accounts.page.html',
  styleUrls: ['./delegated-accounts.page.scss'],
})
export class DelegatedAccountsPage implements OnInit {
  @ViewChild('searchDelegatees') searchDelegatees: ElementRef<HTMLInputElement>;

  delegatedAccList;

  currentOrg;

  searchInput = '';

  constructor(
    private orgUserService: OrgUserService,
    private orgService: OrgService,
    private router: Router,
    private loaderService: LoaderService,
    private activatedRoute: ActivatedRoute,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService
  ) {}

  switchToDelegatee(eou: ExtendedOrgUser): void {
    from(this.loaderService.showLoader('Switching Account'))
      .pipe(
        concatMap(() => {
          globalCacheBusterNotifier.next();
          this.recentLocalStorageItemsService.clearRecentLocalStorageCache();
          return this.orgUserService.switchToDelegator(eou.ou);
        }),
        finalize(async () => {
          await this.loaderService.hideLoader();
        })
      )
      .subscribe(() => {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      });
  }

  ngOnInit(): void {
    return;
  }

  ionViewWillEnter(): void {
    this.searchInput = '';
    const switchToOwn = this.activatedRoute.snapshot.params.switchToOwn as string;

    if (switchToOwn) {
      from(this.loaderService.showLoader('Switching Account'))
        .pipe(
          concatMap(() => this.orgUserService.switchToDelegatee()),
          finalize(async () => {
            await this.loaderService.hideLoader();
          })
        )
        .subscribe(() => {
          globalCacheBusterNotifier.next();
          this.recentLocalStorageItemsService.clearRecentLocalStorageCache();
          this.router.navigate(['/', 'enterprise', 'my_dashboard']);
        });
    } else {
      const delegatedAccList$ = forkJoin({
        delegatedAcc: this.orgUserService.findDelegatedAccounts(),
        currentOrg: this.orgService.getCurrentOrg(),
      }).pipe(shareReplay(1));

      delegatedAccList$.subscribe((res) => {
        this.currentOrg = res.currentOrg;
      });

      fromEvent<{ srcElement: { value: string } }>(this.searchDelegatees.nativeElement, 'keyup')
        .pipe(
          map((event) => event.srcElement.value),
          startWith(''),
          distinctUntilChanged(),
          switchMap((searchText) =>
            delegatedAccList$.pipe(
              map(({ delegatedAcc }) => this.orgUserService.excludeByStatus(delegatedAcc, 'DISABLED')),
              map((delegatees: ExtendedOrgUser[]) =>
                delegatees?.filter((delegatee: ExtendedOrgUser) =>
                  Object.values(delegatee.us).some(
                    (delegateeProp: User) =>
                      delegateeProp &&
                      delegateeProp.toString() &&
                      delegateeProp.toString().toLowerCase().includes(searchText.toLowerCase())
                  )
                )
              )
            )
          )
        )
        .subscribe((delegatees) => {
          this.delegatedAccList = delegatees || [];
        });
    }
  }
}
