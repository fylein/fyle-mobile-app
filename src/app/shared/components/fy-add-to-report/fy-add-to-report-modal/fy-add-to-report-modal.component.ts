import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  ChangeDetectorRef,
  TemplateRef,
  inject,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { isEqual } from 'lodash';
import { getCurrencySymbol } from '@angular/common';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { Option } from 'src/app/core/models/option.model';

@Component({
  selector: 'app-add-to-report-modal',
  templateUrl: './fy-add-to-report-modal.component.html',
  styleUrls: ['./fy-add-to-report-modal.component.scss'],
  standalone: false,
})
export class FyAddToReportModalComponent implements OnInit, AfterViewInit {
  private modalController = inject(ModalController);

  private cdr = inject(ChangeDetectorRef);

  private currencyService = inject(CurrencyService);

  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() options: Option[] = [];

  @Input() currentSelection: Report;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() showNullOption = true;

  @Input() cacheName;

  @Input() customInput = false;

  @Input() subheader;

  @Input() enableSearch;

  @Input() autoSubmissionReportName: string;

  @Input() isNewReportsFlowEnabled = false;

  reportCurrencySymbol: string;

  ngOnInit() {
    if (this.currentSelection) {
      this.options = this.options
        .map((option) =>
          isEqual(option.value, this.currentSelection) ? { ...option, selected: true } : { ...option, selected: false },
        )
        .sort((a, b) => (a.selected === b.selected ? 0 : a.selected ? -1 : 1));
    }

    this.currencyService.getHomeCurrency().subscribe((homeCurrency) => {
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

  dismissModal(event: { srcElement: { innerText: string } }) {
    this.modalController.dismiss({
      label: event.srcElement.innerText,
      value: null,
    });
  }
}
