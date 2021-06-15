import {EventEmitter, Injectable} from '@angular/core';
import {from} from 'rxjs';
import {map} from 'rxjs/operators';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  constructor() { }

  isOnline() {
    return from(Network.getStatus()).pipe(
      map(networkStatus => networkStatus.connected)
    );
  }

  connectivityWatcher(emitter: EventEmitter<boolean>) {
    Network.addListener('networkStatusChange', (event) => {
      emitter.emit(event.connected);
    });
  }
}
