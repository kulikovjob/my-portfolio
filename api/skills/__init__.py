# api/skills/__init__.py
# Azure Function — повертає список навичок з рівнем володіння
# GET /api/skills → [{'name': 'Python', 'level': 80}, ...]

import azure.functions as func
import json


def main(req: func.HttpRequest) -> func.HttpResponse:
    skills = [
        {'name': 'Python',         'level': 80},
        {'name': 'Microsoft Azure','level': 65},
        {'name': 'Linux',          'level': 70},
        {'name': 'Git / GitHub',   'level': 85},
        {'name': 'SQL',            'level': 60},
    ]

    return func.HttpResponse(
        body=json.dumps(skills, ensure_ascii=False, indent=2),
        mimetype='application/json',
        headers={'Access-Control-Allow-Origin': '*'}
    )