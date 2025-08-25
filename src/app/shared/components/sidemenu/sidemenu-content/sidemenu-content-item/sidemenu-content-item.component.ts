import { Component, OnInit, Input, Output, EventEmitter, input } from '@angular/core';
import { SidemenuItem } from 'src/app/core/models/sidemenu-item.model';

@Component({
  selector: 'app-sidemenu-content-item',
  templateUrl: './sidemenu-content-item.component.html',
  styleUrls: ['./sidemenu-content-item.component.scss'],
  standalone: false,
})
export class SidemenuContentItemComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() sidemenuItem: Partial<SidemenuItem>;

  readonly showDivider = input<boolean>(undefined);

  @Output() redirect = new EventEmitter<Partial<SidemenuItem>>();

  isRoute = true;

  dropdownHeight = 0;

  constructor() {}

  ngOnInit() {
    this.isRoute = !this.sidemenuItem.dropdownOptions?.length && !this.sidemenuItem.hasOwnProperty('openLiveChat');
    this.dropdownHeight = this.sidemenuItem.dropdownOptions?.length * 50;
  }

  goToRoute(sidemenuItem: Partial<SidemenuItem>) {
    this.redirect.emit(sidemenuItem);
  }
}
