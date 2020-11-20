import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyMultiselectComponent } from './fy-multiselect.component';

describe('FyMultiselectComponent', () => {
  let component: FyMultiselectComponent;
  let fixture: ComponentFixture<FyMultiselectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyMultiselectComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyMultiselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
