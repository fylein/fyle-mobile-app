import { CommuteDetails } from '../models/platform/v1/commute-details.model';

export const commuteDetailsData: CommuteDetails = {
  distance: 10,
  distance_unit: 'KM',
  id: 12345,
  home_location: {
    formatted_address: 'Home',
    latitude: 12.9715987,
    longitude: 77.5945667,
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
  },
  work_location: {
    formatted_address: 'Work',
    latitude: 12.9715987,
    longitude: 77.5945667,
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
  },
};
