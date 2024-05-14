import { Component, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { Observable, fromEvent, iif, of, from } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged, switchMap, concatMap, finalize } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { ProjectV2 } from 'src/app/core/models/v2/project-v2.model';
import { UtilityService } from 'src/app/core/services/utility.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { ProjectOption } from 'src/app/core/models/project-options.model';

@Component({
  selector: 'app-fy-select-modal',
  templateUrl: './fy-select-project-modal.component.html',
  styleUrls: ['./fy-select-project-modal.component.scss'],
})
export class FyProjectSelectModalComponent implements AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef<HTMLInputElement>;

  @Input() currentSelection: ProjectV2;

  @Input() filteredOptions$: Observable<ProjectOption[]>;

  @Input() cacheName: string;

  @Input() selectionElement: TemplateRef<ElementRef>;

  @Input() categoryIds: string[];

  @Input() defaultValue = false;

  @Input() recentlyUsed: ProjectOption[];

  @Input() label: string;

  recentrecentlyUsedItems$: Observable<ProjectOption[]>;

  value: string;

  isLoading = false;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private projectsService: ProjectsService,
    private authService: AuthService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private utilityService: UtilityService,
    private orgUserSettingsService: OrgUserSettingsService,
    private orgSettingsService: OrgSettingsService
  ) {}

  getProjects(searchNameText: string): Observable<ProjectOption[]> {
    // set isLoading to true
    this.isLoading = true;
    // run ChangeDetectionRef.detectChanges to avoid 'expression has changed after it was checked error'.
    // More details about CDR: https://angular.io/api/core/ChangeDetectorRef
    this.cdr.detectChanges();
    const defaultProject$ = this.orgUserSettingsService.get().pipe(
      switchMap((orgUserSettings) => {
        if (orgUserSettings && orgUserSettings.preferences && orgUserSettings.preferences.default_project_id) {
          return this.projectsService.getbyId(orgUserSettings.preferences.default_project_id);
        } else {
          return of(null);
        }
      })
    );

    return this.orgSettingsService.get().pipe(
      switchMap((orgSettings) =>
        iif(
          () => orgSettings.advanced_projects.enable_individual_projects,
          this.orgUserSettingsService
            .get()
            .pipe(map((orgUserSettings: OrgUserSettings) => orgUserSettings.project_ids || [])),
          of(null)
        )
      ),
      concatMap((allowedProjectIds) =>
        from(this.authService.getEou()).pipe(
          switchMap((eou) =>
            this.projectsService.getByParamsUnformatted({
              orgId: eou.ou.org_id,
              isEnabled: true,
              sortDirection: 'asc',
              sortOrder: 'name',
              orgCategoryIds: this.categoryIds,
              projectIds: allowedProjectIds,
              searchNameText,
              offset: 0,
              limit: 20,
            })
          )
        )
      ),
      switchMap((projects) => {
        if (this.defaultValue) {
          return defaultProject$.pipe(
            map((defaultProject) => {
              if (defaultProject && !projects.some((project) => project.project_id === defaultProject.project_id)) {
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

        return [{ label: 'None', value: null }]
          .concat(currentElement)
          .concat(projects.map((project) => ({ label: project.project_name, value: project })));
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

  clearValue(): void {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  getRecentlyUsedItems(): Observable<ProjectV2[] | ProjectOption[]> {
    if (this.recentlyUsed) {
      return of(this.recentlyUsed);
    } else {
      return from(this.recentLocalStorageItemsService.get(this.cacheName)).pipe(
        map((options) =>
          options.map((option: ProjectOption) => {
            option.selected = isEqual(option.value, this.currentSelection);
            return option;
          })
        )
      );
    }
  }

  ngAfterViewInit(): void {
    this.filteredOptions$ = fromEvent<{ target: HTMLInputElement }>(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event) => event.target.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: string) => this.getProjects(searchText)),
      map((projects) =>
        projects.map((project: { label: string; value: ProjectV2; selected?: boolean }) => {
          if (isEqual(project.value, this.currentSelection)) {
            project.selected = true;
          }
          return project as ProjectOption;
        })
      )
    );

    this.recentrecentlyUsedItems$ = fromEvent<{ target: HTMLInputElement }>(
      this.searchBarRef.nativeElement,
      'keyup'
    ).pipe(
      map((event) => event.target.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText: string) =>
        this.getRecentlyUsedItems().pipe(
          // filtering of recently used items wrt searchText is taken care in service method
          this.utilityService.searchArrayStream(searchText)
        )
      )
    );

    this.cdr.detectChanges();
  }

  onDoneClick(): void {
    this.modalController.dismiss();
  }

  onElementSelect(option: ProjectOption): void {
    if (this.cacheName && option.value) {
      this.recentLocalStorageItemsService.post(this.cacheName, option, 'label');
    }
    this.modalController.dismiss(option);
  }
}
