import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { concat, from, of } from 'rxjs';
import { delay, map, pairwise, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ConnectionMessageStatus } from '../../shared/components/fy-connection/connection-status.enum';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private readonly networkStatus$ = new Subject<boolean>();

  /** Single shared stream. Subscribe with takeUntil(destroy$) or use async pipe so subscriptions are cleaned up. */
  readonly isConnected$: Observable<boolean> = concat(
    this.isOnline(),
    this.networkStatus$.asObservable(),
  ).pipe(shareReplay(1));

  constructor() {
    this.setupNetworkWatcher();
  }

  isOnline() {
    return from(Network.getStatus()).pipe(map((networkStatus) => networkStatus.connected));
  }

  private async setupNetworkWatcher() {
    await Network.addListener('networkStatusChange', (event) => {
      this.networkStatus$.next(event.connected);
    });
  }

  getConnectionStatus() {
    return this.isConnected$.pipe(
      startWith(true),
      pairwise(),
      switchMap(([previousConnectionStatus, currentConnectionStatus]) => {
        if (previousConnectionStatus === false && currentConnectionStatus === true) {
          return concat(
            of(ConnectionMessageStatus.onlineMessageShown),
            of(ConnectionMessageStatus.onlineMessageHidden).pipe(delay(3000)),
          );
        } else if (previousConnectionStatus === true && currentConnectionStatus === true) {
          return of(ConnectionMessageStatus.onlineMessageHidden);
        } else {
          return of(ConnectionMessageStatus.disconnected);
        }
      }),
    );
  }
}
