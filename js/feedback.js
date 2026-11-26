/* Feedback inline acessível compartilhado pelas páginas do FitFinder. */
(function () {
    window.mostrarMensagem = function (mensagem, tipo) {
        const texto = String(mensagem || '');
        const sucesso = tipo === 'sucesso' || /sucesso|atualizado|cadastrado/i.test(texto);
        let regiao = document.getElementById('feedback-global');
        if (!regiao) {
            regiao = document.createElement('div');
            regiao.id = 'feedback-global';
            regiao.className = 'feedback-global';
            regiao.setAttribute('role', sucesso ? 'status' : 'alert');
            regiao.setAttribute('aria-live', sucesso ? 'polite' : 'assertive');
            regiao.setAttribute('tabindex', '-1');
            const principal = document.querySelector('main');
            if (principal) principal.prepend(regiao);
            else document.body.prepend(regiao);
        }
        regiao.className = `feedback-global ${sucesso ? 'estado-sucesso' : 'estado-erro'}`;
        regiao.setAttribute('role', sucesso ? 'status' : 'alert');
        regiao.setAttribute('aria-live', sucesso ? 'polite' : 'assertive');
        const icone = document.createElement('i');
        icone.className = sucesso ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
        icone.setAttribute('aria-hidden', 'true');
        const conteudo = document.createElement('span');
        conteudo.textContent = `${sucesso ? 'Sucesso: ' : 'Atenção: '}${texto}`;
        regiao.replaceChildren(icone, conteudo);
        regiao.focus();
    };
})();
