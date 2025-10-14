// Dados de Exemplo (com mais detalhes para evitar erros)
const avisos = [
    { titulo: "Aviso Recente", descricao: "Mudança no horário de aula para às 14h." }
];

const eventos = [
    { titulo: "Prova de História", data: "15/10/2023", tipo: "prova", descricao: "Prova sobre história antiga." },
    { titulo: "Evento Cultural", data: "20/10/2023", tipo: "evento-cultural", descricao: "Festival de artes na escola." },
    { titulo: "Reunião com Pais", data: "25/10/2023", tipo: "reuniao", descricao: "Discussão sobre o ano letivo." }
    // Adicione mais eventos conforme necessário
];

// Carregar conteúdo dinamicamente
document.addEventListener('DOMContentLoaded', () => {
    // Aviso Recente
    const avisoRecenteDiv = document.getElementById('aviso-recente');
    if (avisos.length > 0) {
        avisoRecenteDiv.innerHTML = `<p><strong>${avisos[0].titulo}:</strong> ${avisos[0].descricao}</p>`;
    } else {
        avisoRecenteDiv.innerHTML = '<p>Nenhum aviso recente.</p>';
    }
    
    // Próximos Eventos
    const proximosEventosUl = document.getElementById('proximos-eventos');
    const proximos3 = eventos.slice(0, 3);
    proximos3.forEach(evento => {
        proximosEventosUl.innerHTML += `<li>${evento.titulo} - ${evento.data}</li>`;
    });
    
    // Calendário Grid (Simples para o mês atual)
    const calendarioGrid = document.getElementById('calendario-grid');
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = i;
        dayDiv.className = 'calendar-day';
        eventos.forEach(evento => {
            const eventoDate = new Date(evento.data);  // Converte data para objeto Date
            if (eventoDate.getDate() === i && eventoDate.getMonth() === today.getMonth()) {
                dayDiv.innerHTML += `<span class="event-dot">${evento.tipo}</span>`;
            }
        });
        calendarioGrid.appendChild(dayDiv);
    }
    
    // Filtro de Eventos
    const filtroSelect = document.getElementById('filtro-evento');
    const eventosUl = document.getElementById('calendario-eventos');
    
    function exibirEventos(filtro) {
        eventosUl.innerHTML = '';  // Limpa a lista
        eventos.forEach(evento => {
            if (filtro === 'todos' || evento.tipo === filtro) {
                const li = document.createElement('li');
                li.textContent = `${evento.titulo} - ${evento.data}`;
                // Verifica se descricao existe
                li.onclick = () => openModal(evento.titulo, evento.descricao || 'Detalhes não disponíveis.');
                eventosUl.appendChild(li);
            }
        });
    }
    
    filtroSelect.addEventListener('change', (e) => {
        exibirEventos(e.target.value);
    });
    exibirEventos('todos');  // Carrega inicialmente
    
    // Formulário de Feedback com Validação
    const form = document.getElementById('form-feedback');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value.trim();
        const sugestao = document.getElementById('sugestao').value.trim();
        const nomeError = document.getElementById('nome-error');
        const sugestaoError = document.getElementById('sugestao-error');
        
        nomeError.textContent = '';
        sugestaoError.textContent = '';
        
        if (nome === '') {
            nomeError.textContent = 'Nome é obrigatório.';
            return;
        }
        if (sugestao === '') {
            sugestaoError.textContent = 'Sugestão é obrigatória.';
            return;
        }
        
        alert('Sugestão enviada com sucesso!');  // Em uma versão real, envie para o servidor
        form.reset();
    });
    
    // Funções para Modal
    window.openModal = (title, content) => {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-content').textContent = content;
        document.getElementById('modal').style.display = 'block';
    };
    
    window.closeModal = () => {
        document.getElementById('modal').style.display = 'none';
    };
    
    // Toggle Tema
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        }
    });
    
    // Botão Voltar ao Topo
    document.getElementById('back-to-top').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Animação de Scroll
    window.addEventListener('scroll', () => {
        document.querySelectorAll('section').forEach(section => {
            if (window.scrollY + window.innerHeight > section.offsetTop + 100) {
                section.classList.add('fade-in');
            }
        });
    });
});