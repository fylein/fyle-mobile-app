import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';

@Component({
  selector: 'app-team-adv-card',
  templateUrl: './team-adv-card.component.html',
  styleUrls: ['./team-adv-card.component.scss']
})
export class TeamAdvCardComponent implements OnInit {
  @Input() advanceRequest: ExtendedAdvanceRequest;

  @Output() gotoAdvance: EventEmitter<ExtendedAdvanceRequest> = new EventEmitter();

  internalState: { name: string; state: string };

  actionOpened = false;

  constructor(private advanceRequestService: AdvanceRequestService) {}

  ngOnInit() {
    this.internalState = this.advanceRequestService.getInternalStateAndDisplayName(this.advanceRequest);
  }

  onGoToAdvances() {
    this.gotoAdvance.emit(this.advanceRequest);
  }
}
