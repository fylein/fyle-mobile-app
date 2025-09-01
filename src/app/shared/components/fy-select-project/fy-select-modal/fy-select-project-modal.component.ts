import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectorRef,
  TemplateRef,
  inject,
  input,
} from '@angular/core';
import { Observable, fromEvent, iif, of, from, forkJoin } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged, switchMap, finalize, debounceTime, shareReplay } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { ProjectV2 } from 'src/app/core/models/v2/project-v2.model';
import { UtilityService } from 'src/app/core/services/utility.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { ProjectOption } from 'src/app/core/models/project-options.model';
import { OrgCategory } from 'src/app/core/models/v1/org-category.model';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { PlatformEmployeeSettingsService } from 'src/app/core/services/platform/v1/spender/employee-settings.service';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-select-modal',
  templateUrl: './fy-select-project-modal.component.html',
  styleUrls: ['./fy-select-project-modal.component.scss'],
  standalone: false,
})
export class FyProjectSelectModalComponent implements AfterViewInit {
  private modalController = inject(ModalController);

  private cdr = inject(ChangeDetectorRef);

  private projectsService = inject(ProjectsService);

  private authService = inject(AuthService);

  private recentLocalStorageItemsService = inject(RecentLocalStorageItemsService);

  private utilityService = inject(UtilityService);

  private platformEmployeeSettingsService = inject(PlatformEmployeeSettingsService);

  private orgSettingsService = inject(OrgSettingsService);

  private categoriesService = inject(CategoriesService);

  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
  @ViewChild('searchBar') searchBarRef: ElementRef<HTMLInputElement>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currentSelection: ProjectV2;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() filteredOptions$: Observable<ProjectOption[]>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() cacheName: string;

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() selectionElement: TemplateRef<ElementRef>;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() categoryIds: string[];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() defaultValue = false;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() recentlyUsed: ProjectOption[];

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() label: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isProjectCategoryRestrictionsEnabled: boolean;

  readonly isSelectedProjectDisabled = input<boolean>(undefined);

  readonly selectedDisabledProject = input<ProjectV2>(undefined);

  recentrecentlyUsedItems$: Observable<ProjectOption[]>;

  value: string;

  isLoading = false;

  activeCategories$: Observable<OrgCategory[]>;

  getProjects(searchNameText: string): Observable<ProjectOption[]> {
    // set isLoading to true
    this.isLoading = true;
    // run ChangeDetectionRef.detectChanges to avoid 'expression has changed after it was checked error'.
    // More details about CDR: https://angular.io/api/core/ChangeDetectorRef
    this.cdr.detectChanges();
    const defaultProject$ = forkJoin({
      employeeSettings: this.platformEmployeeSettingsService.get(),
      activeCategories: this.activeCategories$,
    }).pipe(
      switchMap(({ employeeSettings, activeCategories }) => {
        const defaultProjectId = employeeSettings?.default_project_id;
        if (defaultProjectId) {
          return this.projectsService.getbyId(defaultProjectId, activeCategories);
        } else {
          return of(null);
        }
      }),
    );
    return this.orgSettingsService.get().pipe(
      switchMap((orgSettings) => {
        const allowedProjectIds$ = iif(
          () => orgSettings.advanced_projects.enable_individual_projects,
          this.platformEmployeeSettingsService
            .get()
            .pipe(
              map((employeeSettings: EmployeeSettings) => employeeSettings.project_ids?.map((id) => Number(id)) || []),
            ),
          of(null),
        );

        return forkJoin({
          allowedProjectIds: allowedProjectIds$,
          eou: from(this.authService.getEou()),
          activeCategories: this.activeCategories$,
        });
      }),
      switchMap(({ allowedProjectIds, eou, activeCategories }) =>
        this.projectsService.getByParamsUnformatted(
          {
            orgId: eou.ou.org_id,
            isEnabled: true,
            sortDirection: 'asc',
            sortOrder: 'name',
            orgCategoryIds: this.categoryIds,
            projectIds: allowedProjectIds,
            searchNameText,
            offset: 0,
            limit: 20,
          },
          this.isProjectCategoryRestrictionsEnabled,
          activeCategories,
        ),
      ),
      switchMap((projects) => {
        if (this.defaultValue) {
          return defaultProject$.pipe(
            map((defaultProject) => {
              if (defaultProject && !projects.some((project) => project.project_id === defaultProject.project_id)) {
                projects.push(defaultProject);
              }
              return projects;
            }),
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

        return [{ label: this.translocoService.translate('fySelectProjectModal.none'), value: null }]
          .concat(currentElement)
          .concat(projects.map((project) => ({ label: project.project_name, value: project })));
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }),
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
          }),
        ),
      );
    }
  }

  getActiveCategories(): Observable<OrgCategory[]> {
    const allCategories$ = this.categoriesService.getAll();

    return allCategories$.pipe(map((catogories) => this.categoriesService.filterRequired(catogories)));
  }

  ngAfterViewInit(): void {
    if (this.categoryIds?.length > 0) {
      this.activeCategories$ = forkJoin(
        this.categoryIds.map((id) => this.categoriesService.getCategoryById(parseInt(id, 10))),
      ).pipe(shareReplay(1));
    } else {
      // Fallback if this.categoryIds is empty
      this.activeCategories$ = this.getActiveCategories().pipe(shareReplay(1));
    }

    this.filteredOptions$ = fromEvent<{ target: HTMLInputElement }>(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event) => event.target.value),
      startWith(''),
      distinctUntilChanged(),
      debounceTime(300),
      switchMap((searchText: string) => this.getProjects(searchText)),
      map((projects) =>
        projects.map((project: { label: string; value: ProjectV2; selected?: boolean }) => {
          if (isEqual(project.value, this.currentSelection)) {
            project.selected = true;
          }
          return project as ProjectOption;
        }),
      ),
      map((projects) => {
        if (this.isSelectedProjectDisabled() && this.selectedDisabledProject()) {
          return projects.filter((project) => project.value?.project_id !== this.selectedDisabledProject()?.project_id);
        }
        return projects;
      }),
    );

    this.recentrecentlyUsedItems$ = fromEvent<{ target: HTMLInputElement }>(
      this.searchBarRef.nativeElement,
      'keyup',
    ).pipe(
      map((event) => event.target.value),
      startWith(''),
      distinctUntilChanged(),
      debounceTime(300),
      switchMap((searchText: string) =>
        this.getRecentlyUsedItems().pipe(
          // filtering of recently used items wrt searchText is taken care in service method
          this.utilityService.searchArrayStream(searchText),
        ),
      ),
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
