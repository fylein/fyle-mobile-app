import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FyAlertInfoComponent } from './fy-alert-info.component';

describe('FyAlertComponent', () => {
  let component: FyAlertInfoComponent;
  let fixture: ComponentFixture<FyAlertInfoComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
    TestBed.configureTestingModule({
      declarations: [FyAlertInfoComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FyAlertInfoComponent);
    component = fixture.componentInstance;
    component.message = 'This expense might be a duplicate of an existing expense.';
    component.type = 'warning';
    component.showActionButton = true;
    component.actionButtonContent = 'View';
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyAlertInfo.action': 'Action',
      };
      return translations[key] || key;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onActionClick(): should emit actionClick', () => {
    component.showActionButton = true;
    fixture.detectChanges();
    const actionClickSpy = spyOn(component.actionClick, 'emit');
    const buttonEl = getElementBySelector(fixture, '.alert-info-container--button') as HTMLElement;
    click(buttonEl);
    expect(actionClickSpy).toHaveBeenCalledTimes(1);
  });

  describe('template', () => {
    it('should display the correct message', () => {
      component.message = 'This expense might be a duplicate of an existing expense.';
      fixture.detectChanges();
      const messageEl = getElementBySelector(fixture, '.alert-info-container--message');
      expect(getTextContent(messageEl)).toBe('This expense might be a duplicate of an existing expense.');
    });

    it('should display the action button when showActionButton is true', () => {
      component.showActionButton = true;
      fixture.detectChanges();
      const buttonEl = getElementBySelector(fixture, '.alert-info-container--button');
      expect(getTextContent(buttonEl)).toContain('View');
    });

    it('should not display the action button when showActionButton is false', () => {
      component.showActionButton = false;
      fixture.detectChanges();
      const buttonEl = getElementBySelector(fixture, '.alert-info-container--button');
      expect(buttonEl).toBeNull();
    });
  });
});
