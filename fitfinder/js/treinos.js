/* =========================================================
   FITFINDER - GERENCIADOR E FILTRO DE TREINOS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const formTreino = document.getElementById('form-treino');
    const inputId = document.getElementById('treino-id');
    const inputExercicio = document.getElementById('exercicio');
    const inputSeries = document.getElementById('series');
    const checkboxesCategoria = document.querySelectorAll('input[name="categoria"]');
    const btnSalvar = document.getElementById('btn-salvar-treino');
    const btnCancelar = document.getElementById('btn-cancelar-edicao');
    
    const selectFiltro = document.getElementById('filtro-categoria');
    const listaUI = document.getElementById('lista-treinos');

    let treinos = JSON.parse(localStorage.getItem('fitfinder_treinos_lista')) || [];

    // Função para renderizar a lista conforme o filtro ativo
    function renderizarTreinos() {
        listaUI.innerHTML = '';
        const filtro = selectFiltro.value;

        // Filtra a lista de treinos
        const treinosFiltrados = treinos.filter(t => {
            if (filtro === 'Todos') return true;
            return t.categorias.includes(filtro);
        });

        if (treinosFiltrados.length === 0) {
            listaUI.innerHTML = '<li style="color: var(--texto-fraco); padding: 10px 0;">Nenhum exercício encontrado para este filtro.</li>';
            return;
        }

        treinosFiltrados.forEach((item, index) => {
            const indexReal = treinos.indexOf(item);
            const li = document.createElement('li');
            li.style.cssText = 'background: #111; padding: 15px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--borda); flex-wrap: wrap; gap: 10px;';

            const tagsCategorias = item.categorias.map(cat => 
                `<span style="background: var(--azul); color: #fff; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; margin-right: 4px;">${cat}</span>`
            ).join('');

            li.innerHTML = `
                <div style="flex: 1 1 200px;">
                    <div style="margin-bottom: 6px;">${tagsCategorias}</div>
                    <strong style="font-size: 1.1rem; color: #fff;">${item.exercicio}</strong>
                    <div style="color: var(--texto-secundario); font-size: 0.95rem; margin-top: 4px;">${item.series}</div>
                </div>

                <div style="display: flex; gap: 8px;">
                    <button 
                        type="button" 
                        onclick="prepararEdicao(${indexReal})" 
                        style="min-height: auto; padding: 8px 14px; background: var(--borda-clara); border-color: var(--borda-clara); font-size: 0.85rem;">
                        ✏️ Editar
                    </button>
                    <button 
                        type="button" 
                        onclick="removerTreino(${indexReal})" 
                        style="min-height: auto; padding: 8px 14px; background: #cc0000; border-color: #cc0000; font-size: 0.85rem;">
                        🗑️ Excluir
                    </button>
                </div>
            `;

            listaUI.appendChild(li);
        });

        localStorage.setItem('fitfinder_treinos_lista', JSON.stringify(treinos));
    }

    // Salvar ou Atualizar
    formTreino.addEventListener('submit', (e) => {
        e.preventDefault();

        // Pega as categorias selecionadas
        const categoriasSelecionadas = Array.from(checkboxesCategoria)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (categoriasSelecionadas.length === 0) {
            alert('Por favor, selecione pelo menos um grupo muscular!');
            return;
        }

        const idEdicao = inputId.value;

        if (idEdicao !== '') {
            // Atualizar existente
            treinos[idEdicao] = {
                exercicio: inputExercicio.value.trim(),
                series: inputSeries.value.trim(),
                categorias: categoriasSelecionadas
            };
            alert('Exercício atualizado com sucesso!');
        } else {
            // Criar novo
            const novoTreino = {
                exercicio: inputExercicio.value.trim(),
                series: inputSeries.value.trim(),
                categorias: categoriasSelecionadas
            };
            treinos.push(novoTreino);
        }

        limparFormulario();
        renderizarTreinos();
    });

    // Função para carregar dados no formulário para editar
    window.prepararEdicao = (index) => {
        const item = treinos[index];
        inputId.value = index;
        inputExercicio.value = item.exercicio;
        inputSeries.value = item.series;

        checkboxesCategoria.forEach(cb => {
            cb.checked = item.categorias.includes(cb.value);
        });

        btnSalvar.textContent = 'Atualizar Exercício';
        btnCancelar.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Excluir treino
    window.removerTreino = (index) => {
        if (confirm('Deseja realmente excluir este exercício?')) {
            treinos.splice(index, 1);
            limparFormulario();
            renderizarTreinos();
        }
    };

    function limparFormulario() {
        inputId.value = '';
        inputExercicio.value = '';
        inputSeries.value = '';
        checkboxesCategoria.forEach(cb => cb.checked = false);
        btnSalvar.textContent = 'Salvar Exercício';
        btnCancelar.style.display = 'none';
    }

    btnCancelar.addEventListener('click', limparFormulario);
    selectFiltro.addEventListener('change', renderizarTreinos);

    renderizarTreinos();

});