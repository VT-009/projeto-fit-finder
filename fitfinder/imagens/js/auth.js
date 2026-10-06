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
                    alert('As senhas não coincidem. Por favor, tente novamente.');
                    return;
                }

                const usuarios = JSON.parse(localStorage.getItem('fitfinder_usuarios')) || [];
                const usuarioExiste = usuarios.some(u => u.email === email);

                if (usuarioExiste) {
                    alert('Este e-mail já está cadastrado! Faça login.');
                    return;
                }

                usuarios.push({ nome, email, senha });
                localStorage.setItem('fitfinder_usuarios', JSON.stringify(usuarios));

                alert('Cadastro realizado com sucesso! Redirecionando para a página de login...');
                window.location.href = 'login.html';
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
                alert(`Bem-vindo(a), ${usuarioValido.nome}!`);
                window.location.href = 'index.html';
            } else {
                alert('E-mail ou senha incorretos. Verifique seus dados!');
            }
        });
    }

    // 3. RECUPERAÇÃO DE SENHA (Funciona sempre, em qualquer tela)
    if (linkEsqueci) {
        linkEsqueci.addEventListener('click', (e) => {
            e.preventDefault();

            const emailDigitado = prompt('Digite o e-mail cadastrado na sua conta para redefinir a senha:');

            if (emailDigitado) {
                const emailNormalizado = emailDigitado.trim().toLowerCase();
                const usuarios = JSON.parse(localStorage.getItem('fitfinder_usuarios')) || [];
                const usuarioEncontrado = usuarios.find(u => u.email === emailNormalizado);

                if (usuarioEncontrado) {
                    alert(`Um código de recuperação de 6 dígitos foi enviado para o e-mail: ${emailNormalizado}\n\n(Dica do protótipo: O código gerado é 123456)`);
                    
                    const codigoDigitado = prompt('Digite o código de 6 dígitos enviado para seu e-mail:');

                    if (codigoDigitado === '123456') {
                        const novaSenha = prompt('Código verificado com sucesso! Digite a sua NOVA senha:');

                        if (novaSenha && novaSenha.trim() !== '') {
                            usuarioEncontrado.senha = novaSenha.trim();
                            localStorage.setItem('fitfinder_usuarios', JSON.stringify(usuarios));

                            alert('Sua senha foi redefinida com sucesso! Faça login com sua nova senha.');
                        } else {
                            alert('A nova senha não pode ser vazia.');
                        }
                    } else if (codigoDigitado !== null) {
                        alert('Código incorreto! Processo de redefinição cancelado.');
                    }

                } else {
                    alert('Nenhuma conta encontrada com este e-mail. Verifique o endereço digitado.');
                }
            }
        });
    }

});