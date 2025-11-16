// import { Component } from '@angular/core';
// import { RouterModule } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterModule],
//   templateUrl: './app.html',
//   styleUrls: []
// })
// export class App {}
// import { Component } from '@angular/core';
// import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet, RouterLink, RouterLinkActive],
//   templateUrl: './app.html',
//   styleUrls: ['./app.css'],
// })
// export class App {}

import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {

  // Run when the app loads
  ngOnInit() {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      document.body.classList.add('dark-mode');
    }
  }

  // Toggle between light and dark mode
  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');

    const enabled = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', enabled ? 'true' : 'false');
  }
}
