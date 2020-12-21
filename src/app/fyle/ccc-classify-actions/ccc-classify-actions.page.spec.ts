import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CccClassifyActionsPage } from './ccc-classify-actions.page';

describe('CccClassifyActionsPage', () => {
  let component: CccClassifyActionsPage;
  let fixture: ComponentFixture<CccClassifyActionsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CccClassifyActionsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CccClassifyActionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
