export const selectedFilters1 = [
  { name: 'State', value: 'Approved' },
  {
    name: 'Date',
    value: 'Last 7 Days',
    associatedData: { startDate: new Date('2023-04-01'), endDate: new Date('2023-04-04') },
  },
  { name: 'Sort By', value: 'dateNewToOld' },
];

export const selectedFilters2 = [
  { name: 'State', value: 'Approved' },
  { name: 'Date', value: 'Last 7 Days', associatedData: undefined },
  { name: 'Sort By', value: 'dateNewToOld' },
];

export const selectedFilters3 = [
  {
    name: 'Date',
    value: 'Last Month',
    associatedData: { startDate: new Date('2023-01-04'), endDate: new Date('2023-01-10') },
  },
];
