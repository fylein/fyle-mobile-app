import { Component, EventEmitter, OnInit, inject } from '@angular/core';
import { NetworkService } from '../../../core/services/network.service';
import { concat, from, of } from 'rxjs';
import { delay, pairwise, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { ConnectionMessageStatus } from './connection-status.enum';
import { AsyncPipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-connection',
  templateUrl: './fy-connection.component.html',
  styleUrls: ['./fy-connection.component.scss'],
  imports: [AsyncPipe, TranslocoPipe],
})
export class FyConnectionComponent implements OnInit {
  private networkService = inject(NetworkService);

  isConnected$: Observable<boolean>;

  state$: Observable<ConnectionMessageStatus>;

  get ConnectionMessageStatus() {
    return ConnectionMessageStatus;
  }

  setupNetworkWatcher() {
    this.isConnected$ = this.networkService.isConnected$;
  }

  ngOnInit() {
    this.setupNetworkWatcher();
    this.state$ = this.networkService.getConnectionStatus();
  }
}
