import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { from, fromEvent, Observable } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { isEqual, tap } from 'lodash';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';

@Component({
  selector: 'app-fy-select-modal',
  templateUrl: './fy-select-modal.component.html',
  styleUrls: ['./fy-select-modal.component.scss'],
})
export class FySelectModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;
  @Input() options: { label: string, value: any, selected?: boolean }[] = [];
  @Input() currentSelection: any;
  @Input() filteredOptions$: Observable<{ label: string, value: any, selected?: boolean }[]>;
  @Input() selectionElement: TemplateRef<ElementRef>;
  @Input() nullOption = true;
  @Input() cacheName;
  @Input() customInput: boolean = false;

  recentrecentlyUsedItems$: Observable<any[]>;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      map((searchText) => {
        const initial = [];

        if (this.nullOption) {
          initial.push({ label: 'None', value: null });
        }

        if (this.customInput) {
          initial.push({ label: searchText, value: searchText });
        }

        return initial.concat(this.options
          .filter(option => option.label.toLowerCase().includes(searchText.toLowerCase()))
          .map(option => {
            option.selected = isEqual(option.value, this.currentSelection);
            return option;
          }));
      }
      )
    );
    this.recentrecentlyUsedItems$ = from(this.recentLocalStorageItemsService.get(this.cacheName)).pipe(
      map((options: any) => {
        options.map(option => {
          option.selected = isEqual(option.value, this.currentSelection);
        });
        return options;
      })
    );
    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option) {
    if (this.cacheName) {
      this.recentLocalStorageItemsService.post(this.cacheName, option, 'label');
    }
    this.modalController.dismiss(option);
  }

}
