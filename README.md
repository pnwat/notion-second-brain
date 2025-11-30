# ChatGPT x Notion Second Brain Integration

ChatGPT で得た知見やメモを Notion の「Second Brain」データベースと同期するためのシステムです。GitHub Actions を介して Node.js スクリプトを実行し、ノートの追加、更新、検索を行います。

## 機能

- **新規作成 (add)**: タイトル、本文、タグ、カテゴリを指定して新しいページを作成します。
- **更新 (update)**: 既存のページIDを指定して、タイトル、タグ、カテゴリの更新や本文の追記を行います。
- **検索 (search)**: タイトルやタグでノートを検索し、ページIDとURLを返します。

## セットアップ

### 1. Notion の準備

1.  Notion で新しいデータベースを作成します（例: "Second Brain"）。
2.  以下のプロパティを設定してください：
    -   **Name** (Title): タイトル
    -   **Category** (Select): カテゴリ (例: Tech, Travel, Finance, Life, Business, Others)
    -   **Tags** (Multi-select): タグ
    -   **Content** (Rich text): 本文 (※スクリプトでは本文をブロックとして追加しますが、プロパティとしても持たせたい場合は作成してください)
3.  [Notion Developers](https://www.notion.so/my-integrations) で新しいインテグレーションを作成し、Internal Integration Token (`NOTION_API_KEY`) を取得します。
4.  作成したデータベースのページ右上の「...」メニューから「Add connections」を選択し、作成したインテグレーションを追加します。
5.  データベースのURLからデータベースID (`NOTION_DB_ID`) を取得します。
    -   `https://www.notion.so/myworkspace/a8aec43384f447ed84390e8e42c2e089?v=...` の場合、`a8aec43384f447ed84390e8e42c2e089` がIDです。

### 2. GitHub Actions の設定

このリポジトリの `Settings` > `Secrets and variables` > `Actions` に以下の Secrets を追加してください：

-   `NOTION_API_KEY`: Notion の Integration Token
-   `NOTION_DB_ID`: Notion の Database ID

## 使い方

GitHub Actions の `workflow_dispatch` イベントをトリガーして実行します。`payload` 入力に JSON 形式でパラメータを渡します。

### 新規作成 (Add)

```json
{
  "action": "add",
  "title": "Stripe Webhook エラー解決",
  "content": "署名検証のエラーだった。シークレットキーを確認すること。",
  "tags": ["Stripe", "Error"],
  "category": "Tech"
}
```

### 検索 (Search)

```json
{
  "action": "search",
  "query": "Stripe"
}
```

### 更新 (Update)

```json
{
  "action": "update",
  "pageId": "ページID (検索結果から取得)",
  "content": "追記：Webhookのタイムアウト設定も確認が必要。",
  "tags": ["Stripe", "Error", "Solved"]
}
```

## ローカルでの実行

`.env` ファイルを作成し、環境変数を設定することでローカルでも実行可能です。

```bash
NOTION_API_KEY=your_secret_key
NOTION_DB_ID=your_database_id
```

実行コマンド:

```bash
# Windows (PowerShell)
$env:PAYLOAD='{"action":"search","query":"Test"}'; node src/index.js
```

## ChatGPT (Custom GPTs) との連携

このリポジトリには `openapi.json` が含まれており、ChatGPT の Custom GPTs から直接このシステムを呼び出すことができます。

1.  **ChatGPT** で「Explore GPTs」→「Create」を選択。
2.  **Configure** タブの **Actions** で「Create new action」をクリック。
3.  **Import from URL** をクリックし、以下の URL を入力して Import します。
    `https://raw.githubusercontent.com/pnwat/notion-second-brain/main/openapi.json`
4.  **Authentication** 設定：
    *   Authentication Type: `API Key`
    *   Auth Type: `Bearer`
    *   API Key: (GitHub で発行した Personal Access Token)
        *   ※Token は GitHub の Settings > Developer settings > Personal access tokens で `repo` と `workflow` 権限を付与して作成してください。

## 開発

### テストの実行

Jest を使用したユニットテストが含まれています。

```bash
npm test
```
