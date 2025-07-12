import { PlatformAccount } from './platform-account.model';
import { AdvanceWallet } from './platform/v1/advance-wallet.model';

export interface AccountOption {
  label: string;
  value: PlatformAccount | AdvanceWallet;
}
