import { Component, OnInit } from '@angular/core';
import { DeviceService } from 'src/app/core/services/device.service';
import { ActivatedRoute } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Browser } from '@capacitor/browser';
import { Platform } from '@ionic/angular';
import { BackButtonActionPriority } from 'src/app/core/models/back-button-action-priority.enum';
import { noop, Subject } from 'rxjs';

@Component({
  selector: 'app-app-version',
  templateUrl: './app-version.page.html',
  styleUrls: ['./app-version.page.scss'],
})
export class AppVersionPage {
  message: string;

  onPageExit$: Subject<void>;

  constructor(
    private deviceService: DeviceService,
    private activatedRoute: ActivatedRoute,
    private platform: Platform
  ) {}

  ionViewWillLeave() {
    this.onPageExit$.next();
    this.onPageExit$.complete();
  }

  ionViewWillEnter() {
    this.onPageExit$ = new Subject();
    this.message = this.activatedRoute.snapshot.params.message;

    //User should not be able to navigate from this page using the hardware back button.
    this.platform.backButton.subscribeWithPriority(BackButtonActionPriority.ABSOLUTE, noop);
  }

  updateApp() {
    const deviceIos$ = this.deviceService.getDeviceInfo().pipe(filter((deviceInfo) => deviceInfo.platform === 'ios'));

    const deviceAndroid$ = this.deviceService
      .getDeviceInfo()
      .pipe(filter((deviceInfo) => deviceInfo.platform === 'android'));

    deviceAndroid$.pipe(takeUntil(this.onPageExit$)).subscribe(async () => {
      await Browser.open({
        url: 'https://play.google.com/store/apps/details?id=com.ionicframework.fyle595781',
        windowName: '_system',
      });
    });

    deviceIos$.pipe(takeUntil(this.onPageExit$)).subscribe(async () => {
      await Browser.open({ url: 'https://itunes.apple.com/in/app/fyle/id1137906166', windowName: '_system' });
    });
  }
}
