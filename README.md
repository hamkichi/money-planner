# Money Planner 💰

目標金額を貯めるための計画ツール。貯金、投資、ローンを組み合わせて目標達成時期をシミュレーションするSPAアプリケーション。

## 🌐 デモ

**ライブデモ**: [https://hamkichi.github.io/money-planner/](https://hamkichi.github.io/money-planner/)

## ✨ 主な機能

### 💡 目標設定
- 目標金額と達成期限の設定
- カテゴリ別分類（住宅、車、教育費、旅行など）
- 優先度設定と進捗状況の可視化

### 📊 計画管理
- リアルタイムの進捗状況表示
- フィルタリング・ソート機能
- 直感的なダッシュボード

### 🧮 金融計算エンジン
- 複利計算
- 月次積立計算
- ローン返済シミュレーション
- 投資リスク分析

### 🎨 美しいUI
- Apple Liquid Glass Designシステム
- レスポンシブデザイン（モバイル対応）
- ダークモード対応
- 流動的なアニメーション

## 🛠️ 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS + カスタムCSS
- **状態管理**: React Hooks + ローカルストレージ
- **デプロイ**: GitHub Pages

## 🚀 開発環境のセットアップ

### 前提条件

- Node.js 20.x 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/hamkichi/money-planner.git
cd money-planner

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

開発サーバーが `http://localhost:5173/money-planner/` で起動します。

### 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# リント実行
npm run lint

# TypeScript型チェック
npm run type-check

# GitHub Pagesにデプロイ
npm run deploy
```

## 📱 使い方

### 1. 目標の作成
1. 「新しい目標」ボタンをクリック
2. 目標名、金額、期限、カテゴリを入力
3. 「作成」ボタンで保存

### 2. 進捗の管理
- ダッシュボードで全体の進捗を確認
- 目標カードで個別の進捗をチェック
- フィルターとソートで目標を整理

### 3. 計画の作成（開発予定）
- 貯金計画の設定
- 投資プランの最適化
- ローン活用の検討

## 🔒 プライバシー・セキュリティ

- **ローカルストレージ**: すべてのデータはブラウザのローカルストレージに保存
- **外部送信なし**: 個人データは外部サーバーに送信されません
- **オフライン対応**: インターネット接続なしでも利用可能

## 🎯 ロードマップ

### Phase 1 ✅ (完了)
- [x] 基本的な目標設定機能
- [x] 進捗管理ダッシュボード
- [x] Liquid Glass UI実装
- [x] レスポンシブデザイン

### Phase 2 🚧 (開発中)
- [ ] 貯金計画シミュレーター
- [ ] 投資計画最適化
- [ ] ローン計算機能
- [ ] データエクスポート・インポート

### Phase 3 🔮 (計画中)
- [ ] チャート・グラフ表示
- [ ] 複数シナリオ比較
- [ ] リマインダー機能
- [ ] PWA対応

## 📐 アーキテクチャ

```
src/
├── components/          # Reactコンポーネント
│   ├── ui/             # 再利用可能なUIコンポーネント
│   ├── layout/         # レイアウトコンポーネント
│   └── features/       # 機能別コンポーネント
├── hooks/              # カスタムReactフック
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
├── styles/             # CSS・スタイリング
└── data/               # 定数・モックデータ
```

## 🤝 コントリビューション

プルリクエストやイシューを歓迎します！

### 開発の流れ

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約

- TypeScriptの型安全性を重視
- ESLintとPrettierの設定に従う
- CLAUDE.mdのガイドラインに従う
- アクセシビリティ（a11y）を考慮

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

- **Claude Code**: 開発支援
- **Apple Human Interface Guidelines**: デザインインスピレーション
- **React Community**: 素晴らしいエコシステム

## 📞 サポート

質問やフィードバックがある場合は、GitHubのIssuesをご利用ください。

---

<div align="center">

**Money Planner** - あなたの夢を実現するための資金計画ツール 🎯

Made with ❤️ and [Claude Code](https://claude.ai/code)

</div>