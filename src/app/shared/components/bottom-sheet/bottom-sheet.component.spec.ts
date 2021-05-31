import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BottomSheetComponent } from './bottom-sheet.component';

describe('BottomSheetComponent', () => {
  let component: BottomSheetComponent;
  let fixture: ComponentFixture<BottomSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottomSheetComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
