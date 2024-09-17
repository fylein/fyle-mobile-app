import { PersonalCardDateFilter } from './personal-card-date-filter.model';

export interface PersonalCardFilter {
  amount: number;
  createdOn: PersonalCardDateFilter;
  updatedOn: PersonalCardDateFilter;
  transactionType: string;
}
