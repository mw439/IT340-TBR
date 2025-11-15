// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   templateUrl: './login.html',
//   styleUrls: ['./login.css'],
// })
// export class Login {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  showLogin = true;
  showRegister = false;
  showForgot = false;
}
