import { ExtendedProject } from './v2/extended-project.model';

export interface ProjectOptionType {
  value: string;
}

export interface ProjectOptionTypeWithLabel {
  label: string;
  value: ExtendedProject;
  selected?: boolean;
}
