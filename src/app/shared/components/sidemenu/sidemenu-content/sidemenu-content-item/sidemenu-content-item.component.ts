import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SidemenuItem } from 'src/app/core/models/sidemenu-item.model';

@Component({
  selector: 'app-sidemenu-content-item',
  templateUrl: './sidemenu-content-item.component.html',
  styleUrls: ['./sidemenu-content-item.component.scss'],
})
export class SidemenuContentItemComponent implements OnInit {
  @Input() sidemenuItem: SidemenuItem;

  @Output() redirect = new EventEmitter<SidemenuItem>();

  isRoute = true;

  dropdownHeight = 0;

  constructor() {}

  ngOnInit() {
    this.isRoute = !this.sidemenuItem.dropdownOptions?.length && !this.sidemenuItem.hasOwnProperty('openLiveChat');
    this.dropdownHeight = this.sidemenuItem.dropdownOptions?.length * 50;
  }

  goToRoute(sidemenuItem: SidemenuItem) {
    this.redirect.emit(sidemenuItem);
  }
}
