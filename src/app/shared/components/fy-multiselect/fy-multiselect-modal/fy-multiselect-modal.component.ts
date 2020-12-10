import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, Input } from '@angular/core';
import { Observable, fromEvent, forkJoin, from } from 'rxjs';
import { AgmGeocoder } from '@agm/core';
import { ModalController } from '@ionic/angular';
import { LocationService } from 'src/app/core/services/location.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { map, debounceTime, distinctUntilChanged, switchMap, tap, startWith } from 'rxjs/operators';
import { Geolocation } from '@capacitor/core';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-fy-multiselect-modal',
  templateUrl: './fy-multiselect-modal.component.html',
  styleUrls: ['./fy-multiselect-modal.component.scss'],
})
export class FyMultiselectModalComponent implements OnInit, AfterViewInit {
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
