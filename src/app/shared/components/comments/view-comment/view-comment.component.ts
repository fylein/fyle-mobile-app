import { Component, Input, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatusService } from 'src/app/core/services/status.service';


@Component({
  selector: 'app-view-comment',
  templateUrl: './view-comment.component.html',
  styleUrls: ['./view-comment.component.scss'],
})
export class ViewCommentComponent implements OnInit {

  @Input() objectType: string;
  @Input() objectId: any;

  estatuses$: Observable<any>;
  totalCommentsCount$: Observable<number>;

  constructor(
    private statusService: StatusService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // MatIconModule
    const eou$ = from(this.authService.getEou());
    this.estatuses$ = eou$.pipe(
      switchMap(eou => {
        return this.statusService.find(this.objectType, this.objectId).pipe(
          map(res => {
            return res.map(status => {
              status.isBotComment = status && status.st && (status.st.org_user_id === 'SYSTEM');
              status.isSelfComment = status && status.st && eou && eou.ou && (status.st.org_user_id === eou.ou.id);
              return status;
            })
          }), map(res => {
            return res.sort(function(a,b){
              return a.st.created_at - b.st.created_at;
            });
          })
        )
      }), shareReplay()
    )


    // this.estatuses$.subscribe(res => {
    //   debugger;
    // })

    this.totalCommentsCount$ = this.estatuses$.pipe(
      map(res => {
        return res.filter(function (estatus) {
          return estatus.st.org_user_id !== 'SYSTEM';
        }).length;
      })
    )


  }

}
