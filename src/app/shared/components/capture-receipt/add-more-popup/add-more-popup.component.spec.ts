import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { AddMorePopupComponent } from './add-more-popup.component';
import { getElementBySelector, getTextContent, getAllElementsBySelector } from 'src/app/core/dom-helpers';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('AddMorePopupComponent', () => {
  let addMorePopupComponent: AddMorePopupComponent;
  let fixture: ComponentFixture<AddMorePopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddMorePopupComponent],
      imports: [IonicModule.forRoot(), MatBottomSheetModule, MatIconModule, MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMorePopupComponent);
    addMorePopupComponent = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(addMorePopupComponent).toBeTruthy();
  });

  it('should display the heading correctly', () => {
    const headingElement = getElementBySelector(fixture, '.add-more--heading');
    expect(getTextContent(headingElement)).toContain('Add more Using');
  });

  it('should initialize actionButtons correctly', () => {
    const containerElements = getAllElementsBySelector(fixture, '.add-more--container');
    expect(containerElements.length).toBe(2); // Check that there are 2 action buttons
    expect(addMorePopupComponent.actionButtons).toEqual([
      { icon: 'fy-camera', title: 'Capture Receipts', mode: 'camera' },
      { icon: 'image', title: 'Upload from Gallery', mode: 'gallery' },
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
