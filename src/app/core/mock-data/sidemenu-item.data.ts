import { SidemenuItem } from '../models/sidemenu-item.model';

export const sidemenuItemData1: SidemenuItem = {
  title: 'Dashboard',
  isVisible: true,
  icon: 'dashboard',
  route: ['/', 'enterprise', 'my_dashboard'],
  disabled: false,
  isDropdownOpen: false,
  dropdownOptions: [],
  openLiveChat: false,
};

export const sidemenuItemData2: SidemenuItem = {
  title: 'Team',
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

export const sidemenuItemData3: Partial<SidemenuItem> = {
  title: 'Live Chat',
  isVisible: true,
  icon: 'chat',
  openLiveChat: true,
  disabled: false,
};

export const sidemenuItemData4: Partial<SidemenuItem> = {
  title: 'Switch Organization',
  isVisible: true,
  icon: 'swap',
  route: [
    '/',
    'auth',
    'switch_org',
    {
      choose: true,
      navigate_back: true,
    },
  ],
  disabled: false,
};
