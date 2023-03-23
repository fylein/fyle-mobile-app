import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, PopoverController } from '@ionic/angular';
import { of } from 'rxjs';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { PopupComponent } from './popup.component';

describe('ErrorComponent', () => {
  let component: PopupComponent;
  let fixture: ComponentFixture<PopupComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      declarations: [PopupComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the header input correctly', () => {
    component.header = 'Password changed successfully';
    fixture.detectChanges();
    const headerElement = getElementBySelector(fixture, '.popup-internal--header');
    expect(getTextContent(headerElement)).toContain('Password changed successfully');
  });

  it('should set the route input correctly', () => {
    component.route = ['/', 'auth', 'sign_up'];
    fixture.detectChanges();
    expect(component.route).toEqual(['/', 'auth', 'sign_up']);
  });

  it('closeClicked(): should dismiss the popover and navigate to the correct route', () => {
    // @ts-ignore
    component.popoverController.dismiss.and.returnValue(of(null));
    // @ts-ignore
    component.router.navigate.and.returnValue(Promise.resolve(true));
    component.closeClicked();
    // @ts-ignore
    expect(component.popoverController.dismiss).toHaveBeenCalledTimes(1);
    // @ts-ignore
    expect(component.router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'sign_in']);
  });
});
