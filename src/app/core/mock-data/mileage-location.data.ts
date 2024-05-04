import deepFreeze from 'deep-freeze-strict';

import { MileageLocation } from 'src/app/shared/components/route-visualizer/mileage-locations.interface';

export const mileageLocationData1: MileageLocation[] = deepFreeze([
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Moore Avenue',
    latitude: 22.4860708,
    longitude: 88.3506995,
  },
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Bhawanipur',
    latitude: 22.532432,
    longitude: 88.3445775,
  },
]);

export const mileageLocationData2: MileageLocation[] = deepFreeze([
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Moore Avenue',
    latitude: 0,
    longitude: 88.3506995,
  },
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Bhawanipur',
    latitude: 22.532432,
    longitude: 0,
  },
]);

export const mileageLocationData3: MileageLocation[] = deepFreeze([
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Moore Avenue',
    latitude: 22.4860708,
    longitude: 88.3506995,
  },
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Bhawanipur',
    latitude: 22.532432,
    longitude: 88.3445775,
  },
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Park Street area',
    latitude: 22.549094,
    longitude: 88.357311,
  },
]);

export const mileageLocationData4: MileageLocation[] = deepFreeze([
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Moore Avenue',
    latitude: 22.4860708,
    longitude: 88.3506995,
  },
]);

export const mileageLocationData5: MileageLocation[] = deepFreeze([
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    display: 'Kolkata',
    formatted_address: 'Moore Avenue',
    latitude: 22.4860708,
    longitude: 88.3506995,
  },
  null,
]);
