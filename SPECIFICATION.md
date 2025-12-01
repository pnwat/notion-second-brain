# Notion Second Brain 統合システム - 機能仕様書

## 概要
ChatGPT で得た知見やメモを Notion の「Second Brain」データベースと双方向で同期できるシステム。
ChatGPT の Custom GPTs から自然言語で指示するだけで、Notion へのノート保存・検索・更新が可能。

## アーキテクチャ
- **フロントエンド**: ChatGPT Custom GPTs (自然言語インターフェース)
- **バックエンド**: GitHub Actions (Node.js スクリプト実行環境)
- **データベース**: Notion Database
- **認証**: GitHub Secrets (NOTION_API_KEY, NOTION_DB_ID)

## 技術スタック
- Node.js 18
- @notionhq/client (Notion API SDK)
- GitHub Actions (workflow_dispatch)
- OpenAPI 3.1.0 (ChatGPT Actions 定義)

## Notion データベース構造
### 必須プロパティ
- **名前** (タイトル型): ページのタイトル
- **カテゴリ** (セレクト型): 大分類 (例: Tech, ビジネス, 学習, アイデア, メモ, その他)
- **タグ** (マルチセレクト型): 細かいトピック (例: Python, React, マーケティング)

### 推奨プロパティ
- **作成日時** (作成日時型): 自動記録
- **最終更新日時** (最終更新日時型): 自動記録

### 本文
ページの中身（ブロック）として保存。プロパティではなくページコンテンツとして管理。

## 主要機能

### 1. ノート追加 (add)
**入力パラメータ**:
- `title` (必須): ノートのタイトル
- `content` (必須): ノートの本文
- `category` (任意): カテゴリ (デフォルト: "Others")
- `tags` (任意): タグ (カンマ区切り文字列)

**動作**:
1. Notion データベースに新規ページを作成
2. プロパティ (名前、カテゴリ、タグ) を設定
3. 本文をページコンテンツとして追加
4. 作成されたページの URL を返す

**ChatGPT での使用例**:
- "Stripe の Webhook エラー解決方法を保存して。カテゴリは Tech で"
- "今日のアイデアをメモ。タイトルは『新サービス案』、カテゴリはビジネス"

### 2. ノート検索 (search)
**入力パラメータ**:
- `query` (必須): 検索キーワード

**動作**:
1. Notion データベースを検索 (タイトルとタグで OR 検索)
2. マッチしたページの一覧を返す (ID, タイトル, URL)

**ChatGPT での使用例**:
- "Stripe タグのノート一覧を見せて"
- "React に関するメモを探して"

### 3. ノート更新 (update)
**入力パラメータ**:
- `title` (任意): 更新対象ページのタイトル (自動検索)
- `pageId` (任意): 更新対象ページの ID (直接指定)
- `content` (任意): 追記する本文
- `category` (任意): 更新後のカテゴリ
- `tags` (任意): 更新後のタグ

**動作**:
1. タイトルまたは pageId でページを特定
2. タイトルのみ指定の場合、自動的に検索してページを取得
3. プロパティ (カテゴリ、タグ) を更新
4. 本文が指定されている場合、既存の本文の下に追記
5. 更新されたページの URL を返す

**ChatGPT での使用例**:
- "『テスト』というページに追記して。内容は『追加情報です』"
- "Stripe のノートにタグ『解決済み』を追加"

## 実装の特徴

### 自動ページ検索
- `update` 機能でタイトルのみ指定された場合、自動的に検索してページを特定
- 複数マッチした場合は最初の結果を使用

### エラーハンドリング
- ページが見つからない場合: エラーメッセージを返す
- プロパティ名の不一致: Notion 側のプロパティ名と完全一致が必要
- API エラー: 詳細なエラーログを出力

### 日本語対応
- プロパティ名は日本語 (`名前`, `カテゴリ`, `タグ`)
- 本文も日本語に完全対応

## ワークフロー

### GitHub Actions
- **トリガー**: `workflow_dispatch` (手動実行 / API 経由)
- **入力**: 個別フィールド (action, title, content, category, tags, pageId, query)
- **環境変数**: NOTION_API_KEY, NOTION_DB_ID (GitHub Secrets)
- **実行**: Node.js スクリプト (`src/index.js`)

### ChatGPT Custom GPT
- **認証**: GitHub Personal Access Token (Bearer)
- **権限**: `repo`, `workflow`
- **OpenAPI 定義**: `openapi.json` (GitHub リポジトリから Import)
- **制約**: 毎回ユーザーの許可が必要 (ChatGPT の仕様)

## セキュリティ
- Notion API キーは GitHub Secrets で管理
- GitHub Actions は Public リポジトリで無制限実行
- ChatGPT からの API 呼び出しは Bearer トークン認証

## 制限事項
1. **本文の完全置き換え不可**: 追記のみ可能 (Notion API の仕様)
2. **ChatGPT の許可ボタン**: 毎回ユーザーの明示的な許可が必要
3. **検索の精度**: 部分一致検索のため、複数マッチする可能性あり
4. **タイトル検索の制約**: 完全一致ではなく部分一致

## 今後の改善案
- [ ] 本文の完全置き換え機能
- [ ] より高度な検索 (日付範囲、複数条件)
- [ ] ノート削除機能
- [ ] ノート統合機能 (重複排除)
- [ ] タグの自動提案
- [ ] カテゴリの自動分類 (AI)
- [ ] Chrome 拡張機能 (許可ボタン不要化)
- [ ] 最近のノート一覧表示
- [ ] お気に入り機能

## ディレクトリ構成
```
notion-second-brain/
├── .github/workflows/
│   └── sync.yml           # GitHub Actions ワークフロー
├── src/
│   ├── notion.js          # Notion クライアント初期化
│   ├── add.js             # ノート追加機能
│   ├── update.js          # ノート更新機能
│   ├── search.js          # ノート検索機能
│   └── index.js           # メインエントリーポイント
├── tests/
│   ├── add.test.js        # add 機能のテスト
│   ├── update.test.js     # update 機能のテスト
│   └── search.test.js     # search 機能のテスト
├── openapi.json           # ChatGPT Actions 定義
├── package.json           # 依存関係
├── .env.example           # 環境変数のサンプル
└── README.md              # セットアップガイド
```

## 使用例シナリオ

### シナリオ1: 技術メモの保存
```
ユーザー: "Stripe の Webhook 署名検証エラーの解決方法を保存して。
          カテゴリは Tech、タグは Stripe と Error で"

システム: ✓ 新規ページ作成
          タイトル: "Stripe の Webhook 署名検証エラーの解決方法"
          カテゴリ: Tech
          タグ: Stripe, Error
          URL: https://notion.so/xxxxx
```

### シナリオ2: 過去のメモ検索
```
ユーザー: "Stripe 関連のノートを探して"

システム: 検索結果:
          1. Stripe の Webhook 署名検証エラーの解決方法
          2. Stripe API の使い方メモ
```

### シナリオ3: メモの追記
```
ユーザー: "『Stripe の Webhook』というページに追記。
          内容は『タイムアウト設定も確認が必要』"

システム: ✓ ページ更新完了
          既存の本文の下に追記しました
```
