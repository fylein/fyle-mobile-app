import { TaskFilters } from './task-filters.model';

export interface TaskFilterClearAllProperties {
  Asset: string;
  appliedFilters: TaskFilters;
}
