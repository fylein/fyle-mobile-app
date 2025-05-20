import deepFreeze from 'deep-freeze-strict';

export const expectedFilterPill1 = deepFreeze([
  {
    label: 'State',
    type: 'state',
    value: 'approved, reported',
  },
]);

export const expectedFilterPill2 = deepFreeze([
  {
    label: 'Date',
    type: 'date',
    value: '2023-01-21 to 2023-01-31',
  },
]);

export const expectedFilterPill3 = deepFreeze([
  {
    label: 'Date',
    type: 'date',
    value: '>= 2023-01-21',
  },
]);

export const expectedFilterPill4 = deepFreeze([
  {
    label: 'Date',
    type: 'date',
    value: '<= 2023-01-31',
  },
]);

export const expectedFilterPill5 = deepFreeze([
  {
    label: 'Date',
    type: 'date',
    value: 'this Week',
  },
]);

export const expectedFilterPill6 = deepFreeze([
  {
    label: 'Date',
    type: 'date',
    value: 'this Month',
  },
]);

export const expectedFilterPill7 = deepFreeze([
  {
    label: 'Date',
    type: 'date',
    value: 'All',
  },
]);

export const expectedFilterPill8 = deepFreeze([
  {
    label: 'Date',
    type: 'date',
    value: 'Last Month',
  },
]);

export const expectedFilterPill9 = deepFreeze([
  {
    label: 'Sort by',
    type: 'sort',
    value: 'date - old to new',
  },
]);

export const expectedFilterPill10 = deepFreeze([
  {
    label: 'Sort by',
    type: 'sort',
    value: 'date - new to old',
  },
]);

export const expectedFilterPill11 = deepFreeze([
  {
    label: 'Sort by',
    type: 'sort',
    value: 'amount - high to low',
  },
]);

export const expectedFilterPill12 = deepFreeze([
  {
    label: 'Sort by',
    type: 'sort',
    value: 'amount - low to high',
  },
]);

export const expectedFilterPill13 = deepFreeze([
  {
    label: 'Sort by',
    type: 'sort',
    value: 'Name - a to z',
  },
]);

export const expectedFilterPill14 = deepFreeze([
  {
    label: 'Sort by',
    type: 'sort',
    value: 'Name - z to a',
  },
]);
