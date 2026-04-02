import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import type { DxfViewer } from 'dxf-viewer';

@Component({
  selector: 'app-cad-viewer',
  standalone: true,
  templateUrl: './cad-viewer.component.html'
})
export class CadViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() fileUrl = '';
  @Input() viewerHeight = 560;

  @ViewChild('viewerHost', { static: true })
  private viewerHost?: ElementRef<HTMLDivElement>;

  protected isLoading = true;
  protected errorMessage = '';

  private viewer: DxfViewer | null = null;
  private isViewReady = false;

  protected get fileName(): string {
    if (!this.fileUrl) {
      return 'No file selected';
    }

    const segments = this.fileUrl.split('/');
    return segments[segments.length - 1] || this.fileUrl;
  }

  async ngAfterViewInit(): Promise<void> {
    this.isViewReady = true;
    await this.loadViewer();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.isViewReady) {
      return;
    }

    if (changes['fileUrl'] && !changes['fileUrl'].firstChange) {
      await this.loadViewer();
    }
  }

  ngOnDestroy(): void {
    this.viewer?.Destroy();
    this.viewer = null;
  }

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
      const { DxfViewer } = await import('dxf-viewer');
      const { Color } = await import('three');

      this.viewer?.Destroy();
      this.viewer = new DxfViewer(this.viewerHost.nativeElement, {
        autoResize: true,
        antialias: true,
        clearColor: new Color(0xffffff),
        clearAlpha: 1,
        canvasAlpha: false,
        colorCorrection: true
      });

      await this.viewer.Load({ url: this.fileUrl });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load DXF file.';
    } finally {
      this.isLoading = false;
    }
  }
}
