import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { DependentFieldsComponent } from './dependent-fields.component';
import { DependentFieldComponent } from './dependent-field/dependent-field.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

fdescribe('DependentFieldsComponent', () => {
  let component: DependentFieldsComponent;
  let fixture: ComponentFixture<DependentFieldsComponent>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let formBuilder: jasmine.SpyObj<FormBuilder>;

  beforeEach(waitForAsync(() => {
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', ['getOptionsForDependentField']);
    TestBed.configureTestingModule({
      declarations: [DependentFieldsComponent, DependentFieldComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        {
          provide: DependentFieldsService,
          useValue: dependentFieldsServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DependentFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('addDependentFieldWithValue', () => {});

  xit('getDependentField', () => {});

  xit('addDependentField', () => {});

  xit('removeAllDependentFields', () => {});
});
