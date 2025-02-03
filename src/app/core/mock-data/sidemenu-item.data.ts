import deepFreeze from 'deep-freeze-strict';

import { SidemenuItem } from '../models/sidemenu-item.model';

export const sidemenuItemData1: SidemenuItem = deepFreeze({
  title: 'Home',
  isVisible: true,
  icon: 'dashboard',
  route: ['/', 'enterprise', 'my_dashboard'],
  disabled: false,
  isDropdownOpen: false,
  dropdownOptions: [],
  openLiveChat: false,
});

export const sidemenuItemData2: SidemenuItem = deepFreeze({
  title: 'Team',
  isVisible: true,
  icon: 'user-three',
  isDropdownOpen: false,
  disabled: false,
  dropdownOptions: [
    {
      title: 'Team expense reports',
      isVisible: true,
      route: ['/', 'enterprise', 'team_reports'],
    },
    {
      title: 'Team advances',
      isVisible: true,
      route: ['/', 'enterprise', 'team_advance'],
    },
  ],
  route: [],
  openLiveChat: false,
});

export const sidemenuItemData3: Partial<SidemenuItem> = deepFreeze({
  title: 'Live chat',
  isVisible: true,
  icon: 'chat',
  openLiveChat: true,
  disabled: false,
});

export const sidemenuItemData4: Partial<SidemenuItem> = deepFreeze({
  title: 'Switch organization',
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
});
