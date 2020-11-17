import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyMultiselectModalComponent } from './fy-multiselect-modal.component';

describe('FyMultiselectModalComponent', () => {
  let component: FyMultiselectModalComponent;
  let fixture: ComponentFixture<FyMultiselectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyMultiselectModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyMultiselectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
