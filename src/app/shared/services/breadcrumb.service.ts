import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  UrlSegment,
} from '@angular/router';
import { filter } from 'rxjs';

// 可由路由動態產生麵包屑文字（例如取 :id）
type BreadcrumbResolver = (route: ActivatedRouteSnapshot) => string;
type BreadcrumbValue = string | BreadcrumbResolver;

// `breadcrumbs` 陣列的單一節點設定。
interface BreadcrumbSegment {
  // 文字可為固定字串或 resolver。
  label: BreadcrumbValue;
  // 若提供，使用指定連結；否則預設使用目前路由累積路徑。
  url?: string;
}

// 真正渲染在畫面的麵包屑項目。
interface BreadcrumbItem {
  label: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly itemsSignal = signal<BreadcrumbItem[]>([]);

  // 供元件讀取的唯讀麵包屑狀態。
  readonly items = computed(() => this.itemsSignal());

  constructor() {
    // 初次載入先計算一次。
    this.refresh();
    // 每次導頁完成後重新計算。
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.refresh());
  }

  // 重新從目前 router state 建立麵包屑。
  private refresh(): void {
    const rootSnapshot = this.router.routerState.snapshot.root;
    const nextItems = this.build(rootSnapshot);
    this.itemsSignal.set(nextItems);
  }

  // 由根路由往下走，組出目前頁面的完整麵包屑。
  // 僅支援 `breadcrumbs` 欄位（每層路由可輸出多個節點）。
  private build(root: ActivatedRouteSnapshot): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentSnapshot: ActivatedRouteSnapshot | null = root;
    let currentUrl = '';

    while (currentSnapshot) {
      const segmentPath = this.toPath(currentSnapshot.url);
      if (segmentPath) {
        currentUrl = `${currentUrl}/${segmentPath}`;
      }

      const configured = currentSnapshot.routeConfig;
      const breadcrumbsData = configured?.data?.['breadcrumbs'] as
        | BreadcrumbSegment[]
        | undefined;

      if (breadcrumbsData?.length) {
        for (const segment of breadcrumbsData) {
          const label =
            typeof segment.label === 'function'
              ? segment.label(currentSnapshot)
              : segment.label;
          const url = segment.url ?? currentUrl;

          if (label && url) {
            breadcrumbs.push({ label, url });
          }
        }
      }

      currentSnapshot = currentSnapshot.firstChild;
    }

    return breadcrumbs;
  }

  // 將當前路由片段組成 path（不含 query / fragment）。
  private toPath(segments: UrlSegment[]): string {
    return segments.map((segment) => segment.path).join('/');
  }
}
