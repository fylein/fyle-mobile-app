import { PopupConfig } from 'src/app/shared/components/fy-popup/popup.model';

export const popupConfigData: PopupConfig = {
  header: 'Delete Report?',
  message: `
          <p class="highlight-info">
            On deleting this report, all the associated expenses will be moved to <strong>"My Expenses"</strong> list.
          </p>
          <p class="mb-0">
            Are you sure, you want to delete this report?
          </p>
        `,
  primaryCta: {
    text: 'Delete',
  },
};

export const popupConfigData2: PopupConfig = {
  header: 'Cannot Delete Report',
  message: 'Report cannot be deleted',
  primaryCta: {
    text: 'Close',
  },
};

export const popupConfigData3: PopupConfig = {
  header: 'Confirm',
  message: 'Are you sure you want to delete this Advance Request',
  primaryCta: {
    text: 'Delete Advance Request',
  },
};
