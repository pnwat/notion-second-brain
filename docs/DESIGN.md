# Notion Second Brain - 内部設計書

## 1. システムアーキテクチャ

本システムは、GitHub Actions をサーバーレスな実行環境として利用し、ChatGPT (クライアント) からの自然言語リクエストを Notion API コールに変換するミドルウェアとして機能します。

```mermaid
graph TD
    User[User (ChatGPT)] -->|OpenAPI Request| GitHubAPI[GitHub API]
    GitHubAPI -->|workflow_dispatch| GHA[GitHub Actions Runner]
    
    subgraph "GitHub Actions Environment"
        GHA -->|Checkout| Code[Source Code]
        GHA -->|Setup Node| Node[Node.js Runtime]
        Node -->|Run| Main[src/index.js]
    end
    
    Main -->|Env Vars| Config[Configuration]
    Main -->|Action Dispatch| Modules[Modules (src/modules/*)]
    
    Modules -->|Read/Write| NotionAPI[Notion API]
    Modules -->|Fetch| GoogleBooks[Google Books API]
    
    Modules -->|Log/Result| Stdout[stdout (JSON)]
    Modules -->|Debug Info| Stderr[stderr (Logs)]
```

---

## 2. モジュール構成と責務

### エントリーポイント
- **`src/index.js`**: 
  - 環境変数 (`process.env`) からパラメータを読み込み。
  - `ACTION` 変数に基づいて適切なモジュールにディスパッチ。
  - 実行結果を JSON 形式で `stdout` に出力（GPTへのレスポンス用）。
  - エラー発生時は JSON エラーレスポンスを生成し、プロセス自体は正常終了(exit 0)させることで GitHub Actions を失敗させない（GPTにエラー内容を伝えるため）。

### コアモジュール (`src/modules/`)
| モジュール | 責務 | 依存関係 |
|------------|------|----------|
| `addNote.js` | 新規ページ作成。テンプレート適用、AIコンテンツフィルタリング、書籍メタデータ取得のトリガー。 | `templateManager`, `enrichBookMetadata`, `markdownConverter` |
| `updateNote.js` | 既存ページ更新。タイトル検索、セクション追記、コンテンツ置換。 | `searchNotes`, `markdownConverter` |
| `searchNotes.js` | Notion Search API ラッパー。タイトルによるページ検索。 | `notionClient` |
| `listRecent.js` | 最新のページ一覧取得。 | `notionClient` |
| `batchUpdate.js` | 複数ページの一括プロパティ更新。 | `notionClient` |
| `exportNote.js` | ページ内容を Markdown として取得。 | `markdownConverter` |
| `manageTemplate.js` | テンプレートファイルの CRUD 操作。 | `fs` |
| `enrichBookMetadata.js` | Google Books API から書誌情報を取得し、Notion プロパティを更新。 | `notionClient` |

### ユーティリティ (`src/utils/`)
- **`notionClient.js`**: Notion SDK の初期化と共通エラーハンドリング。
- **`logger.js`**: ログ出力。**重要**: すべてのログは `stderr` に出力し、`stdout` の JSON レスポンスと混ざらないようにしている。
- **`markdownConverter.js`**: 
  - `markdownToBlocks`: Markdown テキストを Notion Block オブジェクト配列に変換。
  - **特記事項**: 引用記法 `> ## 見出し` を検出し、Notion の「トグル見出し」ブロックに変換するカスタムロジックを含む。
- **`markdownFormatter.js`**: `remark` エコシステムを使用した Markdown の正規化（見出しレベル調整、リスト整形、コード言語検出）。
- **`templateManager.js`**: テンプレートファイルの読み込みと変数置換 (`{{title}}` など)。

---

## 3. データフローと主要ロジック

### 3.1. ノート作成フロー (`add`)
1. **入力**: タイトル、本文、カテゴリ、タグ、テンプレート名。
2. **前処理**:
   - カテゴリが `Book` の場合、タイトルから「読書メモ」などの接尾辞を除去。
   - テンプレートが指定されている（または `Book` カテゴリの）場合、テンプレートを読み込み変数置換。
   - `Book` カテゴリの場合、AIが生成した長文要約（"本書は..."等）が含まれていれば破棄し、テンプレートのみを使用。
3. **Markdown変換**: 本文を `formatMarkdown` で整形後、`convertMarkdownToBlocks` で Notion ブロックに変換。
4. **Notion API**: `pages.create` をコール。
5. **後処理**: `Book` カテゴリの場合、非同期で `enrichBookMetadata` を実行（Google Books API 検索 → プロパティ更新）。

### 3.2. セクション追記フロー (`update` with `section`)
1. **入力**: ページID（またはタイトル）、追記内容、セクション名（例: "クリップ"）。
2. **検索**: 指定されたページ内のブロックを全件取得 (`blocks.children.list`)。
3. **セクション特定**: 
   - 見出しブロック (`heading_1`~`3`) のテキストを正規化（空白除去・小文字化）して比較。
   - 対象が見出しブロックかつ `is_toggleable: true` であるか確認。
4. **追記**: 特定されたトグル見出しブロックの ID に対して `blocks.children.append` を実行。
   - 見つからない場合はページの末尾に追記。

### 3.3. Markdown ↔ Notion 変換ロジック
- ライブラリ `@tryfabric/martian` をベースに使用。
- **カスタム拡張**:
  - **トグル見出し**: Markdown 標準にはないため、引用記法 `> ## Title` を流用。
  - 変換時に `Quote` ブロックの中に `Heading` がある構造を検出し、トップレベルの `Toggle Heading` ブロックに変換して、引用内の他の要素をその子供として再配置する。

---

## 4. エラーハンドリングとログ

### ログ戦略
- **`stdout`**: JSON レスポンスのみを出力。GPT Builder が解析する唯一の出力。
- **`stderr`**: デバッグログ、INFOログ、エラー詳細。GitHub Actions の実行ログで確認用。

### エラーレスポンス
例外発生時は `process.exit(1)` せず、以下の JSON を `stdout` に出力して `process.exit(0)` する。
```json
{
  "status": "error",
  "action": "add",
  "error": {
    "message": "エラーメッセージ",
    "stack": "スタックトレース(DEBUG時のみ)"
  }
}
```
これにより、GitHub Actions 上は「成功」扱いとなり、GPT Builder はレスポンスを受け取ってユーザーに「エラーが発生しました」と伝えることができる。

---

## 5. 保守・拡張ガイド

### 新しいアクションの追加
1. `src/modules/` に新しい JS ファイルを作成（例: `archiveNote.js`）。
2. `src/index.js` の `payload` 作成部分と `handleRequest` (実際には `notionClient.js` 内のディスパッチロジック) に分岐を追加。
3. `.github/workflows/sync.yml` の `inputs` と `env` にパラメータを追加。
4. `openapi.json` の `enum` とプロパティ定義を更新。

### テンプレートの修正
- `templates/` ディレクトリ内の `.md` ファイルを直接編集。
- 変数は `{{variableName}}` の形式で記述。`src/utils/templateManager.js` で置換ロジックを拡張可能。

### 依存ライブラリの更新
- 主要ライブラリ: `@notionhq/client`, `@tryfabric/martian`, `remark`, `unified`.
- `package.json` を更新し `npm install`。
- **注意**: `remark` 系は ESM 化が進んでいるため、CommonJS 環境 (`require`) で動作するバージョン（v13系など）を維持するか、プロジェクト全体を ESM に移行する必要がある。現在は CommonJS を維持。
