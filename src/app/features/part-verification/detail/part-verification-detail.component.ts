import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CadViewerComponent } from '../../../shared/components/cad-viewer/cad-viewer.component';
import { ModelViewerComponent } from '../../../shared/components/model-viewer/model-viewer.component';
import {
  PART_VERIFICATION_STATUS_LABEL,
  PartVerificationStatus,
} from '../part-verification.data';
import { PartVerificationStore } from '../part-verification.store';

@Component({
  selector: 'app-part-verification-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    CadViewerComponent,
    ModelViewerComponent,
  ],
  templateUrl: './part-verification-detail.component.html',
  styleUrl: './part-verification-detail.component.scss',
})
export class PartVerificationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly breakpointObserver = inject(BreakpointObserver);
  protected readonly store = inject(PartVerificationStore);

  protected readonly viewerHeight = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
      .pipe(
        map(() => {
          if (this.breakpointObserver.isMatched(Breakpoints.XSmall)) return 280;
          if (this.breakpointObserver.isMatched(Breakpoints.Small)) return 360;
          if (this.breakpointObserver.isMatched(Breakpoints.Medium)) return 420;
          return 560;
        }),
      ),
    { initialValue: 560 },
  );

  protected readonly part = this.store.currentPart;

  protected readonly cadFileUrl = computed(() => this.store.currentPart()?.cad_file_url ?? '');
  protected readonly modelFileUrl = computed(() => this.store.currentPart()?.model_file_url ?? '');

  protected readonly summaryCards = computed(() => {
    const part = this.store.currentPart();
    if (!part) return [];
    return [
      {
        title: '零件編號',
        value: part.part_number,
        caption: part.part_name,
        icon: 'precision_manufacturing',
      },
      {
        title: '驗證狀態',
        value: PART_VERIFICATION_STATUS_LABEL[part.status as PartVerificationStatus],
        caption: '圖檔與模型之比對結果摘要',
        icon: 'verified',
      },
      {
        title: '版次',
        value: part.revision,
        caption: `最近更新：${part.updated_at?.slice(0, 10) ?? ''}`,
        icon: 'history',
      },
    ];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.loadPart(id);
    }
  }
}
