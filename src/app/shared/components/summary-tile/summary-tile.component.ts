import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, input } from '@angular/core';
import { AdvanceApprover } from 'src/app/core/models/advance-approver.model';
import { AdvanceRequestActions } from 'src/app/core/models/advance-request-actions.model';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { NgClass, LowerCasePipe, TitleCasePipe, DatePipe } from '@angular/common';
import { FyApproverComponent } from '../fy-approver/fy-approver.component';
import { EllipsisPipe } from '../../pipes/ellipses.pipe';
import { SnakeCaseToSpaceCase } from '../../pipes/snake-case-to-space-case.pipe';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';
@Component({
    selector: 'app-summary-tile',
    templateUrl: './summary-tile.component.html',
    styleUrls: ['./summary-tile.component.scss'],
    imports: [
        NgClass,
        FyApproverComponent,
        LowerCasePipe,
        TitleCasePipe,
        DatePipe,
        TranslocoPipe,
        EllipsisPipe,
        SnakeCaseToSpaceCase,
        ExactCurrencyPipe,
    ],
})
export class FySummaryTileComponent implements OnInit, OnChanges {
  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() category: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() merchant: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() project: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currency: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() amount: number;

  readonly paymentModeIcon = input<string>(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() purpose: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() status: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() approvals: AdvanceApprover[];

  readonly orig_currency = input<string>(undefined);

  readonly actions = input<AdvanceRequestActions>(undefined);

  readonly id = input<string>(undefined);

  readonly ownerEmail = input<string>(undefined);

  readonly approverEmails = input<string[]>(undefined);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(changes: SimpleChanges): void {
    this.status =
      this.status === 'APPROVAL PENDING' ? this.translocoService.translate('summaryTile.pending') : this.status;
    this.status = this.status === 'INQUIRY' ? this.translocoService.translate('summaryTile.sentBack') : this.status;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnInit(): void {}
}
