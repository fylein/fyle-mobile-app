import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeepLinkRedirectionPage } from './deep-link-redirection.page';

xdescribe('DeepLinkRedirectionPage', () => {
  let component: DeepLinkRedirectionPage;
  let fixture: ComponentFixture<DeepLinkRedirectionPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeepLinkRedirectionPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DeepLinkRedirectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
