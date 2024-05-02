import { ExtendedProject } from './v2/extended-project.model';

export interface ProjectOption {
  label: string;
  value: ExtendedProject;
  selected?: boolean;
}
