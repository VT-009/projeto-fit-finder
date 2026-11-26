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

                if (!nome) { mostrarMensagem('Digite seu nome completo para criar a conta.'); document.getElementById('nome').focus(); return; }
                if (!/^[A-Z0-9._%+-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(email)) { mostrarMensagem("Digite um endereço de e-mail válido contendo '@' (exemplo: nome@email.com)."); document.getElementById('email').focus(); return; }
                if (senha.length < 8) { mostrarMensagem('A senha precisa ter pelo menos 8 caracteres.'); document.getElementById('senha').focus(); return; }

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

            if (!email || !senha) { mostrarMensagem('Preencha o e-mail e a senha para entrar.'); (emailInput?.value ? senhaInput : emailInput)?.focus(); return; }
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(email)) { mostrarMensagem("Digite um endereço de e-mail válido contendo '@' (exemplo: nome@email.com)."); emailInput?.focus(); return; }

            const usuarios = JSON.parse(localStorage.getItem('fitfinder_usuarios')) || [];
            const usuarioValido = usuarios.find(u => u.email === email && u.senha === senha);

            if (usuarioValido) {
                localStorage.setItem('fitfinder_usuario_logado', JSON.stringify(usuarioValido));
                mostrarMensagem(`Bem-vindo(a), ${usuarioValido.nome}!`);
                setTimeout(() => { window.location.href = 'index.html'; }, 1200);
            } else {
                mostrarMensagem('E-mail ou senha incorretos. Confira os dados e tente novamente.');
            }
        });
    }

});
