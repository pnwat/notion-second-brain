# Notion Second Brain - Gemini Client (GAS)

Google Apps Script (GAS) を使用して、ブラウザから Gemini 経由で Notion を操作できるチャットアプリです。

## セットアップ手順

### 1. GAS プロジェクトの作成
1. [Google Apps Script](https://script.google.com/) にアクセスし、「新しいプロジェクト」を作成します。
2. プロジェクト名を「Notion Second Brain AI」などに変更します。

### 2. ファイルの作成
以下のファイルを GAS エディタで作成し、このディレクトリ内の同名ファイルの内容をコピペしてください。

- **`Code.gs`**: 既存の `Code.gs` を上書き
- **`Index.html`**: 新規作成 (HTML)
- **`Stylesheet.html`**: 新規作成 (HTML)
- **`JavaScript.html`**: 新規作成 (HTML)

### 3. スクリプトプロパティの設定
GAS エディタの左側メニュー「プロジェクトの設定」(歯車アイコン) > 「スクリプト プロパティ」を開き、以下を追加します。

| プロパティ | 値 | 説明 |
|------------|----|------|
| `GEMINI_API_KEY` | `AIza...` | Google AI Studio で取得した API キー |
| `GITHUB_TOKEN` | `ghp_...` | GitHub Personal Access Token (repo, workflow) |
| `GITHUB_OWNER` | `pnwat` | GitHub ユーザー名 |
| `GITHUB_REPO` | `notion-second-brain` | リポジトリ名 |

### 4. デプロイ
1. 右上の「デプロイ」ボタン > 「新しいデプロイ」を選択。
2. 「種類の選択」の歯車アイコン > 「ウェブアプリ」を選択。
3. 設定:
   - **説明**: `v1` など
   - **次のユーザーとして実行**: `自分`
   - **アクセスできるユーザー**: `自分のみ` (または `Google アカウントを持つ全員`)
4. 「デプロイ」をクリック。
5. 表示された **ウェブアプリ URL** をコピーして、ブラウザで開きます。

## 使い方
チャット画面が開いたら、以下のように話しかけてください。

- 「Clean Code の読書メモを追加して」
- 「最近のノートを教えて」
- 「クリップに『テスト』と追記して」

## 注意事項
- 無料枠の Gemini API を使用しているため、過度なリクエストは制限される場合があります。
- GitHub Actions の実行には数秒〜数十秒かかります。完了メッセージが表示されるまでお待ちください。
