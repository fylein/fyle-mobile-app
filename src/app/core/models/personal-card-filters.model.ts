export interface PersonalCardFilter {
  amount?: number;
  createdOn?: {
    name?: string;
    customDateStart?: Date;
    customDateEnd?: Date;
  };
  updatedOn?: {
    name?: string;
    customDateStart?: Date;
    customDateEnd?: Date;
  };
  transactionType?: string;
}
