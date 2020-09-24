import { Component, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NetworkService } from 'src/app/core/services/network.service';
import { Observable, concat, noop } from 'rxjs';

@Component({
  selector: 'app-signup-details-enterprise',
  templateUrl: './signup-details-enterprise.page.html',
  styleUrls: ['./signup-details-enterprise.page.scss'],
})
export class SignupDetailsEnterprisePage implements OnInit {

  isConnected$: Observable<boolean>;

  constructor(
    private activateRoute: ActivatedRoute,
    private networkService: NetworkService
  ) { }

  ngOnInit() {
    this.setupNetworkWatcher();
    const email = this.activateRoute.snapshot.params.email;

  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe(noop);
  }


}
