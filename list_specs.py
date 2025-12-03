import os
import sys
from notion_client import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DB_ID = os.getenv("NOTION_DB_ID")

notion = Client(auth=NOTION_API_KEY)

def main():
    query = "仕様書"
    print(f"🔍 '{query}' を含むページを検索中...")
    
    response = notion.search(
        query=query,
        filter={"property": "object", "value": "page"},
        sort={"direction": "descending", "timestamp": "last_edited_time"}
    )
    
    print(f"発見数: {len(response.get('results', []))}")
    print("-" * 80)
    
    for page in response.get("results", []):
        page_id = page["id"]
        
        # タイトル取得
        title_prop = page["properties"].get("名前", {}).get("title", [])
        if not title_prop:
            # プロパティ名が違う場合のフォールバック（念のため）
            for prop in page["properties"].values():
                if prop["type"] == "title":
                    title_prop = prop["title"]
                    break
        
        title = "".join([t.get("plain_text", "") for t in title_prop]) if title_prop else "No Title"
        url = page["url"]
        last_edited = page["last_edited_time"]
        
        print(f"📄 タイトル: {title}")
        print(f"🆔 ID: {page_id}")
        print(f"🔗 URL: {url}")
        print(f"🕒 最終更新: {last_edited}")
        print("-" * 80)

if __name__ == "__main__":
    main()
