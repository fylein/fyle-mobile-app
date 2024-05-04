import deepFreeze from 'deep-freeze-strict';

export const expectedCriticalPolicyViolationPopoverParams = deepFreeze({
  title:
    '1 Critical Policy and \
  1 Draft Expenses blocking the way',
  message: `Critical policy blocking these 1 expenses worth \ 
    $10 from being submitted. \ 
    Also 1 other expenses are in draft states.`,
  reportType: 'newReport',
});

export const expectedCriticalPolicyViolationPopoverParams2 = deepFreeze({
  title: '1 Critical Policy Expenses blocking the way',
  message: `Critical policy blocking these 1 expenses worth \ 
  $10 from being submitted.`,
  reportType: 'newReport',
});

export const expectedCriticalPolicyViolationPopoverParams3 = deepFreeze({
  title: '1 Draft Expenses blocking the way',
  message: '1 expenses are in draft states.',
  reportType: 'newReport',
});
