import { SidemenuItem } from '../models/sidemenu-item.model';

export const sidemenuData1 = [
  {
    title: 'Dashboard',
    isVisible: true,
    icon: 'fy-dashboard-new',
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
    icon: 'fy-settings',
    route: ['/', 'enterprise', 'my_profile'],
  },
];

export const PrimaryOptionsRes: Partial<SidemenuItem>[] = [
  {
    title: 'Dashboard',
    isVisible: true,
    icon: 'fy-dashboard-new',
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
    icon: 'fy-corporate-card',
    disabled: false,
  },
  {
    title: 'Reports',
    isVisible: true,
    icon: 'fy-report',
    route: ['/', 'enterprise', 'my_reports'],
    disabled: false,
  },
  {
    title: 'Advances',
    isVisible: true,
    icon: 'advances',
    route: ['/', 'enterprise', 'my_advances'],
    disabled: false,
  },
  {
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
  },
];

export const UpdatedOptionsRes: Partial<SidemenuItem> = {
  title: 'Personal Cards',
  isVisible: true,
  route: ['/', 'enterprise', 'personal_cards'],
  icon: 'fy-corporate-card',
  disabled: false,
};

export const updateSidemenuOptionRes = [
  {
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
  },
];

export const getPrimarySidemenuOptionsRes1 = [
  {
    title: 'Dashboard',
    isVisible: true,
    icon: 'fy-dashboard-new',
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
    icon: 'fy-report',
    route: ['/', 'enterprise', 'my_reports'],
    disabled: false,
  },
  {
    title: 'Advances',
    isVisible: true,
    icon: 'advances',
    route: ['/', 'enterprise', 'my_advances'],
    disabled: false,
  },

  {
    title: 'Team Reports',
    isVisible: true,
    route: ['/', 'enterprise', 'team_reports'],
    icon: 'teams',
    disabled: false,
  },
];

export const getSecondarySidemenuOptionsRes1 = [
  {
    title: 'Delegated Accounts',
    isVisible: true,
    icon: 'delegate-switch',
    route: ['/', 'enterprise', 'delegated_accounts'],
    disabled: false,
  },
  {
    title: 'Settings',
    isVisible: true,
    icon: 'fy-settings',
    route: ['/', 'enterprise', 'my_profile'],
  },
  {
    title: 'Live Chat',
    isVisible: true,
    icon: 'fy-chat-2',
    openLiveChat: true,
    disabled: false,
  },
  {
    title: 'Help',
    isVisible: true,
    icon: 'help',
    route: ['/', 'enterprise', 'help'],
    disabled: false,
  },
];

export const setSideMenuRes: Partial<SidemenuItem>[] = [
  {
    title: 'Dashboard',
    isVisible: true,
    icon: 'fy-dashboard-new',
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
    icon: 'fy-report',
    route: ['/', 'enterprise', 'my_reports'],
    disabled: false,
  },
  {
    title: 'Advances',
    isVisible: true,
    icon: 'advances',
    route: ['/', 'enterprise', 'my_advances'],
    disabled: false,
  },
  {
    title: 'Team Reports',
    isVisible: true,
    route: ['/', 'enterprise', 'team_reports'],
    icon: 'teams',
    disabled: false,
  },
  {
    title: 'Delegated Accounts',
    isVisible: true,
    icon: 'delegate-switch',
    route: ['/', 'enterprise', 'delegated_accounts'],
    disabled: false,
  },
  {
    title: 'Settings',
    isVisible: true,
    icon: 'fy-settings',
    route: ['/', 'enterprise', 'my_profile'],
  },
  {
    title: 'Live Chat',
    isVisible: true,
    icon: 'fy-chat-2',
    openLiveChat: true,
    disabled: false,
  },
  {
    title: 'Help',
    isVisible: true,
    icon: 'help',
    route: ['/', 'enterprise', 'help'],
    disabled: false,
  },
];
