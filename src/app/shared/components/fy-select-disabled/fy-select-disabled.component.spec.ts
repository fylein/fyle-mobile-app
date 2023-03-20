import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FySelectDisabledComponent } from './fy-select-disabled.component';

xdescribe('FySelectDisabledComponent', () => {
  let component: FySelectDisabledComponent;
  let fixture: ComponentFixture<FySelectDisabledComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FySelectDisabledComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FySelectDisabledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
