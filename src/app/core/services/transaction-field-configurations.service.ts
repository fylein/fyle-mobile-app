import { Injectable } from '@angular/core';
import { OrgSettingsService } from './org-settings.service';
import { map, switchMap, concatMap, reduce, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { from, of, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionFieldConfigurationsService {

  constructor(
    private orgSettingsService: OrgSettingsService,
    private authService: AuthService
  ) { }

  getAll() {
    return this.orgSettingsService.get().pipe(
      map((settings) => {
        return settings.transaction_field_configurations;
      })
    );
  }

  getAllMap() {
    return this.getAll().pipe(
      map(
        transactionFieldConfigurations => {
          const tfcMap = {};

          transactionFieldConfigurations.forEach((transactionFieldConfiguration) => {
            tfcMap[transactionFieldConfiguration.column_name] = transactionFieldConfiguration.configurations;
          });

          return tfcMap;
        }
      )
    );
  }

  getUserRoles() {
    return from(this.authService.getRoles());
  }

  findCommonRoles(roles) {
    return this.getUserRoles().pipe(
      map(userRoles => roles.filter((role) => {
        return userRoles.indexOf(role) !== -1;
      }))
    );
  }

  canEdit(roles) {
    return this.findCommonRoles(roles).pipe(
      map(commonRoles => (commonRoles.length > 0))
    );
  }

  canView(roles) {
    return this.findCommonRoles(roles).pipe(
      map(commonRoles => (commonRoles.length > 0))
    );
  }


  filterByOrgCategoryIdProjectId(tfcMap: any, orgCategory: any, project: any) {
    const orgCategoryId = orgCategory && orgCategory.id;
    const projectId = project && project.project_id;
    return of(['purpose', 'txn_dt', 'vendor_id', 'cost_center_id', 'from_dt', 'to_dt', 'location1',
      'location2', 'distance', 'distance_unit', 'flight_journey_travel_class', 'flight_return_travel_class', 'train_travel_class', 'bus_travel_class']).pipe(
        map(fields => fields.map(field => {
          const configurations = tfcMap[field];
          let filteredField;

          if (configurations && configurations.length > 0) {
            configurations.some((configuration) => {
              if (orgCategoryId && projectId) {
                if (configuration.org_category_ids.indexOf(orgCategoryId) > -1 && configuration.project_ids.indexOf(projectId) > -1) {
                  filteredField = configuration;

                  return true;
                }
              } else if (orgCategoryId) {
                if (configuration.org_category_ids.indexOf(orgCategoryId) > -1) {
                  filteredField = configuration;

                  return true;
                }
              } else if (projectId) {
                if (configuration.project_ids.indexOf(projectId) > -1) {
                  filteredField = configuration;

                  return true;
                }
              } else if (['purpose', 'txn_dt', 'vendor_id', 'cost_center_id'].indexOf(field) > -1) {
                filteredField = configuration;

                return true;
              }
            });
          }
          if (filteredField) {
            filteredField.field = field;

          }

          return filteredField;
        })
          .filter(filteredField => !!filteredField)
        ),
        switchMap(fields => {
          return from(fields);
        }),
        concatMap(field => {
          return forkJoin({
            canView: this.canView(field.roles_visible),
            canEdit: this.canEdit(field.roles_editable)
          }).pipe(
            map(
              (res) => ({
                ...field,
                ...res
              })
            )
          );
        }),
        reduce((acc, curr) => {
          acc[curr.field] = curr;
          return acc;
        }, {})
      );
  }

}
