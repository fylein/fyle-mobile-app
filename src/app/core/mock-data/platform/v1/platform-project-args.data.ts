import { PlatformProjectArgs } from 'src/app/core/models/platform/v1/platform-project-args.model';
import deepFreeze from 'deep-freeze-strict';
import { apiEouRes } from '../../extended-org-user.data';
import { recentlyUsedRes } from '../../recently-used.data';

export const platformProjectsArgs1: PlatformProjectArgs = deepFreeze({
  orgId: apiEouRes.ou.org_id,
  isEnabled: true,
  sortDirection: 'asc',
  sortOrder: 'name',
  orgCategoryIds: ['16558', '16559', '16560', '16561', '16562'],
  projectIds: recentlyUsedRes.project_ids,
  offset: 0,
  limit: 10,
});
