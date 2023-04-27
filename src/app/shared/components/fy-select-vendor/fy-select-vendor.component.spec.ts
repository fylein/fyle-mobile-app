import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FySelectVendorComponent } from './fy-select-vendor.component';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

fdescribe('FySelectVendorComponent', () => {
  let component: FySelectVendorComponent;
  let fixture: ComponentFixture<FySelectVendorComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);

    TestBed.configureTestingModule({
      declarations: [FySelectVendorComponent],
      imports: [IonicModule.forRoot(), MatIconTestingModule, MatIconModule, FormsModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FySelectVendorComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('openModal', () => {});

  xit('onBlur', () => {});

  xit('writeValue', () => {});

  xit('registerOnTouched', () => {});
});
