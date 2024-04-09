import { Destination } from './destination.model';
import { MergeExpensesOptionsData } from './merge-expenses-options-data.model';

export interface CategoryDependentFieldsOptions {
  location1OptionsData: MergeExpensesOptionsData<Destination>;
  location2OptionsData: MergeExpensesOptionsData<Destination>;
  onwardDateOptionsData: MergeExpensesOptionsData<Date>;
  returnDateOptionsData: MergeExpensesOptionsData<Date>;
  flightJourneyTravelClassOptionsData: MergeExpensesOptionsData<string>;
  flightReturnTravelClassOptionsData: MergeExpensesOptionsData<string>;
  trainTravelClassOptionsData: MergeExpensesOptionsData<string>;
  busTravelClassOptionsData: MergeExpensesOptionsData<string>;
  distanceOptionsData: MergeExpensesOptionsData<number>;
  distanceUnitOptionsData: MergeExpensesOptionsData<string>;
}
