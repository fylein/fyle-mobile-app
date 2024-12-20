import { Component } from '@angular/core';
import { from, map, switchMap } from 'rxjs';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';

@Component({
  selector: 'app-spender-onboarding',
  templateUrl: './spender-onboarding.page.html',
  styleUrls: ['./spender-onboarding.page.scss'],
})
export class SpenderOnboardingPage {
  isLoading = true;

  userFullName: string;

  constructor(private loaderService: LoaderService, private orgUserService: OrgUserService) {}

  ionViewWillEnter(): void {
    this.isLoading = true;
    from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => this.orgUserService.getCurrent()),
        map((eou: ExtendedOrgUser) => {
          this.userFullName = eou.us.full_name;
          this.isLoading = false;
          this.loaderService.hideLoader();
        })
      )
      .subscribe();
  }
}
