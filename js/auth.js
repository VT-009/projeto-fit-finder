/* =========================================================
   FITFINDER - SISTEMA DE CADASTRO, LOGIN E RECUPERAÇÃO
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const formCadastro = document.querySelector('form[action*="cadastro"]');
    const formLogin = document.querySelector('form.form-login');
    const inputConfirmarSenha = document.getElementById('confirmar-senha');
    const linkEsqueci = document.getElementById('link-esqueci-senha');

    // 1. LÓGICA DE CADASTRO (Apenas se existir o campo 'confirmar-senha')
    if (inputConfirmarSenha) {
        const formAtual = inputConfirmarSenha.closest('form');
        if (formAtual) {
            formAtual.addEventListener('submit', (e) => {
                e.preventDefault();

                const nome = document.getElementById('nome').value.trim();
                const email = document.getElementById('email').value.trim().toLowerCase();
                const senha = document.getElementById('senha').value;
                const confirmarSenha = inputConfirmarSenha.value;

                if (senha !== confirmarSenha) {
                    mostrarMensagem('As senhas não coincidem. Por favor, tente novamente.');
                    return;
                }

                const usuarios = JSON.parse(localStorage.getItem('fitfinder_usuarios')) || [];
                const usuarioExiste = usuarios.some(u => u.email === email);

                if (usuarioExiste) {
                    mostrarMensagem('Este e-mail já está cadastrado! Faça login.');
                    return;
                }

                usuarios.push({ nome, email, senha });
                localStorage.setItem('fitfinder_usuarios', JSON.stringify(usuarios));

                mostrarMensagem('Cadastro realizado com sucesso! Redirecionando para a página de login...');
                setTimeout(() => { window.location.href = 'login.html'; }, 1200);
            });
        }
    } 
    // 2. LÓGICA DE LOGIN (Para a página de login)
    else if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email') || document.getElementById('login-email');
            const senhaInput = document.getElementById('senha') || document.getElementById('login-senha');

            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            const senha = senhaInput ? senhaInput.value : '';

            const usuarios = JSON.parse(localStorage.getItem('fitfinder_usuarios')) || [];
            const usuarioValido = usuarios.find(u => u.email === email && u.senha === senha);

            if (usuarioValido) {
                localStorage.setItem('fitfinder_usuario_logado', JSON.stringify(usuarioValido));
                mostrarMensagem(`Bem-vindo(a), ${usuarioValido.nome}!`);
                setTimeout(() => { window.location.href = 'index.html'; }, 1200);
            } else {
                mostrarMensagem('E-mail ou senha incorretos. Verifique seus dados!');
            }
        });
    }

});
