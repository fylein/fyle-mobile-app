import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, concat, from, noop, Observable, Subject } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { LoaderService } from 'src/app/core/services/loader.service';
import { finalize, shareReplay, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-personal-cards',
  templateUrl: './personal-cards.page.html',
  styleUrls: ['./personal-cards.page.scss'],
})
export class PersonalCardsPage implements OnInit {
  headerState: HeaderState = HeaderState.base;

  isConnected$: Observable<boolean>;

  linkedAccountsCount$: Observable<number>;

  loadData$: BehaviorSubject<any>;

  navigateBack = false;


  constructor(
    private personalCardsService: PersonalCardsService,
    private networkService: NetworkService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private inAppBrowser: InAppBrowser,
    private loaderService: LoaderService,

  ) { }

  ngOnInit() {
    this.setupNetworkWatcher();
  }

  ionViewWillEnter() {
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;

    this.loadData$ = new BehaviorSubject({});
    this.linkedAccountsCount$ = this.loadData$.pipe(
      switchMap(() => this.personalCardsService.getLinkedAccountsCount()
      ),
      shareReplay(1)
    );
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
  }

  linkAccount() {
    from(this.loaderService.showLoader('Redirecting you to our banking partner...',10000))
    .pipe(
      switchMap(() => this.personalCardsService.getToken()),
      finalize(async () => {
        await this.loaderService.hideLoader();
      })).subscribe((accessToken) => {
          this.openYoodle(accessToken.fast_link_url, accessToken.access_token);
        });
  }


  openYoodle(url, access_token) {
    const pageContent = `<form id="fastlink-form" name="fastlink-form" action="` + url + `" method="POST">
                          <input name="accessToken" value="Bearer `+ access_token + `" hidden="true" />
                          <input  name="extraParams" value="configName=Aggregation&callback=success://" hidden="true" />
                          </form> 
                          <script type="text/javascript">
                          document.getElementById("fastlink-form").submit();
                          </script>
                          `;
    const pageContentUrl = 'data:text/html;base64,' + btoa(pageContent);
    const browser = this.inAppBrowser.create(pageContentUrl, '_blank', 'location=yes,beforeload=yes');
    browser.on('beforeload').subscribe((event) => {
      if (event.url.substring(0,10) === 'success://') {
         const decodedData = JSON.parse(decodeURIComponent(event.url.slice(30)));
         browser.close();
         this.postAccounts([decodedData[0].requestId]);
      }

    });
  }

  postAccounts(requestIds) {
    from(this.loaderService.showLoader('Linking your card to Fyle...',30000))
    .pipe(
      switchMap(() => this.personalCardsService.postBankAccounts(requestIds)),
      finalize(async () => {
        await this.loaderService.hideLoader();
      })).subscribe(() => {
        this.loadData$.next({});
      });
      }

  onHomeClicked() {
    const queryParams: Params = { state: 'home' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
  }

  onTaskClicked() {
    const queryParams: Params = { state: 'tasks' };
    this.router.navigate(['/', 'enterprise', 'my_dashboard'], {
      queryParams,
    });
  }

  onCameraClicked() {
    this.router.navigate([
      '/',
      'enterprise',
      'camera_overlay',
      {
        navigate_back: true,
      },
    ]);
  }

}
