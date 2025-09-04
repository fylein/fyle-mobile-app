import deepFreeze from 'deep-freeze-strict';

import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { apiExpenses3 } from './expense.data';
import { MileageUnitEnum } from 'src/app/core/models/platform/platform-mileage-rates.model';

export const mergeExpenses: Expense[] = deepFreeze([
  {
    ...apiExpenses3[0],
    spent_at: new Date('2023-03-13T11:30:00.000Z'),
    amount: 100,
    currency: 'INR',
    merchant: 'Merchant Test',
    project: { ...apiExpenses3[0].project, name: 'Staging Project' },
  },
  {
    ...apiExpenses3[1],
    spent_at: new Date('2023-03-08T11:30:00.000Z'),
    amount: 200,
    currency: 'INR',
    merchant: 'Merchant Test',
    project: { ...apiExpenses3[1].project, name: 'Staging Project' },
  },
]);

export const mergeExpensesWithoutDate: Expense[] = deepFreeze([
  { ...mergeExpenses[0], spent_at: null },
  { ...mergeExpenses[1], spent_at: null },
]);

export const mergeExpensesWithForeignCurrency: Expense[] = deepFreeze([
  { ...mergeExpenses[0], currency: 'INR', foreign_currency: 'USD', foreign_amount: 800 },
  { ...mergeExpenses[1], currency: 'INR', foreign_currency: 'USD', foreign_amount: 1600 },
]);

export const mergeExpensesWithZeroAmount: Expense[] = deepFreeze([
  { ...mergeExpenses[0], amount: 0, foreign_currency: 'USD', foreign_amount: 0 },
  { ...mergeExpenses[1], amount: 0, foreign_currency: 'USD', foreign_amount: 0 },
]);

export const mergeExpensesWithLocation: Expense[] = deepFreeze([
  {
    ...mergeExpenses[0],
    locations: [
      {
        city: 'Kalyan',
        country: 'India',
        display: 'Kalyan Station Road, Bhanunagar KalyanWest, Bhoiwada, Kalyan, Maharashtra, India',
        formatted_address: 'Kalyan Station Rd, Bhanunagar KalyanWest, Bhoiwada, Kalyan, Maharashtra 421301, India',
        latitude: 19.238037,
        longitude: 73.1296469,
        state: 'Maharashtra',
      },
      {
        city: 'Bhiwandi',
        country: 'India',
        display: 'Bhiwandi Railway Station Road, Brahmanand Nagar, Kamatghar, Bhiwandi, Maharashtra, India',
        formatted_address:
          'Bhiwandi Railway Station Rd, Brahmanand Nagar, Kamatghar, Bhiwandi, Maharashtra 421302, India',
        latitude: 19.2687341,
        longitude: 73.0484305,
        state: 'Maharashtra',
      },
    ],
  },
  { ...mergeExpenses[1] },
]);

export const mergeExpensesWithFromDate: Expense[] = deepFreeze([
  { ...mergeExpenses[0], started_at: new Date('2023-03-13T05:31:00.000Z') },
  { ...mergeExpenses[1], started_at: new Date('2023-03-10T05:31:00.000Z') },
]);

export const mergeExpensesWithToDate: Expense[] = deepFreeze([
  { ...mergeExpenses[0], ended_at: new Date('2023-03-13T05:31:00.000Z') },
  { ...mergeExpenses[1], ended_at: new Date('2023-03-10T05:31:00.000Z') },
]);

export const mergeExpensesWithFlightJourneyTravelClass: Expense[] = deepFreeze([
  { ...mergeExpenses[0], travel_classes: ['ECONOMY'] },
  { ...mergeExpenses[1], travel_classes: ['BUSINESS'] },
]);

export const mergeExpensesWithFlightReturnTravelClass: Expense[] = deepFreeze([
  { ...mergeExpenses[0], travel_classes: ['ECONOMY', 'ECONOMY'] },
  { ...mergeExpenses[1], travel_classes: ['BUSINESS', 'BUSINESS'] },
]);

export const mergeExpensesWithTrainTravelClass: Expense[] = deepFreeze([
  { ...mergeExpenses[0], travel_classes: ['SLEEPER'] },
  { ...mergeExpenses[1], travel_classes: ['SLEEPER'] },
]);

export const mergeExpensesWithBusTravelClass: Expense[] = deepFreeze([
  { ...mergeExpenses[0], travel_classes: ['AC'] },
  { ...mergeExpenses[1], travel_classes: ['AC'] },
]);

export const mergeExpensesWithDistance: Expense[] = deepFreeze([
  { ...mergeExpenses[0], distance: 25, distance_unit: MileageUnitEnum.KM },
  { ...mergeExpenses[1], distance: 30, distance_unit: MileageUnitEnum.MILES },
]);

export const expensesWithProjectId: Expense[] = deepFreeze([
  { ...apiExpenses3[0], project_id: 316992 },
  { ...apiExpenses3[1], project_id: 316992 },
]);
