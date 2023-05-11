import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { FyProjectSelectModalComponent } from './fy-select-project-modal.component';
import { ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { orgSettingsData, orgSettingsDataWithoutAdvPro } from 'src/app/core/test-data/accounts.service.spec.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { FyHighlightTextComponent } from '../../fy-highlight-text/fy-highlight-text.component';
import { HighlightPipe } from 'src/app/shared/pipes/highlight.pipe';
import { testProjectV2 } from 'src/app/core/test-data/projects.spec.data';
import {
  expectedProjects,
  expectedProjects2,
  expectedProjects3,
  expectedProjects4,
  projects,
  singleProject2,
  singleProjects1,
} from 'src/app/core/mock-data/extended-projects.data';
import { click, getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { By } from '@angular/platform-browser';

describe('FyProjectSelectModalComponent', () => {
  let component: FyProjectSelectModalComponent;
  let fixture: ComponentFixture<FyProjectSelectModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let cdr: ChangeDetectorRef;
  let projectService: jasmine.SpyObj<ProjectsService>;
  let authService: jasmine.SpyObj<AuthService>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let inputElement: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const projectServiceSpy = jasmine.createSpyObj('ProjectsService', ['getbyId', 'getByParamsUnformatted']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const recentLocalStorageItemsServiceSpy = jasmine.createSpyObj('RecentLocalStorageItemsService', ['get', 'post']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['searchArrayStream']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);

    TestBed.configureTestingModule({
      declarations: [FyProjectSelectModalComponent, FyHighlightTextComponent, HighlightPipe],
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatIconTestingModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      providers: [
        ChangeDetectorRef,
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ProjectsService,
          useValue: projectServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: RecentLocalStorageItemsService,
          useValue: recentLocalStorageItemsServiceSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FyProjectSelectModalComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    cdr = TestBed.inject(ChangeDetectorRef);
    projectService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;

    projectService.getbyId.and.returnValue(of(singleProjects1));

    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));

    projectService.getByParamsUnformatted.and.returnValue(of([singleProject2]));

    component.cacheName = 'projects';
    component.defaultValue = true;
    component.searchBarRef = fixture.debugElement.query(By.css('.selection-modal--search-input'));
    recentLocalStorageItemsService.get.and.returnValue(Promise.resolve([testProjectV2]));
    utilityService.searchArrayStream.and.returnValue(() => of([{ label: '', value: '' }]));
    spyOn(component, 'getProjects').and.callThrough();

    fixture.detectChanges();
    inputElement = component.searchBarRef.nativeElement;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getProjects():', () => {
    it('should get projects when current selection is not defined', (done) => {
      projectService.getByParamsUnformatted.and.returnValue(of(projects));
      projectService.getbyId.and.returnValue(of(expectedProjects[0].value));
      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));

      component.getProjects('projects').subscribe((res) => {
        expect(res).toEqual(expectedProjects);
        expect(orgSettingsService.get).toHaveBeenCalledTimes(2);
        expect(authService.getEou).toHaveBeenCalledTimes(2);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(4);
        expect(projectService.getByParamsUnformatted).toHaveBeenCalledWith({
          orgId: 'orNVthTo2Zyo',
          active: true,
          sortDirection: 'asc',
          sortOrder: 'project_name',
          orgCategoryIds: undefined,
          projectIds: null,
          searchNameText: '',
          offset: 0,
          limit: 20,
        });
        expect(projectService.getbyId).toHaveBeenCalledWith(3943);
        done();
      });
    });

    it('should get projects when current selection is defined', (done) => {
      projectService.getByParamsUnformatted.and.returnValue(of(projects));
      component.currentSelection = [testProjectV2];
      fixture.detectChanges();

      component.getProjects('projects').subscribe((res) => {
        expect(res).toEqual(expectedProjects2);
        expect(orgSettingsService.get).toHaveBeenCalledTimes(2);
        expect(authService.getEou).toHaveBeenCalledTimes(2);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(4);
        expect(projectService.getByParamsUnformatted).toHaveBeenCalledWith({
          orgId: 'orNVthTo2Zyo',
          active: true,
          sortDirection: 'asc',
          sortOrder: 'project_name',
          orgCategoryIds: undefined,
          projectIds: null,
          searchNameText: '',
          offset: 0,
          limit: 20,
        });
        expect(projectService.getbyId).toHaveBeenCalledWith(3943);
        done();
      });
    });

    it('should get projects when default value is null and no default projects are available', (done) => {
      orgSettingsService.get.and.returnValue(of(orgSettingsDataWithoutAdvPro));
      projectService.getbyId.and.returnValue(of(expectedProjects[0].value));
      component.defaultValue = false;
      fixture.detectChanges();

      component.getProjects('value').subscribe(() => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(2);
        expect(authService.getEou).toHaveBeenCalledTimes(2);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(4);
        expect(projectService.getByParamsUnformatted).toHaveBeenCalledWith({
          orgId: 'orNVthTo2Zyo',
          active: true,
          sortDirection: 'asc',
          sortOrder: 'project_name',
          orgCategoryIds: undefined,
          projectIds: null,
          searchNameText: '',
          offset: 0,
          limit: 20,
        });
        expect(projectService.getbyId).toHaveBeenCalledWith(3943);
        done();
      });
    });
  });

  it('clearValue(): should clear all values', () => {
    component.value = 'value';

    inputElement.value = 'projects';
    inputElement.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();

    component.clearValue();
    expect(component.value).toEqual('');
    expect(inputElement.value).toEqual('');
  });

  describe('getRecentlyUsedItems():', () => {
    it('should return recently used project if already present', (done) => {
      component.recentlyUsed = [
        {
          label: 'label',
          value: testProjectV2,
        },
      ];

      fixture.detectChanges();

      component.getRecentlyUsedItems().subscribe((res) => {
        expect(res).toEqual([
          {
            label: 'label',
            value: testProjectV2,
          },
        ]);
      });
      done();
    });

    it('should get project from recently used storage if not already present', (done) => {
      recentLocalStorageItemsService.get.and.returnValue(
        Promise.resolve([
          {
            label: 'label',
            value: testProjectV2,
          },
        ])
      );
      component.recentlyUsed = null;
      component.cacheName = 'project';
      fixture.detectChanges();

      component.getRecentlyUsedItems().subscribe((res) => {
        expect(res).toEqual([
          {
            label: 'label',
            value: testProjectV2,
            selected: false,
          },
        ]);
        expect(recentLocalStorageItemsService.get).toHaveBeenCalledWith(component.cacheName);
        done();
      });
    });
  });

  it('onDoneClick(): should dimiss the modal on clicking the done CTA', () => {
    modalController.dismiss.and.returnValue(Promise.resolve(true));

    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  describe('onElementSelect():', () => {
    it('should dismiss the modal with selected option', () => {
      modalController.dismiss.and.returnValue(Promise.resolve(true));

      component.onElementSelect('value');
      expect(modalController.dismiss).toHaveBeenCalledWith('value');
      expect(recentLocalStorageItemsService.post).not.toHaveBeenCalled();
    });

    it('should cache the selected option and dismiss the modal', () => {
      modalController.dismiss.and.returnValue(Promise.resolve(true));
      recentLocalStorageItemsService.post.and.returnValue(null);
      component.cacheName = 'cache';
      fixture.detectChanges();

      component.onElementSelect({
        value: 'value',
      });

      expect(modalController.dismiss).toHaveBeenCalledOnceWith({
        value: 'value',
      });
      expect(recentLocalStorageItemsService.post).toHaveBeenCalledOnceWith(
        component.cacheName,
        { value: 'value' },
        'label'
      );
    });
  });

  it('ngAfterViewInit(): show filtered projects and recently used items', (done) => {
    spyOn(component, 'getRecentlyUsedItems').and.returnValue(of(expectedProjects));

    utilityService.searchArrayStream.and.returnValue(() => of([{ label: 'project1', value: testProjectV2 }]));
    component.currentSelection = singleProject2;

    component.ngAfterViewInit();
    inputElement.value = 'projects';
    inputElement.dispatchEvent(new Event('keyup'));

    component.recentrecentlyUsedItems$.subscribe((res) => {
      expect(res).toEqual(expectedProjects4);
    });

    expect(component.getProjects).toHaveBeenCalledWith('projects');
    expect(component.getRecentlyUsedItems).toHaveBeenCalled();
    expect(utilityService.searchArrayStream).toHaveBeenCalledWith('projects');
    done();
  });

  it('should show label on the screen', () => {
    component.label = 'Projects';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.selection-modal--title'))).toEqual('Select Projects');
  });

  it('should close the modal on clicking done CTA', () => {
    spyOn(component, 'onDoneClick');
    const doneButton = getElementBySelector(fixture, '.fy-icon-close') as HTMLElement;

    click(doneButton);
    expect(component.onDoneClick).toHaveBeenCalledTimes(1);
  });

  it('should clear value on clicking the clear button', () => {
    spyOn(component, 'clearValue').and.callThrough();
    component.value = 'value';
    fixture.detectChanges();

    expect(component.value).toEqual('value');

    const clearButton = getElementBySelector(fixture, '.selection-modal--clear-button') as HTMLElement;
    click(clearButton);

    expect(component.clearValue).toHaveBeenCalledTimes(1);
    expect(component.value).toEqual('');
  });

  it('should select element on clicking recently used items', () => {
    spyOn(component, 'onElementSelect');
    component.recentrecentlyUsedItems$ = of([testProjectV2]);
    fixture.detectChanges();

    const itemsList = getAllElementsBySelector(fixture, '.selection-modal--recently-used-item-content');

    click(itemsList[0] as HTMLElement);
    expect(component.onElementSelect).toHaveBeenCalledOnceWith(testProjectV2);
  });

  it('should select an element on clicking filtered items', () => {
    spyOn(component, 'onElementSelect');
    component.filteredOptions$ = of(expectedProjects);
    fixture.detectChanges();

    const itemsList = getAllElementsBySelector(fixture, '.selection-modal--list-element');
    click(itemsList[1] as HTMLElement);
    expect(component.onElementSelect).toHaveBeenCalledOnceWith(expectedProjects[0]);
  });
});
