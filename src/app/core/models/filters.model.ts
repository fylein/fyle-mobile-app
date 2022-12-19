import { AdvancesStates } from './advances-states.model';
import { SortingParam } from './sorting-param.model';
import { SortingDirection } from './sorting-direction.model';

export interface Filters {
  state?: AdvancesStates[];
  sortParam?: SortingParam;
  sortDir?: SortingDirection;
}
