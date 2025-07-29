import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-delegated-acc-message',
  templateUrl: './delegated-acc-message.component.html',
  styleUrls: ['./delegated-acc-message.component.scss'],
  standalone: false,
})
export class DelegatedAccMessageComponent implements OnInit {
  delegateeName;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    from(this.authService.getEou()).subscribe((res) => {
      this.delegateeName = res.us.full_name;
    });
  }
}
