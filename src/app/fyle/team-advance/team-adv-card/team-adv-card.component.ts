import { getCurrencySymbol, DatePipe } from '@angular/common';
import { Component, OnInit, Input, inject, output } from '@angular/core';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import dayjs from 'dayjs';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { EllipsisPipe } from '../../../shared/pipes/ellipses.pipe';
import { ExactCurrencyPipe } from '../../../shared/pipes/exact-currency.pipe';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-team-adv-card',
  templateUrl: './team-adv-card.component.html',
  styleUrls: ['./team-adv-card.component.scss'],
  imports: [MatRipple, MatIcon, DatePipe, EllipsisPipe, ExactCurrencyPipe, TranslocoPipe],
})
export class TeamAdvCardComponent implements OnInit {
  private advanceRequestService = inject(AdvanceRequestService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() advanceRequest: ExtendedAdvanceRequest;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() prevDate: Date;

  readonly gotoAdvance = output<ExtendedAdvanceRequest>();

  internalState: { name: string; state: string };

  currencySymbol = '';

  showDate = false;

  actionOpened = false;

  ngOnInit() {
    if (this.advanceRequest && this.prevDate) {
      this.showDate = dayjs(this.advanceRequest.areq_created_at).isSame(this.prevDate, 'day');
    }
    this.currencySymbol = getCurrencySymbol(this.advanceRequest.areq_currency, 'wide');
    this.internalState = this.advanceRequestService.getInternalStateAndDisplayName(this.advanceRequest);
  }

  onGoToAdvances() {
    this.gotoAdvance.emit(this.advanceRequest);
  }
}
