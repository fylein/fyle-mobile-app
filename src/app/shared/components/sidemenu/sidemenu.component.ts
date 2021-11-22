import { Component, OnInit } from '@angular/core';
import { Observable, noop } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeviceService } from 'src/app/core/services/device.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { Org } from 'src/app/core/models/org.model';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent implements OnInit {
  eou$: Observable<ExtendedOrgUser>;

  activeOrg$: Observable<Org>;

  appVersion: string;

  constructor(private offlineService: OfflineService, private deviceService: DeviceService) {}

  ngOnInit(): void {
    this.activeOrg$ = this.offlineService.getCurrentOrg();
    this.eou$ = this.offlineService.getCurrentUser();
    this.deviceService
      .getDeviceInfo()
      .pipe(map((deviceInfo) => (this.appVersion = deviceInfo.appVersion || '1.2.3')))
      .subscribe(noop);
  }
}
