import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { Observable, fromEvent, iif, of, from } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { map, startWith, distinctUntilChanged, switchMap, tap, concatMap } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
@Component({
  selector: 'app-fy-select-modal',
  templateUrl: './fy-select-modal.component.html',
  styleUrls: ['./fy-select-modal.component.scss'],
})
export class FySelectModalComponent implements OnInit, AfterViewInit {
  @ViewChild('searchBar') searchBarRef: ElementRef;
  @Input() currentSelection: any;
  @Input() filteredOptions$: Observable<{ label: string, value: any, selected?: boolean }[]>;
  @Input() cacheName;
  @Input() selectionElement: TemplateRef<ElementRef>;

  recentrecentlyUsedItems$: Observable<any[]>;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectsService,
    private offlineService: OfflineService,
    private authService: AuthService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService
  ) { }

  ngOnInit() {

  }

  getProjects(searchNameText) {
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
              isIndividualProjectEnabled: !!allowedProjectIds,
              projectIds: allowedProjectIds,
              searchNameText,
              offset: 0,
              limit: 20
            });
        }
        ))
      );
    }),
    map(projects => [{ label: 'None', value: null }].concat(projects.map(project => ({ label: project.projectv2_name, value: project }))))
  );
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

    this.recentrecentlyUsedItems$ = from(this.recentLocalStorageItemsService.get(this.cacheName)).pipe(
      map((options: any) => {
        return options
          .map(option => {
          option.selected = isEqual(option.value, this.currentSelection);
          return option;
        });
      })
    );
    this.cdr.detectChanges();
  }

  onDoneClick() {
    this.modalController.dismiss();
  }

  onElementSelect(option) {
    if (this.cacheName) {
      this.recentLocalStorageItemsService.post(this.cacheName, option, 'label');
    }
    this.modalController.dismiss(option);
  }
}
