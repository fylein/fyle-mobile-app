import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatRippleModule } from '@angular/material/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { click, getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FormsModule } from '@angular/forms';
//import { MatFormFieldModule } from '@angular/material/form-field';
import { ShareReportComponent } from './share-report.component';

fdescribe('ShareReportComponent', () => {
  let component: ShareReportComponent;
  let fixture: ComponentFixture<ShareReportComponent>;
  let popoverControllerSpy: PopoverController;
  beforeEach(waitForAsync(() => {
    popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    TestBed.configureTestingModule({
      declarations: [ShareReportComponent],
      imports: [IonicModule.forRoot(), MatRippleModule, FormsModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title and details', () => {
    const shareReportTitle = getElementBySelector(fixture, '.share-report--title');
    expect(getTextContent(shareReportTitle)).toContain('Share Report');
    const shareReportDesc = getAllElementsBySelector(fixture, '.share-report--details');
    expect(getTextContent(shareReportDesc[0])).toContain('Share report via email.');
  });
});
