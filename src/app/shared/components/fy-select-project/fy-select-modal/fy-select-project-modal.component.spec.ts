import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
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
import { map, of } from 'rxjs';
import { orgUserSettingsData } from 'src/app/core/mock-data/org-user-settings.data';
import { orgSettingsData, orgSettingsDataWithoutAdvPro } from 'src/app/core/test-data/accounts.service.spec.data';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { FyHighlightTextComponent } from '../../fy-highlight-text/fy-highlight-text.component';
import { HighlightPipe } from 'src/app/shared/pipes/highlight.pipe';
import { testProjectV2 } from 'src/app/core/test-data/projects.spec.data';
import {
  expectedLabelledProjects,
  expectedProjects,
  expectedProjects2,
  expectedProjects4,
  labelledProjects,
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
  let projectsService: jasmine.SpyObj<ProjectsService>;
  let authService: jasmine.SpyObj<AuthService>;
  let recentLocalStorageItemsService: jasmine.SpyObj<RecentLocalStorageItemsService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let inputElement: HTMLInputElement;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const projectsServiceSpy = jasmine.createSpyObj('ProjectsService', ['getbyId', 'getByParamsUnformatted']);
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
          useValue: projectsServiceSpy,
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
    projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    recentLocalStorageItemsService = TestBed.inject(
      RecentLocalStorageItemsService
    ) as jasmine.SpyObj<RecentLocalStorageItemsService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;

    projectsService.getbyId.and.returnValue(of(singleProjects1));

    orgSettingsService.get.and.returnValue(of(orgSettingsData));
    authService.getEou.and.resolveTo(apiEouRes);
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));

    projectsService.getByParamsUnformatted.and.returnValue(of([singleProject2]));

    component.cacheName = 'projects';
    component.defaultValue = true;
    component.searchBarRef = fixture.debugElement.query(By.css('.selection-modal--search-input'));
    recentLocalStorageItemsService.get.and.resolveTo([testProjectV2]);
    utilityService.searchArrayStream.and.returnValue(() => of([{ label: '', value: '' }]));

    fixture.detectChanges();
    inputElement = component.searchBarRef.nativeElement;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getProjects():', () => {
    it('should get projects when current selection is not defined', (done) => {
      projectsService.getByParamsUnformatted.and.returnValue(of(projects));
      projectsService.getbyId.and.returnValue(of(expectedProjects[0].value));
      authService.getEou.and.resolveTo(apiEouRes);

      component.getProjects('projects').subscribe((res) => {
        expect(res).toEqual(expectedProjects);
        expect(orgSettingsService.get).toHaveBeenCalledTimes(2);
        expect(authService.getEou).toHaveBeenCalledTimes(2);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(4);
        expect(projectsService.getByParamsUnformatted).toHaveBeenCalledWith({
          orgId: 'orNVthTo2Zyo',
          isEnabled: true,
          sortDirection: 'asc',
          sortOrder: 'name',
          orgCategoryIds: undefined,
          projectIds: null,
          searchNameText: '',
          offset: 0,
          limit: 20,
        });
        expect(projectsService.getbyId).toHaveBeenCalledWith(3943);
        done();
      });
    });

    it('should get projects when current selection is defined', (done) => {
      projectsService.getByParamsUnformatted.and.returnValue(of(projects));
      component.currentSelection = testProjectV2;
      fixture.detectChanges();

      component.getProjects('projects').subscribe((res) => {
        expect(res).toEqual(expectedProjects2);
        expect(orgSettingsService.get).toHaveBeenCalledTimes(2);
        expect(authService.getEou).toHaveBeenCalledTimes(2);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(4);
        expect(projectsService.getByParamsUnformatted).toHaveBeenCalledWith({
          orgId: 'orNVthTo2Zyo',
          isEnabled: true,
          sortDirection: 'asc',
          sortOrder: 'name',
          orgCategoryIds: undefined,
          projectIds: null,
          searchNameText: '',
          offset: 0,
          limit: 20,
        });
        expect(projectsService.getbyId).toHaveBeenCalledWith(3943);
        done();
      });
    });

    it('should get projects when default value is null and no default projects are available', (done) => {
      orgSettingsService.get.and.returnValue(of(orgSettingsDataWithoutAdvPro));
      projectsService.getbyId.and.returnValue(of(expectedProjects[0].value));
      component.defaultValue = false;
      fixture.detectChanges();

      component.getProjects('value').subscribe(() => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(2);
        expect(authService.getEou).toHaveBeenCalledTimes(2);
        expect(orgUserSettingsService.get).toHaveBeenCalledTimes(4);
        expect(projectsService.getByParamsUnformatted).toHaveBeenCalledWith({
          orgId: 'orNVthTo2Zyo',
          isEnabled: true,
          sortDirection: 'asc',
          sortOrder: 'name',
          orgCategoryIds: undefined,
          projectIds: null,
          searchNameText: '',
          offset: 0,
          limit: 20,
        });
        expect(projectsService.getbyId).toHaveBeenCalledWith(3943);
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
      recentLocalStorageItemsService.get.and.resolveTo([
        {
          label: 'label',
          value: testProjectV2,
        },
      ]);
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

  it('onDoneClick(): should dismiss the modal on clicking the done CTA', fakeAsync(() => {
    modalController.dismiss.and.resolveTo(true);

    component.onDoneClick();
    tick();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    discardPeriodicTasks();
  }));

  describe('onElementSelect():', () => {
    it('should dismiss the modal with selected option', () => {
      modalController.dismiss.and.resolveTo(true);

      component.onElementSelect({ label: '', value: null });
      expect(modalController.dismiss).toHaveBeenCalledWith({ label: '', value: null });
      expect(recentLocalStorageItemsService.post).not.toHaveBeenCalled();
    });

    it('should cache the selected option and dismiss the modal', () => {
      modalController.dismiss.and.resolveTo(true);
      recentLocalStorageItemsService.post.and.returnValue(null);
      component.cacheName = 'cache';
      fixture.detectChanges();

      component.onElementSelect({ label: 'Staging Project', value: testProjectV2 });

      expect(modalController.dismiss).toHaveBeenCalledOnceWith({ label: 'Staging Project', value: testProjectV2 });
      expect(recentLocalStorageItemsService.post).toHaveBeenCalledOnceWith(
        component.cacheName,
        { label: 'Staging Project', value: testProjectV2 },
        'label'
      );
    });
  });

  it('ngAfterViewInit(): show filtered projects and recently used items', fakeAsync((done) => {
    spyOn(component, 'getRecentlyUsedItems').and.returnValue(of(expectedProjects));
    spyOn(component, 'getProjects').and.returnValue(of(labelledProjects));

    utilityService.searchArrayStream.and.returnValue(() => of([{ label: 'project1', value: testProjectV2 }]));
    fixture.detectChanges();

    component.ngAfterViewInit();
    inputElement.value = 'projects';
    inputElement.dispatchEvent(new Event('keyup'));

    tick(300);
    component.recentrecentlyUsedItems$.subscribe((res) => {
      expect(res).toEqual(expectedProjects4);
    });

    tick(300);
    component.filteredOptions$.subscribe((res) => {
      expect(res).toEqual(expectedLabelledProjects);
    });

    expect(component.getProjects).toHaveBeenCalledWith('projects');
    expect(component.getRecentlyUsedItems).toHaveBeenCalled();
    expect(utilityService.searchArrayStream).toHaveBeenCalledWith('projects');

    discardPeriodicTasks();
  }));

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
    component.recentrecentlyUsedItems$ = of(testProjectV2).pipe(
      map((project) => [
        {
          label: project.project_name,
          value: project,
        },
      ])
    );
    fixture.detectChanges();

    const itemsList = getAllElementsBySelector(fixture, '.selection-modal--recently-used-item-content');

    click(itemsList[0] as HTMLElement);
    expect(component.onElementSelect).toHaveBeenCalledOnceWith({ label: 'Staging Project', value: testProjectV2 });
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
