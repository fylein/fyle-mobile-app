import { AdvancesStates } from '../models/advances-states.model';
import { MyAdvancesFilters } from '../models/my-advances-filters.model';
import { SortingDirection } from '../models/sorting-direction.model';
import { SortingParam } from '../models/sorting-param.model';

export const myAdvancesfiltersData: Partial<MyAdvancesFilters> = {
  state: [AdvancesStates.cancelled, AdvancesStates.paid],
};

export const myAdvancesFiltersData2: Partial<MyAdvancesFilters> = {
  ...myAdvancesfiltersData,
  sortDir: SortingDirection.ascending,
  sortParam: SortingParam.project,
};

export const draftSentBackFiltersData: Partial<MyAdvancesFilters> = {
  state: [AdvancesStates.sentBack, AdvancesStates.draft],
  sortDir: SortingDirection.ascending,
  sortParam: SortingParam.project,
};
