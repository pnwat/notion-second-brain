import os
import sys
from notion_client import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DB_ID = os.getenv("NOTION_DB_ID")

notion = Client(auth=NOTION_API_KEY)
database_id = NOTION_DB_ID

def get_page_content(page_id):
    """ページのブロックを取得してテキスト化"""
    blocks = notion.blocks.children.list(block_id=page_id)
    content = []
    
    for block in blocks.get("results", []):
        block_type = block.get("type")
        if block_type == "paragraph":
            text = "".join([t.get("plain_text", "") for t in block.get("paragraph", {}).get("rich_text", [])])
            content.append(text)
        elif block_type in ["heading_1", "heading_2", "heading_3"]:
            text = "".join([t.get("plain_text", "") for t in block.get(block_type, {}).get("rich_text", [])])
            prefix = "#" * int(block_type.split("_")[1])
            content.append(f"\n{prefix} {text}\n")
        elif block_type == "bulleted_list_item":
            text = "".join([t.get("plain_text", "") for t in block.get("bulleted_list_item", {}).get("rich_text", [])])
            content.append(f"- {text}")
        elif block_type == "numbered_list_item":
            text = "".join([t.get("plain_text", "") for t in block.get("numbered_list_item", {}).get("rich_text", [])])
            content.append(f"1. {text}")
        elif block_type == "code":
            text = "".join([t.get("plain_text", "") for t in block.get("code", {}).get("rich_text", [])])
            lang = block.get("code", {}).get("language", "")
            content.append(f"\n```{lang}\n{text}\n```\n")
    
    return "\n".join(content)

def main():
    title_query = "Notion Second Brain 改善提案仕様書（完全版）"
    print(f"🔍 '{title_query}' を検索中...")
    
    response = notion.search(
        query=title_query,
        filter={"property": "object", "value": "page"}
    )
    
    results = []
    db_id_normalized = database_id.replace("-", "")
    for page in response.get("results", []):
        parent = page.get("parent", {})
        parent_db = parent.get("database_id", "") or parent.get("data_source_id", "")
        if parent_db.replace("-", "") == db_id_normalized:
            results.append(page)
            
    if not results:
        print("❌ ページが見つかりませんでした。")
        sys.exit(1)
    
    page = results[0]
    print(f"📄 タイトル: {title_query}")
    print("=" * 80)
    print(get_page_content(page["id"]))
    print("=" * 80)

if __name__ == "__main__":
    main()
