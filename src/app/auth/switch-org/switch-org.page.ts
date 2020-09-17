import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, Observable, forkJoin, concat, from, noop } from 'rxjs';
import { distinctUntilChanged, finalize, map, startWith, switchMap, concatMap } from 'rxjs/operators';
import { Org } from 'src/app/core/models/org.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgService } from 'src/app/core/services/org.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-swicth-org',
  templateUrl: './switch-org.page.html',
  styleUrls: ['./switch-org.page.scss'],
})
export class SwitchOrgPage implements OnInit, AfterViewInit {
  @ViewChild('searchOrgsInput') searchOrgsInput: ElementRef;

  orgs$: Observable<Org[]>;
  filteredOrgs$: Observable<Org[]>;

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
    private menuController: MenuController
  ) { }

  ngOnInit() {
    from(this.menuController.enable(false)).subscribe(noop);
    this.isLoading = true;
    this.orgs$ = this.offlineService.getOrgs().pipe(
      finalize(() => {
        this.isLoading = false;
      })
    );

    this.orgs$.subscribe((orgs) => {
      if (orgs.length === 1) {
        from(this.proceed()).subscribe(noop);
      }
    });

    const choose = this.activatedRoute.snapshot.params.choose && JSON.parse(this.activatedRoute.snapshot.params.choose);
    if (!choose) {
      from(this.proceed()).subscribe(noop);
    }
  }

  async proceed() {
    await this.loaderService.showLoader();
    const offlineData$ = this.offlineService.load();
    const pendingDetails$ = this.userService.isPendingDetails();
    const eou$ = from(this.authService.getEou());
    const roles$ = from(this.authService.getRoles());
    const isOnline$ = this.networkService.isOnline();
    forkJoin(
      [
        offlineData$,
        pendingDetails$,
        eou$,
        roles$,
        isOnline$
      ]
    ).pipe(
      finalize(async () => {
        await this.loaderService.hideLoader();
      })
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

      // TODO: Setup Sentry
      //   if (eou) {
      //     Raven.setUserContext({
      //       id: eou.us.email + ' - ' + eou.ou.id,
      //       email: eou.us.email,
      //       orgUserId: eou.ou.id
      //     });
      //   }

      let oneClickAction;
      if (eou.ou.is_primary) {
        const oneClickActionSettings = orgUserSettings.one_click_action_settings;
        if (oneClickActionSettings.allowed && oneClickActionSettings.enabled) {
          oneClickAction = oneClickActionSettings.module;
          from(this.storageService.set('oneClickAction', oneClickAction)).subscribe(noop);
        }
      }

      if (pendingDetails) {
        if (roles.indexOf('OWNER') > -1) {
          this.router.navigate(['/', 'post_verification', 'setup_account']);
        } else {
          this.router.navigate(['/', 'post_verification', 'invited_user']);
        }
      } else if (eou.ou.status === 'ACTIVE') {
        if (oneClickAction === 'insta_fyle') {
          this.router.navigate(['/', 'enterprise', 'camera_overlay', { isOneClick: true }]);
        } else {
          if (!isOnline) {
            this.router.navigate(['/', 'enterprise', 'my_expenses']);
          } else {
            this.router.navigate(['/', 'enterprise', 'my_dashboard']);
          }
        }
      } else if (eou.ou.status === 'DISABLED') {
        this.router.navigate(['/', 'auth', 'disabled']);
      }
    });
  }

  async switchToOrg(org: Org) {
    await this.loaderService.showLoader();
    this.orgService.switchOrg(org.id).pipe(
      finalize(async () => {
        await this.loaderService.hideLoader();
      })
    ).subscribe(() => {
      from(this.proceed()).subscribe(noop);
    }, async (err) => {
      await this.loaderService.hideLoader();
      await this.storageService.clearAll();
      this.userEventService.logout();
      // TODO: Clear all caches also
    });
  }

  getOrgsWhichContainSearchText(orgs: Org[], searchText: string) {
    return orgs.filter(org => {
      return Object.values(org)
        .map(value => value && value.toString().toLowerCase())
        .filter(value => !!value)
        .some(value => value.includes(searchText));
    });
  }

  ngAfterViewInit(): void {
    this.filteredOrgs$ = fromEvent(this.searchOrgsInput.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => {
        return this.orgs$.pipe(
          map(
            orgs => this.getOrgsWhichContainSearchText(orgs, searchText)
          )
        );
      })
    );
  }
}
