import {
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
  Input,
  ChangeDetectorRef,
  TemplateRef,
  inject,
  input,
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

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() options: Option[] = [];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currentSelection: Report;

  readonly selectionElement = input<TemplateRef<ElementRef>>(undefined);

  readonly showNullOption = input(true);

  readonly cacheName = input(undefined);

  readonly customInput = input(false);

  readonly subheader = input(undefined);

  readonly enableSearch = input(undefined);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() autoSubmissionReportName: string;

  readonly isNewReportsFlowEnabled = input(false);

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
