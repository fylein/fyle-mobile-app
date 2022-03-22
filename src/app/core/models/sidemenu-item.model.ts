export interface SidemenuItem {
  icon: string;
  title: string;
  route: any[];
  disabled: boolean;
  isDropdownOpen: boolean;
  dropdownOptions: Partial<SidemenuItem>[];
  openLiveChat: boolean;
  isVisible: boolean;
}
