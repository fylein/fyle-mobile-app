import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DraftAdvanceSummaryComponent } from './draft-advance-summary.component';

xdescribe('DraftAdvanceSummaryComponent', () => {
  let component: DraftAdvanceSummaryComponent;
  let fixture: ComponentFixture<DraftAdvanceSummaryComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DraftAdvanceSummaryComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(DraftAdvanceSummaryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
