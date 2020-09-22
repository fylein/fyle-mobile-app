import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DeviceService } from './core/services/device.service';
import { switchMap, filter, tap } from 'rxjs/operators';
import { AppVersionService } from './core/services/app-version.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private deviceService: DeviceService,
    private appVersionService: AppVersionService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    this.checkAppSupportedVersion();
  }

  checkAppSupportedVersion() {
    this.deviceService.getDeviceInfo().pipe(
      switchMap((deviceInfo) => {
        const data = {
          app_version: deviceInfo.appVersion,
          device_os: deviceInfo.platform
        };

        return this.appVersionService.isSupported(data);
      })
    ).subscribe((res: { message: string, supported: boolean }) => {
      if (!res.supported && environment.production) {
        this.router.navigate(['/', 'auth', 'app_version', { message: res.message }]);
      }
    });
  }
}
