import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { DxfViewer } from 'dxf-viewer';

@Component({
  selector: 'app-cad-viewer',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './cad-viewer.component.html',
})
// 封裝 DXF viewer，讓外部可透過 Angular input 控制檔案載入與畫面狀態。
export class CadViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() fileUrl = '';
  @Input() viewerHeight = 560;
  @Input() showResetButton = true;

  // dxf-viewer 會掛載到這個 DOM 容器，並在裡面建立 canvas 與 renderer。
  @ViewChild('viewerHost', { static: true })
  private viewerHost?: ElementRef<HTMLDivElement>;

  // 控制 template 中的 loading 與 error overlay。
  protected isLoading = true;
  protected errorMessage = '';

  private viewer: DxfViewer | null = null;
  // 避免在 ViewChild 尚未準備好前就初始化 viewer。
  private isViewReady = false;

  // 需要顯示或除錯目前檔名時，可由 fileUrl 中取出最後一段。
  protected get fileName(): string {
    if (!this.fileUrl) {
      return 'No file selected';
    }

    const segments = this.fileUrl.split('/');
    return segments[segments.length - 1] || this.fileUrl;
  }

  // 畫面上的 host div 已渲染完成後，才安全建立 viewer。
  async ngAfterViewInit(): Promise<void> {
    this.isViewReady = true;
    await this.loadViewer();
  }

  // 初次建立後，只有 fileUrl 真的改變時才重新載入 DXF。
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.isViewReady) {
      return;
    }

    if (changes['fileUrl'] && !changes['fileUrl'].firstChange) {
      await this.loadViewer();
    }
  }

  // 元件銷毀時，釋放第三方 viewer 持有的 WebGL / canvas 資源。
  ngOnDestroy(): void {
    this.viewer?.Destroy();
    this.viewer = null;
  }

  // 重新計算視圖範圍，讓整張圖回到可完整顯示的狀態。
  protected resetView(): void {
    if (!this.viewer) {
      return;
    }

    const bounds = this.viewer.GetBounds();
    const origin = this.viewer.GetOrigin();

    if (!bounds || !origin) {
      return;
    }

    this.viewer.FitView(
      bounds.minX - origin.x,
      bounds.maxX - origin.x,
      bounds.minY - origin.y,
      bounds.maxY - origin.y,
      0.1,
    );
    this.viewer.Render();
  }

  // 建立或重建 viewer，並把目前的 DXF 檔案載入進去。
  private async loadViewer(): Promise<void> {
    if (!this.viewerHost) {
      this.errorMessage = 'Viewer container not found.';
      this.isLoading = false;
      return;
    }

    if (!this.fileUrl) {
      this.errorMessage = 'CAD file URL is required.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // 延後載入較重的 viewer 依賴，避免初始 bundle 一開始就承擔這些成本。
      const { DxfViewer } = await import('dxf-viewer');
      const { Color } = await import('three');

      // 每次換檔都重建 viewer，避免沿用舊的內部狀態造成渲染異常。
      this.viewer?.Destroy();
      this.viewer = new DxfViewer(this.viewerHost.nativeElement, {
        autoResize: true,
        antialias: true,
        clearColor: new Color(0xffffff),
        clearAlpha: 1,
        canvasAlpha: false,
        colorCorrection: true,
      });

      await this.viewer.Load({ url: this.fileUrl });
    } catch (error) {
      // 把套件或載入失敗的錯誤透過 template overlay 顯示出來。
      this.errorMessage =
        error instanceof Error ? error.message : 'Failed to load DXF file.';
    } finally {
      this.isLoading = false;
    }
  }
}
