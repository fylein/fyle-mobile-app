import { Component, ElementRef, forwardRef, Injector, Input, OnChanges, OnInit, TemplateRef } from '@angular/core';
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
import { PlatformReport } from 'src/app/core/models/platform/platform-report.model';
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
  @Input() options: { label: string; value: PlatformReport }[] = [];

  @Input() disabled = false;

  @Input() label = '';

  @Input() mandatory = false;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() showNullOption = true;

  @Input() cacheName = '';

  @Input() customInput = false;

  @Input() subheader = 'All';

  @Input() enableSearch = false;

  @Input() autoSubmissionReportName: string;

  @Input() isNewReportsFlowEnabled = false;

  displayValue: string;

  private ngControl: NgControl;

  private innerValue: PlatformReport;

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: PlatformReport) => void = noop;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private injector: Injector,
    private popoverController: PopoverController,
    private reportService: ReportService,
    private trackingService: TrackingService
  ) {}

  get valid(): boolean {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  get value(): PlatformReport {
    return this.innerValue;
  }

  set value(v: PlatformReport) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.setDisplayValue();
      this.onChangeCallback(v);
    }
  }

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl);
  }

  ngOnChanges(): void {
    //If Report auto submission is scheduled, 'None' option won't be shown in reports list
    if (this.autoSubmissionReportName) {
      this.showNullOption = false;
      this.label = 'Expense Report';
    }
  }

  async openModal(): Promise<void> {
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

    const { data } = await selectionModal.onWillDismiss<{ createDraftReport: boolean; value: PlatformReport }>();

    if (data && !data.createDraftReport) {
      this.value = data.value;
      this.trackingService.addToReportFromExpense();
    }
    console.log(data, data.createDraftReport);
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
      const { data } = await draftReportPopover.onWillDismiss<{ newValue: string }>();

      if (data && data.newValue) {
        const report = {
          purpose: data.newValue,
          source: 'MOBILE',
        };
        console.log(report);
        console.log('sjhdjshd jhs js hdjsh djsj dhsjhd js jdhajshd jadk askdhsa jdhkafirst');

        this.reportService
          .createDraft(report)
          .pipe(
            concatMap((newReport: ReportV1) =>
              this.reportService.getAllReportsByParams({ state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)' }).pipe(
                map((reports) => reports.map((report) => ({ label: report.purpose, value: report }))),
                tap((options) => {
                  console.log(newReport);
                  this.options = options;
                  this.value = this.options.find((option) => isEqual(newReport.id, option.value.id))?.value;
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

  onBlur(): void {
    this.onTouchedCallback();
  }

  writeValue(value: PlatformReport): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.setDisplayValue();
    }
  }

  setDisplayValue(): void {
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

  registerOnChange(fn: (_: PlatformReport) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }
}
