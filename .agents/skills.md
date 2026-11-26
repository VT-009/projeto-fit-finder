---
name: fitfinder-auditor-acessibilidade-ux
description: Skill de auditoria de acessibilidade (WCAG 2.1 AA/AAA), design system e engenharia front-end aplicada ao desenvolvimento da plataforma web FitFinder.
---

# Skills de IA Utilizadas no Desenvolvimento — FitFinder

Este documento registra as competências (*skills*) e diretrizes de agentes de Inteligência Artificial utilizadas para projetar, auditar, refinar e documentar a plataforma **FitFinder** (busca de academias e gestão de bem-estar em Maceió/AL).

---

## 1. Skill Principal: Auditoria de Acessibilidade Digital (WCAG 2.1 AA/AAA)

### Objetivo
Garantir que todas as páginas, formulários, fluxos de autenticação e componentes interativos do FitFinder cumpram integralmente os critérios da **WCAG 2.1 Nível AA** e alcancem padrões de excelência do **Nível AAA**.

### Regras e Critérios Aplicados
1. **Contraste de Cores e Daltonismo (WCAG 1.4.3 / 1.4.6):**
   - Manter paleta Dark Mode (`#05080e` como fundo base e `#0d1117` / `#111827` em superfícies) com textos primários (`#e2e8f0` / `#f0f6fc`) atingindo razão de contraste superior a **15:1 (Nível AAA)**.
   - Garantir que estados semânticos nunca dependam apenas de cor: alertas de erro (`#251116` / `#fca5a5`) e sucesso (`#052e16` / `#bbf7d0`) devem combinar ícones, bordas distintas e prefixos textuais claros (*"Atenção:"* e *"Sucesso:"*).
2. **Alvos Interativos de Toque (WCAG 2.5.5 — Nível AAA):**
   - Exigir dimensão mínima de **`44px × 44px`** em todos os botões, links do menu dropdown, checkboxes, inputs e estrelas de avaliação.
3. **Navegação por Teclado e Gerenciamento de Foco (WCAG 2.1.1 / 2.4.7):**
   - Garantir *skip link* ("Pular para o conteúdo principal") visível ao foco em todas as páginas.
   - Aplicar `:focus-visible` de alto contraste (`3px solid #38bdf8`) em todos os elementos interativos.
   - Suportar navegação completa via `Tab` / `Shift+Tab`, ativação por `Enter` / `Espaço` nas estrelas de avaliação e fechamento do menu dropdown via tecla `Esc` com devolução de foco ao botão acionador.
4. **Semântica e Leitores de Tela (WCAG 4.1.2):**
   - Utilizar *landmarks* HTML5 (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`), atributos `aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-pressed` e regiões dinâmicas `aria-live="polite"` / `aria-live="assertive"` (`#feedback-global`).
5. **Ampliação e Refluxo (WCAG 1.4.4 / 1.4.10):**
   - Validar layout fluido até **200% de zoom** sem rolagem horizontal (`overflow-x: clip`, `min-width: 320px`) e layouts em coluna única na página de detalhes.

---

## 2. Skill de Apoio: Especialista em UI/UX & Design Systems

### Objetivo
Padronizar tokens visuais, eliminar atritos na jornada do usuário e manter consistência entre todas as 10 páginas do sistema.

### Diretrizes Executadas
- **Arquitetura de Navegação Unificada (`js/user-menu.js`):** Centralização de toda a navegação global em um único botão dropdown (`Menu` para visitantes; primeiro nome do usuário quando autenticado).
- **Onboarding Sem Atrito e Bloqueio Educativo (`js/auth.js`, `js/feedback.js`):**
  - Login automático imediatamente após o cadastro em `cadastro.html`, redirecionando o usuário já autenticado para `index.html`.
  - Exibição das ferramentas restritas (*Treinos*, *Avaliação Física*, *Meta de Água*) no menu para visitantes com bloqueio educativo e botões diretos para **Entrar** e **Criar Conta**.
- **Validação Localizada em Português:** Desativação de balões nativos em inglês (`novalidate`) e exibição de mensagens inline em português sem causar saltos verticais (*layout shift*) nos formulários.
- **Avaliação por Estrelas Sem Viés:** Inicialização com nota `0` (estrelas vazias) e preenchimento progressivo no *hover*.

---

## 3. Skill de Apoio: Engenharia Front-end & Arquitetura Web

### Objetivo
Estruturar o código HTML5, CSS3 e JavaScript ES6 de forma modular, desacoplada e fácil de manter ou migrar para backend (Flask/Jinja2).

### Diretrizes Executadas
- Separação de responsabilidades por script (`auth.js`, `main.js`, `detalhes.js`, `treinos.js`, `avaliacao.js`, `agua.js`, `perfil.js`, `feedback.js`, `user-menu.js`).
- Isolamento de dados por usuário no `localStorage` por meio de chaves indexadas por e-mail.
- Documentação da equivalência arquitetural entre cliente (`localStorage`) e servidor (`Flask sessions` + `cookies HttpOnly`) no arquivo `/docs/PRD.md`.