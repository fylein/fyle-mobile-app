import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { FyMenuIconComponent } from '../fy-menu-icon/fy-menu-icon.component';
import { FyHeaderComponent } from './fy-header.component';
import { HeaderState } from './header-state.enum';

describe('FyHeaderComponent', () => {
  let component: FyHeaderComponent;
  let fixture: ComponentFixture<FyHeaderComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['menuButtonClicked']);
  const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FyHeaderComponent, FyMenuIconComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyHeader.fyle': 'Fyle',
      };
      return translations[key] || key;
    });
    fixture = TestBed.createComponent(FyHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSimpleSearchCancel(): should emit event when the method is called', () => {
    const simpleSearchCancelSpy = spyOn(component.simpleSearchCancel, 'emit');
    component.onSimpleSearchCancel();
    expect(simpleSearchCancelSpy).toHaveBeenCalledTimes(1);
  });

  it('onMultiselectBack(): should emit and event when the method is called', () => {
    const multiselectSpy = spyOn(component.multiselectBack, 'emit');
    component.onMultiselectBack();
    expect(multiselectSpy).toHaveBeenCalledTimes(1);
  });

  it('should show the correct title as given when HeaderState is Base', () => {
    component.title = 'Expenses';
    component.currentState = HeaderState.base;
    fixture.detectChanges();

    const header = getElementBySelector(fixture, '.fy-header--title');
    expect(getTextContent(header)).toEqual('Expenses');
  });

  it('should click the Cancel button when HeaderState is SimpleSearch', () => {
    const simpleSearchCancelSpy = spyOn(component.simpleSearchCancel, 'emit');
    component.currentState = HeaderState.simpleSearch;
    fixture.detectChanges();

    const cancelButton = getElementBySelector(fixture, '.fy-header--simple-search-cancel') as HTMLElement;
    click(cancelButton);
    expect(simpleSearchCancelSpy).toHaveBeenCalledTimes(1);
  });

  it('should click the Back button when HeaderState is MultiSelect', () => {
    const multiselectSpy = spyOn(component.multiselectBack, 'emit');
    component.currentState = HeaderState.multiselect;
    fixture.detectChanges();

    const backButton = getElementBySelector(fixture, 'ion-button') as HTMLElement;
    click(backButton);
    expect(multiselectSpy).toHaveBeenCalledTimes(1);
  });
});
