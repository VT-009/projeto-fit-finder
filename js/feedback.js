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
        const linhaMensagem = document.createElement('div');
        linhaMensagem.className = 'feedback-mensagem';
        const icone = document.createElement('i');
        icone.className = sucesso ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
        icone.setAttribute('aria-hidden', 'true');
        const conteudo = document.createElement('span');
        conteudo.textContent = `${sucesso ? 'Sucesso: ' : 'Atenção: '}${texto}`;
        linhaMensagem.append(icone, conteudo);
        regiao.replaceChildren(linhaMensagem);
        regiao.focus();
    };

    window.mostrarAcessoRestrito = function () {
        const texto = 'Faça o cadastro ou entre na sua conta para ter todas as ferramentas disponíveis.';
        window.mostrarMensagem(texto);
        const regiao = document.getElementById('feedback-global');
        regiao.classList.add('feedback-com-acoes');
        regiao.querySelector('.feedback-mensagem span').textContent = texto;
        const acoes = document.createElement('div');
        acoes.className = 'feedback-acoes';
        acoes.innerHTML = '<a class="btn-primary" href="login.html">Entrar</a><a class="btn-secondary" href="cadastro.html">Criar Conta</a>';
        regiao.appendChild(acoes);
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('form').forEach(form => {
            form.noValidate = true;
            form.addEventListener('submit', event => {
                const campo = Array.from(form.elements).find(el => el.willValidate && el.required && !el.disabled &&
                    ((el.type === 'checkbox' || el.type === 'radio') ? !el.checked : !String(el.value || '').trim()));
                if (campo) {
                    event.preventDefault(); event.stopImmediatePropagation();
                    window.mostrarMensagem('Preencha este campo para continuar.'); campo.focus(); return;
                }
                const email = Array.from(form.elements).find(el => el.type === 'email' && el.value.trim());
                if (email && !/^[A-Z0-9._%+-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(email.value.trim())) {
                    event.preventDefault(); event.stopImmediatePropagation();
                    window.mostrarMensagem("Digite um endereço de e-mail válido contendo '@' (exemplo: nome@email.com)."); email.focus(); return;
                }
                const senha = Array.from(form.elements).find(el => el.type === 'password' && el.required);
                if (senha && senha.value.length < 8) {
                    event.preventDefault(); event.stopImmediatePropagation();
                    window.mostrarMensagem('A senha precisa ter pelo menos 8 caracteres.'); senha.focus(); return;
                }
                const numeroInvalido = Array.from(form.elements).find(el => el.type === 'number' && el.value &&
                    (!Number.isFinite(Number(el.value)) || (el.min !== '' && Number(el.value) < Number(el.min)) || (el.max !== '' && Number(el.value) > Number(el.max))));
                if (numeroInvalido) {
                    event.preventDefault(); event.stopImmediatePropagation();
                    window.mostrarMensagem('Digite um valor numérico válido dentro do intervalo permitido.'); numeroInvalido.focus();
                }
            }, true);
        });
    });
})();
