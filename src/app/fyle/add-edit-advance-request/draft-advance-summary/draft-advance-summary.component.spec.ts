import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DraftAdvanceSummaryComponent } from './draft-advance-summary.component';

describe('DraftAdvanceSummaryComponent', () => {
  let component: DraftAdvanceSummaryComponent;
  let fixture: ComponentFixture<DraftAdvanceSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraftAdvanceSummaryComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DraftAdvanceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
