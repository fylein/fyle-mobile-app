import deepFreeze from 'deep-freeze-strict';

import { AllowedPaymentModes } from '../models/allowed-payment-modes.enum';
import { PaymentmodeSettings } from '../models/org-settings.model';

export const cccOnlyPaymentModeSettingsParam: PaymentmodeSettings = deepFreeze({
  allowed: true,
  enabled: true,
  payment_modes_order: [AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT],
});

export const reimbursableOnlyPaymentModeSettingsParam: PaymentmodeSettings = deepFreeze({
  allowed: true,
  enabled: true,
  payment_modes_order: [AllowedPaymentModes.PERSONAL_CASH_ACCOUNT],
  allowed_payment_modes: [
    AllowedPaymentModes.PERSONAL_CASH_ACCOUNT,
  ],
});

export const cccAndReimbursablePaymentModeSettingsParam: PaymentmodeSettings = deepFreeze({
  allowed: true,
  enabled: true,
  payment_modes_order: [
    AllowedPaymentModes.PERSONAL_CASH_ACCOUNT,
    AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
  ],
});

export const cccAndPaidByCompanyPaymentModeSettingsParam: PaymentmodeSettings = deepFreeze({
  allowed: true,
  enabled: true,
  payment_modes_order: [
    AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
    AllowedPaymentModes.COMPANY_ACCOUNT,
  ],
});
