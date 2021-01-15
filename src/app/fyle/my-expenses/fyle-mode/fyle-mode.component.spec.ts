import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyleModeComponent } from './fyle-mode.component';

describe('FyleModeComponent', () => {
  let component: FyleModeComponent;
  let fixture: ComponentFixture<FyleModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyleModeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyleModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
