import { Component, OnInit } from '@angular/core';
import { DeviceService } from 'src/app/core/services/device.service';
import { ActivatedRoute } from '@angular/router';
import { filter, shareReplay } from 'rxjs/operators';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { noop } from 'rxjs';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';
import { PlatformHandlerService } from 'src/app/core/services/platform-handler.service';

@Component({
  selector: 'app-app-version',
  templateUrl: './app-version.page.html',
  styleUrls: ['./app-version.page.scss'],
})
export class AppVersionPage implements OnInit {
  message: string;

  constructor(
    private deviceService: DeviceService,
    private activatedRoute: ActivatedRoute,
    private browserHandlerService: BrowserHandlerService,
    private platformHandlerService: PlatformHandlerService
  ) {}

  ngOnInit() {
    this.message = this.activatedRoute.snapshot.params.message;

    //User should not be able to navigate from this page using the hardware back button.
    this.platformHandlerService.registerBackButtonAction(BackButtonActionPriority.ABSOLUTE, noop);
  }

  updateApp() {
    const deviceInfo$ = this.deviceService.getDeviceInfo().pipe(shareReplay(1));

    const deviceIos$ = deviceInfo$.pipe(filter((deviceInfo) => deviceInfo.platform === 'ios'));

    const deviceAndroid$ = deviceInfo$.pipe(filter((deviceInfo) => deviceInfo.platform === 'android'));

    deviceAndroid$.subscribe(async () => {
      await this.browserHandlerService.openLinkWithWindowName(
        '_system',
        'https://play.google.com/store/apps/details?id=com.ionicframework.fyle595781'
      );
    });

    deviceIos$.subscribe(async () => {
      await this.browserHandlerService.openLinkWithWindowName(
        '_system',
        'https://itunes.apple.com/in/app/fyle/id1137906166'
      );
    });
  }
}
