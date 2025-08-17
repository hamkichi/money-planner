import { GoalCategory } from '../types/financial'

// 目標カテゴリの定義
export const GOAL_CATEGORIES: { value: GoalCategory; label: string; icon: string }[] = [
  { value: 'house', label: '住宅購入', icon: '🏠' },
  { value: 'car', label: '車購入', icon: '🚗' },
  { value: 'education', label: '教育資金', icon: '🎓' },
  { value: 'travel', label: '旅行', icon: '✈️' },
  { value: 'retirement', label: '老後資金', icon: '👴' },
  { value: 'emergency', label: '緊急時資金', icon: '🆘' },
  { value: 'other', label: 'その他', icon: '💡' }
]

// リスクレベルの定義
export const RISK_LEVELS = [
  { value: 'low', label: '低リスク', description: '元本保証重視、リターン1-3%', color: 'green' },
  { value: 'medium', label: '中リスク', description: 'バランス重視、リターン3-7%', color: 'blue' },
  { value: 'high', label: '高リスク', description: 'リターン重視、リターン7-15%', color: 'red' }
]

// 優先度の定義
export const PRIORITIES = [
  { value: 'high', label: '高', color: 'red' },
  { value: 'medium', label: '中', color: 'yellow' },
  { value: 'low', label: '低', color: 'green' }
]

// 複利計算の頻度
export const COMPOUNDING_FREQUENCIES = [
  { value: 'monthly', label: '毎月' },
  { value: 'quarterly', label: '四半期' },
  { value: 'annually', label: '年1回' }
]

// デフォルトの金利設定
export const DEFAULT_RATES = {
  savings: 0.002,      // 0.2% (普通預金)
  timeDeposit: 0.01,   // 1.0% (定期預金)
  investment: {
    low: 0.03,         // 3% (低リスク投資)
    medium: 0.05,      // 5% (中リスク投資)
    high: 0.08         // 8% (高リスク投資)
  },
  loan: {
    housing: 0.013,    // 1.3% (住宅ローン)
    car: 0.025,        // 2.5% (自動車ローン)
    personal: 0.05     // 5% (個人ローン)
  }
}

// 投資ポートフォリオのプリセット
export const PORTFOLIO_PRESETS = [
  {
    name: '保守的',
    riskLevel: 'low' as const,
    allocation: { stocks: 20, bonds: 60, cash: 20, others: 0 },
    expectedReturn: 0.03
  },
  {
    name: 'バランス',
    riskLevel: 'medium' as const,
    allocation: { stocks: 50, bonds: 30, cash: 15, others: 5 },
    expectedReturn: 0.05
  },
  {
    name: '積極的',
    riskLevel: 'high' as const,
    allocation: { stocks: 70, bonds: 15, cash: 10, others: 5 },
    expectedReturn: 0.08
  },
  {
    name: '超積極的',
    riskLevel: 'high' as const,
    allocation: { stocks: 85, bonds: 5, cash: 5, others: 5 },
    expectedReturn: 0.10
  }
]

// 通貨設定
export const CURRENCY = {
  symbol: '¥',
  code: 'JPY',
  locale: 'ja-JP'
}

// アプリケーション設定
export const APP_CONFIG = {
  name: 'Money Planner',
  version: '1.0.0',
  description: '目標金額達成計画ツール',
  maxGoals: 10,
  maxYears: 50,
  minAmount: 1000,
  maxAmount: 999999999999,
  autoSaveInterval: 30000, // 30秒
  chartColors: [
    '#007AFF', // Primary Blue
    '#34C759', // Green
    '#FF9500', // Orange
    '#FF3B30', // Red
    '#5856D6', // Purple
    '#FF2D92', // Pink
    '#64D2FF', // Light Blue
    '#30D158'  // Light Green
  ]
}

// ローカルストレージのキー
export const STORAGE_KEYS = {
  goals: 'money_planner_goals',
  savingsPlans: 'money_planner_savings_plans',
  investmentPlans: 'money_planner_investment_plans',
  loanPlans: 'money_planner_loan_plans',
  settings: 'money_planner_settings',
  lastBackup: 'money_planner_last_backup'
}

// エラーメッセージ
export const ERROR_MESSAGES = {
  required: 'この項目は必須です',
  invalidAmount: '有効な金額を入力してください',
  invalidDate: '有効な日付を入力してください',
  futureDate: '未来の日付を入力してください',
  invalidPercentage: '0-100の範囲で入力してください',
  portfolioTotal: 'ポートフォリオの合計は100%である必要があります',
  networkError: 'ネットワークエラーが発生しました',
  storageError: 'データの保存に失敗しました',
  loadError: 'データの読み込みに失敗しました'
}

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  goalCreated: '目標が作成されました',
  goalUpdated: '目標が更新されました',
  goalDeleted: '目標が削除されました',
  planCreated: 'プランが作成されました',
  planUpdated: 'プランが更新されました',
  planDeleted: 'プランが削除されました',
  dataSaved: 'データが保存されました',
  dataExported: 'データがエクスポートされました',
  dataImported: 'データがインポートされました'
}

// チャートの設定
export const CHART_CONFIG = {
  defaultHeight: 300,
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
        },
      },
    },
  }
}

// アニメーションの設定
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: 'ease-out',
  staggerDelay: 100
}