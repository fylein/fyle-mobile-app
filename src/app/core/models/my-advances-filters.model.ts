import { AdvancesStates } from './advances-states.model';
import { SortingDirection } from './sorting-direction.model';
import { SortingParam } from './sorting-param.model';

export interface MyAdvancesFilters {
  state: AdvancesStates[];
  sortParam: SortingParam;
  sortDir: SortingDirection;
}
