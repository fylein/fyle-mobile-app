import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FilterPill } from './filter-pill.interface';
import { IonicModule } from '@ionic/angular';
import { TitleCasePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { SnakeCaseToSpaceCase } from '../../pipes/snake-case-to-space-case.pipe';

@Component({
    selector: 'app-fy-filter-pills',
    templateUrl: './fy-filter-pills.component.html',
    styleUrls: ['./fy-filter-pills.component.scss'],
    imports: [
        IonicModule,
        TitleCasePipe,
        TranslocoPipe,
        SnakeCaseToSpaceCase,
    ],
})
export class FyFilterPillsComponent implements OnInit {
  @Input() filterPills: FilterPill[];

  @Output() clearAll = new EventEmitter();

  @Output() filterClicked = new EventEmitter();

  @Output() filterClose = new EventEmitter();

  @Output() filterClicked2 = new EventEmitter();

  @Output() filterClose2 = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  onClearAll() {
    this.clearAll.emit();
  }

  onFilterClick(filterPill: FilterPill) {
    this.filterClicked.emit(filterPill.type);
    this.filterClicked2.emit(filterPill.label);
  }

  onFilterClose(event: Event, filterPill: FilterPill) {
    event.stopPropagation();
    this.filterClose.emit(filterPill.type);
    this.filterClose2.emit(filterPill.label);
  }
}
