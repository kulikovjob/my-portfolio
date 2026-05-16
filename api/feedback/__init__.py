# api/feedback/__init__.py
# Azure Function — приймає відгук, аналізує тональність, зберігає у Cosmos DB

import azure.functions as func
import json, os, uuid
from datetime import datetime
from dotenv import load_dotenv
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from azure.cosmos import CosmosClient

load_dotenv()

# ── Ініціалізація клієнтів ──────────────────────────────────────────
def get_ai_client():
    return TextAnalyticsClient(
        endpoint=os.getenv('LANGUAGE_ENDPOINT'),
        credential=AzureKeyCredential(os.getenv('LANGUAGE_KEY'))
    )

def get_cosmos_container():
    client = CosmosClient(os.getenv('COSMOS_URI'), os.getenv('COSMOS_KEY'))
    db     = client.get_database_client(os.getenv('COSMOS_DATABASE'))
    return db.get_container_client(os.getenv('COSMOS_CONTAINER'))

def main(req: func.HttpRequest) -> func.HttpResponse:
    # ── Читаємо тіло запиту ─────────────────────────────────────────
    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            json.dumps({'error': 'Invalid JSON body'}),
            status_code=400, mimetype='application/json'
        )

    text   = body.get('text', '').strip()
    course = body.get('course', 'Невідомий курс')
    author = body.get('author', 'Анонімно')

    if not text:
        return func.HttpResponse(
            json.dumps({'error': 'text is required'}),
            status_code=400, mimetype='application/json'
        )

    # ── Azure AI Language: аналіз тональності ───────────────────────
    ai_client  = get_ai_client()
    sentiments = ai_client.analyze_sentiment([text])
    key_phrases_result = ai_client.extract_key_phrases([text])

    sentiment_doc = sentiments[0]
    sentiment     = sentiment_doc.sentiment          # positive/neutral/negative
    confidence    = {
        'positive': round(sentiment_doc.confidence_scores.positive, 3),
        'neutral' : round(sentiment_doc.confidence_scores.neutral,  3),
        'negative': round(sentiment_doc.confidence_scores.negative, 3),
    }
    key_phrases = list(key_phrases_result[0].key_phrases)

    # ── Формуємо документ для Cosmos DB ─────────────────────────────
    document = {
        'id'         : str(uuid.uuid4()),
        'course'     : course,           # partition key
        'author'     : author,
        'text'       : text,
        'sentiment'  : sentiment,
        'confidence' : confidence,
        'key_phrases': key_phrases,
        'created_at' : datetime.utcnow().isoformat() + 'Z',
    }

    # ── Зберігаємо у Cosmos DB ───────────────────────────────────────
    container = get_cosmos_container()
    container.upsert_item(document)

    # ── Відповідь клієнту ────────────────────────────────────────────
    return func.HttpResponse(
        body    = json.dumps(document, ensure_ascii=False, indent=2),
        mimetype= 'application/json',
        headers = {'Access-Control-Allow-Origin': '*'}
    )
