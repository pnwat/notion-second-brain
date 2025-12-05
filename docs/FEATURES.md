# Notion Second Brain - 機能仕様書

## 概要

ChatGPT と Notion を連携し、自然言語で Notion データベースにノートを追加・更新・検索できるシステム。GitHub Actions を介して実行される。

---

## アーキテクチャ

```
ChatGPT (GPT Builder)
    ↓ OpenAPI Schema
GitHub API (workflow_dispatch)
    ↓
GitHub Actions (sync.yml)
    ↓
Node.js Application
    ↓
Notion API
```

---

## アクション一覧

| アクション | 説明 | 主要パラメータ |
|-----------|------|---------------|
| `add` | 新規ノート作成 | `title`, `content`, `category`, `tags`, `template` |
| `update` | 既存ノート更新 | `title`/`pageId`, `content`, `mode`, `section` |
| `search` | ノート検索 | `query`, `limit` |
| `list_recent` | 最近のノート一覧 | `limit` |
| `batch_update` | 一括更新 | `updates` (JSON配列) |
| `export` | ノートのエクスポート | `pageId`, `title` |
| `manage_template` | テンプレート管理 | `subAction`, `name`, `content` |

---

## 機能詳細

### 1. ノート作成 (`add`)

**パラメータ:**
- `title` (必須): ノートのタイトル
- `content`: 本文（Markdown対応）
- `category`: カテゴリ (`Tech`, `Travel`, `Finance`, `Life`, `Business`, `Others`, `Book`, `読書`)
- `tags`: カンマ区切りのタグ
- `template`: 使用するテンプレート名

**特殊機能:**
- **テンプレート自動適用**: `category` が `Book`/`読書` の場合、`book_note` テンプレートが自動適用
- **AI生成コンテンツフィルタリング**: 200文字超や「本書は」「概要」等を含むコンテンツは自動除外
- **タイトルクリーニング**: 「読書メモ」「メモ」等の接尾辞を自動除去
- **書籍メタデータ自動取得**: Google Books API から著者・出版社・ISBN等を取得

---

### 2. ノート更新 (`update`)

**パラメータ:**
- `title` または `pageId`: 更新対象の特定
- `content`: 追加/置換するコンテンツ
- `mode`: `append`（追記）または `replace`（置換）
- `section`: 追記先のセクション名（例: `クリップ`, `感想`）

**特殊機能:**
- **タイトル検索**: `pageId` がなくても `title` で自動検索
- **セクション指定追記**: トグル見出し内への追記が可能
- **自動フォーマット**: Markdown の見出しレベル正規化、コード言語自動検出

---

### 3. 検索 (`search`)

**パラメータ:**
- `query`: 検索クエリ
- `limit`: 結果件数の上限

**戻り値:**
- マッチしたノートのタイトル、URL、カテゴリ、タグ一覧

---

### 4. 最近のノート一覧 (`list_recent`)

**パラメータ:**
- `limit`: 取得件数（デフォルト: 10）

**戻り値:**
- 作成日時の新しい順にノート一覧

---

### 5. 一括更新 (`batch_update`)

**パラメータ:**
- `updates`: JSON配列形式の更新指示
  ```json
  [
    {"pageId": "xxx", "category": "Tech"},
    {"pageId": "yyy", "tags": "tag1,tag2"}
  ]
  ```

---

### 6. エクスポート (`export`)

**パラメータ:**
- `pageId` または `title`: エクスポート対象

**戻り値:**
- ノートの本文を Markdown 形式で出力

---

### 7. テンプレート管理 (`manage_template`)

**サブアクション:**
- `list`: 利用可能なテンプレート一覧
- `get`: テンプレート内容の取得
- `save`: テンプレートの保存

**変数置換:**
テンプレート内の `{{title}}` は自動的にノートタイトルに置換される。

---

## ユーティリティ機能

### Markdown 変換 (`markdownConverter.js`)

- Markdown → Notion ブロック変換
- **トグル見出し変換**: `> ## 見出し` 記法をトグル見出しに変換
- 逆変換（ブロック → Markdown）もサポート

### Markdown フォーマッター (`markdownFormatter.js`)

- **見出しレベル正規化**: H1が1つになるよう調整、レベルジャンプを防止
- **リスト構造正規化**: 番号付きリストは1から開始
- **コード言語自動検出**: JavaScript, Python, SQL 等を自動判定

---

## テンプレート

### `book_note.md` (読書メモ用)

```markdown
# {{title}}

> ## クリップ
> - 

> ## 感想
```

トグル見出しとして展開され、セクション単位での追記が可能。

---

## カテゴリ一覧

| カテゴリ | 説明 |
|---------|------|
| `Tech` | 技術関連 |
| `Travel` | 旅行 |
| `Finance` | 金融・投資 |
| `Life` | 生活 |
| `Business` | ビジネス |
| `Others` | その他 |
| `Book` / `読書` | 読書メモ（テンプレート自動適用） |

---

## 環境変数 (GitHub Secrets)

| 変数名 | 説明 |
|--------|------|
| `NOTION_API_KEY` | Notion インテグレーションのシークレット |
| `NOTION_DB_ID` | 対象データベースのID |

---

## GPT Builder 設定

### OpenAPI スキーマ

バージョン: `1.6.3`

スキーマファイル: `openapi.json`

### 推奨 Instructions

読書メモ作成時:
- `title`: 書籍タイトルのみ（「読書メモ」等を付けない）
- `content`: 空または短い感想のみ
- `category`: `Book`

---

## ファイル構成

```
notion-second-brain/
├── src/
│   ├── index.js              # エントリーポイント
│   ├── notionClient.js       # リクエストハンドラー
│   ├── notion.js             # Notion API クライアント
│   ├── modules/
│   │   ├── addNote.js        # ノート作成
│   │   ├── updateNote.js     # ノート更新
│   │   ├── searchNotes.js    # 検索
│   │   ├── listRecent.js     # 最近のノート
│   │   ├── batchUpdate.js    # 一括更新
│   │   ├── exportNote.js     # エクスポート
│   │   ├── manageTemplate.js # テンプレート管理
│   │   └── enrichBookMetadata.js # 書籍メタデータ取得
│   └── utils/
│       ├── logger.js         # ログ出力
│       ├── markdownConverter.js   # Markdown↔Notion変換
│       ├── markdownFormatter.js   # Markdown整形
│       └── templateManager.js     # テンプレート処理
├── templates/
│   ├── book_note.md          # 読書メモテンプレート
│   └── daily_report.md       # 日報テンプレート
├── .github/workflows/
│   └── sync.yml              # GitHub Actions ワークフロー
└── openapi.json              # GPT Builder 用スキーマ
```

---

## 既知の制限事項

1. **GitHub Actions の inputs 上限**: 最大10個
2. **Notion API のレート制限**: 3リクエスト/秒
3. **コンテンツサイズ**: ブロックあたり2000文字まで（自動分割対応済み）
