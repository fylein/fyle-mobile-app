import { createReducer, on } from '@ngrx/store';
import { clearAllFilters, removeFilter, updateFilters } from './my-expenses.action';
import * as _ from 'lodash';

type Filters = Partial<{
  state: string[];
  date: string;
  customDateStart: Date;
  customDateEnd: Date;
  receiptsAttached: string;
  type: string[];
  sortParam: string;
  sortDir: string;
  searchString: string;
  pageNumber: number;
}>;

export const initialState: Filters = {
  pageNumber: 1,
};

export const myExpensesReducer = createReducer(
  initialState,
  on(clearAllFilters, (state) => initialState),
  on(updateFilters, (state, filterContainer) => filterContainer.filters),
  on(removeFilter, (state, { filterName }) => {
    const clonedState = _.cloneDeep(state);
    clonedState[filterName] = null;
    return clonedState;
  })
);
