# api/about/__init__.py
# Azure Function — повертає інформацію про студента у форматі JSON
# GET /api/about → {'name': '...', 'specialty': '...', ...}

import azure.functions as func
import json
from datetime import datetime


def main(req: func.HttpRequest) -> func.HttpResponse:
    # ── ВАШІ ДАНІ: замініть на свої ────────────────────────────
    student_data = {
        'name': 'Куликов Вадим Володимирович',
        'email': 'kulikov.vadim@stud.onu.edu.ua',
        'specialty': 'Комп\'ютерна інженерія (Магістр, 1 курс)',
        'skills': ['Python', 'Azure', 'GitHub', 'Linux', 'SQL'],
        'labs_done': 2,
        'platform': 'Azure Static Web Apps (PaaS)',
        'deployed_at': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
    }
    # ────────────────────────────────────────────────────────────

    return func.HttpResponse(
        body=json.dumps(student_data, ensure_ascii=False, indent=2),
        mimetype='application/json',
        headers={'Access-Control-Allow-Origin': '*'}
    )
