/* =========================================================
   FITFINDER - LÓGICA DA PÁGINA DE RECUPERAÇÃO DE SENHA
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const formEmail = document.getElementById('form-recuperar-email');
    const formCodigo = document.getElementById('form-recuperar-codigo');
    const inputEmail = document.getElementById('recuperar-email');
    const inputCodigo = document.getElementById('codigo-verificacao');
    const inputNovaSenha = document.getElementById('nova-senha-recuperada');

    let usuarioEncontrado = null;

    // PASSO 1: Validar e-mail
    formEmail.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailDigitado = inputEmail.value.trim().toLowerCase();
        const usuarios = JSON.parse(localStorage.getItem('fitfinder_usuarios')) || [];

        usuarioEncontrado = usuarios.find(u => u.email === emailDigitado);

        if (usuarioEncontrado) {
            alert(`Código enviado com sucesso para ${emailDigitado}!`);
            formEmail.style.display = 'none';
            formCodigo.style.display = 'block';
        } else {
            alert('Nenhuma conta encontrada com este e-mail. Verifique se digitou corretamente.');
        }
    });

    // PASSO 2: Validar código e salvar nova senha
    formCodigo.addEventListener('submit', (e) => {
        e.preventDefault();

        const codigo = inputCodigo.value.trim();
        const novaSenha = inputNovaSenha.value.trim();

        if (codigo !== '123456') {
            alert('Código de verificação incorreto! Tente usar "123456".');
            return;
        }

        if (!novaSenha) {
            alert('Por favor, digite a nova senha.');
            return;
        }

        // Atualiza a senha no localStorage
        let usuarios = JSON.parse(localStorage.getItem('fitfinder_usuarios')) || [];
        usuarios = usuarios.map(u => {
            if (u.email === usuarioEncontrado.email) {
                u.senha = novaSenha;
            }
            return u;
        });

        localStorage.setItem('fitfinder_usuarios', JSON.stringify(usuarios));

        alert('Senha redefinida com sucesso! Você será redirecionado para o login.');
        window.location.href = 'login.html';
    });

});