/* =========================================================
   FITFINDER - MENU E BARRA DE USUÁRIO COM ÍCONES VETORIAIS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const usuarioLogado = JSON.parse(localStorage.getItem('fitfinder_usuario_logado'));
    const navUl = document.querySelector('header nav ul');

    if (usuarioLogado && navUl) {

        navUl.innerHTML = `
            <li>
                <a href="index.html">
                    <i class="fa-solid fa-location-dot" style="margin-right: 6px;"></i> Academias
                </a>
            </li>
            <li class="user-menu-item">
                <button type="button" class="user-name" aria-expanded="false" aria-haspopup="true">
                    <i class="fa-solid fa-user-gear" style="margin-right: 8px;"></i> ${usuarioLogado.nome.split(' ')[0]}
                </button>
                <div class="user-dropdown" aria-label="Menu do usuário">
                    <div class="user-dropdown-content">
                        <a href="perfil.html">
                            <i class="fa-solid fa-id-card" style="width: 20px; color: var(--azul, #38bdf8);"></i> Meu Perfil
                        </a>
                        <a href="treinos.html">
                            <i class="fa-solid fa-dumbbell" style="width: 20px; color: var(--azul, #38bdf8);"></i> Meus Treinos
                        </a>
                        <a href="avaliacao.html">
                            <i class="fa-solid fa-fire" style="width: 20px; color: var(--azul, #38bdf8);"></i> Avaliação (TMB)
                        </a>
                        <a href="agua.html">
                            <i class="fa-solid fa-droplet" style="width: 20px; color: var(--azul, #38bdf8);"></i> Registro de Água
                        </a>
                        <button
                            id="btn-logout"
                            class="btn-logout">
                            <i class="fa-solid fa-right-from-bracket" style="width: 20px;"></i> Sair
                        </button>
                    </div>
                </div>
            </li>
        `;

        const botaoMenu = navUl.querySelector('.user-name');
        botaoMenu.addEventListener('click', () => {
            const aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
            botaoMenu.setAttribute('aria-expanded', String(!aberto));
            navUl.querySelector('.user-dropdown').classList.toggle('menu-aberto', !aberto);
        });
        document.getElementById('btn-logout').addEventListener('click', () => {
            localStorage.removeItem('fitfinder_usuario_logado');
            mostrarMensagem('Você saiu da sua conta com sucesso.');
            setTimeout(() => { window.location.href = 'index.html'; }, 1200);
        });

    }

});
