import deepFreeze from 'deep-freeze-strict';

import { SidemenuItem } from '../models/sidemenu-item.model';

export const sidemenuData1 = deepFreeze([
  {
    title: 'Home',
    isVisible: true,
    icon: 'dashboard',
    route: ['/', 'enterprise', 'my_dashboard'],
  },
  {
    title: 'My expenses',
    isVisible: true,
    icon: 'list',
    route: ['/', 'enterprise', 'my_expenses'],
  },
  {
    title: 'Settings',
    isVisible: true,
    icon: 'gear',
    route: ['/', 'enterprise', 'my_profile'],
  },
]);

export const PrimaryOptionsRes1: Partial<SidemenuItem>[] = deepFreeze([
  {
    title: 'Home',
    isVisible: true,
    icon: 'house-outline',
    route: ['/', 'enterprise', 'my_dashboard'],
  },
  {
    title: 'My expenses',
    isVisible: true,
    icon: 'list',
    route: ['/', 'enterprise', 'my_expenses'],
  },
  {
    title: 'Personal cards',
    isVisible: true,
    route: ['/', 'enterprise', 'personal_cards'],
    icon: 'card',
    disabled: false,
  },
  {
    title: 'My expense reports',
    isVisible: true,
    icon: 'folder',
    route: ['/', 'enterprise', 'my_reports'],
    disabled: false,
  },
  {
    title: 'My advances',
    isVisible: true,
    icon: 'wallet',
    route: ['/', 'enterprise', 'my_advances'],
    disabled: false,
  },
]);

export const UpdatedOptionsRes: Partial<SidemenuItem> = deepFreeze({
  title: 'Personal cards',
  isVisible: true,
  route: ['/', 'enterprise', 'personal_cards'],
  icon: 'card',
  disabled: false,
});

export const PrimaryOptionsRes2: Partial<SidemenuItem>[] = deepFreeze([
  {
    title: 'Team',
    isVisible: true,
    icon: 'user-three',
    isDropdownOpen: false,
    disabled: false,
    dropdownOptions: [
      {
        title: 'Expense reports',
        isVisible: true,
        route: ['/', 'enterprise', 'team_reports'],
      },
      {
        title: 'Advances',
        isVisible: true,
        route: ['/', 'enterprise', 'team_advance'],
      },
    ],
  },
]);

export const getPrimarySidemenuOptionsRes1 = deepFreeze([
  {
    title: 'Home',
    isVisible: true,
    icon: 'house-outline',
    route: ['/', 'enterprise', 'my_dashboard'],
  },
  {
    title: 'My expenses',
    isVisible: true,
    icon: 'list',
    route: ['/', 'enterprise', 'my_expenses'],
  },
  {
    title: 'My expense reports',
    isVisible: true,
    icon: 'folder',
    route: ['/', 'enterprise', 'my_reports'],
    disabled: false,
  },
  {
    title: 'My advances',
    isVisible: true,
    icon: 'wallet',
    route: ['/', 'enterprise', 'my_advances'],
    disabled: false,
  },

  {
    title: 'Expense reports',
    isVisible: true,
    route: ['/', 'enterprise', 'team_reports'],
    icon: 'user-three',
    disabled: false,
  },
]);

export const getSecondarySidemenuOptionsRes1 = deepFreeze([
  {
    title: 'Delegated accounts',
    isVisible: true,
    icon: 'user-two',
    route: ['/', 'enterprise', 'delegated_accounts'],
    disabled: false,
  },
  {
    title: 'Settings',
    isVisible: true,
    icon: 'gear',
    route: ['/', 'enterprise', 'my_profile'],
  },
  {
    title: 'Live chat',
    isVisible: true,
    icon: 'chat',
    openLiveChat: true,
    disabled: false,
  },
  {
    title: 'Help',
    isVisible: true,
    icon: 'question-square-outline',
    route: ['/', 'enterprise', 'help'],
    disabled: false,
  },
]);

export const setSideMenuRes: Partial<SidemenuItem>[] = deepFreeze([
  {
    title: 'Home',
    isVisible: true,
    icon: 'house-outline',
    route: ['/', 'enterprise', 'my_dashboard'],
  },
  {
    title: 'My expenses',
    isVisible: true,
    icon: 'list',
    route: ['/', 'enterprise', 'my_expenses'],
  },
  {
    title: 'My expense reports',
    isVisible: true,
    icon: 'folder',
    route: ['/', 'enterprise', 'my_reports'],
    disabled: false,
  },
  {
    title: 'My advances',
    isVisible: true,
    icon: 'wallet',
    route: ['/', 'enterprise', 'my_advances'],
    disabled: false,
  },
  {
    title: 'Expense reports',
    isVisible: true,
    route: ['/', 'enterprise', 'team_reports'],
    icon: 'user-three',
    disabled: false,
  },
  {
    title: 'Delegated accounts',
    isVisible: true,
    icon: 'user-two',
    route: ['/', 'enterprise', 'delegated_accounts'],
    disabled: false,
  },
  {
    title: 'Settings',
    isVisible: true,
    icon: 'gear',
    route: ['/', 'enterprise', 'my_profile'],
  },
  {
    title: 'Live chat',
    isVisible: true,
    icon: 'chat',
    openLiveChat: true,
    disabled: false,
  },
  {
    title: 'Help',
    isVisible: true,
    icon: 'question-square-outline',
    route: ['/', 'enterprise', 'help'],
    disabled: false,
  },
]);
