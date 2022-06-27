import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@NgModule({
  declarations: [],
  imports: [CommonModule, MatIconModule],
  exports: [MatIconModule],
  providers: [MatIconRegistry],
})
export class IconModule {
  path = '../../assets/svg';

  svgImageArray = [
    'add-advance.svg',
    'add-expense.svg',
    'add-mileage.svg',
    'add-per-diem.svg',
    'arrow-prev.svg',
    'arrow-next.svg',
    'add-report.svg',
    'auto_fyle.svg',
    'add-to-list.svg',
    'attachment.svg',
    'bike.svg',
    'bulk.svg',
    'bus.svg',
    'building.svg',
    'bulk-mode.svg',
    'car.svg',
    'chevron-right.svg',
    'create-expense.svg',
    'create-mileage.svg',
    'create-per-diem.svg',
    'curve.svg',
    'comments-zero-state',
    'circle.svg',
    'card-filled.svg',
    'close.svg',
    'capture.svg',
    'camera-pointer-top-left.svg',
    'camera-pointer-top-right.svg',
    'camera-pointer-bottom-left.svg',
    'camera-pointer-bottom-right.svg',
    'danger.svg',
    'duplicate.svg',
    'entertainment.svg',
    'expense.svg',
    'error.svg',
    'edit.svg',
    'error-filled.svg',
    'flight.svg',
    'food.svg',
    'flash-off.svg',
    'flash-on.svg',
    'fy-add-new-expense.svg',
    'fy-advances-new.svg',
    'fy-arrow-down.svg',
    'fy-attachment.svg',
    'fy-bike.svg',
    'fy-bot.svg',
    'fy-bus.svg',
    'fy-calendar.svg',
    'fy-camera.svg',
    'fy-car-mini.svg',
    'fy-car.svg',
    'fy-card.svg',
    'fy-cards-new.svg',
    'fy-chat.svg',
    'fy-classify-ccc.svg',
    'fy-close.svg',
    'fy-corporate-card.svg',
    'fy-cyclist.svg',
    'fy-dashboard-new.svg',
    'fy-delegate-switch.svg',
    'fy-delete.svg',
    'fy-dismiss.svg',
    'fy-done.svg',
    'fy-edit-gradient',
    'fy-electric-car.svg',
    'fy-email.svg',
    'fy-expense.svg',
    'fy-expenses-new.svg',
    'fy-filter.svg',
    'fy-flag-2.svg',
    'fy-help-new.svg',
    'fy-home-solid.svg',
    'fy-home.svg',
    'fy-individual.svg',
    'fy-iphone.svg',
    'fy-info.svg',
    'fy-info-gradient.svg',
    'fy-gallery.svg',
    'fy-matched-no.svg',
    'fy-matched-yes.svg',
    'fy-mileage.svg',
    'fy-matched.svg',
    'fy-notification-solid.svg',
    'fy-notification.svg',
    'fy-non-reimbursable.svg',
    'fy-plus.svg',
    'fy-receipt-attached.svg',
    'fy-receipt-not-attached.svg',
    'fy-receipt.svg',
    'fy-receipts-new.svg',
    'fy-receipts.svg',
    'fy-recently-used.svg',
    'fy-rectangle.svg',
    'fy-reports-new.svg',
    'fy-reports.svg',
    'fy-report.svg',
    'fy-reimbursable.svg',
    'fy-settings.svg',
    'fy-sort-ascending.svg',
    'fy-sort-descending.svg',
    'fy-spinner-circle.svg',
    'fy-switch-new.svg',
    'fy-switch.svg',
    'fy-team-advances-new.svg',
    'fy-team-reports-new.svg',
    'fy-search.svg',
    'fy-clear.svg',
    'flag.svg',
    'fy-unmatched.svg',
    'fy-location.svg',
    'gas.svg',
    'gallery.svg',
    'hotel.svg',
    'insta-fyle.svg',
    'instafyle.svg',
    'internet.svg',
    'ionic-log-out-outline.svg',
    'information.svg',
    'logo-icon-white.svg',
    'logo-white.svg',
    'list.svg',
    'mail.svg',
    'mileage.svg',
    'navigate-left.svg',
    'navigate-right.svg',
    'no-attachment.svg',
    'office-supplies.svg',
    'parking.svg',
    'per_diem.svg',
    'phone.svg',
    'professional-service.svg',
    'plus.svg',
    'profile.svg',
    'rectangle.svg',
    'return-home.svg',
    'search.svg',
    'settings.svg',
    'single.svg',
    'snacks.svg',
    'software.svg',
    'split-expense.svg',
    'send.svg',
    'send-back.svg',
    'success-tick.svg',
    'search-not-found.svg',
    'share.svg',
    'single-mode.svg',
    'tag.svg',
    'tax.svg',
    'taxi.svg',
    'toll-charge.svg',
    'train.svg',
    'training.svg',
    'tick-square-filled.svg',
    'utility.svg',
    'warning-inverted.svg',
    'warning.svg',
    'fy-merge.svg',
  ];

  constructor(private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry) {
    this.svgImageArray.forEach((imageName) => {
      this.matIconRegistry.addSvgIcon(imageName.replace('.svg', ''), this.setPath(`${this.path}/${imageName}`));
    });
  }

  private setPath(url: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
