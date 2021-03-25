import {Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef, TemplateRef} from '@angular/core';
import {Observable, fromEvent, iif, of, from} from 'rxjs';
import {ModalController} from '@ionic/angular';
import {map, startWith, distinctUntilChanged, switchMap, tap, concatMap} from 'rxjs/operators';
import {isEqual} from 'lodash';
import {ProjectsService} from 'src/app/core/services/projects.service';
import {OfflineService} from 'src/app/core/services/offline.service';
import {AuthService} from 'src/app/core/services/auth.service';
import {RecentLocalStorageItemsService} from 'src/app/core/services/recent-local-storage-items.service';
import { ExtendedProject } from 'src/app/core/models/V2/extended-project.model';

@Component({
  selector: 'app-fy-select-modal',
  templateUrl: './fy-select-project-modal.component.html',
  styleUrls: ['./fy-select-project-modal.component.scss'],
})
export class FyProjectSelectModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;
  @Input() currentSelection: any;
  @Input() filteredOptions$: Observable<{ label: string, value: any, selected?: boolean }[]>;
  @Input() cacheName;
  @Input() selectionElement: TemplateRef<ElementRef>;
  @Input() categoryIds: string[];
  @Input() defaultValue = false;
  @Input() recentlyUsed: { label: string, value: ExtendedProject, selected?: boolean }[];

  recentrecentlyUsedItems$: Observable<any[]>;
  value;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectsService,
    private offlineService: OfflineService,
    private authService: AuthService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService
  ) {
  }

  ngOnInit() {

  }

  getProjects(searchNameText) {
    const defaultProject$ = this.offlineService.getOrgUserSettings().pipe(
      switchMap(orgUserSettings => {
        if (orgUserSettings && orgUserSettings.preferences && orgUserSettings.preferences.default_project_id) {
          return this.projectService.getbyId(orgUserSettings && orgUserSettings.preferences && orgUserSettings.preferences.default_project_id);
        } else {
          return of(null);
        }
      })
    );

    return this.offlineService.getOrgSettings().pipe(
      switchMap((orgSettings) => {
        return iif(
          () => orgSettings.advanced_projects.enable_individual_projects,
          this.offlineService.getOrgUserSettings().pipe(map((orgUserSettings: any) => orgUserSettings.project_ids || [])),
          of(null)
        );
      }),
      concatMap((allowedProjectIds) => {
        return from(this.authService.getEou()).pipe(
          switchMap((eou => {
              return this.projectService.getByParamsUnformatted
              ({
                orgId: eou.ou.org_id,
                active: true,
                sortDirection: 'asc',
                sortOrder: 'project_name',
                orgCategoryIds: this.categoryIds,
                projectIds: allowedProjectIds,
                searchNameText,
                offset: 0,
                limit: 20
              });
            }
          ))
        );
      }),
      switchMap(projects => {
        if (this.defaultValue) {
          return defaultProject$.pipe(
            map(defaultProject => {
              if (defaultProject && !projects.some(project => project.project_id === defaultProject.project_id)) {
                projects.push(defaultProject);
              }

              return projects;
            })
          );
        } else {
          return of(projects);
        }
      }),
      map(projects => {
          const currentElement = [];
          if (this.currentSelection && !projects.some(project => project.project_id === this.currentSelection.project_id)) {
            currentElement.push({
              label: this.currentSelection.project_name, value: this.currentSelection
            });
          }

          return [
            {label: 'None', value: null}
          ].concat(currentElement).concat(
            projects.map(project => ({label: project.project_name, value: project}))
          );
        }
      )
    );
  }

  clearValue() {
    this.value = '';
    const searchInput = this.searchBarRef.nativeElement as HTMLInputElement;
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('keyup'));
  }

  ngAfterViewInit() {
    this.filteredOptions$ = fromEvent(this.searchBarRef.nativeElement, 'keyup').pipe(
      map((event: any) => event.srcElement.value),
      startWith(''),
      distinctUntilChanged(),
      switchMap((searchText) => {
        return this.getProjects(searchText);
      }),
      map((projects: any[]) => {
        return projects.map(project => {
          if (isEqual(project.value, this.currentSelection)) {
            project.selected = true;
          }
          return project;
        });
      })
    );

    if (this.recentlyUsed) {
      this.recentrecentlyUsedItems$ = of(this.recentlyUsed);
    } else {
      this.recentrecentlyUsedItems$ = from(this.recentLocalStorageItemsService.get(this.cacheName)).pipe(
        map((options: any) => {
          return options
            .map(option => {
              option.selected = isEqual(option.value, this.currentSelection);
              return option;
            });
        })
      );
    }
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
