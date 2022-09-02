import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AutosubmissionInfoCardComponent } from './autosubmission-info-card.component';

describe('AutosubmissionInfoCardComponent', () => {
  let component: AutosubmissionInfoCardComponent;
  let fixture: ComponentFixture<AutosubmissionInfoCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AutosubmissionInfoCardComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(AutosubmissionInfoCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
