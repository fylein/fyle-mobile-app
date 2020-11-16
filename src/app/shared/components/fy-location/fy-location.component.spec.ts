import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyLocationComponent } from './fy-location.component';

describe('FyLocationComponent', () => {
  let component: FyLocationComponent;
  let fixture: ComponentFixture<FyLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyLocationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
