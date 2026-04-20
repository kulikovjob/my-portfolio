# My Portfolio - Azure Static Web Apps

## Опис проекту

Це персональне портфоліо, розгорнуте на **Microsoft Azure Static Web Apps** з використанням GitHub Actions CI/CD. Проект включає статичний сайт (HTML/CSS/JS) та Azure Functions для бекенд API.

## Архітектура

```mermaid
graph LR
    A[Розробник] -->|git push| B[GitHub Repository]
    B -->|trigger| C[GitHub Actions]
    C -->|build & deploy| D[Azure Static Web Apps]
    D -->|CDN| E[Браузер користувача]
    D -->|serverless| F[Azure Functions /api/about]
    F -->|JSON| E