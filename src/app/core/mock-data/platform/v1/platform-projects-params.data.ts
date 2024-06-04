import { PlatformProjectParams } from 'src/app/core/models/platform/v1/platform-project-params.model';
import deepFreeze from 'deep-freeze-strict';

export const ProjectPlatformParams: PlatformProjectParams = deepFreeze({
  org_id: 'eq.orNVthTo2Zyo',
  order: 'name.asc',
  limit: 10,
  offset: 0,
  is_enabled: 'eq.true',
  or: '(category_ids.is.null, category_ids.ov.{122269,122270,122271,122272,122273})',
  id: 'in.(3943,305792,148971,247936)',
  name: 'ilike.%search%',
});
