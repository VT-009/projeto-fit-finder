/* =========================================================
   FITFINDER - AVALIAÇÃO FÍSICA (TMB) E SINCRONIZAÇÃO DE META
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Verificação de Autenticação do Usuário
    const usuarioLogado = JSON.parse(localStorage.getItem('fitfinder_usuario_logado'));

    if (!usuarioLogado) {
        alert('Para acessar recursos completos, faça login.');
        window.location.href = 'login.html';
        return;
    }

    // Chaves personalizadas por e-mail para isolamento de dados
    const emailKey = usuarioLogado.email;
    const keyHistorico = `fitfinder_historico_tmb_${emailKey}`;
    const keyMetaAgua = `fitfinder_meta_agua_custom_${emailKey}`;

    // 2. Mapeamento de Elementos do DOM
    const formTMB = document.getElementById('form-tmb');
    const inputPeso = document.getElementById('peso');
    const inputAltura = document.getElementById('altura');
    const inputIdade = document.getElementById('idade');
    const selectSexo = document.getElementById('sexo');
    const selectAtividade = document.getElementById('atividade');

    const listaHistorico = document.getElementById('lista-historico');
    const btnSalvar = formTMB ? formTMB.querySelector('button[type="submit"]') : null;

    // Variável para controle de estado de edição
    let indexEdicao = null;

    /* =========================================================
       3. FUNÇÕES AUXILIARES E DE INTERFACE
       ========================================================= */

    /**
     * Carrega o histórico do localStorage com migração automática do histórico antigo
     */
    function carregarHistorico() {
        let historico = JSON.parse(localStorage.getItem(keyHistorico));

        // MIGRAÇÃO: Se não houver histórico específico do usuário, tenta puxar do histórico genérico antigo
        if (!historico || historico.length === 0) {
            const historicoAntigo = JSON.parse(localStorage.getItem('fitfinder_historico_tmb'));
            if (historicoAntigo && historicoAntigo.length > 0) {
                historico = historicoAntigo;
                // Salva no novo formato individual
                localStorage.setItem(keyHistorico, JSON.stringify(historico));
            } else {
                historico = [];
            }
        }
        
        // Sincroniza a meta de água com o registro mais recente
        if (historico.length > 0) {
            localStorage.setItem(keyMetaAgua, historico[0].metaAgua);
        } else {
            localStorage.setItem(keyMetaAgua, 2000);
        }

        renderizarHistorico(historico);
    }

    /**
     * Retorna a descrição legível do nível de atividade física
     */
    function obterTextoAtividade(fator) {
        const fatorNum = parseFloat(fator);
        switch (fatorNum) {
            case 1.2:
                return 'Sedentário (pouco ou nenhum exercício)';
            case 1.375:
                return 'Levemente ativo (1 a 3 dias/semana)';
            case 1.55:
                return 'Moderadamente ativo (3 a 5 dias/semana)';
            case 1.725:
                return 'Muito ativo (6 a 7 dias/semana)';
            case 1.9:
                return 'Extremamente ativo (treinos intensos diários)';
            default:
                return 'Moderadamente ativo';
        }
    }

    /**
     * Renderiza a lista de cards no histórico de avaliações
     */
    function renderizarHistorico(historico) {
        if (!listaHistorico) return;

        listaHistorico.innerHTML = '';

        if (historico.length === 0) {
            listaHistorico.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--texto-secundario);">
                    <p>Nenhuma avaliação física cadastrada até o momento.</p>
                    <p style="font-size: 0.85rem;">Preencha o formulário acima para calcular seu gasto calórico e meta de água.</p>
                </div>
            `;
            return;
        }

        historico.forEach((item, index) => {
            const card = document.createElement('article');
            card.className = 'card-historico';
            card.style.cssText = 'background: #111; border: 1px solid var(--borda); padding: 18px; border-radius: 8px; margin-bottom: 15px; transition: border-color 0.2s;';

            const textoSexo = item.sexo === 'm' ? 'Masculino' : 'Feminino';
            const textoAtividade = obterTextoAtividade(item.atividade);

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 1px solid #222; padding-bottom: 8px;">
                    <div>
                        <h3 style="color: var(--azul); margin: 0; font-size: 1.3rem; font-weight: 700;">
                            ${item.calorias} kcal/dia
                        </h3>
                        <span style="font-size: 0.85rem; color: var(--texto-secundario);">
                            Gasto Calórico Total Estimado
                        </span>
                    </div>
                    <span style="font-size: 0.8rem; color: #888; background: #1a1a1a; padding: 4px 8px; border-radius: 4px;">
                        [ ${item.data} ]
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin: 12px 0;">
                    <div style="background: #080808; padding: 8px 12px; border-radius: 4px;">
                        <span style="font-size: 0.75rem; color: #888; display: block;">Peso</span>
                        <strong style="color: var(--texto);">${item.peso} kg</strong>
                    </div>
                    <div style="background: #080808; padding: 8px 12px; border-radius: 4px;">
                        <span style="font-size: 0.75rem; color: #888; display: block;">Altura</span>
                        <strong style="color: var(--texto);">${item.altura} cm</strong>
                    </div>
                    <div style="background: #080808; padding: 8px 12px; border-radius: 4px;">
                        <span style="font-size: 0.75rem; color: #888; display: block;">Idade / Sexo</span>
                        <strong style="color: var(--texto);">${item.idade} anos (${textoSexo})</strong>
                    </div>
                </div>

                <div style="background: #08111e; border: 1px solid #1e3a8a; padding: 10px 12px; border-radius: 6px; margin-bottom: 12px;">
                    <span style="font-size: 0.85rem; color: #38bdf8; display: block;">
                        » <strong>Meta Diária de Água Calculada:</strong> ${item.metaAgua} mL/dia
                    </span>
                    <small style="color: #94a3b8; font-size: 0.75rem;">Baseado em 35 mL por kg corporal</small>
                </div>

                <p style="font-size: 0.8rem; color: #888; margin-bottom: 12px;">
                    <strong>Fator de Atividade:</strong> ${textoAtividade}
                </p>

                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button 
                        type="button" 
                        onclick="editarAvaliacao(${index})" 
                        style="padding: 6px 14px; font-size: 0.85rem; background: #222222; border: 1px solid #444444; color: #ffffff; border-radius: 4px; cursor: pointer;">
                        [ / ] Editar
                    </button>
                    <button 
                        type="button" 
                        onclick="excluirAvaliacao(${index})" 
                        style="padding: 6px 14px; font-size: 0.85rem; background: #990000; border: 1px solid #cc0000; color: #ffffff; border-radius: 4px; cursor: pointer;">
                        [ x ] Excluir
                    </button>
                </div>
            `;

            listaHistorico.appendChild(card);
        });
    }

    /* =========================================================
       4. SUBMISSÃO E CÁLCULO FORMULÁRIO TMB
       ========================================================= */

    if (formTMB) {
        formTMB.addEventListener('submit', (e) => {
            e.preventDefault();

            const peso = parseFloat(inputPeso.value);
            const altura = parseFloat(inputAltura.value);
            const idade = parseInt(inputIdade.value);
            const sexo = selectSexo.value;
            const fatorAtividade = parseFloat(selectAtividade.value);

            // Validação de entrada
            if (isNaN(peso) || peso <= 0) {
                alert('Por favor, informe um peso válido.');
                inputPeso.focus();
                return;
            }

            if (isNaN(altura) || altura <= 0) {
                alert('Por favor, informe uma altura válida em centímetros.');
                inputAltura.focus();
                return;
            }

            if (isNaN(idade) || idade <= 0) {
                alert('Por favor, informe uma idade válida.');
                inputIdade.focus();
                return;
            }

            // 1. Cálculo da TMB (Fórmula de Harris-Benedict)
            let tmb = 0;
            if (sexo === 'm') {
                tmb = 66 + (13.7 * peso) + (5 * altura) - (6.8 * idade);
            } else {
                tmb = 655 + (9.6 * peso) + (1.8 * altura) - (4.7 * idade);
            }

            // 2. Cálculo do Gasto Calórico Total
            const gastoTotal = Math.round(tmb * fatorAtividade);

            // 3. Cálculo da Meta Recomendada de Água (35 mL por kg)
            const metaAguaRecomendada = Math.round(peso * 35);

            const dataHoje = new Date().toLocaleDateString('pt-BR');

            // Objeto com os dados completos do cálculo
            const novaAvaliacao = {
                calorias: gastoTotal,
                peso: peso,
                altura: altura,
                idade: idade,
                sexo: sexo,
                atividade: fatorAtividade,
                metaAgua: metaAguaRecomendada,
                data: dataHoje
            };

            let historico = JSON.parse(localStorage.getItem(keyHistorico)) || [];

            if (indexEdicao !== null) {
                // Atualiza o registro existente
                historico[indexEdicao] = novaAvaliacao;
                indexEdicao = null;
                if (btnSalvar) btnSalvar.textContent = 'Calcular e Salvar Avaliação';
            } else {
                // Adiciona a nova avaliação no início do histórico (mais recente)
                historico.unshift(novaAvaliacao);
            }

            // Atualiza o histórico no localStorage
            localStorage.setItem(keyHistorico, JSON.stringify(historico));

            // SINCRONIZAÇÃO AUTOMÁTICA: Atualiza a meta de água ativa do usuário
            localStorage.setItem(keyMetaAgua, metaAguaRecomendada);

            alert(`[ ok ] Avaliação calculada com sucesso!\n\nGasto Calórico Estimado: ${gastoTotal} kcal/dia\nMeta Diária de Água Atualizada: ${metaAguaRecomendada} mL/dia`);

            // Reseta formulário e recarrega interface
            formTMB.reset();
            carregarHistorico();
        });
    }

    /* =========================================================
       5. FUNÇÕES GLOBAIS DE MANIPULAÇÃO DO HISTÓRICO
       ========================================================= */

    /**
     * Carrega os dados de um item do histórico de volta para o formulário para edição
     */
    window.editarAvaliacao = function(index) {
        const historico = JSON.parse(localStorage.getItem(keyHistorico)) || [];
        const item = historico[index];

        if (!item) return;

        inputPeso.value = item.peso;
        inputAltura.value = item.altura;
        inputIdade.value = item.idade;
        selectSexo.value = item.sexo;
        selectAtividade.value = item.atividade;

        indexEdicao = index;
        if (btnSalvar) btnSalvar.textContent = 'Atualizar Avaliação Selecionada';

        // Rola a tela suavemente até o formulário
        window.scrollTo({
            top: formTMB.offsetTop - 30,
            behavior: 'smooth'
        });
    };

    /**
     * Remove um registro do histórico e reavalia a meta de água
     */
    window.excluirAvaliacao = function(index) {
        if (confirm('Tem certeza de que deseja excluir este registro de avaliação física?')) {
            let historico = JSON.parse(localStorage.getItem(keyHistorico)) || [];
            historico.splice(index, 1);
            
            localStorage.setItem(keyHistorico, JSON.stringify(historico));
            
            // Recarrega o histórico e re-sincroniza a meta de água
            carregarHistorico();
        }
    };

    // Inicialização da página
    carregarHistorico();

});