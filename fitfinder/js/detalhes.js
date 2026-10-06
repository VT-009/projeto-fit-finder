/* =========================================================
   FITFINDER - LOGICA DE DETALHES E COMENTARIOS INTERATIVOS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Verificação de Autenticação
    const usuarioLogado = JSON.parse(localStorage.getItem('fitfinder_usuario_logado'));

    if (!usuarioLogado) {
        alert('Para acessar recursos completos, faça login.');
        window.location.href = 'login.html';
        return;
    }

    const container = document.getElementById('secao-detalhes') || document.getElementById('detalhes-container');

    if (!container) return;

    // 2. Busca a base de dados do arquivo dados-academias.js
    const academias = window.dadosAcademias || window.academias;

    if (!academias) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--texto-secundario);">
                <h2>Erro ao carregar dados</h2>
                <p style="margin-top: 10px;">Não foi possível carregar a base de dados do arquivo dados-academias.js.</p>
                <a href="index.html" class="btn-secondary" style="display: inline-block; margin-top: 15px;">
                    ← Voltar para a lista de academias
                </a>
            </div>
        `;
        return;
    }

    // 3. Captura o ID da URL (?id=...)
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id') || 'n2-antares';
    const item = academias[idParam];

    if (!item) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--texto-secundario);">
                <h2>Academia não encontrada</h2>
                <a href="index.html" class="btn-secondary" style="display: inline-block; margin-top: 15px;">
                    ← Voltar para a lista de academias
                </a>
            </div>
        `;
        return;
    }

    // Gerenciamento de comentários no localStorage
    const keyComentarios = `fitfinder_comentarios_${idParam}`;

    let comentariosSalvos = JSON.parse(localStorage.getItem(keyComentarios));
    if (!comentariosSalvos) {
        comentariosSalvos = item.avaliacoesIniciais || [
            { autor: 'Carlos Eduardo', nota: '5.0', texto: 'Excelente estrutura e atendimento! Os professores são atenciosos.' }
        ];
        localStorage.setItem(keyComentarios, JSON.stringify(comentariosSalvos));
    }

    document.title = `FitFinder - ${item.nome}`;

    // Guarda a nota selecionada pelo usuário (padrão inicial de 5 estrelas)
    let notaSelecionada = 5;

    // 4. Renderização com a nova interface em lista vertical
    function renderizarPagina() {

        const foto1 = item.foto1 || item.imgEntrada || 'imagens/powerfit.jpg';
        const foto2 = item.foto2 || item.imgInterior || 'imagens/max-fitness.jpg';
        const bairroTexto = item.bairro.includes('Maceió') ? item.bairro : `${item.bairro} - Maceió/AL`;

        const planosHTML = Array.isArray(item.planos)
            ? item.planos.map(p => `<li>${p}</li>`).join('')
            : `<li><strong>Plano Mensal:</strong> ${item.preco || 'A partir de R$ 79,00/mês'}</li>`;

        const estruturaHTML = Array.isArray(item.estrutura)
            ? item.estrutura.map(e => `<li>${e}</li>`).join('')
            : Array.isArray(item.aparelhos)
                ? item.aparelhos.map(a => `<li>${a}</li>`).join('')
                : `<li>${item.aparelhosCount || 'Estrutura completa para musculação e cardio'}</li>`;

        const horariosHTML = Array.isArray(item.horarios)
            ? item.horarios.map(h => `<li>${h}</li>`).join('')
            : `<li>${item.horarios || 'Segunda a Sexta: 05:30 às 22:00 | Sábado: 08:00 às 12:00'}</li>`;

        container.innerHTML = `
            <div class="detalhes-header">
                <h2>${item.nome}</h2>
                <p class="nota-localizacao">
                    <span class="google-star">star</span> ${item.nota} • ${bairroTexto}
                </p>
            </div>

            <section class="galeria-fotos">
                <h3>Galeria de Fotos</h3>
                <div class="fotos-grid">
                    <figure>
                        <img src="${foto1}" alt="Área principal da ${item.nome}">
                        <figcaption>Fachada e Recepção.</figcaption>
                    </figure>
                    <figure>
                        <img src="${foto2}" alt="Estrutura da ${item.nome}">
                        <figcaption>Área de Treino e Equipamentos.</figcaption>
                    </figure>
                </div>
            </section>

            <div class="info-grid">
                <article class="info-card">
                    <h3>Planos e Mensalidades</h3>
                    <ul>
                        ${planosHTML}
                    </ul>
                </article>

                <article class="info-card">
                    <h3>Equipamentos e Estrutura</h3>
                    <ul>
                        ${estruturaHTML}
                    </ul>
                </article>

                <article class="info-card">
                    <h3>Horários de Funcionamento</h3>
                    <ul>
                        ${horariosHTML}
                    </ul>
                </article>

                <article class="info-card">
                    <h3>Localização e Contato</h3>
                    <p><strong>Endereço:</strong> ${item.endereco}</p>
                    ${item.telefone ? `<p><strong>Telefone / WhatsApp:</strong> ${item.telefone}</p>` : ''}
                    ${item.instagram ? `<p><strong>Instagram:</strong> ${item.instagram}</p>` : ''}
                </article>
            </div>

            <!-- SEÇÃO REFORMULADA DE AVALIAÇÕES -->
            <section class="avaliacoes-secao">
                <h3>Avaliações e Experiências dos Alunos</h3>

                <div style="background: #111; padding: 25px; border-radius: 8px; border: 1px solid var(--borda); margin-bottom: 25px;">
                    <h4 style="color: var(--azul); margin-bottom: 6px; font-size: 1.15rem;">
                        <i class="fa-solid fa-comment-dots"></i> Já frequentou essa academia? Conte sua experiência!
                    </h4>
                    <p style="font-size: 0.85rem; color: var(--texto-secundario); margin-bottom: 20px;">
                        Compartilhe como foi seu treino para ajudar outros alunos da comunidade.
                    </p>

                    <form id="form-novo-comentario" style="display: flex; flex-direction: column; gap: 18px;">
                        
                        <!-- 1. SELEÇÃO DE ESTRELAS INTERATIVAS -->
                        <div>
                            <label style="font-size: 0.9rem; color: #ccc; display: block; margin-bottom: 8px; font-weight: 600;">
                                Sua Nota:
                            </label>
                            <div id="estrelas-seletor" style="display: flex; gap: 6px; cursor: pointer;">
                                <span class="star-btn google-star" data-value="1" style="font-size: 1.8rem; transition: transform 0.15s ease, color 0.15s ease;">star</span>
                                <span class="star-btn google-star" data-value="2" style="font-size: 1.8rem; transition: transform 0.15s ease, color 0.15s ease;">star</span>
                                <span class="star-btn google-star" data-value="3" style="font-size: 1.8rem; transition: transform 0.15s ease, color 0.15s ease;">star</span>
                                <span class="star-btn google-star" data-value="4" style="font-size: 1.8rem; transition: transform 0.15s ease, color 0.15s ease;">star</span>
                                <span class="star-btn google-star" data-value="5" style="font-size: 1.8rem; transition: transform 0.15s ease, color 0.15s ease;">star</span>
                            </div>
                        </div>

                        <!-- 2. CAMPO DE TEXTO GRANDE E EXPANDIDO -->
                        <div>
                            <label for="texto-comentario" style="font-size: 0.9rem; color: #ccc; display: block; margin-bottom: 8px; font-weight: 600;">
                                Seu Comentário:
                            </label>
                            <textarea 
                                id="texto-comentario" 
                                rows="5" 
                                placeholder="Escreva aqui detalhadamente sobre a estrutura, equipamentos, atendimento dos instrutores, limpeza e ambiente..." 
                                style="width: 100%; padding: 14px; background: #080808; border: 1px solid var(--borda); color: #fff; border-radius: 6px; resize: vertical; font-size: 0.95rem; line-height: 1.5; min-height: 120px;" 
                                required></textarea>
                        </div>

                        <!-- 3. BOTÃO DE ENVIO LOGO ABAIXO -->
                        <div>
                            <button type="submit" style="padding: 12px 28px; font-size: 0.95rem; font-weight: 600; border-radius: 6px; cursor: pointer;">
                                Publicar Comentário
                            </button>
                        </div>

                    </form>
                </div>

                <div id="lista-comentarios">
                    ${comentariosSalvos.map(a => `
                        <article class="avaliacao-card">
                            <p class="autor">
                                <strong>${a.autor}</strong> — <span class="google-star">star</span> ${a.nota}
                            </p>
                            <p class="comentario">"${a.texto}"</p>
                        </article>
                    `).join('')}
                </div>
            </section>

            <div class="voltar-area">
                <a href="index.html" class="btn-secondary">
                    ← Voltar para a lista de academias
                </a>
            </div>
        `;

        // LÓGICA DE ANIMAÇÃO E INTERAÇÃO DAS ESTRELAS
        const estrelas = document.querySelectorAll('#estrelas-seletor .star-btn');

        function atualizarEstrelas(valor) {
            estrelas.forEach(star => {
                const val = parseInt(star.getAttribute('data-value'));
                if (val <= valor) {
                    star.style.color = '#e3a008';
                    star.style.opacity = '1';
                    star.style.transform = 'scale(1.1)';
                } else {
                    star.style.color = '#444';
                    star.style.opacity = '0.5';
                    star.style.transform = 'scale(1)';
                }
            });
        }

        // Aplica valor inicial
        atualizarEstrelas(notaSelecionada);

        // Eventos de passagem do mouse (hover) e clique nas estrelas
        estrelas.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.getAttribute('data-value'));
                atualizarEstrelas(val);
            });

            star.addEventListener('mouseleave', () => {
                atualizarEstrelas(notaSelecionada);
            });

            star.addEventListener('click', () => {
                notaSelecionada = parseInt(star.getAttribute('data-value'));
                atualizarEstrelas(notaSelecionada);
            });
        });

        // Evento do Formulário de Envio
        const formComentario = document.getElementById('form-novo-comentario');
        if (formComentario) {
            formComentario.addEventListener('submit', (e) => {
                e.preventDefault();

                const textoDigitado = document.getElementById('texto-comentario').value.trim();

                if (!textoDigitado) return;

                const novoComentario = {
                    autor: usuarioLogado.nome,
                    nota: notaSelecionada.toFixed(1),
                    texto: textoDigitado
                };

                comentariosSalvos.unshift(novoComentario);
                localStorage.setItem(keyComentarios, JSON.stringify(comentariosSalvos));

                alert('Seu comentário foi publicado com sucesso!');
                renderizarPagina();
            });
        }
    }

    renderizarPagina();

});