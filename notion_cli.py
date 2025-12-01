#!/usr/bin/env python3
"""
Notion CLI - ローカルから Notion ページを閲覧・操作するツール
"""
import os
import sys
from notion_client import Client
from dotenv import load_dotenv

# .env ファイルから環境変数を読み込み
load_dotenv()

# Notion クライアントの初期化
notion = Client(auth=os.getenv("NOTION_API_KEY"))
database_id = os.getenv("NOTION_DB_ID")


def search_page_by_title(title):
    """タイトルでページを検索"""
    # データベース内を検索
    response = notion.search(
        query=title,
        filter={"property": "object", "value": "page"}
    )
    
    # データベース内のページのみフィルタ
    results = []
    db_id_normalized = database_id.replace("-", "")
    for page in response.get("results", []):
        parent = page.get("parent", {})
        parent_db = parent.get("database_id", "") or parent.get("data_source_id", "")
        if parent_db.replace("-", "") == db_id_normalized:
            results.append(page)
    
    return results


def get_page_content(page_id):
    """ページの本文を取得"""
    blocks = notion.blocks.children.list(block_id=page_id)
    content = []
    
    for block in blocks.get("results", []):
        block_type = block.get("type")
        
        if block_type == "paragraph":
            text = "".join([
                t.get("plain_text", "") 
                for t in block.get("paragraph", {}).get("rich_text", [])
            ])
            if text:
                content.append(text)
        
        elif block_type == "heading_1":
            text = "".join([
                t.get("plain_text", "") 
                for t in block.get("heading_1", {}).get("rich_text", [])
            ])
            content.append(f"\n# {text}\n")
        
        elif block_type == "heading_2":
            text = "".join([
                t.get("plain_text", "") 
                for t in block.get("heading_2", {}).get("rich_text", [])
            ])
            content.append(f"\n## {text}\n")
        
        elif block_type == "heading_3":
            text = "".join([
                t.get("plain_text", "") 
                for t in block.get("heading_3", {}).get("rich_text", [])
            ])
            content.append(f"\n### {text}\n")
        
        elif block_type == "bulleted_list_item":
            text = "".join([
                t.get("plain_text", "") 
                for t in block.get("bulleted_list_item", {}).get("rich_text", [])
            ])
            content.append(f"- {text}")
        
        elif block_type == "numbered_list_item":
            text = "".join([
                t.get("plain_text", "") 
                for t in block.get("numbered_list_item", {}).get("rich_text", [])
            ])
            content.append(f"1. {text}")
        
        elif block_type == "code":
            text = "".join([
                t.get("plain_text", "") 
                for t in block.get("code", {}).get("rich_text", [])
            ])
            language = block.get("code", {}).get("language", "")
            content.append(f"\n```{language}\n{text}\n```\n")
        
        elif block_type == "quote":
            text = "".join([
                t.get("plain_text", "") 
                for t in block.get("quote", {}).get("rich_text", [])
            ])
            content.append(f"> {text}")
    
    return "\n".join(content)


def view_page(title):
    """ページを検索して内容を表示"""
    print(f"🔍 '{title}' を検索中...")
    
    results = search_page_by_title(title)
    
    if not results:
        print(f"❌ '{title}' というタイトルのページが見つかりませんでした。")
        return
    
    if len(results) > 1:
        print(f"⚠️  {len(results)} 件のページが見つかりました。最初のページを表示します。\n")
    
    page = results[0]
    page_id = page["id"]
    
    # タイトルを取得
    title_prop = page["properties"].get("名前", {}).get("title", [])
    page_title = title_prop[0]["plain_text"] if title_prop else "(無題)"
    page_url = page["url"]
    
    print(f"📄 タイトル: {page_title}")
    print(f"🔗 URL: {page_url}")
    print("=" * 80)
    print()
    
    content = get_page_content(page_id)
    print(content)
    print()
    print("=" * 80)


def list_pages():
    """データベース内の全ページを一覧表示"""
    print("📚 ページ一覧を取得中...")
    
    # データベース情報を取得
    db = notion.databases.retrieve(database_id=database_id)
    
    # 全ページを検索
    response = notion.search(
        filter={"property": "object", "value": "page"}
    )
    
    # このデータベースのページのみフィルタ
    results = []
    db_id_normalized = database_id.replace("-", "")
    for page in response.get("results", []):
        parent = page.get("parent", {})
        parent_db = parent.get("database_id", "") or parent.get("data_source_id", "")
        if parent_db.replace("-", "") == db_id_normalized:
            results.append(page)
    
    if not results:
        print("❌ ページが見つかりませんでした。")
        return
    
    print(f"\n📋 {len(results)} 件のページが見つかりました:\n")
    
    for i, page in enumerate(results, 1):
        title_prop = page["properties"].get("名前", {}).get("title", [])
        title = title_prop[0]["plain_text"] if title_prop else "(無題)"
        
        category_prop = page["properties"].get("カテゴリ", {}).get("select")
        category = category_prop.get("name", "") if category_prop else ""
        
        tags = [t["name"] for t in page["properties"].get("タグ", {}).get("multi_select", [])]
        
        print(f"{i}. {title}")
        if category:
            print(f"   カテゴリ: {category}")
        if tags:
            print(f"   タグ: {', '.join(tags)}")
        print()


def main():
    if len(sys.argv) < 2:
        print("使い方:")
        print("  python notion_cli.py view <タイトル>  - ページを表示")
        print("  python notion_cli.py list             - 全ページ一覧")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "view":
        if len(sys.argv) < 3:
            print("❌ タイトルを指定してください")
            print("例: python notion_cli.py view 'Notion Second Brain'")
            sys.exit(1)
        
        title = sys.argv[2]
        view_page(title)
    
    elif command == "list":
        list_pages()
    
    else:
        print(f"❌ 不明なコマンド: {command}")
        print("使用可能なコマンド: view, list")
        sys.exit(1)


if __name__ == "__main__":
    main()
