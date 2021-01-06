import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyZeroStateComponent } from './fy-zero-state.component';

describe('FyZeroStateComponent', () => {
  let component: FyZeroStateComponent;
  let fixture: ComponentFixture<FyZeroStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyZeroStateComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyZeroStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
