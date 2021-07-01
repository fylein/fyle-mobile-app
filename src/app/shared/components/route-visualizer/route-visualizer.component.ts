import { Component, Input, OnInit } from '@angular/core';
import { MileageLocation } from './mileage-locations';

@Component({
  selector: 'app-route-visualizer',
  templateUrl: './route-visualizer.component.html',
  styleUrls: ['./route-visualizer.component.scss'],
})
export class RouteVisualizerComponent implements OnInit {

  @Input() mileageLocations: MileageLocation[];
  @Input() currentLocation: {
    lat: number,
    long: number
  };
  
  constructor() { }

  ngOnInit() {}

}
