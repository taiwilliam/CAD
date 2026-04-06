import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'CAD';
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    // Handle SPA routing redirect from GitHub Pages 404.html
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['redirect']) {
        const redirectTo = params['redirect'];
        // Navigate without query params to clean up the URL
        this.router.navigateByUrl(redirectTo).catch(() => {
          // If the redirect path doesn't exist, stay on current route
          console.warn(`Redirect path not found: ${redirectTo}`);
        });
      }
    });
  }
}
