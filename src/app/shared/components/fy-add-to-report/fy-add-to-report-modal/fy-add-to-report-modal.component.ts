import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { isEqual } from 'lodash';
import { OfflineService } from 'src/app/core/services/offline.service';
import { getCurrencySymbol } from '@angular/common';
import { UnflattenedReport } from 'src/app/core/models/report-unflattened.model';

type Option = {
  label: string;
  value: UnflattenedReport;
  selected?: boolean;
};

@Component({
  selector: 'app-add-to-report-modal',
  templateUrl: './fy-add-to-report-modal.component.html',
  styleUrls: ['./fy-add-to-report-modal.component.scss'],
})
export class FyAddToReportModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() options: Option[] = [];

  @Input() currentSelection: UnflattenedReport;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() nullOption = true;

  @Input() cacheName;

  @Input() customInput = false;

  @Input() subheader;

  @Input() enableSearch;

  reportCurrencySymbol: string;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private offlineService: OfflineService
  ) {}

  ngOnInit() {
    if (this.currentSelection) {
      this.options = this.options
        .map((option) =>
          isEqual(option.value, this.currentSelection) ? { ...option, selected: true } : { ...option, selected: false }
        )
        .sort((a, b) => (a.selected === b.selected ? 0 : a.selected ? -1 : 1));
    }

    this.offlineService.getHomeCurrency().subscribe((homeCurrency) => {
      this.reportCurrencySymbol = getCurrencySymbol(homeCurrency, 'wide');
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option: Option) {
    this.modalController.dismiss(option);
  }

  createDraftReport() {
    this.modalController.dismiss({ createDraftReport: true });
  }

  onNoneSelect() {
    this.modalController.dismiss({
      label: 'None',
      value: null,
    });
  }
}
