/* =========================================================
   FITFINDER - LOGICA PRINCIPAL, FILTRO E BANNER VISITANTE
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 0. EXIBIÇÃO CONDICIONAL DO BANNER DE LOGIN --- */
    const usuarioLogado = JSON.parse(localStorage.getItem('fitfinder_usuario_logado'));
    const bannerVisitante = document.getElementById('banner-login-visitante');

    if (bannerVisitante) {
        if (!usuarioLogado) {
            bannerVisitante.style.display = 'flex';
        } else {
            bannerVisitante.style.display = 'none';
        }
    }


    /* --- 1. FILTRO DE BAIRROS E GRELHA DE CARDS --- */
    const selectBairro = document.getElementById('bairro');
    const containerAcademias = document.querySelector('main section:nth-of-type(3) > div');

    // Função auxiliar para remover acentos e hífens na comparação
    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos (ex: Jatiúca -> jatiuca)
            .replace(/-/g, ' ')              // Troca hífen por espaço (ex: ponta-verde -> ponta verde)
            .trim();
    }

    if (containerAcademias) {
        // FORÇA O LAYOUT DE GRELHA EM BLOCOS LADO A LADO NO CONTAINER PAI
        containerAcademias.style.display = 'grid';
        containerAcademias.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        containerAcademias.style.gap = window.matchMedia('(max-width: 600px)').matches ? '20px' : '28px';
    }

    if (selectBairro && containerAcademias) {
        selectBairro.addEventListener('change', (e) => {
            const bairroSelecionado = normalizarTexto(e.target.value);
            const cards = containerAcademias.querySelectorAll('article');
            let visiveis = 0;

            cards.forEach(card => {
                const textoCard = normalizarTexto(card.textContent);
                
                // Força o tamanho e imagem dos cards para não esticarem
                const img = card.querySelector('img');
                if (img) {
                    img.style.width = '100%';
                    img.style.height = '180px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '6px';
                }

                if (bairroSelecionado === '' || textoCard.includes(bairroSelecionado)) {
                    card.style.display = 'flex';
                    card.style.flexDirection = 'column';
                    visiveis++;
                } else {
                    card.style.display = 'none';
                }
            });

            let msgVazia = document.getElementById('feedback-vazio');

            if (visiveis === 0) {
                if (!msgVazia) {
                    msgVazia = document.createElement('div');
                    msgVazia.id = 'feedback-vazio';
                    msgVazia.style.cssText = `
                        text-align: center;
                        padding: 40px 20px;
                        background: #111;
                        border: 1px dashed var(--borda, #333);
                        border-radius: 8px;
                        margin-top: 20px;
                        color: var(--texto-secundario, #aaa);
                        width: 100%;
                        grid-column: 1 / -1;
                    `;
                    msgVazia.innerHTML = `
                        <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: #555; margin-bottom: 12px; display: block;"></i>
                        <h3 style="color: #fff; margin-bottom: 6px; font-size: 1.2rem;">Nenhuma academia encontrada</h3>
                        <p style="font-size: 0.9rem; color: #888;">Não encontramos academias cadastradas para o bairro selecionado no momento.</p>
                    `;
                    containerAcademias.appendChild(msgVazia);
                }
            } else if (msgVazia) {
                msgVazia.remove();
            }
        });

        // Dispara o evento uma vez ao carregar para formatar todas as imagens/cards de imediato
        selectBairro.dispatchEvent(new Event('change'));
    }


    /* --- 2. GESTÃO DO FEEDBACK GERAL DA PLATAFORMA --- */
    const formSite = document.getElementById('form-feedback-site');
    const campoTextoSite = document.getElementById('texto-feedback-site');
    const listaFeedbacksContainer = document.getElementById('lista-feedbacks-site');
    const keyFeedbackPlataforma = 'fitfinder_feedback_site_geral';

    let notaSite = 0;

    function renderizarFeedbacksSite() {
        if (!listaFeedbacksContainer) return;

        let feedbacks = JSON.parse(localStorage.getItem(keyFeedbackPlataforma)) || [];

        // Limpeza de comentários genéricos
        feedbacks = feedbacks.filter(f => f.autor !== 'Usuário Visitante' && f.autor !== 'Visitante');
        localStorage.setItem(keyFeedbackPlataforma, JSON.stringify(feedbacks));

        if (feedbacks.length === 0) {
            listaFeedbacksContainer.innerHTML = `
                <p style="color: var(--texto-secundario, #aaa); font-size: 0.9rem; font-style: italic;">Seja o primeiro a avaliar nosso site!</p>
            `;
            return;
        }

        listaFeedbacksContainer.innerHTML = feedbacks.map((f, index) => {
            const eDono = usuarioLogado && usuarioLogado.nome === f.autor;
            return `
                <article class="avaliacao-card" style="border-left: 3px solid #0284c7; background: #080d16; padding: 15px; border-radius: 6px; margin-bottom: 12px; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <p class="autor" style="color: #fff; margin: 0;">
                            <strong>${f.autor}</strong> — <span class="google-star" style="color: #e3a008;">star</span> ${f.nota}
                        </p>
                        ${eDono ? `
                            <button class="btn-excluir-feedback" data-index="${index}" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer; font-size: 0.8rem; padding: 4px 10px; border-radius: 4px; transition: all 0.2s;">
                                <i class="fa-solid fa-trash-can"></i> Excluir
                            </button>
                        ` : ''}
                    </div>
                    <p class="comentario" style="font-size: 0.9rem; color: #ccc; margin: 0;">"${f.texto}"</p>
                </article>
            `;
        }).join('');

        // Excluir próprio comentário
        const botoesExcluir = listaFeedbacksContainer.querySelectorAll('.btn-excluir-feedback');
        botoesExcluir.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                if (confirm('Tem certeza que deseja excluir seu comentário?')) {
                    feedbacks.splice(idx, 1);
                    localStorage.setItem(keyFeedbackPlataforma, JSON.stringify(feedbacks));
                    renderizarFeedbacksSite();
                }
            });
        });
    }

    // Estrelas
    const estrelasSite = document.querySelectorAll('#estrelas-site .star-btn');

    function atualizarEstrelasSite(val) {
        estrelasSite.forEach(s => {
            const v = parseInt(s.getAttribute('data-value'));
            s.style.color = v <= val ? '#e3a008' : '#444';
            s.style.opacity = v <= val ? '1' : '0.5';
            s.style.fontVariationSettings = `'FILL' ${v <= val ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`;
            s.style.transform = v <= val ? 'scale(1.1)' : 'scale(1)';
            s.setAttribute('aria-pressed', String(v === val));
        });
        const textoNota = document.getElementById('nota-site-valor');
        if (textoNota) textoNota.textContent = val ? `Nota selecionada: ${val} de 5 estrelas.` : 'Nenhuma nota selecionada. Escolha de 1 a 5 estrelas.';
    }

    if (estrelasSite.length > 0) {
        atualizarEstrelasSite(notaSite);

        estrelasSite.forEach(s => {
            s.addEventListener('mouseenter', () => atualizarEstrelasSite(parseInt(s.getAttribute('data-value'))));
            s.addEventListener('mouseleave', () => atualizarEstrelasSite(notaSite));
            s.addEventListener('click', () => {
                notaSite = parseInt(s.getAttribute('data-value'));
                atualizarEstrelasSite(notaSite);
            });
            s.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    s.click();
                }
            });
        });
    }

    // REDIRECIONA DIRETO AO CLICAR NA CAIXA SEM LOGAR
    if (campoTextoSite) {
        campoTextoSite.addEventListener('click', () => {
            if (!usuarioLogado) {
                window.location.href = 'login.html';
            }
        });
    }

    // REDIRECIONA DIRETO AO TENTAR ENVIAR SEM LOGAR
    if (formSite) {
        formSite.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!usuarioLogado) {
                window.location.href = 'login.html';
                return;
            }

            const texto = campoTextoSite ? campoTextoSite.value.trim() : '';
            if (notaSite === 0) {
                mostrarMensagem('Selecione de 1 a 5 estrelas para enviar sua avaliação.');
                document.getElementById('estrelas-site')?.querySelector('.star-btn')?.focus();
                return;
            }
            if (!texto) return;

            const feedbacks = JSON.parse(localStorage.getItem(keyFeedbackPlataforma)) || [];

            feedbacks.unshift({
                autor: usuarioLogado.nome,
                nota: notaSite.toFixed(1),
                texto: texto
            });

            localStorage.setItem(keyFeedbackPlataforma, JSON.stringify(feedbacks));
            if (campoTextoSite) campoTextoSite.value = '';
            notaSite = 0;
            atualizarEstrelasSite(0);

            renderizarFeedbacksSite();
            mostrarMensagem('Sua avaliação do FitFinder foi publicada com sucesso.', 'sucesso');
        });
    }

    renderizarFeedbacksSite();

});
