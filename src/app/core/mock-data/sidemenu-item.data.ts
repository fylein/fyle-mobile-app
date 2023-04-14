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

export const sidemenuItemData3: Partial<SidemenuItem> = {
  title: 'Live Chat',
  isVisible: true,
  icon: 'fy-chat-2',
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

export const sidemenuItemData5: Partial<SidemenuItem>[] = [
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

// [
//   {
//       "title": "Dashboard",
//       "isVisible": true,
//       "icon": "fy-dashboard-new",
//       "route": [
//           "/",
//           "enterprise",
//           "my_dashboard"
//       ]
//   },
//   {
//       "title": "Expenses",
//       "isVisible": true,
//       "icon": "expense",
//       "route": [
//           "/",
//           "enterprise",
//           "my_expenses"
//       ]
//   },
//   {
//       "title": "Personal Cards",
//       "isVisible": true,
//       "route": [
//           "/",
//           "enterprise",
//           "personal_cards"
//       ],
//       "icon": "fy-corporate-card",
//       "disabled": false
//   },
//   {
//       "title": "Reports",
//       "isVisible": true,
//       "icon": "fy-report",
//       "route": [
//           "/",
//           "enterprise",
//           "my_reports"
//       ],
//       "disabled": false
//   },
//   {
//       "title": "Advances",
//       "isVisible": true,
//       "icon": "advances",
//       "route": [
//           "/",
//           "enterprise",
//           "my_advances"
//       ],
//       "disabled": false
//   },
//   {
//       "title": "Teams",
//       "isVisible": true,
//       "icon": "teams",
//       "isDropdownOpen": false,
//       "disabled": false,
//       "dropdownOptions": [
//           {
//               "title": "Team Reports",
//               "isVisible": true,
//               "route": [
//                   "/",
//                   "enterprise",
//                   "team_reports"
//               ]
//           },
//           {
//               "title": "Team Advances",
//               "isVisible": true,
//               "route": [
//                   "/",
//                   "enterprise",
//                   "team_advance"
//               ]
//           }
//       ]
//   }
// ]
