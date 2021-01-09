import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef } from '@angular/core';
import { Observable, from, noop, fromEvent, of } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { concatMap, map, finalize, shareReplay, startWith, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-selection-modal',
  templateUrl: './selection-modal.component.html',
  styleUrls: ['./selection-modal.component.scss'],
})
export class SelectionModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  filteredList$: Observable<string[]>;

  @Input() header = '';
  @Input() selectionItems: string[] = [];
  @Input() selectedValue: string;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.filteredList$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => {
        return of(['None'].concat(this.selectionItems.filter(
          item => item.toLowerCase().includes(searchText)
        )));
      })
    );

    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(selection) {
    if (selection === 'None') {
      this.modalController.dismiss();
    }

    this.modalController.dismiss({
      selection
    });
  }

}
