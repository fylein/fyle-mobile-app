import {Component, forwardRef, Injector, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {noop} from 'rxjs';
import {ModalController} from '@ionic/angular';
import {RecentLocalStorageItemsService} from '../../../core/services/recent-local-storage-items.service';
import {isEqual} from 'lodash';
import {FyAddToReportModalComponent} from './fy-add-to-report-modal/fy-add-to-report-modal.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-fy-add-to-report',
  templateUrl: './fy-add-to-report.component.html',
  styleUrls: ['./fy-add-to-report.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyAddToReportComponent),
      multi: true
    }
  ]
})
export class FyAddToReportComponent implements OnInit, OnDestroy {
  private ngControl: NgControl;
  @Input() options: { label: string, value: any }[] = [];
  @Input() disabled = false;
  @Input() label = '';
  @Input() mandatory = false;
  @Input() selectionElement: TemplateRef<any>;
  @Input() nullOption = true;
  @Input() cacheName = '';
  @Input() customInput = false;
  @Input() subheader = 'All';
  @Input() enableSearch = false;

  private innerValue;
  displayValue;

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
    private injector: Injector
  ) { }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);
  }

  ngOnDestroy(): void {
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      if (this.options) {
        const selectedOption = this.options.find(option => isEqual(option.value, this.innerValue));
        if (selectedOption) {
          this.displayValue = selectedOption && selectedOption.label;
        } else if (typeof this.innerValue === 'string'){
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
        enableSearch: this.enableSearch
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties()
    });

    await selectionModal.present();

    const { data } = await selectionModal.onWillDismiss();

    if (data) {
      this.value = data.value;
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      if (this.options) {
        const selectedOption = this.options.find(option => isEqual(option.value, this.innerValue));
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
