import { getCurrencySymbol } from '@angular/common';
import { Component, Input, OnInit, inject, output } from '@angular/core';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import dayjs from 'dayjs';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-my-advances-card',
  templateUrl: './my-advances-card.component.html',
  styleUrls: ['./my-advances-card.component.scss'],
  standalone: false,
})
export class MyAdvancesCardComponent implements OnInit {
  private advanceRequestService = inject(AdvanceRequestService);

  private translocoService = inject(TranslocoService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() advanceRequest: any;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() prevDate: Date;

  readonly advanceClick = output<{
    advanceRequest: ExtendedAdvanceRequest;
    internalState: {
      name: string;
      state: string;
    };
  }>();

  internalState: { name: string; state: string };

  currencySymbol = '';

  showDate = false;

  ngOnInit(): void {
    if (this.advanceRequest && this.prevDate) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.showDate = dayjs(this.advanceRequest.created_at as Date).isSame(this.prevDate, 'day');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    this.currencySymbol = getCurrencySymbol(this.advanceRequest.currency, 'wide');

    this.internalState =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.advanceRequest.type === 'request'
        ? this.advanceRequestService.getInternalStateAndDisplayName(this.advanceRequest as ExtendedAdvanceRequest)
        : {
            state: 'paid',
            name: this.translocoService.translate('myAdvancesCard.paid'),
          };
  }

  onAdvanceClick(): void {
    this.advanceClick.emit({
      advanceRequest: this.advanceRequest as ExtendedAdvanceRequest,
      internalState: this.internalState,
    });
  }
}
