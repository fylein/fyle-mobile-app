import { User } from '../user.model';

export interface PlatformEmployee {
  id: string;
  user_id: string;
  user: User;
}
