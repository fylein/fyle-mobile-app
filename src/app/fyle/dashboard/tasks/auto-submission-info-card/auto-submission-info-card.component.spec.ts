import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AutoSubmissionInfoCardComponent } from './auto-submission-info-card.component';

describe('AutoSubmissionInfoCardComponent', () => {
  let component: AutoSubmissionInfoCardComponent;
  let fixture: ComponentFixture<AutoSubmissionInfoCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AutoSubmissionInfoCardComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(AutoSubmissionInfoCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
