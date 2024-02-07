import { CardStatus } from '../enums/card-status.enum';

export interface VirtualCard {
  id: string;
  state: CardStatus;
  last_five: string;
  expiry_date: Date;
  created_at: Date;
  updated_at: Date;
  org_id: string;
  amex_account_id: string;
  valid_from_at: Date;
  valid_till_at: Date;
  user_id: string;
  creator_user_id: string;
  nick_name: string;
}
