import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { Observable, fromEvent, iif, of, from, combineLatest, BehaviorSubject, Subject, forkJoin } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged, switchMap, tap, concatMap, finalize } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { ExtendedProject } from 'src/app/core/models/v2/extended-project.model';
import { UtilityService } from 'src/app/core/services/utility.service';

@Component({
  selector: 'app-fy-select-modal',
  templateUrl: './fy-select-project-modal.component.html',
  styleUrls: ['./fy-select-project-modal.component.scss'],
})
export class FyProjectSelectModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;

  @Input() currentSelection: any;

  @Input() filteredOptions$: Observable<{ label: string; value: any; selected?: boolean }[]>;
  
  @Input() allProjects$: Observable<{ label: string; value: any; selected?: boolean }[]>;

  @Input() cacheName;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() categoryIds: string[];

  @Input() defaultValue = false;

  @Input() recentlyUsed: { label: string; value: ExtendedProject; selected?: boolean }[];

  recentrecentlyUsedItems$: Observable<any[]>;

  value;

  isLoading = false;

  clickedToLoadMore = 0

  projectsCount = 0;

  loadMore$ = new BehaviorSubject({
    pageNumber: 1,
  });

  projects = [];

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectsService,
    private offlineService: OfflineService,
    private authService: AuthService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {}

  getProjects(searchNameText, pageNumber) {
    // set isLoading to true
    this.isLoading = true;
    // run ChangeDetectionRef.detectChanges to avoid 'expression has changed after it was checked error'.
    // More details about CDR: https://angular.io/api/core/ChangeDetectorRef
    this.cdr.detectChanges();
    const defaultProject$ = this.offlineService.getOrgUserSettings().pipe(
      switchMap((orgUserSettings) => {
        if (orgUserSettings && orgUserSettings.preferences && orgUserSettings.preferences.default_project_id) {
          return this.projectService.getbyId(orgUserSettings.preferences.default_project_id);
        } else {
          return of(null);
        }
      })
    );

    return this.offlineService.getOrgSettings().pipe(
      switchMap((orgSettings) =>
        iif(
          () => orgSettings.advanced_projects.enable_individual_projects,
          this.offlineService
            .getOrgUserSettings()
            .pipe(map((orgUserSettings: any) => orgUserSettings.project_ids || [])),
          of(null)
        )
      ),
      concatMap((allowedProjectIds) =>
        from(this.authService.getEou()).pipe(
          switchMap((eou) =>
            forkJoin({
              projects: this.projectService.getByParamsUnformatted({
                orgId: eou.ou.org_id,
                active: true,
                sortDirection: 'asc',
                sortOrder: 'project_name',
                orgCategoryIds: this.categoryIds,
                projectIds: allowedProjectIds,
                searchNameText,
                offset: searchNameText ? 0 : (pageNumber - 1) * 20,
                limit: 20
              }),
              projectsCount: this.projectService.getByParamsUnformattedCount({
                orgId: eou.ou.org_id,
                active: true,
                sortDirection: 'asc',
                sortOrder: 'project_name',
                orgCategoryIds: this.categoryIds,
                projectIds: allowedProjectIds,
                searchNameText
              })
            })
          ),
        )
      ),
      switchMap((res) => {
        const projects = res.projects;
        this.projectsCount = res.projectsCount.count;
        if (this.defaultValue) {
          return defaultProject$.pipe(
            map((defaultProject) => {
              if (defaultProject && !projects.some((project) => project.project_id === defaultProject.project_id) && this.loadMore$.getValue().pageNumber === 1) {
                projects.push(defaultProject);
              }

              return projects;
            })
          );
        } else {
          return of(projects);
        }
      }),
      map((projects) => {
        const currentElement = [];
        if (
          this.currentSelection &&
          !projects.some((project) => project.project_id === this.currentSelection.project_id)
        ) {
          currentElement.push({
            label: this.currentSelection.project_name,
            value: this.currentSelection,
          });
        }

        if (this.loadMore$.getValue().pageNumber === 1) {
          return [{ label: 'None', value: null }]
          .concat(currentElement)
          .concat(projects.map((project) => ({ label: project.project_name, value: project })));
        } else {
          return projects.map((project) => ({ label: project.project_name, value: project }));
        }
      }),
      finalize(() => {
        // set isLoading to false
        this.isLoading = false;
        // run ChangeDetectionRef.detectChanges to avoid 'expression has changed after it was checked error'.
        // More details about CDR: https://angular.io/api/core/ChangeDetectorRef
        this.cdr.detectChanges();
      })
    );
  }

  clearValue() {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  getRecentlyUsedItems() {
    if (this.recentlyUsed) {
      return of(this.recentlyUsed);
    } else {
      return from(this.recentLocalStorageItemsService.get(this.cacheName)).pipe(
        map((options: any) =>
          options.map((option) => {
            option.selected = isEqual(option.value, this.currentSelection);
            return option;
          })
        )
      );
    }
  }

  loadMoreProjects() {
    this.loadMore$.next({pageNumber: this.loadMore$.getValue().pageNumber + 1});
  }

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => {
        this.projects = [];
        this.loadMore$.next({pageNumber: 1});
        return this.loadMore$.pipe(
          switchMap(({pageNumber}) => this.getProjects(searchText, pageNumber)),
          map((newProjects) => {
            this.projects = this.projects.concat(newProjects);
            return this.projects;
          })
        )
      }),
      map((projects: any[]) =>
        projects.map((project) => {
          if (isEqual(project.value, this.currentSelection)) {
            project.selected = true;
          }
          return project;
        })
      )
    );

    this.recentrecentlyUsedItems$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) =>
        this.getRecentlyUsedItems().pipe(
          // filtering of recently used items wrt searchText is taken care in service method
          this.utilityService.searchArrayStream(searchText)
        )
      )
    );

    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option) {
    if (this.cacheName && option.value) {
      this.recentLocalStorageItemsService.post(this.cacheName, option, 'label');
    }
    this.modalController.dismiss(option);
  }
}
