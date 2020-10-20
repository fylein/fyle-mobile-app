import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DelegatedAccMessageComponent } from './delegated-acc-message.component';

describe('DelegatedAccMessageComponent', () => {
  let component: DelegatedAccMessageComponent;
  let fixture: ComponentFixture<DelegatedAccMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelegatedAccMessageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DelegatedAccMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
