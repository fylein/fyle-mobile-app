import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FySelectComponent } from './fy-select.component';

describe('FySelectComponent', () => {
  let component: FySelectComponent;
  let fixture: ComponentFixture<FySelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FySelectComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
