import { paymentModeDataPersonal } from '../test-data/accounts.service.spec.data';
import { expectedProjectsResponse } from '../test-data/projects.spec.data';
import { costCentersData } from './cost-centers.data';
import { locationData1, locationData2 } from './location.data';
import { unfilteredMileageRatesData } from './mileage-rate.data';
import { orgCategoryData } from './org-category.data';

export const formValue1 = {
  mileage_rate_name: unfilteredMileageRatesData[0],
  route: {
    mileageLocations: [locationData1, locationData2],
    roundTrip: true,
    distance: 10,
  },
  paymentMode: paymentModeDataPersonal,
  sub_category: orgCategoryData,
  dateOfSpend: new Date('2022-08-12T00:00:00'),
  project: expectedProjectsResponse[0],
  purpose: 'travel',
  costCenter: costCentersData[0],
};

export const formValue2 = {
  mileage_rate_name: null,
  route: {
    mileageLocations: null,
    roundTrip: true,
    distance: 10,
  },
  paymentMode: paymentModeDataPersonal,
  sub_category: null,
  dateOfSpend: new Date('2022-08-12T00:00:00'),
  project: expectedProjectsResponse[0],
  purpose: 'travel',
  costCenter: costCentersData[0],
};
