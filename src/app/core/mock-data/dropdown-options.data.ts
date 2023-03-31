import { SidemenuItem } from '../models/sidemenu-item.model';

export const dropdownOptionsRes: Partial<SidemenuItem>[] = [
  {
    title: 'Team Reports',
    isVisible: true,
    route: ['/', 'enterprise', 'team_reports'],
  },
  {
    title: 'Team Advances',
    isVisible: true,
    route: ['/', 'enterprise', 'team_advance'],
  },
];
