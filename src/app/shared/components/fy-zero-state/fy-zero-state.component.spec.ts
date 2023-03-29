import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FyZeroStateComponent } from './fy-zero-state.component';

describe('FyZeroStateComponent', () => {
  let component: FyZeroStateComponent;
  let fixture: ComponentFixture<FyZeroStateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FyZeroStateComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FyZeroStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click on the link', () => {
    component.link = 'http://a_link';
    fixture.detectChanges();
    const linkSpy = spyOn(component.linkClicked, 'emit');
    const linkButton = getElementBySelector(fixture, 'button') as HTMLElement;
    click(linkButton);
    expect(linkSpy).toHaveBeenCalledTimes(1);
  });

  it('onLinkClick(): should emit link event', () => {
    const linkSpy = spyOn(component.linkClicked, 'emit');
    component.onLinkClick(Event);
    expect(linkSpy).toHaveBeenCalledTimes(1);
  });

  it('should check if message icon is displayed', () => {
    component.message = '<ion-icon><ion-icon>';
    fixture.detectChanges();
    component.ngAfterViewInit();

    expect(getElementBySelector(fixture, '.zero-state--icon')).toBeTruthy();
  });

  it('should check if header is displayed', () => {
    component.header = 'Header';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.zero-state--header'))).toEqual('Header');
  });

  it('should check if message is displayed', () => {
    component.message = 'A message';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.zero-state--description'))).toEqual('A message');
  });

  it('should check if message is displayed', () => {
    component.submessage = 'A sub message';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.zero-state--description'))).toEqual('A sub message');
  });
});
