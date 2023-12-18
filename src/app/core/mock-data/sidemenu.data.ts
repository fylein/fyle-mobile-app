import { SidemenuItem } from '../models/sidemenu-item.model';

export const sidemenuData1 = [
  {
    title: 'Dashboard',
    isVisible: true,
    icon: 'dashboard',
    route: ['/', 'enterprise', 'my_dashboard'],
  },
  {
    title: 'Expenses',
    isVisible: true,
    icon: 'expense',
    route: ['/', 'enterprise', 'my_expenses'],
  },
  {
    title: 'Settings',
    isVisible: true,
    icon: 'gear',
    route: ['/', 'enterprise', 'my_profile'],
  },
];

export const PrimaryOptionsRes1: Partial<SidemenuItem>[] = [
  {
    title: 'Dashboard',
    isVisible: true,
    icon: 'dashboard',
    route: ['/', 'enterprise', 'my_dashboard'],
  },
  {
    title: 'Expenses',
    isVisible: true,
    icon: 'expense',
    route: ['/', 'enterprise', 'my_expenses'],
  },
  {
    title: 'Personal Cards',
    isVisible: true,
    route: ['/', 'enterprise', 'personal_cards'],
    icon: 'card',
    disabled: false,
  },
  {
    title: 'Reports',
    isVisible: true,
    icon: 'folder',
    route: ['/', 'enterprise', 'my_reports'],
    disabled: false,
  },
  {
    title: 'Advances',
    isVisible: true,
    icon: 'wallet',
    route: ['/', 'enterprise', 'my_advances'],
    disabled: false,
  },
];

export const UpdatedOptionsRes: Partial<SidemenuItem> = {
  title: 'Personal Cards',
  isVisible: true,
  route: ['/', 'enterprise', 'personal_cards'],
  icon: 'card',
  disabled: false,
};

export const PrimaryOptionsRes2: Partial<SidemenuItem>[] = [
  {
    title: 'Team',
    isVisible: true,
    icon: 'user-three',
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
  },
];

export const getPrimarySidemenuOptionsRes1 = [
  {
    title: 'Dashboard',
    isVisible: true,
    icon: 'dashboard',
    route: ['/', 'enterprise', 'my_dashboard'],
  },
  {
    title: 'Expenses',
    isVisible: true,
    icon: 'expense',
    route: ['/', 'enterprise', 'my_expenses'],
  },
  {
    title: 'Reports',
    isVisible: true,
    icon: 'folder',
    route: ['/', 'enterprise', 'my_reports'],
    disabled: false,
  },
  {
    title: 'Advances',
    isVisible: true,
    icon: 'wallet',
    route: ['/', 'enterprise', 'my_advances'],
    disabled: false,
  },

  {
    title: 'Team Reports',
    isVisible: true,
    route: ['/', 'enterprise', 'team_reports'],
    icon: 'user-three',
    disabled: false,
  },
];

export const getSecondarySidemenuOptionsRes1 = [
  {
    title: 'Delegated Accounts',
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
    title: 'Live Chat',
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
];

export const setSideMenuRes: Partial<SidemenuItem>[] = [
  {
    title: 'Dashboard',
    isVisible: true,
    icon: 'dashboard',
    route: ['/', 'enterprise', 'my_dashboard'],
  },
  {
    title: 'Expenses',
    isVisible: true,
    icon: 'expense',
    route: ['/', 'enterprise', 'my_expenses'],
  },
  {
    title: 'Reports',
    isVisible: true,
    icon: 'folder',
    route: ['/', 'enterprise', 'my_reports'],
    disabled: false,
  },
  {
    title: 'Advances',
    isVisible: true,
    icon: 'wallet',
    route: ['/', 'enterprise', 'my_advances'],
    disabled: false,
  },
  {
    title: 'Team Reports',
    isVisible: true,
    route: ['/', 'enterprise', 'team_reports'],
    icon: 'user-three',
    disabled: false,
  },
  {
    title: 'Delegated Accounts',
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
    title: 'Live Chat',
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
];
