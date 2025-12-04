import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile {
  user: any = null;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.getUserFromToken();
  }
}
