import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SuggestedDuplicatesComponent } from './suggested-duplicates.component';

xdescribe('SuggestedDuplicatesComponent', () => {
  let component: SuggestedDuplicatesComponent;
  let fixture: ComponentFixture<SuggestedDuplicatesComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SuggestedDuplicatesComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(SuggestedDuplicatesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
