import { VirtualSelectOption } from 'src/app/shared/components/virtual-select/virtual-select-modal/virtual-select-option.interface';

export const virtualSelectOptionData: VirtualSelectOption = {
  label: 'Airlines',
  value: {
    code: null,
    created_at: '2023-07-20T09:58:39.922648+00:00',
    displayName: 'Airlines',
    enabled: true,
    fyle_category: 'Airlines',
    id: 264267,
    name: 'Airlines',
    org_id: 'orDsbzdz7I7k',
    sub_category: 'Airlines',
    updated_at: '2023-07-20T09:58:39.922648+00:00',
  },
  selected: false,
};

export const virtualSelectOptionData2: VirtualSelectOption = {
  label: 'Mail',
  value: {
    code: null,
    created_at: '2023-07-20T09:58:39.922648+00:00',
    displayName: 'Mail',
    enabled: true,
    fyle_category: 'Mail',
    id: 264265,
    name: 'Mail',
    org_id: 'orDsbzdz7I7k',
    sub_category: 'Mail',
    updated_at: '2023-07-20T09:58:39.922648+00:00',
  },
  selected: false,
};

export const virtualSelectOptionData3: VirtualSelectOption = {
  label: 'Train',
  value: {
    code: null,
    created_at: '2023-07-20T09:58:39.922648+00:00',
    displayName: 'Train',
    enabled: true,
    fyle_category: 'Train',
    id: 264255,
    name: 'Train',
    org_id: 'orDsbzdz7I7k',
    sub_category: 'Train',
    updated_at: '2023-07-20T09:58:39.922648+00:00',
  },
  selected: false,
};

export const virtualSelectOptionData4: VirtualSelectOption[] = [virtualSelectOptionData, virtualSelectOptionData2];

export const virtualSelectOptionData5: VirtualSelectOption[] = [virtualSelectOptionData2, virtualSelectOptionData3];

export const expectedVirtualSelectOptionData: VirtualSelectOption[] = [
  { label: 'None', value: null },
  virtualSelectOptionData2,
];

export const expectedSelectableOptionsData: VirtualSelectOption[] = [
  { ...virtualSelectOptionData2, isRecentlyUsed: true },
  { ...virtualSelectOptionData3, isRecentlyUsed: true },
  virtualSelectOptionData,
  virtualSelectOptionData2,
];

export const expectedFilteredOptionsData: VirtualSelectOption[] = [
  { label: 'None', value: null },
  virtualSelectOptionData,
  virtualSelectOptionData2,
  { label: 'Train', value: virtualSelectOptionData3, selected: true },
];
