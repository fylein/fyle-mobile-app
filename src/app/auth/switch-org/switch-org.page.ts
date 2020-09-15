import { Component, OnInit } from '@angular/core';
import { AppVersionService } from 'src/app/core/services/app-version.service';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { tap } from 'rxjs/operators';
import { noop } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { OfflineService } from 'src/app/core/services/offline.service';

@Component({
  selector: 'app-swicth-org',
  templateUrl: './switch-org.page.html',
  styleUrls: ['./switch-org.page.scss'],
})
export class SwitchOrgPage implements OnInit {

  constructor(
    private offlineService: OfflineService
  ) { }

  ngOnInit() {
    this.offlineService.load().pipe(tap(console.log)).subscribe(noop);
  }

}
