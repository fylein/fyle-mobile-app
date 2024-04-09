import { CardStatus } from '../enums/card-status.enum';

export interface VirtualCard {
  id: string;
  state: CardStatus;
  last_five: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
  org_id: string;
  amex_account_id: string;
  valid_from_at: string;
  valid_till_at: string;
  user_id: string;
  creator_user_id: string;
  nick_name: string;
}
