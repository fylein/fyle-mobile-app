import { SidemenuItem } from '../models/sidemenu-item.model';

export const sidemenuItemData1: SidemenuItem = {
  title: 'Dashboard',
  isVisible: true,
  icon: 'fy-dashboard-new',
  route: ['/', 'enterprise', 'my_dashboard'],
  disabled: false,
  isDropdownOpen: false,
  dropdownOptions: [],
  openLiveChat: false,
};

export const sidemenuItemData2: SidemenuItem = {
  title: 'Teams',
  isVisible: true,
  icon: 'teams',
  isDropdownOpen: false,
  disabled: false,
  dropdownOptions: [
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
  ],
  route: [],
  openLiveChat: false,
};

export const sidemenuItemData3: SidemenuItem = {
  title: 'Live Chat',
  isVisible: true,
  icon: 'fy-chat-2',
  openLiveChat: true,
  disabled: false,
  route: [],
  isDropdownOpen: false,
  dropdownOptions: [
    {
      title: 'Team Advances',
      isVisible: true,
      route: ['/', 'enterprise', 'team_advance'],
    },
  ],
};
