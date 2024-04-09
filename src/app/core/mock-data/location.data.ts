import { Position } from '@capacitor/geolocation';
import { Location } from '../models/location.model';
import { PredictedLocation } from '../models/predicted-location.model';
export const locationData1: Location = {
  city: 'Kolkata',
  state: 'West Bengal',
  country: 'India',
  formatted_address: 'Tollygunge, Kolkata, West Bengal, India',
  latitude: 22.4986357,
  longitude: 88.3453906,
  display: 'Tollygunge, Kolkata, West Bengal, India',
};

export const locationData2: Location = {
  city: 'Kolkata',
  state: 'West Bengal',
  country: 'India',
  formatted_address: 'Howrah Bridge, Kolkata, West Bengal 700001, India',
  latitude: 22.5851477,
  longitude: 88.34680530000001,
  display: 'Howrah Bridge, Kolkata, West Bengal, India',
};

export const locationData3: Location = {
  city: 'Kolkata',
  state: 'West Bengal',
  country: 'India',
  formatted_address: 'Park St, Mullick Bazar, Park Street area, Kolkata, West Bengal, India',
  latitude: 22.5474164,
  longitude: 88.3598025,
  display: 'Park Street, Mullick Bazar, Beniapukur, Kolkata, West Bengal, India',
};

export const locationData4: Location = {
  city: 'Thane',
  state: 'Maharashtra',
  country: 'India',
  formatted_address: 'Thane, Maharashtra, India',
  latitude: 19.2183307,
  longitude: 72.9780897,
  display: 'Thane, Maharashtra, India',
};

export const predictedLocation1: PredictedLocation[] = [
  {
    description: 'Bengaluru, Karnataka, India',
    matched_substrings: [
      {
        length: 3,
        offset: 0,
      },
    ],
    place_id: 'ChIJbU60yXAWrjsR4E9-UejD3_g',
    reference: 'ChIJbU60yXAWrjsR4E9-UejD3_g',
    structured_formatting: {
      main_text: 'Bengaluru',
      main_text_matched_substrings: [
        {
          length: 3,
          offset: 0,
        },
      ],
      secondary_text: 'Karnataka, India',
    },
    terms: [
      {
        offset: 0,
        value: 'Bengaluru',
      },
      {
        offset: 11,
        value: 'Karnataka',
      },
      {
        offset: 22,
        value: 'India',
      },
    ],
    types: ['locality', 'political', 'geocode'],
  },
  {
    description: 'Bena Beach, Vasai West, Vasai-Virar, Maharashtra, India',
    matched_substrings: [
      {
        length: 3,
        offset: 0,
      },
    ],
    place_id: 'ChIJHREKUcmt5zsRaQAE2xafP7o',
    reference: 'ChIJHREKUcmt5zsRaQAE2xafP7o',
    structured_formatting: {
      main_text: 'Bena Beach',
      main_text_matched_substrings: [
        {
          length: 3,
          offset: 0,
        },
      ],
      secondary_text: 'Vasai West, Vasai-Virar, Maharashtra, India',
    },
    terms: [
      {
        offset: 0,
        value: 'Bena Beach',
      },
      {
        offset: 12,
        value: 'Vasai West',
      },
      {
        offset: 24,
        value: 'Vasai-Virar',
      },
      {
        offset: 37,
        value: 'Maharashtra',
      },
      {
        offset: 50,
        value: 'India',
      },
    ],
    types: ['natural_feature', 'establishment'],
  },
  {
    description: 'Bendshil, Maharashtra, India',
    matched_substrings: [
      {
        length: 3,
        offset: 0,
      },
    ],
    place_id: 'ChIJO6m2Oqbt5zsRjgaO_meFdlM',
    reference: 'ChIJO6m2Oqbt5zsRjgaO_meFdlM',
    structured_formatting: {
      main_text: 'Bendshil',
      main_text_matched_substrings: [
        {
          length: 3,
          offset: 0,
        },
      ],
      secondary_text: 'Maharashtra, India',
    },
    terms: [
      {
        offset: 0,
        value: 'Bendshil',
      },
      {
        offset: 10,
        value: 'Maharashtra',
      },
      {
        offset: 23,
        value: 'India',
      },
    ],
    types: ['locality', 'political', 'geocode'],
  },
];

export const coordinatesData1: Position = {
  timestamp: Date.now(),
  coords: {
    latitude: 10.12,
    longitude: 89.67,
    accuracy: 13.147000312805176,
    altitudeAccuracy: 0,
    altitude: -26.39999,
    speed: 0.099,
    heading: 0,
  },
};

export const coordinatesData2: Position = {
  timestamp: Date.now(),
  coords: {
    latitude: 19.0748,
    longitude: 72.8856,
    accuracy: 13.147000312805176,
    altitudeAccuracy: 0,
    altitude: -26.39999,
    speed: 0.099,
    heading: 0,
  },
};
