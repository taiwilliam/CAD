import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {
  dashboardActivities,
  dashboardMetrics,
  dashboardQuickLinks,
  dashboardTasks,
  dashboardTeamSnapshots,
} from './dashboard.data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly metrics = dashboardMetrics;
  protected readonly quickLinks = dashboardQuickLinks;
  protected readonly tasks = dashboardTasks;
  protected readonly activities = dashboardActivities;
  protected readonly teamSnapshots = dashboardTeamSnapshots;
}
