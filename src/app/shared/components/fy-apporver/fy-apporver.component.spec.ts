import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyApporverComponent } from './fy-apporver.component';

describe('FyApporverComponent', () => {
  let component: FyApporverComponent;
  let fixture: ComponentFixture<FyApporverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyApporverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyApporverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
