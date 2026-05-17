// app.js — отримує дані про студента з Azure Functions API

// ========== ТЕМНА ТЕМА ==========
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Перевірка збереженої теми при завантаженні
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// ========== API ЗАВАНТАЖЕННЯ ==========
async function loadApiData() {
  const box = document.getElementById('api-result');
  if (!box) return;

  box.innerHTML = '<div class="student-loading">⏳ Завантаження даних з API...</div>';

  try {
    const response = await fetch('/api/about');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    renderStudentCard(box, data);
  } catch (error) {
    box.innerHTML = '<div class="student-loading" style="color: #e53e3e;">❌ Помилка: ' + error.message + '</div>';
  }
}

function renderStudentCard(container, data) {
  const fields = [
    { key: 'name',      label: '👤 Ім\'я'},
    { key: 'email',     label: '📧 Email'},
    { key: 'specialty', label: '🎓 Спеціальність'},
    { key: 'labs_done', label: '✅ Лабораторні'},
    { key: 'platform',  label: '☁️ Платформа'},
  ];
  const skillsHtml = (data.skills || []).map(s => `<span class="api-tag">${s}</span>`).join('');

  let html = fields.map(f => `
    <div class="info-row">
      <span class="label">${f.label}</span>
      <span class="value">${data[f.key] || '-'}</span>
    </div>`).join('');

  html += `<div class="info-row">
    <span class="label">💪 Навички</span>
    <div class="skills-tags">${skillsHtml}</div>
  </div>`;
  html += `<p class="api-timestamp">🕑 Оновлено: ${data.deployed_at || '-'}</p>`;

  container.innerHTML = html;
}

async function loadSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  try {
    const response = await fetch('/api/skills');
    const skills = await response.json();

    if (!Array.isArray(skills)) throw new Error('Невірний формат даних');

    let html = '';
    for (const skill of skills) {
      html += `
        <div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">${skill.name}</span>
            <span class="skill-percent">${skill.level}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${skill.level}%;"></div>
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<div class="skills-loading" style="color: #e53e3e;">❌ Помилка завантаження навичок</div>';
    console.error('Error loading skills:', error);
  }
}

// ========== ІНІЦІАЛІЗАЦІЯ ==========
document.addEventListener('DOMContentLoaded', () => {
  loadApiData();
  loadSkills();
});

document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.getElementById('feedbackForm');

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const course = document.getElementById('course').value.trim();
      const author = document.getElementById('author').value.trim() || 'Анонімно';
      const text = document.getElementById('feedbackText').value.trim();

      if (!text || !course) {
        alert('Заповніть назву курсу та текст відгуку.');
        return;
      }

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            course: course,
            author: author
          })
        });

        if (!response.ok) {
          throw new Error('Помилка при відправленні відгуку');
        }

        const result = await response.json();

        showFeedbackResult(result);
        feedbackForm.reset();
        loadFeedbackStats();

      } catch (error) {
        console.error(error);
        alert('Не вдалося надіслати відгук. Перевірте роботу API.');
      }
    });
  }

  loadFeedbackStats();
});

function showFeedbackResult(result) {
  const resultBlock = document.getElementById('feedbackResult');

  document.getElementById('resultSentiment').textContent = result.sentiment || 'невідомо';

  if (result.confidence) {
    document.getElementById('resultConfidence').textContent =
      `positive: ${result.confidence.positive}, neutral: ${result.confidence.neutral}, negative: ${result.confidence.negative}`;
  } else {
    document.getElementById('resultConfidence').textContent = 'немає даних';
  }

  if (result.key_phrases && result.key_phrases.length > 0) {
    document.getElementById('resultPhrases').textContent = result.key_phrases.join(', ');
  } else {
    document.getElementById('resultPhrases').textContent = 'ключові фрази не знайдено';
  }

  resultBlock.classList.remove('hidden');
}

async function loadFeedbackStats() {
  try {
    const response = await fetch('/api/stats');

    if (!response.ok) {
      throw new Error('Помилка завантаження статистики');
    }

    const stats = await response.json();

    document.getElementById('totalReviews').textContent = stats.total ?? 0;
    document.getElementById('positiveReviews').textContent = stats.positive ?? 0;
    document.getElementById('neutralReviews').textContent = stats.neutral ?? 0;
    document.getElementById('negativeReviews').textContent = stats.negative ?? 0;

    const topPhrasesList = document.getElementById('topPhrases');
    topPhrasesList.innerHTML = '';

    if (stats.top_phrases && stats.top_phrases.length > 0) {
      stats.top_phrases.forEach((phrase) => {
        const li = document.createElement('li');
        li.textContent = phrase;
        topPhrasesList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'Ключові фрази поки відсутні';
      topPhrasesList.appendChild(li);
    }

  } catch (error) {
    console.error(error);
  }
}