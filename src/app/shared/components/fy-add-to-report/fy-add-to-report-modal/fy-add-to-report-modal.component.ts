import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef, TemplateRef } from '@angular/core';
import {from, fromEvent, Observable, of} from 'rxjs';
import { map, startWith, distinctUntilChanged, tap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { isEqual } from 'lodash';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';

@Component({
  selector: 'app-add-to-report-modal',
  templateUrl: './fy-add-to-report-modal.component.html',
  styleUrls: ['./fy-add-to-report-modal.component.scss'],
})
export class FyAddToReportModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() options: { label: string, value: any, selected?: boolean }[] = [];
  @Input() currentSelection: any;
  filteredOptions: { label: string, value: any, selected?: boolean }[];
  @Input() selectionElement: TemplateRef<ElementRef>;
  @Input() nullOption = true;
  @Input() cacheName;
  @Input() customInput = false;
  @Input() subheader;
  @Input() enableSearch;
  value = '';
  states: any = {};

  selectedOption: { label: string, value: any, selected?: boolean };

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService
  ) { }

  ngOnInit() {
    this.states.DRAFT = 'draft';
    this.states.DRAFT_INQUIRY = 'incomplete';
    this.states.COMPLETE = 'fyled';
    this.states.APPROVER_PENDING = 'reported';
    this.states.SUBMITTED = 'reported';
    this.states.APPROVER_INQUIRY = 'inquiry';
    this.states.POLICY_INQUIRY = 'auto_flagged';
    this.states.REJECTED = 'rejected';
    this.states.APPROVED = 'approved';
    this.states.PAYMENT_PENDING = 'payment_pending';
    this.states.PAYMENT_PROCESSING = 'payment_processing';
    this.states.PAID = 'paid';
    this.states.CANCELLED = 'cancelled';
    this.states.APPROVAL_PENDING = 'reported';
    this.states.APPROVAL_DONE = 'approved';
    this.states.APPROVAL_DISABLED = 'disabled';
    this.states.APPROVAL_REJECTED = 'rejected';
  }

  ngAfterViewInit() {

    this.filteredOptions = this.options
      .filter(option => !isEqual(option.value, this.currentSelection));

    this.selectedOption = this.options
      .find(option => isEqual(option.value, this.currentSelection));

    console.log({ filteredOptions: this.filteredOptions});
    console.log({ selectedOption: this.selectedOption});

    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option) {
    this.modalController.dismiss(option);
  }

  onNoneSelect() {
    this.modalController.dismiss({
      label: 'None',
      value: null
    });
  }

}
