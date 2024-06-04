import { PaymentModeOptionTypes } from './payment-mode-option-types.enum';
import { ExtendedAccount } from './extended-account.model';
import { AdvanceWallet } from './platform/v1/advance-wallet.model';

export interface PaymentModeOptions {
  type: PaymentModeOptionTypes;
  accounts?: ExtendedAccount[];
  advance_wallets?: AdvanceWallet[];
}
