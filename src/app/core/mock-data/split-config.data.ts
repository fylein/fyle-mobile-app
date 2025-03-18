import deepFreeze from 'deep-freeze-strict';

export const splitConfig = deepFreeze({
  category: {
    is_mandatory: false,
    is_visible: true,
    value: undefined,
  },
  costCenter: {
    is_mandatory: false,
    is_visible: true,
    value: undefined,
  },
  project: {
    is_mandatory: true,
    is_visible: true,
    value: undefined,
  },
});
