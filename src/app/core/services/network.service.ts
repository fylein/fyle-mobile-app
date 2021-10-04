import { EventEmitter, Injectable } from '@angular/core';
import { concat, from, Observable, of } from 'rxjs';
import { delay, map, pairwise, startWith, switchMap } from 'rxjs/operators';
import { Network } from '@capacitor/network';
import { ConnectionMessageStatus } from 'src/app/shared/components/fy-connection/connection-status.enum';

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

  connectivityWatcher(emitter: EventEmitter<boolean>) {
    Network.addListener('networkStatusChange', (event) => {
      emitter.emit(event.connected);
    });
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
