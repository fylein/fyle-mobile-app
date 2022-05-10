import { PlatformProjectData } from '../../models/platform/platform-project-data.model';

export interface PlatformProject {
  count: number;
  offset: number;
  data: PlatformProjectData[];
}
