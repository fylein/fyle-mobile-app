import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';
import { SnakeCaseToSpaceCase } from '../../pipes/snake-case-to-space-case.pipe';

import { FyFilterPillsComponent } from './fy-filter-pills.component';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('FyFilterPillsComponent', () => {
  let component: FyFilterPillsComponent;
  let fixture: ComponentFixture<FyFilterPillsComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TranslocoModule, FyFilterPillsComponent, SnakeCaseToSpaceCase],
      providers: [
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FyFilterPillsComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyFilterPills.clearAll': 'Clear all',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    component.filterPills = [
      { label: 'Label 1', type: 'Type 1', value: 'Value 1' },
      { label: 'Label 2', type: 'Type 2', value: 'Value 2' },
      { label: 'Label 3', type: 'Type 3', value: 'Value 3' },
    ];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onClearAll(): should emit clearAll event when "Clear all" pill is clicked', () => {
    spyOn(component.clearAll, 'emit');
    const clearAllPill = getElementBySelector(fixture, '.filter-pills--pill__clear-all') as HTMLElement;
    click(clearAllPill);
    expect(component.clearAll.emit).toHaveBeenCalledTimes(1);
  });

  it('onFilterClick(): should emit filterClicked and filterClicked2 events when filter pill is clicked', () => {
    spyOn(component.filterClicked, 'emit');
    spyOn(component.filterClicked2, 'emit');
    const filterPill = component.filterPills[0];
    const filterPillElement = getElementBySelector(fixture, '.filter-pills--pill') as HTMLElement;
    click(filterPillElement);
    expect(component.filterClicked.emit).toHaveBeenCalledOnceWith(filterPill.type);
    expect(component.filterClicked2.emit).toHaveBeenCalledOnceWith(filterPill.label);
  });

  it('onFilterClose(): should emit filterClose and filterClose2 events when close icon of filter pill is clicked', () => {
    spyOn(component.filterClose, 'emit');
    spyOn(component.filterClose2, 'emit');
    const filterPill = component.filterPills[0];
    const filterCloseIcon = getElementBySelector(fixture, '.filter-pills--close-icon') as HTMLElement;
    click(filterCloseIcon);
    expect(component.filterClose.emit).toHaveBeenCalledOnceWith(filterPill.type);
    expect(component.filterClose2.emit).toHaveBeenCalledOnceWith(filterPill.label);
  });
});
