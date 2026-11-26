/* Navegação principal e acesso educativo às ferramentas restritas. */
document.addEventListener('DOMContentLoaded', () => {
    const chaveUsuario = 'fitfinder_usuario_logado';
    let usuarioLogado = null;
    try { usuarioLogado = JSON.parse(localStorage.getItem(chaveUsuario)); } catch (_) { }
    const nav = document.querySelector('header nav');
    const primeiroNome = usuarioLogado?.nome?.split(' ')[0] || 'Perfil';
    const nomeSeguro = primeiroNome.replace(/[&<>"']/g, caractere => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caractere]));
    const ferramentas = [
        ['treinos.html', 'Treinos'],
        ['avaliacao.html', 'Avaliação Física'],
        ['agua.html', 'Meta de Água']
    ];

    if (nav) {
        nav.setAttribute('aria-label', 'Navegação principal');
        nav.innerHTML = `<ul class="nav-principal">
            <li><a href="index.html">Início</a></li>
            ${ferramentas.map(([url, nome]) => `<li><a href="${url}" data-restrito="true">${nome}</a></li>`).join('')}
            ${usuarioLogado ? `<li class="user-menu-item"><button type="button" class="user-name" aria-expanded="false" aria-haspopup="true">${nomeSeguro}</button>
                <div class="user-dropdown"><div class="user-dropdown-content">
                    <a href="perfil.html">Meu Perfil</a><button type="button" id="btn-logout" class="btn-logout">Sair</button>
                </div></div></li>` : '<li><a href="login.html">Entrar</a></li><li><a href="cadastro.html">Cadastrar</a></li>'}
        </ul>`;

        if (usuarioLogado) {
            const botao = nav.querySelector('.user-name');
            botao.addEventListener('click', () => {
                const aberto = botao.getAttribute('aria-expanded') === 'true';
                botao.setAttribute('aria-expanded', String(!aberto));
                nav.querySelector('.user-dropdown').classList.toggle('menu-aberto', !aberto);
            });
            nav.querySelector('#btn-logout').addEventListener('click', () => {
                localStorage.removeItem(chaveUsuario);
                window.location.href = 'index.html';
            });
        }
        nav.querySelectorAll('[data-restrito]').forEach(link => link.addEventListener('click', event => {
            if (!usuarioLogado) {
                event.preventDefault();
                window.mostrarAcessoRestrito();
            }
        }));
    }

    const pagina = location.pathname.split('/').pop();
    if (!usuarioLogado && ['treinos.html', 'avaliacao.html', 'agua.html', 'perfil.html'].includes(pagina)) {
        window.mostrarAcessoRestrito();
    }
});
