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
  title: 'Live Chat',
  isVisible: true,
  icon: 'fy-chat-2',
  openLiveChat: true,
  disabled: false,
  route: [],
  isDropdownOpen: false,
  dropdownOptions: [],
};
