import { Component, Input, OnInit, output } from '@angular/core';
import { FilterPill } from './filter-pill.interface';
import { TitleCasePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { SnakeCaseToSpaceCase } from '../../pipes/snake-case-to-space-case.pipe';
import { IonCol, IonGrid, IonIcon, IonRow } from '@ionic/angular/standalone';


@Component({
  selector: 'app-fy-filter-pills',
  templateUrl: './fy-filter-pills.component.html',
  styleUrls: ['./fy-filter-pills.component.scss'],
  imports: [
    IonCol,
    IonGrid,
    IonIcon,
    IonRow,
    SnakeCaseToSpaceCase,
    TitleCasePipe,
    TranslocoPipe
  ],
})
export class FyFilterPillsComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() filterPills: FilterPill[];

  readonly clearAll = output();

  readonly filterClicked = output<string>();

  readonly filterClose = output<string>();

  readonly filterClicked2 = output<string>();

  readonly filterClose2 = output<string>();

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
