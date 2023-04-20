import { EventEmitter, Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { concat, from, of } from 'rxjs';
import { delay, map, pairwise, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { ConnectionMessageStatus } from '../../shared/components/fy-connection/connection-status.enum';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  isConnected$: Observable<boolean>;

  constructor() {
    this.setupNetworkWatcher();
  }

  isOnline() {
    return from(Network.getStatus()).pipe(map((networkStatus) => networkStatus.connected));
  }

  connectivityWatcher(emitter: EventEmitter<boolean>): EventEmitter<boolean> {
    Network.addListener('networkStatusChange', (event) => {
      emitter.emit(event.connected);
    });
    return emitter;
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.isOnline(), networkWatcherEmitter.asObservable()).pipe(shareReplay(1));
  }

  getConnectionStatus() {
    return this.isConnected$.pipe(
      startWith(true),
      pairwise(),
      switchMap(([previousConnectionStatus, currentConnectionStatus]) => {
        if (previousConnectionStatus === false && currentConnectionStatus === true) {
          return concat(
            of(ConnectionMessageStatus.onlineMessageShown),
            of(ConnectionMessageStatus.onlineMessageHidden).pipe(delay(3000))
          );
        } else if (previousConnectionStatus === true && currentConnectionStatus === true) {
          return of(ConnectionMessageStatus.onlineMessageHidden);
        } else {
          return of(ConnectionMessageStatus.disconnected);
        }
      })
    );
  }
}
