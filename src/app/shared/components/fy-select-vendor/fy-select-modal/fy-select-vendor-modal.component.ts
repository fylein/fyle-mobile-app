import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { VendorService } from 'src/app/core/services/vendor.service';
@Component({
  selector: 'app-fy-select-vendor-modal',
  templateUrl: './fy-select-vendor-modal.component.html',
  styleUrls: ['./fy-select-vendor-modal.component.scss'],
})
export class FySelectVendorModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;
  @Input() currentSelection: any;
  @Input() filteredOptions$: Observable<{ label: string, value: any, selected?: boolean }[]>;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private vendorService: VendorService
  ) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      distinctUntilChanged(),
      switchMap((searchText) => {
        return this.vendorService.get(searchText).pipe(
          map(vendors => vendors.map(vendor => ({
            label: vendor.display_name,
            value: vendor
          }))
          ),
          catchError(err => []), // api fails on empty searchText and if app is offline - failsafe here
          map(vendors => [{ label: searchText, value: { display_name: searchText } }].concat(vendors)),
          map(vendors => [{ label: 'None', value: null }].concat(vendors))
        );
      }),
      startWith([{ label: 'None', value: null }]),
      map((vendors: any[]) => {
        return vendors.map(vendor => {
          if (isEqual(vendor.value, this.currentSelection)) {
            vendor.selected = true;
          }
          return vendor;
        });
      })
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
