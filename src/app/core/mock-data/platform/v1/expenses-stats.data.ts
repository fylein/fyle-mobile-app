import deepFreeze from 'deep-freeze-strict';

export const completeStats = deepFreeze({
  data: {
    count: 3,
    total_amount: 30,
  },
});

export const emptyStats = deepFreeze({
  data: {
    count: 0,
    total_amount: 0,
  },
});

export const incompleteStats = deepFreeze({
  data: {
    count: 339,
    total_amount: 76234.4729069240282984,
  },
});

export const completeStats1 = deepFreeze({
  data: {
    count: 4,
    total_amount: 3494,
  },
});
