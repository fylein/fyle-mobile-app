import { Component, OnInit, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { from, concat, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NetworkService } from '../../../core/services/network.service';

@Component({
  selector: 'app-delegated-acc-message',
  templateUrl: './delegated-acc-message.component.html',
  styleUrls: ['./delegated-acc-message.component.scss'],
})
export class DelegatedAccMessageComponent implements OnInit {
  delegateeName: string;

  isConnected$: Observable<boolean>;

  constructor(private authService: AuthService, private router: Router, private networkService: NetworkService) {}

  ngOnInit(): void {
    from(this.authService.getEou()).subscribe((res) => {
      this.delegateeName = res.us.full_name;
    });
    this.setupNetworkWatcher();
  }

  setupNetworkWatcher(): void {
    const networkWatcherEmitter = this.networkService.connectivityWatcher(new EventEmitter<boolean>());
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1)
    );
  }

  switchBack(): void {
    if (!this.isConnected$) {
      return;
    }
    this.router.navigate(['/', 'enterprise', 'delegated_accounts', { switchToOwn: true }]);
  }
}
