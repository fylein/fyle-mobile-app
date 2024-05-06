import deepFreeze from 'deep-freeze-strict';

export const loadData1 = deepFreeze({
  pageNumber: 1,
  searchString: 'example',
  sortParam: 'approvalDate',
  sortDir: 'desc',
});

export const loadData2 = deepFreeze({
  pageNumber: 1,
  searchString: 'example',
  sortDir: 'desc',
});

export const loadData3 = deepFreeze({
  pageNumber: 1,
  searchString: 'example',
  sortDir: 'desc',
});
