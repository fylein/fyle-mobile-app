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
    MatIconModule
  ],
  providers: [MatIconRegistry]
})
export class IconModule {
  path = '../../assets/svg';

  svgImageArray = ['fy-individual.svg', 'fy-add-new-expense.svg', 'fy-dismiss.svg', 'fy-done.svg', 'fy-classify-ccc.svg', 'fy-chat.svg', 'add-advance.svg', 'fy-filter.svg', 'fy-card.svg', 'fy-team-reports-new.svg', 'add-expense.svg', 'fy-cards-new.svg', 'fy-team-trips-new.svg', 'add-mileage.svg', 'fy-dashboard-new.svg', 'fy-trips-new.svg', 'add-per-diem.svg', 'fy-email.svg', 'fy-iphone.svg', 'fy-delegate-switch.svg', 'fy-trips.svg', 'add-report.svg', 'fy-expenses-new.svg', 'fy-wallet.svg', 'add-trip.svg', 'fy-help-new.svg', 'insta-fyle.svg', 'auto_fyle.svg', 'fy-settings.svg', 'instafyle.svg', 'chevron-right.svg', 'fy-receipts-new.svg', 'logo-icon-white.svg', 'create-expense.svg', 'fy-receipts.svg', 'logo-white.svg', 'create-mileage.svg', 'fy-reports-new.svg', 'mileage.svg', 'create-per-diem.svg', 'fy-reports.svg', 'per_diem.svg', 'curve.svg', 'fy-switch-new.svg', 'warning-inverted.svg', 'expense.svg', 'fy-switch.svg' , 'warning.svg', 'fy-advances-new.svg', 'fy-team-advances-new.svg', 'fy-bot.svg', 'fy-bike.svg', 'fy-car-mini.svg', 'fy-car.svg', 'fy-cyclist.svg', 'fy-electric-car.svg', 'ionic-log-out-outline.svg', 'single.svg', 'bulk.svg', 'split-expense.svg', 'fy-sort-descending.svg', 'fy-receipt.svg', 'flight.svg', 'tax.svg', 'train.svg', 'utility.svg', 'mail.svg', 'entertainment.svg', 'food.svg', 'toll-charge.svg', 'internet.svg', 'office-supplies.svg', 'bus.svg', 'taxi.svg', 'gas.svg', 'snacks.svg', 'phone.svg', 'hotel.svg', 'training.svg', 'parking.svg', 'software.svg', 'professional-service.svg', 'search.svg', 'fy-attachment.svg', 'fy-sort-ascending.svg', 'settings.svg', 'fy-recently-used.svg', 'fy-spinner-circle.svg', 'fy-matched-yes.svg', 'fy-matched-no.svg', 'fy-receipt-attached.svg', 'fy-receipt-not-attached.svg', 'fy-notification.svg', 'fy-notification-solid.svg', 'fy-home.svg', 'fy-home-solid.svg', 'fy-plus.svg', 'fy-camera.svg', 'fy-calendar.svg', 'fy-expense.svg', 'fy-mileage.svg', 'fy-rectangle.svg', 'fy-close.svg'];

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
