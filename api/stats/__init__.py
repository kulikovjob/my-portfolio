# api/stats/__init__.py
# Повертає статистику відгуків: кількість, розподіл тональності, топ ключових фраз

import azure.functions as func
import json, os
from collections import Counter
from dotenv import load_dotenv
from azure.cosmos import CosmosClient

load_dotenv()

def main(req: func.HttpRequest) -> func.HttpResponse:
    # Читаємо всі відгуки з Cosmos DB
    client    = CosmosClient(os.getenv('COSMOS_URI'), os.getenv('COSMOS_KEY'))
    db        = client.get_database_client(os.getenv('COSMOS_DATABASE'))
    container = db.get_container_client(os.getenv('COSMOS_CONTAINER'))

    items = list(container.read_all_items())

    # Підраховуємо статистику
    sentiments  = [i.get('sentiment', 'unknown') for i in items]
    sent_counts = Counter(sentiments)

    all_phrases = []
    for item in items:
        all_phrases.extend(item.get('key_phrases', []))
    top_phrases = [phrase for phrase, _ in Counter(all_phrases).most_common(10)]

    stats = {
        'total'        : len(items),
        'positive'     : sent_counts.get('positive', 0),
        'neutral'      : sent_counts.get('neutral',  0),
        'negative'     : sent_counts.get('negative', 0),
        'top_phrases'  : top_phrases,
        'recent'       : sorted(items, key=lambda x: x.get('created_at',''), reverse=True)[:5],
    }

    return func.HttpResponse(
        body    = json.dumps(stats, ensure_ascii=False, indent=2),
        mimetype= 'application/json',
        headers = {'Access-Control-Allow-Origin': '*'}
    )
