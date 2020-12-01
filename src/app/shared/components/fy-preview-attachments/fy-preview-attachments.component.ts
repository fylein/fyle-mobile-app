import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fy-preview-attachments',
  templateUrl: './fy-preview-attachments.component.html',
  styleUrls: ['./fy-preview-attachments.component.scss'],
})
export class FyPreviewAttachmentsComponent implements OnInit {

  @Input() txnId: string;
  @Input() receiptId: string;
  @Input() fromMatchReceipts: boolean;

  constructor() { }

  ngOnInit() {}

}
