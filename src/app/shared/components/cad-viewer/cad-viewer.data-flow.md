# CAD Viewer 資料流

這個元件會把 Angular input 轉成實際掛載的 `dxf-viewer` 實例，並同步更新 template 的載入與錯誤狀態。

```mermaid
flowchart TD
    A[父層元件設定 fileUrl] --> B[Angular 更新 CadViewerComponent inputs]
    B --> C{View 是否已初始化}
    C -- 否 --> D[ngAfterViewInit]
    D --> E[isViewReady = true]
    E --> F[loadViewer]
    C -- 是 且 fileUrl 已變更 --> F

    F --> G{viewerHost 是否存在}
    G -- 否 --> H[設定 errorMessage]
    H --> I[Template 顯示錯誤 overlay]

    G -- 是 --> J{fileUrl 是否存在}
    J -- 否 --> H

    J -- 是 --> K[設定 isLoading = true 並清空 errorMessage]
    K --> L[動態載入 dxf-viewer 與 three]
    L --> M[若已有 viewer 先 Destroy]
    M --> N[在 viewerHost 上建立新的 DxfViewer]
    N --> O[用 fileUrl 載入 DXF]

    O -- 成功 --> P[設定 isLoading = false]
    P --> Q[Template 顯示已渲染的 canvas]

    O -- 失敗 --> R[記錄 errorMessage]
    R --> P

    S[使用者點擊 reset 按鈕] --> T[resetView]
    T --> U[從 viewer 讀取 bounds 與 origin]
    U --> V[FitView + Render]

    W[元件被銷毀] --> X[ngOnDestroy]
    X --> Y[Destroy viewer 並釋放資源]
```

## 補充

- `isViewReady` 用來避免在 `viewerHost` 這個 DOM 節點尚未存在前就呼叫 DXF library。
- `isLoading` 與 `errorMessage` 是 template 直接依賴的兩個狀態。
- 每次 `fileUrl` 改變都會重建 viewer，用來避免殘留舊的內部渲染狀態。
