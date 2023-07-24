import { CombinedOptions } from '../models/combined-options.model';
import {
  optionsData10,
  optionsData11,
  optionsData12,
  optionsData13,
  optionsData14,
  optionsData15,
  optionsData16,
  optionsData17,
  optionsData18,
  optionsData19,
  optionsData2,
  optionsData20,
  optionsData21,
  optionsData3,
  optionsData31,
  optionsData33,
  optionsData6,
  optionsData7,
  optionsData8,
  optionsData9,
} from './merge-expenses-options-data.data';

export const combinedOptionsData1 = {
  amountOptionsData: optionsData3,
  dateOfSpendOptionsData: optionsData6,
  paymentModeOptionsData: optionsData7,
  projectOptionsData: optionsData9,
  billableOptionsData: optionsData2,
  categoryOptionsData: optionsData10,
  vendorOptionsData: optionsData8,
  taxGroupOptionsData: optionsData11,
  taxAmountOptionsData: optionsData12,
  constCenterOptionsData: optionsData13,
  purposeOptionsData: optionsData14,
};

export const combinedOptionsData2: CombinedOptions<string | Date | boolean> = {
  userlist: optionsData3,
  test: optionsData6,
  category2: optionsData31,
};

export const combinedOptionsData3 = {
  location1OptionsData: optionsData15,
  location2OptionsData: optionsData33,
  onwardDateOptionsData: optionsData16,
  returnDateOptionsData: optionsData16,
  flightJourneyTravelClassOptionsData: optionsData17,
  flightReturnTravelClassOptionsData: optionsData17,
  trainTravelClassOptionsData: optionsData18,
  busTravelClassOptionsData: optionsData19,
  distanceOptionsData: optionsData20,
  distanceUnitOptionsData: optionsData21,
};
