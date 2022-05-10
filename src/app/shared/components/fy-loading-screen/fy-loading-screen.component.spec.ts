import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyLoadingScreenComponent } from './fy-loading-screen.component';

xdescribe('FyLoadingScreenComponent', () => {
  let component: FyLoadingScreenComponent;
  let fixture: ComponentFixture<FyLoadingScreenComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyLoadingScreenComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyLoadingScreenComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
