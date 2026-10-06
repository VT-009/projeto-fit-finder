/* =========================================================
   FITFINDER - PAINEL DO PERFIL COM DADOS ISOLADOS E EXCLUSÃO
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const usuarioLogado = JSON.parse(localStorage.getItem('fitfinder_usuario_logado'));

    if (!usuarioLogado) {
        alert('Para acessar recursos completos, faça login.');
        window.location.href = 'login.html';
        return;
    }

    const emailKey = usuarioLogado.email;

    // Elementos das Métricas
    const dashTmb = document.getElementById('dash-tmb');
    const dashAguaHoje = document.getElementById('dash-agua-hoje');
    const dashMetaAgua = document.getElementById('dash-meta-agua');

    // Elementos do Formulário
    const formPerfil = document.getElementById('form-perfil');
    const inputNome = document.getElementById('perfil-nome');
    const inputEmail = document.getElementById('perfil-email');

    // Elementos de Senha
    const btnToggleSenha = document.getElementById('btn-toggle-senha');
    const caixaTrocaSenha = document.getElementById('caixa-troca-senha');
    const inputSenhaAtual = document.getElementById('perfil-senha-atual');
    const inputSenhaNova = document.getElementById('perfil-senha-nova');

    // Botão de Excluir Conta
    const btnExcluirConta = document.getElementById('btn-excluir-conta');

    let querAlterarSenha = false;

    // 1. Carrega Métricas Específicas do Usuário Atual
    const historicoTMB = JSON.parse(localStorage.getItem(`fitfinder_historico_tmb_${emailKey}`)) || [];
    const consumoAguaHoje = localStorage.getItem(`fitfinder_agua_total_${emailKey}`) || 0;
    const metaAguaCustom = localStorage.getItem(`fitfinder_meta_agua_custom_${emailKey}`) || 2000;

    if (historicoTMB.length > 0) {
        dashTmb.textContent = `${historicoTMB[0].calorias} kcal`;
    } else {
        dashTmb.textContent = "Não calculado";
    }

    dashAguaHoje.textContent = `${consumoAguaHoje} mL`;
    dashMetaAgua.textContent = `${metaAguaCustom} mL`;

    // 2. Preenche os Dados Atuais
    inputNome.value = usuarioLogado.nome;
    inputEmail.value = usuarioLogado.email;

    // 3. Alternar exibição dos campos de senha
    btnToggleSenha.addEventListener('click', () => {
        querAlterarSenha = !querAlterarSenha;

        if (querAlterarSenha) {
            caixaTrocaSenha.style.display = 'block';
            btnToggleSenha.textContent = '✖ Cancelar Redefinição de Senha';
            btnToggleSenha.style.backgroundColor = '#333333';
        } else {
            caixaTrocaSenha.style.display = 'none';
            btnToggleSenha.textContent = '🔒 Redefinir Senha';
            btnToggleSenha.style.backgroundColor = '#222222';
            inputSenhaAtual.value = '';
            inputSenhaNova.value = '';
        }
    });

    // 4. Salvar Alterações do Perfil
    formPerfil.addEventListener('submit', (e) => {
        e.preventDefault();

        const novoNome = inputNome.value.trim();
        const novoEmail = inputEmail.value.trim().toLowerCase();

        if (querAlterarSenha) {
            const senhaAtualDigitada = inputSenhaAtual.value.trim();
            const novaSenhaDigitada = inputSenhaNova.value.trim();

            if (!senhaAtualDigitada || !novaSenhaDigitada) {
                alert('Por favor, preencha a senha atual e a nova senha.');
                return;
            }

            if (senhaAtualDigitada !== usuarioLogado.senha) {
                alert('A senha atual digitada está incorreta.');
                inputSenhaAtual.value = '';
                inputSenhaAtual.focus();
                return;
            }

            usuarioLogado.senha = novaSenhaDigitada;
        }

        const emailAntigo = usuarioLogado.email;
        usuarioLogado.nome = novoNome;
        usuarioLogado.email = novoEmail;

        // Atualiza Sessão do Usuário
        localStorage.setItem('fitfinder_usuario_logado', JSON.stringify(usuarioLogado));

        // Atualiza Lista de Cadastrados no Sistema
        let usuariosCadastrados = JSON.parse(localStorage.getItem('fitfinder_usuarios')) || [];
        usuariosCadastrados = usuariosCadastrados.map(u => {
            if (u.email === emailAntigo) {
                return usuarioLogado;
            }
            return u;
        });

        localStorage.setItem('fitfinder_usuarios', JSON.stringify(usuariosCadastrados));

        alert('Perfil atualizado com sucesso!');
        window.location.reload();
    });

    // 5. EXCLUIR CONTA
    if (btnExcluirConta) {
        btnExcluirConta.addEventListener('click', () => {
            const confirmacao = confirm('Tem certeza de que deseja excluir sua conta? Todos os seus dados de treinos, água e avaliações serão apagados permanentemente.');

            if (confirmacao) {
                // Remove da lista global de usuários
                let usuarios = JSON.parse(localStorage.getItem('fitfinder_usuarios')) || [];
                usuarios = usuarios.filter(u => u.email !== usuarioLogado.email);
                localStorage.setItem('fitfinder_usuarios', JSON.stringify(usuarios));

                // Limpa dados específicos do usuário
                localStorage.removeItem(`fitfinder_agua_total_${emailKey}`);
                localStorage.removeItem(`fitfinder_agua_data_${emailKey}`);
                localStorage.removeItem(`fitfinder_meta_agua_custom_${emailKey}`);
                localStorage.removeItem(`fitfinder_historico_tmb_${emailKey}`);
                localStorage.removeItem('fitfinder_usuario_logado');

                alert('Sua conta foi excluída com sucesso.');
                window.location.href = 'index.html';
            }
        });
    }

});