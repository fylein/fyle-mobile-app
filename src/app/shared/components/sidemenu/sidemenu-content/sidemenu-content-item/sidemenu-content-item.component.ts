import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// type SideMenuItem = {
//   key: string;
//   icon: string;
//   title: string;
//   isDisabled: boolean;
//   dropdownOptions: SideMenuItem[];
// };
@Component({
  selector: 'app-sidemenu-content-item',
  templateUrl: './sidemenu-content-item.component.html',
  styleUrls: ['./sidemenu-content-item.component.scss'],
})
export class SidemenuContentItemComponent implements OnInit {
  @Input() sidemenuItem;

  @Output() redirect = new EventEmitter<string>();

  isRoute = true;

  constructor() {}

  ngOnInit() {
    this.isRoute = !this.sidemenuItem.dropdownOptions?.length && !this.sidemenuItem.hasOwnProperty('openLiveChat');
  }

  goToRoute(sidemenuItem) {
    this.redirect.emit(sidemenuItem);
  }
}
