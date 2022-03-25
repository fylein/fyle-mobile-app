import { createAction, props } from '@ngrx/store';

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

export const updateFilters = createAction('[My Expenses Component] Update Filters', props<{ filters: Filters }>());
export const clearAllFilters = createAction('[My Expenses Component] Clear All Filter');
export const removeFilter = createAction('[My Expenses Component] Remove Filter', props<{ filterName: string }>());
export const clearLoadedData = createAction('[My Expenses Component] Clear Loaded Data');
export const setLoadedData = createAction('[My Expenses Component] Load Data', props<{ data: any[] }>());
