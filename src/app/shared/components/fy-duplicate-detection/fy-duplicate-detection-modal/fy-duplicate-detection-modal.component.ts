import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-fy-duplicate-detection-modal',
  templateUrl: './fy-duplicate-detection-modal.component.html',
  styleUrls: ['./fy-duplicate-detection-modal.component.scss']
})
export class FyDuplicateDetectionModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() options: { label: string; value: any; selected?: boolean }[] = [];

  @Input() currentSelection: any;

  @Input() filteredOptions$: Observable<{ label: string; value: any; selected?: boolean }[]>;

  constructor(private modalController: ModalController, private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      map((searchText) =>
        [{ label: 'None', value: null }].concat(
          this.options
            .filter((option) => option.label.toLowerCase().includes(searchText.toLowerCase()))
            .map((option) => {
              option.selected = isEqual(option.value, this.currentSelection);
              return option;
            })
        )
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
