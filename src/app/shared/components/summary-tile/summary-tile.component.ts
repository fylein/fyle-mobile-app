import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Actions } from 'src/app/core/models/actions.model';
@Component({
  selector: 'app-summary-tile',
  templateUrl: './summary-tile.component.html',
  styleUrls: ['./summary-tile.component.scss'],
})
export class FySummaryTileComponent implements OnInit, OnChanges {
  @Input() currency: string;

  @Input() amount: number;

  @Input() purpose: string;

  @Input() status: string;

  @Input() approvals: [];

  @Input() orig_currency: string;

  @Input() actions: Actions;

  constructor() {}

  ngOnChanges() {
    this.status = this.status === 'APPROVAL PENDING' ? 'Pending' : this.status;
  }

  ngOnInit() {}
}
