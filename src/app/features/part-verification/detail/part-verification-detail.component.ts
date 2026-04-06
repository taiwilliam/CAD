import { Component, inject } from '@angular/core';
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
  partVerificationItems,
} from '../part-verification.data';

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
export class PartVerificationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // 根據裝置寬度回傳不同的 viewer 高度（px）。
  protected readonly viewerHeight = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
      .pipe(
        map(() => {
          if (this.breakpointObserver.isMatched(Breakpoints.XSmall)) return 280;
          if (this.breakpointObserver.isMatched(Breakpoints.Small)) return 360;
          if (this.breakpointObserver.isMatched(Breakpoints.Medium)) return 420;
          return 560; // Large / XLarge
        }),
      ),
    { initialValue: 560 },
  );

  protected readonly part =
    partVerificationItems.find(
      (item) => item.id === this.route.snapshot.paramMap.get('id'),
    ) ?? partVerificationItems[0];

  protected readonly cadFileUrl = this.part.cadFileUrl;
  protected readonly modelFileUrl = this.part.modelFileUrl;

  protected readonly summaryCards = [
    {
      title: '零件編號',
      value: this.part.partNumber,
      caption: this.part.partName,
      icon: 'precision_manufacturing',
    },
    {
      title: '驗證狀態',
      value: PART_VERIFICATION_STATUS_LABEL[this.part.status],
      caption: '圖檔與模型之比對結果摘要',
      icon: 'verified',
    },
    {
      title: '版次',
      value: this.part.revision,
      caption: `最近更新：${this.part.updatedAt}`,
      icon: 'history',
    },
  ] as const;
}
