import {Component, forwardRef, Injector, Input, OnDestroy, OnInit, TemplateRef, ElementRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {noop} from 'rxjs';
import {ModalController} from '@ionic/angular';
import {FyProjectSelectModalComponent} from './fy-select-modal/fy-select-project-modal.component';
import { ExtendedProject } from 'src/app/core/models/v2/extended-project.model';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-fy-select-project',
  templateUrl: './fy-select-project.component.html',
  styleUrls: ['./fy-select-project.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FySelectProjectComponent),
      multi: true
    }
  ]
})
export class FySelectProjectComponent implements OnInit, ControlValueAccessor, OnDestroy {
  private ngControl: NgControl;

  @Input() mandatory = false;
  @Input() label = 'Project';
  @Input() cacheName;
  @Input() selectionElement: TemplateRef<ElementRef>;
  @Input() categoryIds: string[];
  @Input() defaultValue = false;
  @Input() recentlyUsed: { label: string, value: ExtendedProject, selected?: boolean }[];

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
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.project_name;
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v);
    }
  }

  async openModal() {
    const projectModal = await this.modalController.create({
      component: FyProjectSelectModalComponent,
      componentProps: {
        currentSelection: this.value,
        cacheName: this.cacheName,
        selectionElement: this.selectionElement,
        categoryIds: this.categoryIds,
        defaultValue: this.defaultValue,
        recentlyUsed: this.recentlyUsed
      },
      mode: 'ios',
      presentingElement: await this.modalController.getTop(),
      ...this.modalProperties.getModalDefaultProperties()
    });

    await projectModal.present();

    const { data } = await projectModal.onWillDismiss();

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
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.project_name;
      } else {
        this.displayValue = '';
      }
    }
  }

  // validate(fc: FormControl) {
  //   if (this.mandatory && fc.value === null) {
  //     return {
  //       required: true
  //     };
  //   }
  // }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
