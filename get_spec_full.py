import os
import sys
from notion_client import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DB_ID = os.getenv("NOTION_DB_ID")

notion = Client(auth=NOTION_API_KEY)

def get_block_content(block):
    """ブロックの種類に応じてテキストを抽出"""
    block_type = block.get("type")
    content = ""
    prefix = ""
    suffix = ""
    
    if block_type == "paragraph":
        content = "".join([t.get("plain_text", "") for t in block.get("paragraph", {}).get("rich_text", [])])
    elif block_type in ["heading_1", "heading_2", "heading_3"]:
        content = "".join([t.get("plain_text", "") for t in block.get(block_type, {}).get("rich_text", [])])
        level = int(block_type.split("_")[1])
        prefix = "#" * level + " "
        suffix = "\n"
    elif block_type == "bulleted_list_item":
        content = "".join([t.get("plain_text", "") for t in block.get("bulleted_list_item", {}).get("rich_text", [])])
        prefix = "- "
    elif block_type == "numbered_list_item":
        content = "".join([t.get("plain_text", "") for t in block.get("numbered_list_item", {}).get("rich_text", [])])
        prefix = "1. "
    elif block_type == "to_do":
        text = "".join([t.get("plain_text", "") for t in block.get("to_do", {}).get("rich_text", [])])
        checked = block.get("to_do", {}).get("checked", False)
        prefix = "- [x] " if checked else "- [ ] "
        content = text
    elif block_type == "toggle":
        content = "".join([t.get("plain_text", "") for t in block.get("toggle", {}).get("rich_text", [])])
        prefix = "> "
    elif block_type == "code":
        content = "".join([t.get("plain_text", "") for t in block.get("code", {}).get("rich_text", [])])
        lang = block.get("code", {}).get("language", "")
        prefix = f"\n```{lang}\n"
        suffix = "\n```\n"
    elif block_type == "callout":
        content = "".join([t.get("plain_text", "") for t in block.get("callout", {}).get("rich_text", [])])
        prefix = "💡 "
    elif block_type == "quote":
        content = "".join([t.get("plain_text", "") for t in block.get("quote", {}).get("rich_text", [])])
        prefix = "> "
    
    return f"{prefix}{content}{suffix}"

def get_children_recursive(block_id, depth=0):
    """再帰的にブロックを取得"""
    results = []
    has_more = True
    start_cursor = None
    
    while has_more:
        response = notion.blocks.children.list(block_id=block_id, start_cursor=start_cursor)
        blocks = response.get("results", [])
        has_more = response.get("has_more")
        start_cursor = response.get("next_cursor")
        
        for block in blocks:
            text = get_block_content(block)
            indent = "  " * depth
            if text.strip():
                results.append(f"{indent}{text}")
            
            if block.get("has_children"):
                children_text = get_children_recursive(block["id"], depth + 1)
                results.extend(children_text)
                
    return results

def main():
    # ID of "Notion Second Brain 仕様書データベース"
    page_id = "2bcb6f07-73e2-8113-b17e-e99c4ae334aa" 
    
    print(f"📄 ページID {page_id} の全コンテンツを取得中...")
    print("=" * 80)
    
    content_lines = get_children_recursive(page_id)
    print("\n".join(content_lines))
    
    print("=" * 80)

if __name__ == "__main__":
    main()
