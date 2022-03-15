import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'app-summary-tile',
  templateUrl: './summary-tile.component.html',
  styleUrls: ['./summary-tile.component.scss'],
})
export class FySummaryTileComponent implements OnInit {
  @Input() category: string;

  @Input() merchant: string;

  @Input() project: string;

  @Input() currency: string;

  @Input() amount: number;

  @Input() paymentModeIcon: string;

  @Input() purpose: string;

  @Input() status: string;

  @Input() approvals: [];

  @Input() orig_currency: string;

  constructor() {}

  ngOnInit() {}
}
