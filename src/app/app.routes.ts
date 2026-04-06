import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PartVerificationDetailComponent } from './features/part-verification/detail/part-verification-detail.component';
import { PartVerificationListComponent } from './features/part-verification/list/part-verification-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { breadcrumbs: [{ label: 'Dashboard' }] },
      },
      {
        path: 'part-verification',
        component: PartVerificationListComponent,
        data: { breadcrumbs: [{ label: 'Part Verification' }] },
      },
      {
        path: 'part-verification/:id',
        component: PartVerificationDetailComponent,
        data: {
          breadcrumbs: [
            { label: 'Part Verification', url: '/part-verification' },
            {
              label: (route: { params: { id: string } }) => route.params.id,
            },
          ],
        },
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
