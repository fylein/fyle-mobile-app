import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EnterpriseDashboardFooterComponent } from './enterprise-dashboard-footer.component';

describe('EnterpriseDashboardFooterComponent', () => {
  let component: EnterpriseDashboardFooterComponent;
  let fixture: ComponentFixture<EnterpriseDashboardFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterpriseDashboardFooterComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EnterpriseDashboardFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
