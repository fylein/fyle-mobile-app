import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin, from, fromEvent, noop, Observable} from 'rxjs';
import {distinctUntilChanged, finalize, map, shareReplay, startWith, switchMap} from 'rxjs/operators';
import {Org} from 'src/app/core/models/org.model';
import {LoaderService} from 'src/app/core/services/loader.service';
import {OfflineService} from 'src/app/core/services/offline.service';
import {UserService} from 'src/app/core/services/user.service';
import {AuthService} from 'src/app/core/services/auth.service';
import {StorageService} from 'src/app/core/services/storage.service';
import {NetworkService} from 'src/app/core/services/network.service';
import {OrgService} from 'src/app/core/services/org.service';
import {UserEventService} from 'src/app/core/services/user-event.service';
import {globalCacheBusterNotifier} from 'ts-cacheable';
import * as Sentry from '@sentry/angular';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';

@Component({
  selector: 'app-swicth-org',
  templateUrl: './switch-org.page.html',
  styleUrls: ['./switch-org.page.scss'],
})
export class SwitchOrgPage implements OnInit, AfterViewInit {
  @ViewChild('searchOrgsInput') searchOrgsInput: ElementRef;

  orgs$: Observable<Org[]>;
  filteredOrgs$: Observable<Org[]>;
  searchInput = '';
  isLoading = false;

  constructor(
    private offlineService: OfflineService,
    private loaderService: LoaderService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private networkService: NetworkService,
    private orgService: OrgService,
    private userEventService: UserEventService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.searchInput = '';
    this.isLoading = true;
    this.orgs$ = this.offlineService.getOrgs().pipe(
      shareReplay(1),
      finalize(() => {
        this.isLoading = false;
      })
    );

    const choose = this.activatedRoute.snapshot.params.choose && JSON.parse(this.activatedRoute.snapshot.params.choose);

    if (!choose) {
      from(this.proceed()).subscribe(noop);
    } else {
      this.orgs$.subscribe((orgs) => {
        if (orgs.length === 1) {
          from(this.proceed()).subscribe(noop);
        }
      });
    }
  }

  async proceed() {
    const offlineData$ = this.offlineService.load().pipe(shareReplay(1));
    const pendingDetails$ = this.userService.isPendingDetails().pipe(shareReplay(1));
    const eou$ = from(this.authService.getEou());
    const roles$ = from(this.authService.getRoles().pipe(shareReplay(1)));
    const isOnline$ = this.networkService.isOnline().pipe(shareReplay(1));

    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return forkJoin(
          [
            offlineData$,
            pendingDetails$,
            eou$,
            roles$,
            isOnline$
          ]
        );
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(aggregatedResults => {
      const [
        [
          orgSettings,
          orgUserSettings,
          allCategories,
          costCenters,
          projects,
          perDiemRates,
          customInputs,
          currentOrg,
          orgs,
          accounts,
          transactionFieldConfigurationsMap,
          currencies,
          homeCurrency
        ],
        isPendingDetails,
        eou,
        roles,
        isOnline
      ] = aggregatedResults;


      const pendingDetails = !(currentOrg.lite === true || currentOrg.lite === false) || isPendingDetails;

      if (eou) {
        Sentry.setUser({
          id: eou.us.email + ' - ' + eou.ou.id,
          email: eou.us.email,
          orgUserId: eou.ou.id
        });
      }

      if (pendingDetails) {
        if (roles.indexOf('OWNER') > -1) {
          this.router.navigate(['/', 'post_verification', 'setup_account']);
        } else {
          this.router.navigate(['/', 'post_verification', 'invited_user']);
        }
      } else if (eou.ou.status === 'ACTIVE') {
        if (!isOnline) {
          this.router.navigate(['/', 'enterprise', 'my_expenses']);
        } else {
          this.router.navigate(['/', 'enterprise', 'my_dashboard']);
        }
      } else if (eou.ou.status === 'DISABLED') {
        this.router.navigate(['/', 'auth', 'disabled']);
      }
    });
  }

  async switchToOrg(org: Org) {
    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return this.orgService.switchOrg(org.id);
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(() => {
      this.clearRecentLocalStorageCache();
      from(this.proceed()).subscribe(noop);
    }, async (err) => {
      await this.storageService.clearAll();
      this.userEventService.logout();
      globalCacheBusterNotifier.next();
    });
  }

  clearRecentLocalStorageCache() {
    this.recentLocalStorageItemsService.clear('recent-currency-cache');
  }

  getOrgsWhichContainSearchText(orgs: Org[], searchText: string) {
    return orgs.filter(org => {
      return Object.values(org)
        .map(value => value && value.toString().toLowerCase())
        .filter(value => !!value)
        .some(value => value.toLowerCase().includes(searchText.toLowerCase()));
    });
  }

  ngAfterViewInit(): void {
    const currentOrgs$ = this.offlineService.getOrgs().pipe(shareReplay(1));

    this.filteredOrgs$ = fromEvent(this.searchOrgsInput.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => {
        return currentOrgs$.pipe(
          map(
            orgs => this.getOrgsWhichContainSearchText(orgs, searchText)
          )
        );
      })
    );
  }
}
