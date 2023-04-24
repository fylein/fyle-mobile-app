import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { DependentFieldModalComponent } from './dependent-field-modal.component';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { FormsModule } from '@angular/forms';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

fdescribe('DependentFieldModalComponent', () => {
  let component: DependentFieldModalComponent;
  let fixture: ComponentFixture<DependentFieldModalComponent>;
  const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
  const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', ['getOptionsForDependentField']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DependentFieldModalComponent],
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatFormFieldModule,
        FormsModule,
        MatIconTestingModule,
        MatIconModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: DependentFieldsService,
          useValue: dependentFieldsServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DependentFieldModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
