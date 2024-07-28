import { DelegationType } from './delegation-type.enum';

export interface Delegatee {
  id: number;
  type: DelegationType;
  user_id: string;
  email: string;
  full_name: string;
  start_at: Date;
  end_at: Date;
}
