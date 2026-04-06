import {
  PART_VERIFICATION_STATUS_LABEL,
  PartVerificationStatus,
  partVerificationItems,
} from '../part-verification/part-verification.data';

export interface DashboardMetric {
  title: string;
  value: string;
  caption: string;
  icon: string;
  iconClass: string;
}

export interface DashboardQuickLink {
  title: string;
  description: string;
  icon: string;
  route: string;
  actionLabel: string;
}

export interface DashboardTask {
  id: string;
  partNumber: string;
  partName: string;
  owner: string;
  updatedAt: string;
  statusLabel: string;
  statusClass: string;
  route: string;
}

export interface DashboardActivity {
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconClass: string;
}

export interface DashboardTeamSnapshot {
  label: string;
  value: string;
  caption: string;
}

const totalParts = partVerificationItems.length;
const completedParts = partVerificationItems.filter(
  (part) => part.status === PartVerificationStatus.Completed,
).length;
const pendingParts = totalParts - completedParts;
const completionRate =
  totalParts === 0 ? 0 : Math.round((completedParts / totalParts) * 100);

export const dashboardMetrics: readonly DashboardMetric[] = [
  {
    title: '待驗證零件',
    value: `${pendingParts}`,
    caption: '尚待 CAD / 3D 圖面比對與審核簽核。',
    icon: 'pending_actions',
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    title: '驗證完成率',
    value: `${completionRate}%`,
    caption: `本期已完成 ${completedParts} / ${totalParts} 件零件驗證。`,
    icon: 'task_alt',
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: '啟用中標準',
    value: '12',
    caption: '已納入平台稽核的緊固件與標準件規格。',
    icon: 'rule_folder',
    iconClass: 'bg-sky-50 text-sky-600',
  },
  {
    title: '版本異動提醒',
    value: '3',
    caption: '包含圖面修訂與工程變更待確認項目。',
    icon: 'notification_important',
    iconClass: 'bg-rose-50 text-rose-600',
  },
];

export const dashboardQuickLinks: readonly DashboardQuickLink[] = [
  {
    title: '零件驗證中心',
    description: '進入待辦清單，快速檢視 CAD 與模型比對狀態。',
    icon: 'security',
    route: '/part-verification',
    actionLabel: '前往驗證',
  },
  {
    title: '設計角色分工',
    description: '查看設計、審核與品保角色之責任分派。',
    icon: 'design_services',
    route: '/design-roles',
    actionLabel: '查看角色',
  },
  {
    title: '系統設定',
    description: '維護驗證規則、通知收件人與專案預設值。',
    icon: 'settings',
    route: '/settings',
    actionLabel: '開啟設定',
  },
];

export const dashboardTasks: readonly DashboardTask[] =
  partVerificationItems.map((part) => ({
    id: part.id,
    partNumber: part.partNumber,
    partName: part.partName,
    owner: part.owner,
    updatedAt: part.updatedAt,
    statusLabel: PART_VERIFICATION_STATUS_LABEL[part.status],
    statusClass:
      part.status === PartVerificationStatus.Completed
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
    route: `/part-verification/${part.id}`,
  }));

export const dashboardActivities: readonly DashboardActivity[] = [
  {
    title: '91310A235 已完成驗證',
    description: 'DXF 與 GLB 模型比對完成，已更新至最新版次。',
    timestamp: '10 分鐘前',
    icon: 'verified',
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'DIN 933 標準件待複核',
    description: '不銹鋼盤頭十字螺絲需確認材質與公差是否一致。',
    timestamp: '1 小時前',
    icon: 'manage_search',
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    title: '品質通知已寄送',
    description: '本日驗證摘要已同步寄送至品質與設計主管。',
    timestamp: '今天 08:30',
    icon: 'outgoing_mail',
    iconClass: 'bg-sky-50 text-sky-600',
  },
];

export const dashboardTeamSnapshots: readonly DashboardTeamSnapshot[] = [
  {
    label: '本週已完成稽核',
    value: '24 件',
    caption: '較上週增加 15%，維持穩定交付。',
  },
  {
    label: '平均審核時程',
    value: '1.8 天',
    caption: '從圖面提交至完成簽核的平均時間。',
  },
  {
    label: '待處理通知',
    value: '6 筆',
    caption: '包含圖號異動、材料覆核與版本補件。',
  },
];
