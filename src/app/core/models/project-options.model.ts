import { ProjectV2 } from './v2/project-v2.model';

export interface ProjectOption {
  label: string;
  value: ProjectV2;
  selected?: boolean;
}
