import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { concat, Observable } from 'rxjs';
import { NetworkService } from 'src/app/core/services/network.service';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';

@Component({
  selector: 'app-personal-cards',
  templateUrl: './personal-cards.page.html',
  styleUrls: ['./personal-cards.page.scss'],
})
export class PersonalCardsPage implements OnInit {
  headerState: HeaderState = HeaderState.base;

  isConnected$: Observable<boolean>;

  linkedAccounts$: Observable<any>;

  linkedAccountsCount$: Observable<number>;

  navigateBack = false;

  constructor(
    private personalCardsService: PersonalCardsService,
    private networkService: NetworkService,
    private router: Router,
    private activatedRoute: ActivatedRoute,

  ) { }

  ngOnInit() {
    this.setupNetworkWatcher();
    this.linkedAccountsCount$ = this.personalCardsService.getLinkedAccountsCount();
  }

  ionViewWillEnter() {
    this.linkedAccountsCount$ = this.personalCardsService.getLinkedAccountsCount();

    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
  }

  linkAccount() {
   this.personalCardsService.getToken();
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
