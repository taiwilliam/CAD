# CAD (Angular)

本專案建議採用 feature-first 架構，讓功能維護、擴充與測試更清楚。

## 目錄規劃

```text
src/
	app/
		core/
			services/
			guards/
			interceptors/
			models/
		shared/
			components/
			directives/
			pipes/
			ui/
		features/
			home/
				home.component.ts
				home.component.html
				home.component.scss
				home.routes.ts
				services/
				models/
			cad/
			project/
		layout/
		app.routes.ts
		app.config.ts
	assets/
	environments/
```

## 每個資料夾放什麼

### app/core/
放全域且單例的基礎設施，不放畫面元件。

- services/: Auth、API Client、Storage、Logger
- guards/: 路由守衛
- interceptors/: HTTP 攔截器
- models/: 跨 feature 共用型別

### app/shared/
放可重用、與特定業務無關的元件和工具。

- components/: 共用元件
- directives/: 共用指令
- pipes/: 共用轉換
- ui/: 通用 UI 元件（button、modal、table）

### app/features/
放業務功能，建議主要開發都在此進行。

- 每個 feature 內聚自己的 component、service、model、routes
- 例如: home、cad、project

### app/layout/
放頁面框架元件，例如 header、sidebar、shell。

### assets/
放圖片、icon、字型、i18n 等靜態資源。

### environments/
放不同環境設定（dev/staging/prod）。

## 目前狀態檢查

目前 app.routes.ts 已使用以下配置，邏輯正確:

- '' 轉址到 home
- home 顯示 HomeComponent

## 改善建議

1. 將各 feature 路由拆成獨立 routes 檔並啟用 lazy loading。
2. 讓 app.routes.ts 保持精簡，只保留入口與導向。
3. 在 tsconfig 設定路徑別名，例如 @core、@shared、@features。
4. 導入 ESLint + Prettier，統一程式風格。
5. 優先補上 service 與 guard 的單元測試。
6. 統一 environments 的 API endpoint 與 feature flag 管理方式。

## 常用指令

```bash
npm start
npm test
npm run build
```
