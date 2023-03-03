type Filter = Partial<{
  amount: number;
  createdOn: Partial<{
    name?: string;
    customDateStart?: Date;
    customDateEnd?: Date;
  }>;
  updatedOn: Partial<{
    name?: string;
    customDateStart?: Date;
    customDateEnd?: Date;
  }>;
  transactionType: string;
}>;

export const filterData1: Filter = {
  createdOn: {
    name: 'custom',
    customDateStart: new Date('2023-02-20T00:00:00.000Z'),
    customDateEnd: new Date('2023-02-22T00:00:00.000Z'),
  },
  updatedOn: {
    name: 'custom',
    customDateStart: new Date('2023-02-22T00:00:00.000Z'),
    customDateEnd: new Date('2023-02-24T00:00:00.000Z'),
  },
  transactionType: 'Debit',
};
