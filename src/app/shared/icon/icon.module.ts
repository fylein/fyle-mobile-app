import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatIconModule
  ],
  exports: [
    MatIconModule,
    MatIconRegistry
  ],
  providers: [MatIconRegistry]
})
export class IconModule {
  path = '../../assets/svg';

  svgImageArray = ['add-advance.svg', 'add-expense.svg', 'add-mileage.svg', 'add-per-diem.svg', 'add-report.svg', 'add-trip.svg', 'auto_fyle.svg', 'chevron-right.svg', 'create-expense.svg', 'create-mileage.svg', 'create-per-diem.svg', 'curve.svg', 'expense.svg', 'fy-advances-new.svg', 'fy-bike.svg', 'fy-bot.svg', 'fy-car-mini.svg', 'fy-car.svg', 'fy-card.svg', 'fy-cards-new.svg', 'fy-cyclist.svg', 'fy-dashboard-new.svg', 'fy-delegate-switch.svg', 'fy-electric-car.svg', 'fy-expenses-new.svg', 'fy-help-new.svg', 'fy-profile-new.svg', 'fy-receipts-new.svg', 'fy-receipts.svg', 'fy-reports-new.svg', 'fy-reports.svg', 'fy-switch-new.svg', 'fy-switch.svg', 'fy-team-advances-new.svg', 'fy-team-reports-new.svg', 'fy-team-trips-new.svg', 'fy-trips-new.svg', 'fy-trips.svg', 'fy-wallet.svg', 'insta-fyle.svg', 'instafyle.svg', 'ionic-log-out-outline.svg', 'logo-icon-white.svg', 'logo-white.svg', 'mileage.svg', 'per_diem.svg', 'warning-inverted.svg', 'warning.svg'];

  constructor(
    private  domSanitizer: DomSanitizer,
    private  matIconRegistry: MatIconRegistry
  ) {

    this.svgImageArray.forEach(imageName => {
      this.matIconRegistry.addSvgIcon(imageName.replace('.svg', ''),  this.setPath(`${this.path}/${imageName}`));
    });
  }

  private  setPath(url: string): SafeResourceUrl  {
    return  this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
