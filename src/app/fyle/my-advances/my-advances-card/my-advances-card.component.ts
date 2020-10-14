import { Component, Input, OnInit } from '@angular/core';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';

@Component({
  selector: 'app-my-advances-card',
  templateUrl: './my-advances-card.component.html',
  styleUrls: ['./my-advances-card.component.scss'],
})
export class MyAdvancesCardComponent implements OnInit {

  @Input() advanceRequest: ExtendedAdvanceRequest;
  internalState: { name: string, state: string };

  constructor(
    private advanceRequestService: AdvanceRequestService
  ) { }

  ngOnInit() {
    this.internalState = this.advanceRequestService.getInternalStateAndDisplayName(this.advanceRequest);
  }

  goToAdvances() {
    const id = this.advanceRequest.areq_advance_id ? this.advanceRequest.areq_advance_id : this.advanceRequest.areq_id;
    let route = this.advanceRequest.areq_advance_id? 'enterprise.view_advance' : 'enterprise.view_advance_request';

    if ((['draft', 'pulledBack', 'inquiry']).indexOf(this.internalState.state) > -1) {
      route = 'enterprise.add_edit_advance_request';
    }

    //Todo: Redirect to page later.
  }

}
