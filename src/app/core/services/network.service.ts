import { Injectable, EventEmitter } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';


const { Network } = Plugins;

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
