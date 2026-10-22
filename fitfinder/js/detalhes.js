/* =========================================================
   FITFINDER - LOGICA DE DETALHES E AVALIAÇÃO DA ACADEMIA
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('secao-detalhes') || document.getElementById('detalhes-container');

    if (!container) return;

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

    const keyComentariosAcademia = `fitfinder_comentarios_${idParam}`;
    let comentariosSalvos = JSON.parse(localStorage.getItem(keyComentariosAcademia)) || [];

    // Filtro de segurança para remover comentários antigos
    const autoresAntigos = ['Carlos Eduardo', 'Lara Beatriz', 'João Gabriel', 'Cauê Alvim', 'Caio Luiz', 'Lucas Silva', 'Alan Victor', 'Gabriel Alves', 'Matheus Santos', 'Bruno Ferreira', 'Patricia Lima', 'Fernando Costa', 'Rafael Torres'];
    comentariosSalvos = comentariosSalvos.filter(c => !autoresAntigos.includes(c.autor));
    localStorage.setItem(keyComentariosAcademia, JSON.stringify(comentariosSalvos));

    document.title = `FitFinder - ${item.nome}`;

    let notaAcademia = 5;

    function renderizarPagina() {

        const usuarioLogado = JSON.parse(localStorage.getItem('fitfinder_usuario_logado'));
        const fotoInterna = item.foto2 || 'imagens/N2 interior.jpg';
        const fotoFachada = item.foto1 || 'imagens/N2 Entrada.jpg';
        const bairroTexto = item.bairro.includes('Maceió') ? item.bairro : `${item.bairro} - Maceió/AL`;

        const planosHTML = Array.isArray(item.planos)
            ? item.planos.map(p => `<li>${p}</li>`).join('')
            : `<li><strong>Plano Mensal:</strong> ${item.preco || 'A partir de R$ 79,00/mês'}</li>`;

        const estruturaHTML = Array.isArray(item.estrutura)
            ? item.estrutura.map(e => `<li>${e}</li>`).join('')
            : `<li>Estrutura completa com musculação e área climatizada</li>`;

        const horariosHTML = Array.isArray(item.horarios)
            ? item.horarios.map(h => `<li>${h}</li>`).join('')
            : `<li>Segunda a Sexta: 05:00 às 22:00</li>`;

        const listaComentariosHTML = comentariosSalvos.length > 0 
            ? comentariosSalvos.map((a, index) => {
                const eDono = usuarioLogado && usuarioLogado.nome === a.autor;
                return `
                    <article class="avaliacao-card" style="position: relative; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <p class="autor" style="margin: 0;">
                                <strong>${a.autor}</strong> — <span class="google-star">star</span> ${a.nota}
                            </p>
                            ${eDono ? `
                                <button class="btn-excluir-comentario" data-index="${index}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem; padding: 4px 8px; border-radius: 4px;">
                                    <i class="fa-solid fa-trash-can"></i> Excluir
                                </button>
                            ` : ''}
                        </div>
                        <p class="comentario" style="margin: 0;">"${a.texto}"</p>
                    </article>
                `;
            }).join('')
            : `<p style="color: var(--texto-secundario); font-size: 0.95rem; font-style: italic; padding: 10px 0;">Ainda não há avaliações para esta academia. Seja o primeiro a publicar!</p>`;

        container.innerHTML = `
            <div class="detalhes-header">
                <h2>${item.nome}</h2>
                <p class="nota-localizacao">
                    <span class="google-star">star</span> ${item.nota} • ${bairroTexto}
                </p>
            </div>

            <section class="galeria-fotos">
                <h3>Estrutura da Academia</h3>
                <div class="fotos-grid">
                    <figure>
                        <img src="${fotoInterna}" alt="Estrutura e Maquinário da ${item.nome}">
                        <figcaption>Área Interna e Equipamentos de Musculação.</figcaption>
                    </figure>
                    <figure>
                        <img src="${fotoFachada}" alt="Fachada e Recepção da ${item.nome}">
                        <figcaption>Fachada e Entrada Principal.</figcaption>
                    </figure>
                </div>
            </section>

            <div class="info-grid">
                <article class="info-card">
                    <h3>Planos e Mensalidades</h3>
                    <ul>${planosHTML}</ul>
                </article>

                <article class="info-card">
                    <h3>Equipamentos e Estrutura</h3>
                    <ul>${estruturaHTML}</ul>
                </article>

                <article class="info-card">
                    <h3>Horários de Funcionamento</h3>
                    <ul>${horariosHTML}</ul>
                </article>

                <article class="info-card">
                    <h3>Localização e Contato</h3>
                    <p><strong>Endereço:</strong> ${item.endereco}</p>
                    ${item.telefone ? `<p><strong>Telefone / WhatsApp:</strong> ${item.telefone}</p>` : ''}
                    ${item.instagram ? `<p><strong>Instagram:</strong> ${item.instagram}</p>` : ''}
                </article>
            </div>

            <section class="avaliacoes-secao" style="margin-top: 30px;">
                <h3>Avaliações e Experiências dos Alunos</h3>

                <div style="background: #111; padding: 25px; border-radius: 8px; border: 1px solid var(--borda); margin-bottom: 25px;">
                    <h4 style="color: var(--azul); margin-bottom: 6px; font-size: 1.1rem;">
                        <i class="fa-solid fa-comment-dots"></i> Já treinou na ${item.nome}? Conte sua experiência!
                    </h4>
                    <p style="font-size: 0.85rem; color: var(--texto-secundario); margin-bottom: 18px;">
                        Compartilhe como foi seu treino para ajudar outros alunos da comunidade.
                    </p>

                    <form id="form-novo-comentario" style="display: flex; flex-direction: column; gap: 18px;">
                        <div>
                            <label style="font-size: 0.9rem; color: #ccc; display: block; margin-bottom: 8px; font-weight: 600;">Sua Nota:</label>
                            <div id="estrelas-seletor" style="display: flex; gap: 6px; cursor: pointer;">
                                <span class="star-btn google-star" data-value="1" style="font-size: 1.8rem; transition: transform 0.15s ease, color 0.15s ease;">star</span>
                                <span class="star-btn google-star" data-value="2" style="font-size: 1.8rem; transition: transform 0.15s ease, color 0.15s ease;">star</span>
                                <span class="star-btn google-star" data-value="3" style="font-size: 1.8rem; transition: transform 0.15s ease, color 0.15s ease;">star</span>
                                <span class="star-btn google-star" data-value="4" style="font-size: 1.8rem; transition: transform 0.15s ease, color 0.15s ease;">star</span>
                                <span class="star-btn google-star" data-value="5" style="font-size: 1.8rem; transition: transform 0.15s ease, color 0.15s ease;">star</span>
                            </div>
                        </div>

                        <div>
                            <textarea id="texto-comentario" rows="5" placeholder="Escreva aqui detalhadamente sobre a estrutura, equipamentos, atendimento..." style="width: 100%; padding: 14px; background: #080808; border: 1px solid var(--borda); color: #fff; border-radius: 6px; resize: vertical;" required></textarea>
                        </div>

                        <div>
                            <button type="submit" style="padding: 12px 28px; font-size: 0.95rem; font-weight: 600; border-radius: 6px; cursor: pointer;">Publicar Comentário</button>
                        </div>
                    </form>
                </div>

                <div id="lista-comentarios">
                    ${listaComentariosHTML}
                </div>
            </section>

            <div class="voltar-area" style="margin-top: 30px;">
                <a href="index.html" class="btn-secondary">
                    ← Voltar para a lista de academias
                </a>
            </div>
        `;

        // Interatividade das estrelas
        const estrelas = document.querySelectorAll('#estrelas-seletor .star-btn');

        function atualizarEstrelas(val) {
            estrelas.forEach(s => {
                const v = parseInt(s.getAttribute('data-value'));
                s.style.color = v <= val ? '#e3a008' : '#444';
                s.style.opacity = v <= val ? '1' : '0.5';
                s.style.transform = v <= val ? 'scale(1.1)' : 'scale(1)';
            });
        }

        atualizarEstrelas(notaAcademia);

        estrelas.forEach(s => {
            s.addEventListener('mouseenter', () => atualizarEstrelas(parseInt(s.getAttribute('data-value'))));
            s.addEventListener('mouseleave', () => atualizarEstrelas(notaAcademia));
            s.addEventListener('click', () => {
                notaAcademia = parseInt(s.getAttribute('data-value'));
                atualizarEstrelas(notaAcademia);
            });
        });

        // Eventos para excluir comentário do usuário logado
        const botoesExcluir = container.querySelectorAll('.btn-excluir-comentario');
        botoesExcluir.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                if (confirm('Deseja realmente apagar esta avaliação?')) {
                    comentariosSalvos.splice(idx, 1);
                    localStorage.setItem(keyComentariosAcademia, JSON.stringify(comentariosSalvos));
                    renderizarPagina();
                }
            });
        });

        // Redirecionamento limpo ao clicar no campo se não houver login (sem alert)
        const campoTexto = document.getElementById('texto-comentario');
        if (campoTexto) {
            campoTexto.addEventListener('click', () => {
                const usuarioLogado = JSON.parse(localStorage.getItem('fitfinder_usuario_logado'));
                if (!usuarioLogado) {
                    window.location.href = 'login.html';
                }
            });
        }

        // Trava no envio do formulário
        const formComentario = document.getElementById('form-novo-comentario');
        if (formComentario) {
            formComentario.addEventListener('submit', (e) => {
                e.preventDefault();

                const usuarioLogado = JSON.parse(localStorage.getItem('fitfinder_usuario_logado'));

                if (!usuarioLogado) {
                    window.location.href = 'login.html';
                    return;
                }

                const textoDigitado = document.getElementById('texto-comentario').value.trim();
                if (!textoDigitado) return;

                comentariosSalvos.unshift({
                    autor: usuarioLogado.nome,
                    nota: notaAcademia.toFixed(1),
                    texto: textoDigitado
                });

                localStorage.setItem(keyComentariosAcademia, JSON.stringify(comentariosSalvos));
                renderizarPagina();
            });
        }
    }

    renderizarPagina();

});
