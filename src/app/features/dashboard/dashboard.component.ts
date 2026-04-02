import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CadViewerComponent } from '../../shared/components/cad-viewer/cad-viewer.component';
import { ModelViewerComponent } from '../../shared/components/model-viewer/model-viewer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, CadViewerComponent, ModelViewerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
}
