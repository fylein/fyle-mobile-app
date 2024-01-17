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
    'arrow-down.svg',
    'arrow-left.svg',
    'arrow-left.svg',
    'arrow-right.svg',
    'arrow-right.svg',
    'arrow-tail-left.svg',
    'attachment-none.svg',
    'attachment.svg',
    'bell-fill.svg',
    'bell-outline.svg',
    'bin.svg',
    'bin.svg',
    'building.svg',
    'bus.svg',
    'calendar.svg',
    'camera.svg',
    'car.svg',
    'cash-slash.svg',
    'cash.svg',
    'check-circle-outline.svg',
    'check-square-fill.svg',
    'check-square-fill.svg',
    'check.svg',
    'chat.svg',
    'clear.svg',
    'clock.svg',
    'crop.svg',
    'cross.svg',
    'danger-fill.svg',
    'dashboard.svg',
    'duplicate.svg',
    'envelope.svg',
    'fyle-logo-dark.svg',
    'fyle-logo-light.svg',
    'file-lightning-indicator.svg',
    'file-pdf.svg',
    'filter-applied.svg',
    'filter.svg',
    'flash-off.svg',
    'flash-on.svg',
    'gear.svg',
    'hamburger-menu.svg',
    'house-fill.svg',
    'house-filled-arrow-clockwise.svg',
    'house-outline.svg',
    'image.svg',
    'image.svg',
    'info-circle-fill.svg',
    'info-circle-fill.svg',
    'info-gradient.svg',
    'list-plus.svg',
    'list.svg',
    'location.svg',
    'logo-google.svg',
    'loader.svg',
    'merge.svg',
    'mileage.svg',
    'notch.svg',
    'open-in-new-tab.svg',
    'phone.svg',
    'plus-minus.svg',
    'plus-square.svg',
    'power.svg',
    'question-square-outline.svg',
    'radio-circle-fill.svg',
    'radio-circle-outline.svg',
    'rectangle.svg',
    'scooter.svg',
    'search-not-found.svg',
    'search.svg',
    'send-back.svg',
    'send-fill.svg',
    'share.svg',
    'single-mode.svg',
    'split.svg',
    'square-outline.svg',
    'scooter.svg',
    'tag.svg',
    'tax.svg',
    'toll-charge.svg',
    'train.svg',
    'user-one.svg',
    'user-one.svg',
    'user-three.svg',
    'user-two.svg',
    'vertical-dots-menu.svg',
    'wallet.svg',
    'warning-fill.svg',
    'warning-outline.svg',
    'warning.svg',
    'arrow-up.svg',
    'check-circle-outline.svg',
    'question-square-outline.svg',
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
