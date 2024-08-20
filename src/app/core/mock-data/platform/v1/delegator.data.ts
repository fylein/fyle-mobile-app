import deepFreeze from 'deep-freeze-strict';
import { Delegator } from 'src/app/core/models/platform/delegator.model';

export const delegatorData: Delegator = deepFreeze({
  user_id: '0x1234',
  email: 'test@mail.com',
  full_name: 'Vercetti',
});
