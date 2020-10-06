import { Component, OnInit, Input } from '@angular/core';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';

@Component({
  selector: 'app-team-trip-card',
  templateUrl: './team-trip-card.component.html',
  styleUrls: ['./team-trip-card.component.scss'],
})
export class TeamTripCardComponent implements OnInit {

  @Input() tripRequest: ExtendedTripRequest;
  internalState: { name: string, state: string };
  tripTypesMap = {
    ONE_WAY: 'One Way',
    ROUND: 'Round Trip',
    MULTI_CITY: 'Multi City'
  };

  constructor(
    private tripRequestService: TripRequestsService
  ) { }

  ngOnInit() {
    this.internalState = this.tripRequestService.getInternalStateAndDisplayName(this.tripRequest);
  }

}
