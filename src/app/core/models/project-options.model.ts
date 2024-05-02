import { ProjectV2 } from './v2/extended-project.model';

export interface ProjectOption {
  label: string;
  value: ProjectV2;
  selected?: boolean;
}
