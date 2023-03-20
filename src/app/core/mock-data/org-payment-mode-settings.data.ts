import { AllowedPaymentModes } from '../models/allowed-payment-modes.enum';
import { PaymentmodeSettings } from '../models/org-settings.model';

export const cccOnlyPaymentModeSettingsParam: PaymentmodeSettings = {
  allowed: true,
  enabled: true,
  payment_modes_order: [AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT],
};

export const reimbursableOnlyPaymentModeSettingsParam: PaymentmodeSettings = {
  allowed: true,
  enabled: true,
  payment_modes_order: [AllowedPaymentModes.PERSONAL_ACCOUNT],
};

export const cccAndReimbursablePaymentModeSettingsParam: PaymentmodeSettings = {
  allowed: true,
  enabled: true,
  payment_modes_order: [
    AllowedPaymentModes.PERSONAL_ACCOUNT,
    AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
  ],
};

export const cccAndPaidByCompanyPaymentModeSettingsParam: PaymentmodeSettings = {
  allowed: true,
  enabled: true,
  payment_modes_order: [
    AllowedPaymentModes.PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT,
    AllowedPaymentModes.COMPANY_ACCOUNT,
  ],
};
