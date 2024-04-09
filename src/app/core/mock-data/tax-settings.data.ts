import { TaxSettings } from '../models/org-settings.model';

export const taxSettingsData: TaxSettings = {
  allowed: true,
  enabled: true,
  name: null,
  groups: [
    {
      label: 'GST',
      value: {
        name: 'GST',
        percentage: 0.23,
      },
    },
    {
      label: 'GST-free capital @0%',
      value: {
        name: 'GST-free capital @0%',
        percentage: 0,
      },
    },
    {
      label: 'GST-free non-capital @0%',
      value: {
        name: 'GST-free non-capital @0%',
        percentage: 0,
      },
    },
  ],
};
