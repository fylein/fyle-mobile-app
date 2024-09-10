import { PersonalCardDateFilter } from './personal-card-date-filter.model';

export interface PersonalCardFilter {
  createdOn: PersonalCardDateFilter;
  updatedOn: PersonalCardDateFilter;
  transactionType: string;
}
