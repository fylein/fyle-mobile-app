import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-add-more-popup',
  templateUrl: './add-more-popup.component.html',
  styleUrls: ['./add-more-popup.component.scss'],
})
export class AddMorePopupComponent implements OnInit {
  actionButtons: { icon: string; title: string; mode: string }[];

  constructor(private matBottomSheet: MatBottomSheet, private translocoService: TranslocoService) {}

  ngOnInit(): void {
    this.actionButtons = [
      {
        icon: 'camera',
        title: this.translocoService.translate('addMorePopup.captureReceipts'),
        mode: 'camera',
      },
      {
        icon: 'image',
        title: this.translocoService.translate('addMorePopup.uploadFiles'),
        mode: 'gallery',
      },
    ];
  }

  ctaClickedEvent(mode: string): void {
    this.matBottomSheet.dismiss({ mode });
  }
}
