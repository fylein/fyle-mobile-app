import { getCurrencySymbol, NgClass, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import dayjs from 'dayjs';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { EllipsisPipe } from '../../../shared/pipes/ellipses.pipe';
import { ExactCurrencyPipe } from '../../../shared/pipes/exact-currency.pipe';

@Component({
    selector: 'app-my-advances-card',
    templateUrl: './my-advances-card.component.html',
    styleUrls: ['./my-advances-card.component.scss'],
    imports: [
        NgClass,
        MatIcon,
        DatePipe,
        EllipsisPipe,
        ExactCurrencyPipe,
        TranslocoPipe,
    ],
})
export class MyAdvancesCardComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() advanceRequest: any;

  @Input() prevDate: Date;

  @Output() advanceClick = new EventEmitter<{
    advanceRequest: ExtendedAdvanceRequest;
    internalState: { name: string; state: string };
  }>();

  internalState: { name: string; state: string };

  currencySymbol = '';

  showDate = false;

  constructor(private advanceRequestService: AdvanceRequestService, private translocoService: TranslocoService) {}

  ngOnInit(): void {
    if (this.advanceRequest && this.prevDate) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.showDate = dayjs(this.advanceRequest.created_at as Date).isSame(this.prevDate, 'day');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    this.currencySymbol = getCurrencySymbol(this.advanceRequest.currency, 'wide');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
