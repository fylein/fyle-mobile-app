import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-fy-userlist-modal',
  templateUrl: './fy-userlist-modal.component.html',
  styleUrls: ['./fy-userlist-modal.component.scss'],
})
export class FyUserlistModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;
  @Input() options: { label: string, value: any, selected?: boolean }[] = [];
  @Input() currentSelections: any[] = [];
  @Input() filteredOptions$: Observable<{ label: string, value: any, selected?: boolean }[]>;

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
          if (this.currentSelections) {
            option.selected = this.currentSelections.includes(option.value);
          }
          return option;
        })
      ),
    );
    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelected(selectedOption) {
    this.options = this.options.map(option => {
      if (isEqual(option.value, selectedOption.value)) {
        option.selected = selectedOption.selected;
      }
      return option;
    });

    this.currentSelections = this.options
                                  .filter(option => option.selected)
                                  .map(option => option.value);
  }

  useSelected() {
    this.modalController.dismiss({
      selected: this.options.filter(option => option.selected)
    });
  }
}
