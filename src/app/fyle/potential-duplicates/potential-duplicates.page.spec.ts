import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PotentialDuplicatesPage } from './potential-duplicates.page';

describe('PotentialDuplicatesPage', () => {
  let component: PotentialDuplicatesPage;
  let fixture: ComponentFixture<PotentialDuplicatesPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PotentialDuplicatesPage],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(PotentialDuplicatesPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
