import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { AdvanceApprover } from 'src/app/core/models/advance-approver.model';
import { AdvanceRequestActions } from 'src/app/core/models/advance-request-actions.model';
import { TranslocoService } from '@jsverse/transloco';
@Component({
  selector: 'app-summary-tile',
  templateUrl: './summary-tile.component.html',
  styleUrls: ['./summary-tile.component.scss'],
  standalone: false,
})
export class FySummaryTileComponent implements OnInit, OnChanges {
  private translocoService = inject(TranslocoService);

  @Input() category: string;

  @Input() merchant: string;

  @Input() project: string;

  @Input() currency: string;

  @Input() amount: number;

  @Input() paymentModeIcon: string;

  @Input() purpose: string;

  @Input() status: string;

  @Input() approvals: AdvanceApprover[];

  @Input() orig_currency: string;

  @Input() actions: AdvanceRequestActions;

  @Input() id: string;

  @Input() ownerEmail: string;

  @Input() approverEmails: string[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(changes: SimpleChanges): void {
    this.status =
      this.status === 'APPROVAL PENDING' ? this.translocoService.translate('summaryTile.pending') : this.status;
    this.status = this.status === 'INQUIRY' ? this.translocoService.translate('summaryTile.sentBack') : this.status;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnInit(): void {}
}
