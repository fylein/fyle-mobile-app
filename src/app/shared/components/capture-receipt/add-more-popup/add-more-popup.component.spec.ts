import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { AddMorePopupComponent } from './add-more-popup.component';
import { getElementBySelector, getTextContent, getAllElementsBySelector } from 'src/app/core/dom-helpers';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { of } from 'rxjs';

describe('AddMorePopupComponent', () => {
  let addMorePopupComponent: AddMorePopupComponent;
  let fixture: ComponentFixture<AddMorePopupComponent>;
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
      declarations: [AddMorePopupComponent],
      imports: [IonicModule.forRoot(), MatBottomSheetModule, MatIconModule, MatIconTestingModule, TranslocoModule],
      providers: [
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMorePopupComponent);
    addMorePopupComponent = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'addMorePopup.captureReceipts': 'Capture receipts',
        'addMorePopup.uploadFiles': 'Upload files',
        'addMorePopup.addMoreUsing': 'Add more using',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(addMorePopupComponent).toBeTruthy();
  });

  it('should display the heading correctly', () => {
    const headingElement = getElementBySelector(fixture, '.add-more--heading');
    expect(getTextContent(headingElement)).toContain('Add more using');
  });

  it('should initialize actionButtons correctly', () => {
    const containerElements = getAllElementsBySelector(fixture, '.add-more--container');
    expect(containerElements.length).toBe(2); // Check that there are 2 action buttons
    expect(addMorePopupComponent.actionButtons).toEqual([
      { icon: 'camera', title: 'Capture receipts', mode: 'camera' },
      { icon: 'image', title: 'Upload files', mode: 'gallery' },
    ]);
  });

  it('should dismiss the bottom sheet when an action button is clicked', () => {
    const matBottomSheet = TestBed.inject(MatBottomSheet);
    const Matspy = spyOn(matBottomSheet, 'dismiss');
    const mode = 'camera';
    const containerElement = fixture.nativeElement.querySelector('.add-more--container');
    containerElement.click();
    expect(Matspy).toHaveBeenCalledWith({ mode });
  });
});
