/* =========================================================
   FITFINDER - AVALIAÇÃO FÍSICA (TMB) E ISOLAMENTO DE DADOS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Verificação de Autenticação do Usuário
    const usuarioLogado = JSON.parse(localStorage.getItem('fitfinder_usuario_logado'));

    if (!usuarioLogado) {
        alert('Para acessar recursos completos, faça login.');
        window.location.href = 'login.html';
        return;
    }

    // Chaves EXCLUSIVAS vinculadas estritamente ao e-mail ou nome da conta atual
    const idUsuario = usuarioLogado.email || usuarioLogado.nome;
    const keyHistorico = `fitfinder_historico_tmb_${idUsuario}`;
    const keyMetaAgua = `fitfinder_meta_agua_custom_${idUsuario}`;

    // 2. Mapeamento de Elementos do DOM
    const formTMB = document.getElementById('form-tmb') || document.querySelector('form');
    const inputPeso = document.getElementById('peso');
    const inputAltura = document.getElementById('altura');
    const inputIdade = document.getElementById('idade');
    const selectSexo = document.getElementById('sexo');
    const selectAtividade = document.getElementById('atividade');

    const listaHistorico = document.getElementById('lista-historico');

    /* =========================================================
       3. FUNÇÕES AUXILIARES E DE INTERFACE
       ========================================================= */

    function carregarHistorico() {
        let historico = JSON.parse(localStorage.getItem(keyHistorico)) || [];

        historico = historico.map(item => {
            const peso = parseFloat(item.peso) || 0;
            const altura = parseFloat(item.altura) || 0;
            const idade = parseInt(item.idade) || 0;
            const sexoRaw = String(item.sexo || 'm').toLowerCase();
            const fatorAtividade = parseFloat(item.atividade) || 1.2;

            let calorias = item.calorias || item.gastoCalorico || item.gastoTotal;
            if (!calorias && peso > 0) {
                let tmb = (sexoRaw.startsWith('m')) ? 
                    66 + (13.7 * peso) + (5 * altura) - (6.8 * idade) : 
                    655 + (9.6 * peso) + (1.8 * altura) - (4.7 * idade);
                calorias = Math.round(tmb * fatorAtividade);
            }

            let metaAgua = item.metaAgua;
            if (!metaAgua && peso > 0) {
                metaAgua = Math.round(peso * 35);
            }

            return {
                calorias: calorias || 0,
                peso: peso,
                altura: altura,
                idade: idade,
                sexo: sexoRaw.startsWith('m') ? 'm' : 'f',
                atividade: fatorAtividade,
                metaAgua: metaAgua || 2000,
                data: item.data || new Date().toLocaleDateString('pt-BR')
            };
        });

        if (historico.length > 0) {
            localStorage.setItem(keyMetaAgua, historico[0].metaAgua);
        } else {
            localStorage.setItem(keyMetaAgua, 2000);
        }

        renderizarHistorico(historico);
    }

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

    function renderizarHistorico(historico) {
        if (!listaHistorico) return;

        listaHistorico.innerHTML = '';

        if (historico.length === 0) {
            listaHistorico.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--texto-secundario, #888);">
                    <p>Nenhuma avaliação física cadastrada até o momento.</p>
                    <p style="font-size: 0.85rem;">Preencha o formulário acima para calcular seu gasto calórico e meta de água.</p>
                </div>
            `;
            return;
        }

        historico.forEach((item, index) => {
            const card = document.createElement('article');
            card.className = 'card-historico';
            card.style.cssText = 'background: #111; border: 1px solid var(--borda, #222); padding: 18px; border-radius: 8px; margin-bottom: 15px; transition: border-color 0.2s;';

            const textoSexo = item.sexo === 'm' ? 'Masculino' : 'Feminino';
            const textoAtividade = obterTextoAtividade(item.atividade);

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 1px solid #222; padding-bottom: 8px;">
                    <div>
                        <h3 style="color: var(--azul, #38bdf8); margin: 0; font-size: 1.3rem; font-weight: 700;">
                            ${item.calorias} kcal/dia
                        </h3>
                        <span style="font-size: 0.85rem; color: var(--texto-secundario, #aaa);">
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
                        <strong style="color: #fff;">${item.peso} kg</strong>
                    </div>
                    <div style="background: #080808; padding: 8px 12px; border-radius: 4px;">
                        <span style="font-size: 0.75rem; color: #888; display: block;">Altura</span>
                        <strong style="color: #fff;">${item.altura} cm</strong>
                    </div>
                    <div style="background: #080808; padding: 8px 12px; border-radius: 4px;">
                        <span style="font-size: 0.75rem; color: #888; display: block;">Idade / Sexo</span>
                        <strong style="color: #fff;">${item.idade} anos (${textoSexo})</strong>
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

                <div style="display: flex; justify-content: flex-end;">
                    <button 
                        type="button" 
                        class="btn-excluir-item"
                        data-index="${index}"
                        style="padding: 6px 14px; font-size: 0.85rem; background: #990000; border: 1px solid #cc0000; color: #ffffff; border-radius: 4px; cursor: pointer;">
                        [ x ] Excluir
                    </button>
                </div>
            `;

            listaHistorico.appendChild(card);
        });

        vincularEventosCard();
    }

    function vincularEventosCard() {
        const botoesExcluir = listaHistorico.querySelectorAll('.btn-excluir-item');

        botoesExcluir.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                executarExclusao(idx);
            });
        });
    }

    function executarExclusao(index) {
        if (confirm('Tem certeza de que deseja excluir este registro de avaliação física?')) {
            let historico = JSON.parse(localStorage.getItem(keyHistorico)) || [];
            historico.splice(index, 1);
            
            localStorage.setItem(keyHistorico, JSON.stringify(historico));
            carregarHistorico();
        }
    }

    /* =========================================================
       4. SUBMISSÃO E CÁLCULO DO FORMULÁRIO TMB
       ========================================================= */

    if (formTMB) {
        formTMB.addEventListener('submit', (e) => {
            e.preventDefault();

            const peso = parseFloat(inputPeso ? inputPeso.value : 0);
            const altura = parseFloat(inputAltura ? inputAltura.value : 0);
            const idade = parseInt(inputIdade ? inputIdade.value : 0);
            const sexoRaw = String(selectSexo ? selectSexo.value : 'm').toLowerCase();
            const fatorAtividade = parseFloat(selectAtividade ? selectAtividade.value : 1.2);

            if (isNaN(peso) || peso <= 0) {
                alert('Por favor, informe um peso válido.');
                if (inputPeso) inputPeso.focus();
                return;
            }

            if (isNaN(altura) || altura <= 0) {
                alert('Por favor, informe uma altura válida em centímetros.');
                if (inputAltura) inputAltura.focus();
                return;
            }

            if (isNaN(idade) || idade <= 0) {
                alert('Por favor, informe uma idade válida.');
                if (inputIdade) inputIdade.focus();
                return;
            }

            // Cálculo TMB Harris-Benedict (Suporta 'm', 'f', 'masculino', 'feminino')
            let tmb = 0;
            if (sexoRaw.startsWith('m')) {
                tmb = 66 + (13.7 * peso) + (5 * altura) - (6.8 * idade);
            } else {
                tmb = 655 + (9.6 * peso) + (1.8 * altura) - (4.7 * idade);
            }

            const gastoTotal = Math.round(tmb * fatorAtividade);
            const metaAguaRecomendada = Math.round(peso * 35);
            const dataHoje = new Date().toLocaleDateString('pt-BR');

            const novaAvaliacao = {
                calorias: gastoTotal,
                peso: peso,
                altura: altura,
                idade: idade,
                sexo: sexoRaw.startsWith('m') ? 'm' : 'f',
                atividade: fatorAtividade,
                metaAgua: metaAguaRecomendada,
                data: dataHoje
            };

            let historico = JSON.parse(localStorage.getItem(keyHistorico)) || [];
            historico.unshift(novaAvaliacao);

            localStorage.setItem(keyHistorico, JSON.stringify(historico));
            localStorage.setItem(keyMetaAgua, metaAguaRecomendada);

            alert(`[ ok ] Avaliação calculada com sucesso!\n\nGasto Calórico Estimado: ${gastoTotal} kcal/dia\nMeta Diária de Água Atualizada: ${metaAguaRecomendada} mL/dia`);

            formTMB.reset();
            carregarHistorico();
        });
    }

    window.excluirAvaliacao = executarExclusao;

    // Inicialização ao carregar a página
    carregarHistorico();

});
