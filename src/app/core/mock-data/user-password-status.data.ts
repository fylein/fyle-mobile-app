import deepFreeze from 'deep-freeze-strict';

import { UserPasswordStatus } from '../models/user-password-status.model';

export const userPasswordStatus: UserPasswordStatus = deepFreeze({
  is_password_required: true,
  is_password_set: true,
});
