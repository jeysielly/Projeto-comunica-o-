/* ===========================
   Dados (exemplo) - edite conforme precisar
   =========================== */
const avisos = [
  { titulo: "Aviso Recente", descricao: "Mudança no horário de aula para às 14h." }
];

const eventos = [
  { titulo: "Prova de História", data: "15/10/2023", tipo: "prova", descricao: "Prova sobre história antiga." },
  { titulo: "Evento Cultural", data: "20/10/2023", tipo: "evento-cultural", descricao: "Festival de artes na escola." },
  { titulo: "Reunião com Pais", data: "25/10/2023", tipo: "reuniao", descricao: "Discussão sobre o ano letivo." }
  // Adicione mais eventos com data no formato DD/MM/YYYY
];

/* ===========================
   Utilitários de data
   =========================== */
// Converte "dd/mm/yyyy" para Date (meio-dia local para evitar offset)
function parseDateDDMMYYYY(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(p => parseInt(p, 10));
  if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return null;
  return new Date(y, m - 1, d, 12, 0, 0);
}

// Formata data para exibição curta dd/mm/yyyy (fallback)
function formatDateShort(date) {
  if (!(date instanceof Date)) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/* ===========================
   Inicialização DOM
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  // Aviso recente
  const avisoRecenteDiv = document.getElementById('aviso-recente');
  avisoRecenteDiv.textContent = '';
  if (avisos.length > 0) {
    avisoRecenteDiv.innerHTML = `<p><strong>${escapeHtml(avisos[0].titulo)}:</strong> ${escapeHtml(avisos[0].descricao)}</p>`;
  } else {
    avisoRecenteDiv.textContent = 'Nenhum aviso recente.';
  }

  // Próximos 3 eventos (ordenados)
  const proximosEventosUl = document.getElementById('proximos-eventos');
  proximosEventosUl.innerHTML = '';
  const eventosOrdenados = eventos
    .map(e => ({ ...e, _dateObj: parseDateDDMMYYYY(e.data) }))
    .filter(e => e._dateObj)
    .sort((a, b) => a._dateObj - b._dateObj);

  eventosOrdenados.slice(0, 3).forEach(ev => {
    const li = document.createElement('li');
    li.innerHTML = `${escapeHtml(ev.titulo)} - <strong>${escapeHtml(ev.data)}</strong>`;
    proximosEventosUl.appendChild(li);
  });

  // Calendário do mês atual
  renderCalendarGrid();

  // Filtro de eventos
  const filtroSelect = document.getElementById('filtro-evento');
  const eventosUl = document.getElementById('calendario-eventos');

  function exibirEventos(filtro) {
    eventosUl.innerHTML = '';
    eventosOrdenados.forEach(evento => {
      if (filtro === 'todos' || evento.tipo === filtro) {
        const li = document.createElement('li');
        li.tabIndex = 0;
        li.setAttribute('role','button');
        li.innerHTML = `<strong>${escapeHtml(evento.titulo)}</strong> — ${escapeHtml(evento.data)}<div class="small">${escapeHtml(evento.descricao || '')}</div>`;
        li.onclick = () => openModal(evento.titulo, evento.descricao || 'Detalhes não disponíveis.');
        li.onkeypress = (e) => { if (e.key === 'Enter' || e.key === ' ') li.click(); };
        eventosUl.appendChild(li);
      }
    });
    if (!eventosUl.hasChildNodes()) {
      eventosUl.innerHTML = '<li class="small-text">Nenhum evento encontrado para o filtro selecionado.</li>';
    }
  }

  filtroSelect.addEventListener('change', (e) => exibirEventos(e.target.value));
  exibirEventos('todos');

  // Formulário
  const form = document.getElementById('form-feedback');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nomeInput = document.getElementById('nome');
    const sugestaoInput = document.getElementById('sugestao');
    const nomeError = document.getElementById('nome-error');
    const sugestaoError = document.getElementById('sugestao-error');

    nomeError.textContent = '';
    sugestaoError.textContent = '';

    const nome = nomeInput.value.trim();
    const sugestao = sugestaoInput.value.trim();

    if (!nome) {
      nomeError.textContent = 'Nome é obrigatório.';
      nomeInput.focus();
      return;
    }
    if (!sugestao) {
      sugestaoError.textContent = 'Sugestão é obrigatória.';
      sugestaoInput.focus();
      return;
    }

    // Persistir sugestão no localStorage (simula envio)
    const saved = JSON.parse(localStorage.getItem('comunica_sugestoes_v1') || '[]');
    saved.unshift({
      nome,
      sugestao,
      status: 'Recebida',
      data: new Date().toISOString()
    });
    localStorage.setItem('comunica_sugestoes_v1', JSON.stringify(saved));

    // Atualizar UI (apensar no histórico local)
    alert('Sugestão enviada com sucesso! Obrigado por contribuir.');
    form.reset();
    // opcional: atualizar lista de status — não sobrescrevemos os itens estáticos
  });

  // Modal functions (exposed to global)
  window.openModal = (title, content) => {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').textContent = content;
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
    // foco para acessibilidade
    modal.querySelector('.close-btn').focus();
  };

  window.closeModal = () => {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
  };

  // Close modal on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal');
      if (modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
    }
  });

  // Theme toggle + persistência
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('comunica_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
    themeToggle.setAttribute('aria-pressed','true');
  } else {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    themeToggle.setAttribute('aria-pressed','false');
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('comunica_theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i> Modo Escuro' : '<i class="fas fa-sun"></i> Modo Claro';
    themeToggle.setAttribute('aria-pressed', String(isDark));
  });

  // Back to top
  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Scroll animations: reveal sections on scroll (simple)
  window.addEventListener('scroll', () => {
    document.querySelectorAll('section').forEach(section => {
      if (window.scrollY + window.innerHeight > section.offsetTop + 100) {
        section.classList.add('fade-in');
      }
    });
  });

  // Initial reveal
  document.querySelectorAll('section').forEach(s => s.classList.add('fade-in'));
});

/* ===========================
   Render calendar grid
   =========================== */
function renderCalendarGrid() {
  const calendarioGrid = document.getElementById('calendario-grid');
  calendarioGrid.innerHTML = '';
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-index
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0 = domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add blanks for the first week (so the 1st lands on correct weekday)
  for (let i = 0; i < startWeekday; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-day blank';
    blank.setAttribute('aria-hidden','true');
    calendarioGrid.appendChild(blank);
  }

  // Map eventos para datas
  const eventosPorDia = {};
  eventos.forEach(ev => {
    const dt = parseDateDDMMYYYY(ev.data);
    if (!dt) return;
    if (dt.getFullYear() !== year || dt.getMonth() !== month) return; // somente mês atual
    const day = dt.getDate();
    eventosPorDia[day] = eventosPorDia[day] || [];
    eventosPorDia[day].push(ev);
  });

  for (let d = 1; d <= daysInMonth; d++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = d;
    dayDiv.appendChild(dayNumber);

    if (eventosPorDia[d]) {
      eventosPorDia[d].forEach(ev => {
        const span = document.createElement('span');
        span.className = 'event-dot';
        span.textContent = labelForTipo(ev.tipo);
        span.title = `${ev.titulo} — ${ev.data}`;
        // style de cor por tipo
        span.style.background = colorForTipo(ev.tipo);
        span.tabIndex = 0;
        span.onclick = () => openModal(ev.titulo, ev.descricao || 'Detalhes não disponíveis.');
        span.onkeypress = (e) => { if (e.key === 'Enter' || e.key === ' ') span.click(); };
        dayDiv.appendChild(span);
      });
    }

    calendarioGrid.appendChild(dayDiv);
  }
}

/* ===========================
   Helpers visuais e segurança
   =========================== */
function labelForTipo(tipo) {
  switch (tipo) {
    case 'prova': return 'Prova';
    case 'evento-cultural': return 'Cultural';
    case 'reuniao': return 'Reunião';
    case 'feriado': return 'Feriado';
    default: return 'Evento';
  }
}

function colorForTipo(tipo) {
  switch (tipo) {
    case 'prova': return '#f59e0b';          // amarelado
    case 'evento-cultural': return '#10b981';// verde vivo
    case 'reuniao': return '#3b82f6';        // azul
    case 'feriado': return '#ef4444';        // vermelho
    default: return '#67B16A';               // verde padrão
  }
}

// Escape simples para evitar XSS em conteúdo inserido via JS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
