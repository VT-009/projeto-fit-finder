/* =========================================================
   FITFINDER - CONTADOR DIÁRIO DE ÁGUA COM META DINÂMICA
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const usuarioLogado = JSON.parse(localStorage.getItem('fitfinder_usuario_logado'));

    if (!usuarioLogado) {
        alert('Para acessar recursos completos, faça login.');
        window.location.href = 'login.html';
        return;
    }

    const emailKey = usuarioLogado.email;

    const displayTotal = document.getElementById('total-agua');
    const displayMeta = document.getElementById('meta-agua-valor');
    const btn250 = document.getElementById('btn-250');
    const btn500 = document.getElementById('btn-500');
    const btnSub250 = document.getElementById('btn-sub-250');
    const btnReset = document.getElementById('btn-reset');
    
    const formManual = document.getElementById('form-agua-manual');
    const inputManual = document.getElementById('quantidade-manual');

    // 1. Busca a Meta Calculada da TMB mais recente do Usuário
    function obterMetaAguaAtual() {
        // Tenta buscar a meta salva diretamente
        let meta = localStorage.getItem(`fitfinder_meta_agua_custom_${emailKey}`);

        // Caso não encontre, tenta buscar da última TMB calculada
        if (!meta) {
            const historicoTMB = JSON.parse(localStorage.getItem(`fitfinder_historico_tmb_${emailKey}`)) || [];
            if (historicoTMB.length > 0 && historicoTMB[0].metaAgua) {
                meta = historicoTMB[0].metaAgua;
                localStorage.setItem(`fitfinder_meta_agua_custom_${emailKey}`, meta);
            } else {
                meta = 2000; // Padrão 2000 mL se ainda não fez a TMB
            }
        }

        return meta;
    }

    const metaCalculada = obterMetaAguaAtual();

    if (displayMeta) {
        displayMeta.textContent = `${metaCalculada} mL`;
    }

    // 2. Lógica de Consumo e Reset à Meia-Noite
    const hoje = new Date().toLocaleDateString('pt-BR');
    const ultimaDataReg = localStorage.getItem(`fitfinder_agua_data_${emailKey}`);
    let consumoAtual = parseInt(localStorage.getItem(`fitfinder_agua_total_${emailKey}`)) || 0;

    if (ultimaDataReg !== hoje) {
        consumoAtual = 0;
        localStorage.setItem(`fitfinder_agua_data_${emailKey}`, hoje);
        localStorage.setItem(`fitfinder_agua_total_${emailKey}`, 0);
    }

    function atualizarDisplay() {
        displayTotal.textContent = `${consumoAtual} mL`;
        localStorage.setItem(`fitfinder_agua_total_${emailKey}`, consumoAtual);
        localStorage.setItem(`fitfinder_agua_data_${emailKey}`, hoje);
    }

    if (btn250) {
        btn250.addEventListener('click', () => {
            consumoAtual += 250;
            atualizarDisplay();
        });
    }

    if (btn500) {
        btn500.addEventListener('click', () => {
            consumoAtual += 500;
            atualizarDisplay();
        });
    }

    if (btnSub250) {
        btnSub250.addEventListener('click', () => {
            consumoAtual = Math.max(0, consumoAtual - 250);
            atualizarDisplay();
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (confirm('Deseja zerar o registro de água de hoje?')) {
                consumoAtual = 0;
                atualizarDisplay();
            }
        });
    }

    if (formManual) {
        formManual.addEventListener('submit', (e) => {
            e.preventDefault();

            const valorDigitado = parseInt(inputManual.value);
            if (valorDigitado && valorDigitado > 0) {
                consumoAtual += valorDigitado;
                inputManual.value = '';
                atualizarDisplay();
            }
        });
    }

    atualizarDisplay();

});