import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, from, fromEvent, throwError } from 'rxjs';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import {
  concatMap,
  finalize,
  catchError,
  map,
  startWith,
  distinctUntilChanged,
  switchMap,
  tap,
  shareReplay,
} from 'rxjs/operators';
import { globalCacheBusterNotifier } from 'ts-cacheable';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { LaunchDarklyService } from 'src/app/core/services/launch-darkly.service';

@Component({
  selector: 'app-delegated-accounts',
  templateUrl: './delegated-accounts.page.html',
  styleUrls: ['./delegated-accounts.page.scss'],
})
export class DelegatedAccountsPage implements OnInit {
  @ViewChild('searchDelegatees') searchDelegatees: ElementRef;

  delegatedAccList;

  currentOrg;

  searchInput = '';

  constructor(
    private orgUserService: OrgUserService,
    private offlineService: OfflineService,
    private router: Router,
    private loaderService: LoaderService,
    private activatedRoute: ActivatedRoute,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private launchDarklyService: LaunchDarklyService
  ) {}

  switchToDelegatee(eou) {
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
        this.launchDarklyService.updateIdentity();
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.searchInput = '';
    const switchToOwn = this.activatedRoute.snapshot.params.switchToOwn;

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
          this.launchDarklyService.updateIdentity();
          this.router.navigate(['/', 'enterprise', 'my_dashboard']);
        });
    } else {
      const delegatedAccList$ = forkJoin({
        delegatedAcc: this.orgUserService.findDelegatedAccounts(),
        currentOrg: this.offlineService.getCurrentOrg(),
      }).pipe(shareReplay(1));

      delegatedAccList$.subscribe((res) => {
        this.currentOrg = res.currentOrg;
      });

      fromEvent(this.searchDelegatees.nativeElement, 'keyup')
        .pipe(
          map((event: any) => event.srcElement.value),
          startWith(''),
          distinctUntilChanged(),
          switchMap((searchText) =>
            delegatedAccList$.pipe(
              map(({ delegatedAcc }) => this.orgUserService.excludeByStatus(delegatedAcc, 'DISABLED')),
              map((delegatees) =>
                delegatees.filter((delegatee) =>
                  Object.values(delegatee.us).some(
                    (delegateeProp) =>
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
          this.delegatedAccList = delegatees;
        });
    }
  }
}
