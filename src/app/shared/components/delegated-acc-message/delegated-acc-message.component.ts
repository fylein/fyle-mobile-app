import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { from } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { EllipsisPipe } from '../../pipes/ellipses.pipe';

@Component({
  selector: 'app-delegated-acc-message',
  templateUrl: './delegated-acc-message.component.html',
  styleUrls: ['./delegated-acc-message.component.scss'],
  imports: [TranslocoPipe, EllipsisPipe],
})
export class DelegatedAccMessageComponent implements OnInit {
  private authService = inject(AuthService);

  delegateeName;

  ngOnInit() {
    from(this.authService.getEou()).subscribe((res) => {
      this.delegateeName = res.us.full_name;
    });
  }
}
