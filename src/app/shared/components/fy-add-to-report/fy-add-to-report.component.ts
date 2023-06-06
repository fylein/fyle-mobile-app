import { Component, forwardRef, Injector, Input, OnChanges, OnInit, TemplateRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NgControl, ControlValueAccessor } from '@angular/forms';
import { noop } from 'rxjs';
import { map, concatMap, tap } from 'rxjs/operators';
import { ModalController, PopoverController } from '@ionic/angular';
import { isEqual } from 'lodash';
import { FyAddToReportModalComponent } from './fy-add-to-report-modal/fy-add-to-report-modal.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { ReportService } from 'src/app/core/services/report.service';
import { FyInputPopoverComponent } from '../fy-input-popover/fy-input-popover.component';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { UnflattenedReport } from 'src/app/core/models/report-unflattened.model';
import { ReportV1 } from 'src/app/core/models/report-v1.model';

@Component({
  selector: 'app-fy-add-to-report',
  templateUrl: './fy-add-to-report.component.html',
  styleUrls: ['./fy-add-to-report.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyAddToReportComponent),
      multi: true,
    },
  ],
})
export class FyAddToReportComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() options: { label: string; value: UnflattenedReport }[] = [];

  @Input() disabled = false;

  @Input() label = '';

  @Input() mandatory = false;

  @Input() selectionElement: TemplateRef<any>;

  @Input() showNullOption = true;

  @Input() cacheName = '';

  @Input() customInput = false;

  @Input() subheader = 'All';

  @Input() enableSearch = false;

  @Input() autoSubmissionReportName: string;

  @Input() isNewReportsFlowEnabled = false;

  displayValue: string;

  private ngControl: NgControl;

  private innerValue;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private injector: Injector,
    private popoverController: PopoverController,
    private reportService: ReportService,
    private trackingService: TrackingService
  ) {}

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.setDisplayValue();
      this.onChangeCallback(v);
    }
  }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);
  }

  ngOnChanges() {
    //If Report auto submission is scheduled, 'None' option won't be shown in reports list
    if (this.autoSubmissionReportName) {
      this.showNullOption = false;
      this.label = 'Expense Report';
    }
  }

  async openModal() {
    const selectionModal = await this.modalController.create({
      component: FyAddToReportModalComponent,
      componentProps: {
        options: this.options,
        currentSelection: this.value,
        selectionElement: this.selectionElement,
        showNullOption: this.showNullOption,
        cacheName: this.cacheName,
        customInput: this.customInput,
        subheader: this.subheader,
        enableSearch: this.enableSearch,
        autoSubmissionReportName: this.autoSubmissionReportName,
        isNewReportsFlowEnabled: this.isNewReportsFlowEnabled,
      },
      mode: 'ios',
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data && !data.createDraftReport) {
      this.value = data.value;
      this.trackingService.addToReportFromExpense();
    }

    if (data && data.createDraftReport) {
      const reportTitle = await this.reportService.getReportPurpose({ ids: null }).toPromise();

      const draftReportPopover = await this.popoverController.create({
        component: FyInputPopoverComponent,
        componentProps: {
          title: 'New Draft Report',
          ctaText: 'Save',
          inputValue: reportTitle,
          inputLabel: 'Report Name',
          isRequired: true,
        },
        cssClass: 'fy-dialog-popover',
      });

      await draftReportPopover.present();
      const { data } = await draftReportPopover.onWillDismiss();

      if (data && data.newValue) {
        const report = {
          purpose: data.newValue,
          source: 'MOBILE',
        };

        this.reportService
          .createDraft(report)
          .pipe(
            concatMap((newReport: ReportV1) =>
              this.reportService.getFilteredPendingReports({ state: 'edit' }).pipe(
                map((reports) => reports.map((report) => ({ label: report.rp.purpose, value: report }))),
                tap((options) => {
                  this.options = options;
                  this.value = this.options.find((option) => isEqual(newReport.id, option.value.rp.id))?.value;
                })
              )
            )
          )
          .subscribe(noop);
        this.trackingService.createDraftReportFromExpense();
      }
      this.trackingService.openCreateDraftReportPopover();
    }
    this.trackingService.openAddToReportModal();
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.setDisplayValue();
    }
  }

  setDisplayValue() {
    if (this.options) {
      const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));
      if (selectedOption) {
        this.displayValue = selectedOption.label;
      } else if (typeof this.innerValue === 'string') {
        this.displayValue = this.innerValue;
      } else {
        this.displayValue = this.autoSubmissionReportName || '';
      }
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
