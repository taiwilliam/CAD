export enum PartVerificationStatus {
  Pending = 0,
  Completed = 1,
}

export const PART_VERIFICATION_STATUS_LABEL: Record<
  PartVerificationStatus,
  string
> = {
  [PartVerificationStatus.Pending]: '待驗證',
  [PartVerificationStatus.Completed]: '驗證完成',
};

export interface PartVerificationItem {
  id: string; // 零件唯一識別碼
  partNumber: string; // 零件編號
  partName: string; // 零件名稱
  category: string; // 零件類別
  material: string; // 材質
  status: PartVerificationStatus; // 驗證狀態
  revision: string; // 版次
  updatedAt: string; // 最近更新日期
  owner: string; // 負責人
  tolerance: string; // 公差
  cadFileUrl: string; // CAD圖檔URL
  modelFileUrl: string; // 3D模型URL
  description: string; // 零件描述
  standard: string; // 標準 如 ISO 4017，DIN 933等
  specification: string; // 規格說明，如尺寸、強度等詳細資訊
  projectCode: string; // 專案代碼
  drawingNumber: string; // 圖紙編號
}

export const partVerificationItems: readonly PartVerificationItem[] = [
  {
    id: '91310A235',
    partNumber: '91310A235',
    partName: '六角頭螺絲',
    category: '螺絲',
    material: '10.9級鋼',
    status: PartVerificationStatus.Completed,
    revision: '1.2.1',
    updatedAt: '2026/04/05',
    owner: 'William Tai',
    tolerance: '± 0.15 mm',
    cadFileUrl: '/DXF/91310A235.DXF',
    modelFileUrl: '/GLB/91310A235.glb',
    description: '用於固定機構外殼的六角頭螺絲，提供高強度的連接性能。',
    standard: 'ISO 4017',
    specification: '尺寸：M10 x 30 mm，強度等級：10.9，表面處理：鍍鋅',
    projectCode: 'PRJ-001',
    drawingNumber: 'DRW-91310A235',
  },
  {
    id: '91772A502',
    partNumber: '91772A502',
    partName: '不銹鋼盤頭十字螺絲',
    category: '螺絲',
    material: '不銹鋼',
    status: PartVerificationStatus.Pending,
    revision: '1.3.2',
    updatedAt: '2026/04/04',
    owner: 'William Tai',
    tolerance: '± 0.15 mm',
    cadFileUrl: '/DXF/91772A502.DXF',
    modelFileUrl: '/GLB/91772A502.glb',
    description:
      '用於固定機構內部組件的不銹鋼盤頭十字螺絲，具有優異的耐腐蝕性能和強度。',
    standard: 'DIN 933',
    specification: '尺寸：M8 x 20 mm，強度等級：A2-70，表面處理：無',
    projectCode: 'PRJ-001',
    drawingNumber: 'DRW-91772A502',
  },
  {
    id: '90031A198',
    partNumber: '90031A198',
    partName: '鋼製十字槽平頭螺絲',
    category: '螺絲',
    material: '鋼',
    status: PartVerificationStatus.Completed,
    revision: '1.0.0',
    updatedAt: '2026/04/03',
    owner: 'William Tai',
    tolerance: '± 0.15 mm',
    cadFileUrl: '/DXF/90031A198.DXF',
    modelFileUrl: '/GLB/90031A198.glb',
    description:
      '用於固定木質部件的鋼製十字槽平頭螺絲，提供穩定的連接性能和耐用性。',
    standard: 'ISO 7040',
    specification: '尺寸：M6 x 25 mm，強度等級：4.8，表面處理：黑色氧化',
    projectCode: 'PRJ-002',
    drawingNumber: 'DRW-90031A198',
  },
  {
    id: '91271A584',
    partNumber: '91271A584',
    partName: '鋼製十二角螺絲',
    category: '螺絲',
    material: '鋼',
    status: PartVerificationStatus.Pending,
    revision: '1.1.0',
    updatedAt: '2026/04/02',
    owner: 'William Tai',
    tolerance: '± 0.15 mm',
    cadFileUrl: '/DXF/91271A584.DXF',
    modelFileUrl: '/GLB/91271A584.glb',
    description:
      '用於固定機構內部組件的鋼製十二角螺絲，具有優異的耐腐蝕性能和強度。',
    standard: 'DIN 912',
    specification: '尺寸：M5 x 15 mm，強度等級：8.8，表面處理：鍍鋅',
    projectCode: 'PRJ-002',
    drawingNumber: 'DRW-91271A584',
  },
  {
    id: '91746A116',
    partNumber: '91746A116',
    partName: '不銹鋼滾花頭蝶形螺絲',
    category: '螺絲',
    material: '不銹鋼',
    status: PartVerificationStatus.Completed,
    revision: '1.0.0',
    updatedAt: '2026/04/01',
    owner: 'William Tai',
    tolerance: '± 0.15 mm',
    cadFileUrl: '/DXF/91746A116.DXF',
    modelFileUrl: '/GLB/91746A116.glb',
    description:
      '用於固定機構內部組件的不銹鋼滾花頭蝶形螺絲，具有優異的耐腐蝕性能和強度。',
    standard: 'ISO 7040',
    specification: '尺寸：M4 x 12 mm，強度等級：A2-70，表面處理：無',
    projectCode: 'PRJ-003',
    drawingNumber: 'DRW-91746A116',
  },
] as const;
