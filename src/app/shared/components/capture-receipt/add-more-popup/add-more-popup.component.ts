import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-add-more-popup',
  templateUrl: './add-more-popup.component.html',
  styleUrls: ['./add-more-popup.component.scss'],
})
export class AddMorePopupComponent implements OnInit {
  actionButtons: { icon: string; title: string; mode: string }[];

  constructor(private matBottomSheet: MatBottomSheet) {}

  ngOnInit() {
    this.actionButtons = [
      {
        icon: 'camera',
        title: 'Capture Receipts',
        mode: 'camera',
      },
      {
        icon: 'image',
        title: 'Upload from Gallery',
        mode: 'gallery',
      },
    ];
  }

  ctaClickedEvent(mode) {
    this.matBottomSheet.dismiss({ mode });
  }
}
