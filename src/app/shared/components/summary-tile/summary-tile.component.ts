import { Component, Input, OnInit } from '@angular/core';
import { AdvanceApprover } from 'src/app/core/models/approver.model';

@Component({
  selector: 'app-summary-tile',
  templateUrl: './summary-tile.component.html',
  styleUrls: ['./summary-tile.component.scss'],
})
export class FySummaryTileComponent implements OnInit {
  @Input() categoryDisplayName: string;

  @Input() merchantName: string;

  @Input() projectName: string;

  @Input() currency: string;

  @Input() amount: number;

  @Input() paymentModeIcon: string;

  @Input() purpose: string;

  @Input() status: string;

  @Input() approvals: AdvanceApprover[];

  @Input() foreignCurrencySymbol: string;

  constructor() {}

  ngOnInit() {}
}
