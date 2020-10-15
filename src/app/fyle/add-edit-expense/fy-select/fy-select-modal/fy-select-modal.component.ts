import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-fy-select-modal',
  templateUrl: './fy-select-modal.component.html',
  styleUrls: ['./fy-select-modal.component.scss'],
})
export class FySelectModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;
  @Input() options: { label: string, value: any, selected?: boolean }[] = [];
  @Input() currentSelection: any;
  @Input() filteredOptions$: Observable<{ label: string, value: any ,selected?: boolean}[]>;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      map((searchText) => this.options
        .filter(option => option.label.toLowerCase().includes(searchText.toLowerCase()))
        .map(option => {
          option.selected = isEqual(option.value, this.currentSelection);
          return option;
        })
      )
    );
    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option) {
    this.modalController.dismiss(option);
  }

}
