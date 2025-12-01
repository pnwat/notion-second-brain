from notion_client import Client
from dotenv import load_dotenv
import os

load_dotenv()

c = Client(auth=os.getenv('NOTION_API_KEY'))

# 検索
r = c.search(query='改善提案', filter={'property': 'object', 'value': 'page'})

print(f"Found {len(r.get('results', []))} results")

for p in r.get('results', []):
    title_prop = p['properties'].get('名前', {}).get('title', [])
    title = title_prop[0]['plain_text'] if title_prop else 'No title'
    print(f"- {title}")
    print(f"  ID: {p['id']}")
