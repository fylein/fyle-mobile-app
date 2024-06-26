import deepFreeze from 'deep-freeze-strict';

export const getMarkDismissModalParamsData1 = deepFreeze({
  header: 'Dismiss this expense?',
  body: "This corporate card expense will be dismissed and you won't be able to edit it.\nDo you wish to proceed?",
  ctaText: 'Yes',
  ctaLoadingText: 'Dismissing',
});

export const getMarkDismissModalParamsData2 = deepFreeze({
  header: 'Mark Expense as Personal',
  body: "This corporate card expense will be marked as personal and you won't be able to edit it.\nDo you wish to proceed?",
  ctaText: 'Yes',
  ctaLoadingText: 'Marking',
});
