import { Destination } from './destination.model';

export interface TrpTripCity {
  from_city: Destination;
  onward_date: Date;
  onward_dt: string;
  return_date?: Date;
  return_dt?: any;
  to_city: Destination;
}
