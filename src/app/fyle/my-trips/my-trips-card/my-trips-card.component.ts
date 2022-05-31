import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';

@Component({
  selector: 'app-my-trips-card',
  templateUrl: './my-trips-card.component.html',
  styleUrls: ['./my-trips-card.component.scss'],
})
export class MyTripsCardComponent implements OnInit {
  @Input() tripRequest: ExtendedTripRequest;

  @Output() tripClick: EventEmitter<ExtendedTripRequest> = new EventEmitter();

  internalState: { name: string; state: string };

  tripTypesMap = {
    ONE_WAY: 'One Way',
    ROUND: 'Round Trip',
    MULTI_CITY: 'Multi City',
  };

  constructor(private tripRequestService: TripRequestsService) {}

  ngOnInit() {
    this.internalState = this.tripRequestService.getInternalStateAndDisplayName(this.tripRequest);
  }

  onTripClick() {
    this.tripClick.emit(this.tripRequest);
  }
}
