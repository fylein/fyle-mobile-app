import { getCurrencySymbol } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-my-advances-card',
  templateUrl: './my-advances-card.component.html',
  styleUrls: ['./my-advances-card.component.scss'],
})
export class MyAdvancesCardComponent implements OnInit {
  @Input() advanceRequest: any;

  @Input() prevDate: Date;

  @Output() advanceClick: EventEmitter<{ advanceRequest: ExtendedAdvanceRequest; internalState: any }> =
    new EventEmitter();

  internalState: { name: string; state: string };

  currencySymbol = '';

  showDate = false;

  constructor(private advanceRequestService: AdvanceRequestService) {}

  ngOnInit() {
    if (this.advanceRequest && this.prevDate) {
      this.showDate = dayjs(this.advanceRequest.created_at).isSame(this.prevDate, 'day');
    }
    this.currencySymbol = getCurrencySymbol(this.advanceRequest.currency, 'wide');
    this.internalState =
      this.advanceRequest.type === 'request'
        ? this.advanceRequestService.getInternalStateAndDisplayName(this.advanceRequest)
        : {
            state: 'paid',
            name: 'Paid',
          };
  }

  onAdvanceClick() {
    this.advanceClick.emit({ advanceRequest: this.advanceRequest, internalState: this.internalState });
  }
}
