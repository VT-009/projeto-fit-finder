/* Menu dropdown único e bloqueio educativo das ferramentas. */
document.addEventListener('DOMContentLoaded', () => {
    const chaveUsuario = 'fitfinder_usuario_logado';
    let usuarioLogado = null;
    try { usuarioLogado = JSON.parse(localStorage.getItem(chaveUsuario)); } catch (_) { }

    const nav = document.querySelector('header nav');
    if (!nav) return;

    const primeiroNome = usuarioLogado?.nome?.trim().split(/\s+/)[0] || 'Perfil';
    const nomeSeguro = primeiroNome.replace(/[&<>"']/g, caractere => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caractere]));
    const itensComuns = `
        <a href="index.html">Início</a>
        <a href="treinos.html" data-restrito="true">Treinos</a>
        <a href="avaliacao.html" data-restrito="true">Avaliação Física</a>
        <a href="agua.html" data-restrito="true">Meta de Água</a>`;
    const itensConta = usuarioLogado
        ? `<a href="perfil.html">Meu Perfil</a><hr><button type="button" id="btn-logout" class="btn-logout">Sair</button>`
        : `<hr><a href="login.html">Entrar</a><a href="cadastro.html">Criar Conta</a>`;
    const rotulo = usuarioLogado ? nomeSeguro : 'Menu';

    nav.setAttribute('aria-label', 'Navegação principal');
    nav.innerHTML = `<ul class="nav-principal"><li class="user-menu-item">
        <button type="button" class="menu-trigger" aria-expanded="false" aria-haspopup="true" aria-controls="menu-navegacao">
            <i class="fa-solid fa-bars" aria-hidden="true"></i><span>${rotulo}</span><span class="menu-seta" aria-hidden="true">▾</span>
        </button>
        <div class="user-dropdown" id="menu-navegacao" aria-label="Opções de navegação">
            <div class="user-dropdown-content">${itensComuns}${itensConta}</div>
        </div>
    </li></ul>`;

    const itemMenu = nav.querySelector('.user-menu-item');
    const botaoMenu = nav.querySelector('.menu-trigger');
    const dropdown = nav.querySelector('.user-dropdown');
    const fecharMenu = () => {
        dropdown.classList.remove('menu-aberto');
        botaoMenu.setAttribute('aria-expanded', 'false');
    };
    const alternarMenu = () => {
        const aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
        dropdown.classList.toggle('menu-aberto', !aberto);
        botaoMenu.setAttribute('aria-expanded', String(!aberto));
    };

    botaoMenu.addEventListener('click', alternarMenu);
    document.addEventListener('click', event => {
        if (!itemMenu.contains(event.target)) fecharMenu();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && dropdown.classList.contains('menu-aberto')) {
            fecharMenu();
            botaoMenu.focus();
        }
    });
    itemMenu.addEventListener('focusout', () => setTimeout(() => {
        if (!itemMenu.contains(document.activeElement)) fecharMenu();
    }, 0));

    nav.querySelectorAll('[data-restrito]').forEach(link => link.addEventListener('click', event => {
        if (!usuarioLogado) {
            event.preventDefault();
            fecharMenu();
            window.mostrarAcessoRestrito();
        }
    }));

    if (usuarioLogado) {
        nav.querySelector('#btn-logout').addEventListener('click', () => {
            localStorage.removeItem(chaveUsuario);
            window.location.href = 'index.html';
        });
    }

    const pagina = location.pathname.split('/').pop();
    if (!usuarioLogado && ['treinos.html', 'avaliacao.html', 'agua.html', 'perfil.html'].includes(pagina)) {
        window.mostrarAcessoRestrito();
    }
});
