import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fy-summary-tile',
  templateUrl: './fy-summary-tile.component.html',
  styleUrls: ['./fy-summary-tile.component.scss'],
})
export class FySummaryTileComponent implements OnInit {
  @Input() categoryDisplayName: string;
  @Input() merchantName: string;
  @Input() projectName: string;
  @Input() currency: any;
  @Input() amount: any;
  @Input() paymentModeIcon: string;
  @Input() purpose: string;
  @Input() status: string;

  constructor() {}

  ngOnInit() {}
}
