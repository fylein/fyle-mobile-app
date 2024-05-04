import deepFreeze from 'deep-freeze-strict';

import { CommuteDetailsResponse } from '../models/platform/commute-details-response.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const commuteDetailsResponseData: PlatformApiResponse<CommuteDetailsResponse> = deepFreeze({
  count: 1,
  offset: 0,
  data: [
    {
      user_id: 'uswr93Wqcfjv',
      full_name: 'John Doe',
      email: 'ajain@fyle.in',
      commute_details: {
        distance: 10,
        distance_unit: 'KM',
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
      },
    },
  ],
});

export const commuteDetailsResponseData2: PlatformApiResponse<CommuteDetailsResponse> = deepFreeze({
  count: 1,
  offset: 0,
  data: [],
});

export const commuteDetailsResponseData3: PlatformApiResponse<CommuteDetailsResponse> = deepFreeze({
  count: 1,
  offset: 0,
  data: [
    {
      user_id: 'uswr93Wqcfjv',
      full_name: 'John Doe',
      email: 'ajain@fyle.in',
      commute_details: {
        distance: null,
        distance_unit: null,
        home_location: null,
        work_location: null,
      },
    },
  ],
});
