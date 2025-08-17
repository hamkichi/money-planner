# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Money Planner

目標金額を貯めるための計画ツール。貯金、投資、ローンを組み合わせて目標達成時期をシミュレーションするSPAアプリケーション。

## 🚨 重要なルール

- 全ての金融計算は正確性を最優先とする
- セキュリティ：個人情報はローカルストレージのみに保存
- レスポンシブデザイン必須（モバイルファースト）
- GitHub Pagesの制約を考慮した静的サイト設計（ユーザー名：hamkichi）
- 数値計算の精度を保つため適切な丸め処理を実装

## 🛠️ 技術スタック

- **フレームワーク**: React 18+ (Create React App または Vite)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + CSS Modules
- **状態管理**: React Context API + useReducer
- **ビルドツール**: Vite (推奨)
- **デプロイ**: GitHub Pages
- **計算ライブラリ**: 金融計算用の精密な数値処理

## 🎨 デザインシステム - Apple Liquid Glass Design

### カラーパレット
```css
/* プライマリカラー */
--glass-primary: rgba(0, 122, 255, 0.8);
--glass-secondary: rgba(52, 199, 89, 0.8);
--glass-accent: rgba(255, 149, 0, 0.8);

/* ガラス効果 */
--glass-bg: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

/* ダークモード対応 */
--glass-bg-dark: rgba(0, 0, 0, 0.2);
--glass-border-dark: rgba(255, 255, 255, 0.1);
```

### ガラス効果のCSS
```css
.glass-effect {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: var(--glass-shadow);
}
```

### デザイン原則
- **透明感**: backdrop-filter: blur()を使用したガラス効果
- **階層感**: 複数のレイヤーによる奥行き表現
- **流動性**: 滑らかなアニメーションとトランジション
- **ミニマリズム**: 必要最小限の要素で最大の効果
- **一貫性**: Apple HIG準拠のインタラクション

## 📁 プロジェクト構造

```
src/
├── components/
│   ├── ui/              # 再利用可能なUIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/          # レイアウトコンポーネント
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── features/        # 機能別コンポーネント
│       ├── goal-setting/
│       ├── savings-plan/
│       ├── investment-plan/
│       └── loan-calculator/
├── hooks/               # カスタムフック
│   ├── useFinancialCalculator.ts
│   ├── useLocalStorage.ts
│   └── useProgressTracking.ts
├── types/               # TypeScript型定義
│   ├── financial.ts
│   └── ui.ts
├── utils/               # ユーティリティ関数
│   ├── calculations.ts  # 金融計算関数
│   ├── formatters.ts    # 数値・日付フォーマット
│   └── validators.ts    # バリデーション
├── styles/              # スタイル関連
│   ├── globals.css
│   ├── glass-effects.css
│   └── animations.css
└── data/                # 静的データ
    ├── constants.ts
    └── mock-data.ts
```

## ⚡ 開発コマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - GitHub Pages用ビルド
- `npm run preview` - ビルド結果のプレビュー
- `npm run test` - テスト実行
- `npm run lint` - ESLint実行
- `npm run type-check` - TypeScript型チェック
- `npm run deploy` - GitHub Pagesにデプロイ

## 💰 機能要件

### 1. 目標設定
- 目標金額の入力
- 達成期限の設定
- 目標カテゴリの選択（住宅、車、教育費等）

### 2. 貯金計画
- 月間貯金額の設定
- 貯金口座の複利計算
- 貯金進捗の可視化

### 3. 投資計画
- 投資商品別のリターン設定
- リスク許容度の考慮
- 複利効果のシミュレーション
- ポートフォリオのバランス表示

### 4. ローン活用
- ローン条件の入力（金利、期間）
- 返済計画の可視化
- 借入と投資の最適化提案

### 5. 統合分析
- 目標達成時期の予測
- 最適な資金配分の提案
- シナリオ別シミュレーション
- 進捗トラッキング

## 🎯 コンポーネント設計原則

### ガラス効果コンポーネント例
```tsx
interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  blur?: 'light' | 'medium' | 'heavy';
}

const GlassCard = ({ children, variant = 'primary', blur = 'medium' }: GlassCardProps) => {
  return (
    <div className={`glass-card glass-${variant} blur-${blur}`}>
      {children}
    </div>
  );
};
```

### アニメーション原則
- `transition-all duration-300 ease-out` - 標準トランジション
- ホバー時の微細な拡大 (`scale-105`)
- フェードイン・アウトアニメーション
- 数値変更時のカウントアップエフェクト

## 🧮 金融計算ルール

### 精度要件
- 金額計算は小数点以下2桁まで
- 利率計算は小数点以下4桁まで
- 期間計算は日単位で正確に

### 計算式
```typescript
// 複利計算
const compoundInterest = (principal: number, rate: number, periods: number): number => {
  return principal * Math.pow(1 + rate, periods);
};

// 月次積立の将来価値
const futureValueAnnuity = (payment: number, rate: number, periods: number): number => {
  return payment * ((Math.pow(1 + rate, periods) - 1) / rate);
};
```

## 📱 レスポンシブデザイン

### ブレイクポイント
- `mobile`: 320px - 767px
- `tablet`: 768px - 1023px  
- `desktop`: 1024px以上

### モバイル優先原則
- タッチフレンドリーなUI（最小44px×44px）
- スワイプ操作対応
- モバイル専用レイアウト最適化

## 🚀 GitHub Pages デプロイ

### 設定要件
- `homepage` フィールドをpackage.jsonに設定
- `gh-pages` ブランチに自動デプロイ
- カスタムドメイン対応準備

### ビルド設定
```json
{
  "homepage": "https://[username].github.io/money-planner",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

## 🔒 セキュリティ・プライバシー

- 個人データはすべてローカルストレージに保存
- 外部APIへのデータ送信なし
- 機密情報の暗号化（ローカル）
- データエクスポート・インポート機能

## 🧪 テスト戦略

- ユニットテスト：金融計算関数のテスト
- コンポーネントテスト：React Testing Library
- E2Eテスト：主要ユーザーフローのテスト
- アクセシビリティテスト：スクリーンリーダー対応

## 📊 パフォーマンス要件

- Lighthouse Score 90+
- 初回ロード時間 < 3秒
- インタラクション応答時間 < 100ms
- 滑らかな60fps アニメーション

## 🎨 UIコンポーネント優先度

1. **高優先度**: GlassCard, Button, Input, Modal
2. **中優先度**: Chart, ProgressBar, Slider
3. **低優先度**: Tooltip, Dropdown, Tabs

## 💡 開発フロー

1. **機能実装前**：CLAUDE.mdを確認
2. **デザイン確認**：Liquid Glass Design原則に従っているか
3. **計算検証**：金融計算の正確性をテスト
4. **レスポンシブ確認**：全デバイスで動作確認
5. **パフォーマンステスト**：最適化の実施

## ✅ 完成基準

- [ ] 目標設定から達成予測まで完全なフロー
- [ ] 美しいLiquid Glass UI
- [ ] モバイル・デスクトップ完全対応
- [ ] 正確な金融計算
- [ ] GitHub Pagesで正常動作
- [ ] アクセシビリティ対応
- [ ] 高いパフォーマンススコア