import { Destination } from './destination.model';

export interface CategoryDependentFieldsFormValues {
  location_1: Destination;
  location_2: Destination;
  from_dt: Date;
  to_dt: Date;
  flight_journey_travel_class: string;
  flight_return_travel_class: string;
  train_travel_class: string;
  bus_travel_class: string;
  distance: number;
  distance_unit: string;
}
