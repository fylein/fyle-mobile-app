import { getCurrencySymbol } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import * as moment from 'moment';

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

  showDate = true;

  actionOpened = false;

  constructor(private advanceRequestService: AdvanceRequestService) {}

  ngOnInit() {
    this.showDate =
      (this.advanceRequest && moment(new Date(this.advanceRequest.areq_created_at)).format('ddd MMM DD YYYY')) !==
      (this.prevDate && moment(new Date(this.prevDate)).format('ddd MMM DD YYYY'));
    this.currencySymbol = getCurrencySymbol(this.advanceRequest.areq_currency, 'wide');
    this.internalState = this.advanceRequestService.getInternalStateAndDisplayName(this.advanceRequest);
  }

  onGoToAdvances() {
    this.gotoAdvance.emit(this.advanceRequest);
  }
}
