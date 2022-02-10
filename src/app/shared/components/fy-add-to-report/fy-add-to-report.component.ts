import { Component, forwardRef, Injector, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
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
export class FyAddToReportComponent implements OnInit, OnDestroy {
  @Input() options: { label: string; value: UnflattenedReport }[] = [];

  @Input() disabled = false;

  @Input() label = '';

  @Input() mandatory = false;

  @Input() selectionElement: TemplateRef<any>;

  @Input() nullOption = true;

  @Input() cacheName = '';

  @Input() customInput = false;

  @Input() subheader = 'All';

  @Input() enableSearch = false;

  displayValue;

  private ngControl: NgControl;

  private innerValue;

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

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

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);
  }

  ngOnDestroy(): void {}

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));
        if (selectedOption) {
          this.displayValue = selectedOption && selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else {
          this.displayValue = '';
        }
      }

      this.onChangeCallback(v);
    }
  }

  async openModal() {
    const selectionModal = await this.modalController.create({
      component: FyAddToReportModalComponent,
      componentProps: {
        options: this.options,
        currentSelection: this.value,
        selectionElement: this.selectionElement,
        nullOption: this.nullOption,
        cacheName: this.cacheName,
        customInput: this.customInput,
        subheader: this.subheader,
        enableSearch: this.enableSearch,
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties(),
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data && !data.createDraftReport) {
      this.value = data.value;
      this.trackingService.addToReportFromExpense();
    }

    if (data && data.createDraftReport) {
      const draftReportPopover = await this.popoverController.create({
        component: FyInputPopoverComponent,
        componentProps: {
          title: 'New Draft Report',
          ctaText: 'Save',
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
            concatMap((newReport) =>
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
      if (this.options) {
        const selectedOption = this.options.find((option) => isEqual(option.value, this.innerValue));
        if (selectedOption) {
          this.displayValue = selectedOption.label;
        } else if (typeof this.innerValue === 'string') {
          this.displayValue = this.innerValue;
        } else {
          this.displayValue = '';
        }
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
