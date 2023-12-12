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
    'arrow-prev.svg',
    'arrow-next.svg',
    'arrow-up',
    'attachment.svg',
    'building.svg',
    'bus.svg',
    'car.svg',
    'card.svg',
    'chat.svg',
    'chevron-right.svg',
    'crop.svg',
    'close.svg',
    'dashboard.svg',
    'duplicate.svg',
    'expense.svg',
    'expense-rule.svg',
    'error.svg',
    'edit.svg',
    'error-filled.svg',
    'filter.svg',
    'filter-applied.svg',
    'flash-off.svg',
    'flash-on.svg',
    'fy-arrow-down.svg',
    'fy-attachment.svg',
    'fy-calendar.svg',
    'fy-camera.svg',
    'fy-classify-ccc.svg',
    'fy-close.svg',
    'fy-delete.svg',
    'fy-dismiss.svg',
    'fy-done.svg',
    'fy-email.svg',
    'fy-expense.svg',
    'flag-fill.svg',
    'flag-outline.svg',
    'fy-individual.svg',
    'fy-info.svg',
    'fy-info-gradient.svg',
    'image.svg',
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
    'gear.svg',
    'fy-sort-ascending.svg',
    'fy-sort-descending.svg',
    'fy-spinner-circle.svg',
    'fy-switch-new.svg',
    'fy-switch.svg',
    'fy-team-advances-new.svg',
    'fy-team-reports-new.svg',
    'fy-search.svg',
    'fy-clear.svg',
    'fy-unmatched.svg',
    'fy-location.svg',
    'house-outline.svg',
    'house-fill.svg',
    'information.svg',
    'image.svg',
    'logo-icon-white.svg',
    'logo-white.svg',
    'logo-google.svg',
    'list.svg',
    'navigate-left.svg',
    'navigate-right.svg',
    'no-attachment.svg',
    'open-in-new-tab.svg',
    'phone.svg',
    'power.svg',
    'plus.svg',
    'plus-minus.svg',
    'user-one.svg',
    'radio-circle-outline.svg',
    'rectangle.svg',
    'house-filled-arrow-clockwise.svg',
    'search.svg',
    'send.svg',
    'send-back.svg',
    'success-tick.svg',
    'search-not-found.svg',
    'share.svg',
    'single-mode.svg',
    'tag.svg',
    'tax.svg',
    'tick-circle-outline-white.svg',
    'toll-charge.svg',
    'tick-square-filled.svg',
    'train.svg',
    'warning-inverted.svg',
    'warning.svg',
    'warning-fill.svg',
    'fy-merge.svg',
    'split-evenly.svg',
    'split.svg',
    'list-plus.svg',
    'question-square-outline.svg',
    'user-one.svg',
    'user-two.svg',
    'user-three.svg',
    'vertical-dots-menu.svg',
    'wallet.svg',
    'scooter.svg',
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
