import {EventEmitter, Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {Plugins} from '@capacitor/core';
import {NetworkService} from './network.service';
import {concat} from 'rxjs';

const {Device} = Plugins;


@Injectable({
  providedIn: 'root'
})
export class AppcuesService {

  constructor(
    private authService: AuthService,
    private networkService: NetworkService
  ) {
  }

  setupNetworkWatcher() {
    const that = this;
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    concat(that.networkService.isOnline(), networkWatcherEmitter.asObservable()).subscribe(async (isOnline) => {
      const eou = await that.authService.getEou();
      if (eou && isOnline) {
        that.identifyUser(eou);
      }
    });
  }

  private identifyUser(eou) {
    (window as any).Appcues.identify(eou.us.id, {
      orgUserId: eou.ou.id,
      orgId: eou.ou.org_id,
      orgName: eou.ou.org_name,
      createdAt: eou.us.created_at,
      email: eou.us.email,
      fullName: eou.us.full_name,
      roles: eou.ou.roles.join()
    });
  }
}