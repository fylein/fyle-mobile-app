import { Component, EventEmitter, OnInit, inject } from '@angular/core';
import { NetworkService } from '../../../core/services/network.service';
import { concat, from, of } from 'rxjs';
import { delay, pairwise, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { ConnectionMessageStatus } from './connection-status.enum';

@Component({
  selector: 'app-fy-connection',
  templateUrl: './fy-connection.component.html',
  styleUrls: ['./fy-connection.component.scss'],
  standalone: false,
})
export class FyConnectionComponent implements OnInit {
  private networkService = inject(NetworkService);

  isConnected$: Observable<boolean>;

  state$: Observable<ConnectionMessageStatus>;

  get ConnectionMessageStatus() {
    return ConnectionMessageStatus;
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      shareReplay(1),
    );
  }

  ngOnInit() {
    this.setupNetworkWatcher();
    this.state$ = this.networkService.getConnectionStatus();
  }
}
