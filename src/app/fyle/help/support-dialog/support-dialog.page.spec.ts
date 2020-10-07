import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SupportDialogPage } from './support-dialog.page';

describe('SupportDialogPage', () => {
  let component: SupportDialogPage;
  let fixture: ComponentFixture<SupportDialogPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportDialogPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SupportDialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
