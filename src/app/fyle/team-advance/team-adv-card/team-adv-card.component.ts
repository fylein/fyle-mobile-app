import { getCurrencySymbol } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-team-adv-card',
  templateUrl: './team-adv-card.component.html',
  styleUrls: ['./team-adv-card.component.scss'],
})
export class TeamAdvCardComponent implements OnInit {
  @Input() advanceRequest: ExtendedAdvanceRequest;

  @Input() prevDate: Date;

  @Output() gotoAdvance: EventEmitter<ExtendedAdvanceRequest> = new EventEmitter();

  internalState: { name: string; state: string };

  currencySymbol = '';

  showDate = false;

  actionOpened = false;

  constructor(private advanceRequestService: AdvanceRequestService) {}

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
