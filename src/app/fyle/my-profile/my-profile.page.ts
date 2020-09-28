
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import {ExtendedOrgUser} from '/Users/tarun/git/fyle-mobile-app2/src/app/core/models/extended-org-user.model';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage implements OnInit {
  eou: ExtendedOrgUser;
  orgUserSettings: any;

  constructor(
    private authService: AuthService,
    private offlineService: OfflineService
  ) { }

  logOut() {
    console.log('will logout user later');
  }

  ngOnInit() {
    const eou$ = this.authService.getEou();
    const orgUserSettings$ =  this.offlineService.getOrgUserSettings();

    const primaryData = forkJoin({
      eou: eou$,
      orgUserSettings: orgUserSettings$,
    });

    primaryData.subscribe((res) => {
      this.eou = res.eou;
      this.orgUserSettings = res.orgUserSettings;

    });

  }

}
