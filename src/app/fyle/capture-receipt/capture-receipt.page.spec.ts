import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CaptureReceiptPage } from './capture-receipt.page';

describe('CaptureReceiptPage', () => {
  let component: CaptureReceiptPage;
  let fixture: ComponentFixture<CaptureReceiptPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaptureReceiptPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CaptureReceiptPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
