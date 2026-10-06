/* =========================================================
   FITFINDER - FILTRO DINÂMICO DE ACADEMIAS POR BAIRRO
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const selectBairro = document.getElementById('bairro');
    const cardsAcademias = document.querySelectorAll('main section:last-of-type article');

    if (!selectBairro || cardsAcademias.length === 0) return;

    // Função para remover acentos e padronizar textos
    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
    }

    selectBairro.addEventListener('change', () => {
        const valorSelecionado = normalizarTexto(selectBairro.value);

        cardsAcademias.forEach(card => {
            // Pega o texto do segundo parágrafo (onde fica o bairro no card)
            const paragrafos = card.querySelectorAll('p');
            
            if (paragrafos.length >= 2) {
                const bairroCard = normalizarTexto(paragrafos[1].textContent);

                // Se não selecionou nada ("Todos") ou o bairro for igual
                if (valorSelecionado === '' || bairroCard.includes(valorSelecionado)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });

});