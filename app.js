// app.js — отримує дані про студента з Azure Functions API

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

// Завантаження навичок з /api/skills з progress bars
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

// Викликати при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  loadApiData();
  loadSkills();
});