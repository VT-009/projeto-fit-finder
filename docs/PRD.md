# PRD — FitFinder

**Plataforma Web de Busca de Academias e Gestão de Bem-Estar (Maceió/AL)**

| Campo | Valor |
|---|---|
| Versão do documento | 3.0 — entrega da 3ª Avaliação (IHC/UX) |
| Data | 26/11/2026 |
| Autor | Alan Victor |
| Base de análise | Repositório `fitfinder` (10 páginas HTML, 1 CSS, 11 scripts JS, 33 imagens, histórico Git com 9 commits) |
| Local de entrega | `/docs/PRD.md` · Skills de IA em `/.agents/skills.md` |

> **Nota de fidelidade ao código.** Este documento descreve o que **existe** no repositório. O FitFinder é uma aplicação **front-end estática** (HTML5 + CSS3 + JavaScript puro) que persiste dados no `localStorage` do navegador. **Não há servidor Flask, templates Jinja2 nem cookies HTTP no código.** Onde a rubrica pede arquitetura de backend, o documento (a) mapeia cada regra de negócio atual para o seu equivalente em Flask e (b) deixa explícito o que é **proposta de migração** e não código existente. Medições que dependem de ferramentas externas (Lighthouse, zoom 200%, simulação de daltonismo) estão marcadas como **declaradas pela equipe** até que o relatório seja anexado.

---

## 1. Visão Geral do Produto (PRD)

### 1.1 Identificação do Projeto

| Item | Descrição |
|---|---|
| Nome | FitFinder — *Encontre. Treine. Evolua.* |
| Tipo | Plataforma web (site multipágina) de busca de academias e acompanhamento pessoal de bem-estar |
| Contexto geográfico | Maceió/AL — 14 academias cadastradas em 7 bairros: Antares, Serraria, Jatiúca, Ponta Verde, Benedito Bentes, Cidade Universitária e Santa Lúcia |
| Stack real | HTML5 semântico, CSS3 (tema escuro, tokens em `:root`), JavaScript ES6 sem framework, Font Awesome 6.5.1 e Google Material Symbols (CDN) |
| Persistência real | `localStorage` do navegador (sem banco de dados e sem servidor) |
| Idioma | Português do Brasil (`lang="pt-BR"`) |

### 1.2 Escopo e aderência à rubrica da disciplina

| Item da rubrica | Situação no repositório | O que este documento entrega |
|---|---|---|
| **Backend** — funcionalidades do projeto (ex.: Flask) | **Não implementado.** Toda a lógica roda no navegador (`js/*.js`). | Documenta todas as regras de negócio reais (RN01–RN16), o inventário de módulos e o **mapeamento proposto** para rotas/controllers/modelos Flask (seção 2.5). |
| **DOC** — PRD em `/docs` e skills em `/.agents` | Atendido por este entregável. | `PRD.md`, `skills.md` e PDF consolidado. |
| **Frontend** integrado ao back com *template language* (ex.: Bootstrap + Jinja2) | **Parcial.** Há renderização dinâmica por *template literals* de JS; não há Jinja2 nem Bootstrap. | Tabela de equivalência Jinja2 ↔ implementação atual (seção 3.4) e rota de migração. |
| **Autenticação** — sessions + cookies | **Parcial.** Autenticação simulada no cliente (`localStorage`); sem cookie de sessão. | Fluxo real documentado (seção 4.1–4.4) e explicação técnica de *sessions + cookies* com exemplo ilustrativo em Flask (seção 4.5). |

### 1.3 Problema, Proposta de Valor e Público-Alvo

**Problema.** Quem quer começar ou retomar a atividade física em Maceió precisa pesquisar academias em fontes dispersas (redes sociais, mapas, sites individuais), sem comparação padronizada de preços, estrutura e horários, e sem um lugar único para acompanhar treinos, gasto calórico e hidratação.

**Proposta de valor.** Reunir em um só lugar (1) comparação de academias por bairro com preço, nota, estrutura, horários e contato e (2) ferramentas pessoais gratuitas — registro de treinos, avaliação física (TMB) e meta diária de água — com experiência acessível (tema escuro de alto contraste, navegação por teclado, mensagens em português).

| Público-alvo | Dor principal | Como o FitFinder ajuda |
|---|---|---|
| Iniciante em atividade física | Não sabe qual academia escolher nem quanto gastar | Cards com preço inicial, nota e aparelhos; página de detalhes com planos e convênios |
| Praticante recorrente | Organizar treinos e acompanhar metas | Lista de treinos por grupo muscular, TMB com histórico e meta de água diária |
| Visitante / curioso | Quer explorar antes de criar conta | Exploração livre das academias; bloqueio **educativo** das ferramentas pessoais com botões *Entrar* e *Criar Conta* |
| Pessoa com necessidades de acessibilidade | Interfaces de baixo contraste e sem teclado | Tema escuro com contraste alto, foco visível, alvos de 44 px, *skip link*, ARIA |

### 1.4 Requisitos Funcionais

| ID | Requisito | Prioridade | Critérios de aceite | Implementação |
|---|---|---|---|---|
| RF01 | Explorar academias e **filtrar por bairro** | Alta | Dado o seletor de bairro, ao escolher um bairro somente os cards correspondentes ficam visíveis; sem resultado, exibe "Nenhuma academia encontrada"; "Todos os bairros" restaura a lista; a busca ignora acentos e hífens | `index.html`, `js/main.js` |
| RF02 | Ver **detalhes da academia** (fotos, planos, estrutura, horários, endereço, telefone, Instagram) | Alta | `detalhes.html?id=<slug>` carrega os dados de `window.dadosAcademias`; `id` inexistente mostra "Academia não encontrada" com link de volta; sem `id`, abre `n2-antares` | `detalhes.html`, `js/detalhes.js`, `js/dados-academias.js` |
| RF03 | **Conta de usuário**: cadastro com login automático, login, logout, recuperação de senha e perfil (editar dados, trocar senha, excluir conta) | Alta | Cadastro válido cria a conta, inicia a sessão e redireciona para `index.html`; e-mail duplicado é recusado; login inválido mostra erro; recuperação exige e-mail cadastrado e código; troca de senha exige senha atual | `cadastro.html`, `login.html`, `recuperar-senha.html`, `perfil.html`, `js/auth.js`, `js/recuperar-senha.js`, `js/perfil.js` |
| RF04 | **Controle de acesso** com bloqueio educativo | Alta | Visitante que clica em *Treinos*, *Avaliação Física* ou *Meta de Água* — ou digita a URL direta (`treinos`, `avaliacao`, `agua`, `perfil`) — vê o aviso "Faça o cadastro ou entre na sua conta para ter todas as ferramentas disponíveis." com botões **Entrar** e **Criar Conta** | `js/user-menu.js`, `js/feedback.js` e guarda no início de cada script de página |
| RF05 | **Gestão de treinos** (criar, editar, excluir e filtrar por grupo muscular) | Média | Exige exercício, séries e ao menos 1 de 8 grupos musculares; lista isolada por usuário; filtro "Todos" ou por grupo | `treinos.html`, `js/treinos.js` |
| RF06 | **Avaliação física (TMB)** com gasto calórico e meta de água | Média | Peso, altura e idade > 0; calcula TMB (Harris-Benedict), gasto diário e meta de água (35 mL/kg); mantém histórico com data e exclusão | `avaliacao.html`, `js/avaliacao.js` |
| RF07 | **Registro diário de água** | Média | Botões +250 mL, +500 mL, −250 mL (mínimo 0), valor manual e reset; mostra consumo e meta; zera automaticamente ao mudar o dia | `agua.html`, `js/agua.js` |
| RF08 | **Avaliações com estrelas** (por academia e da plataforma) | Média | Começa com 0 estrelas; *hover* preenche progressivamente; clique/Enter/Espaço selecionam; exige nota e texto; só usuário autenticado publica; autor pode excluir o próprio comentário | `js/detalhes.js`, `js/main.js` (`#form-feedback-site`) |

### 1.5 Requisitos Não Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Status |
|---|---|---|---|---|
| RNF01 | **Acessibilidade WCAG 2.1 AA** (meta AAA onde viável) | Alta | Contraste ≥ 4,5:1 em texto; foco visível; navegação por teclado; ARIA; *skip link*; cor nunca é o único indicador de estado | Verificado no código e por cálculo (seção 5); Lighthouse **declarado** |
| RNF02 | **Responsividade e zoom 200%** | Alta | Sem rolagem horizontal; grid adaptável; `min-width: 320px`; pontos de quebra em 900, 600 e 400 px | CSS verificado; teste de zoom **declarado** |
| RNF03 | **Usabilidade e localização PT-BR** | Alta | Formulários com `novalidate`; mensagens em português, inline, em uma região única com foco programático | Atendido (`js/feedback.js`) |
| RNF04 | **Desempenho e simplicidade de implantação** | Média | Site estático sem *build*; scripts por página; hospedável em qualquer servidor de arquivos | Atendido |
| RNF05 | **Privacidade e segurança** | Alta | Dados do usuário isolados por e-mail; senha não deve ser armazenada em texto puro; saída HTML deve ser escapada | **Parcial** — ver limitações na seção 2.6 |
| RNF06 | **Manutenibilidade** | Média | Um script por responsabilidade; tokens de design em `:root`; *commits* convencionais (`feat`, `fix`) | Atendido |

### 1.6 Jornada do Usuário e Fluxos Principais

**Fluxo A — Visitante (exploração + bloqueio educativo)**

1. Abre `index.html`; o banner "Ainda não tem conta? Cadastre-se gratuitamente…" aparece (apenas para não autenticados).
2. Filtra por bairro e abre `detalhes.html?id=…` para comparar planos, estrutura e horários.
3. Abre o menu **Menu ▾** e tenta acessar *Treinos*, *Avaliação Física* ou *Meta de Água*.
4. O clique é interceptado: aparece o aviso educativo com **Entrar** e **Criar Conta**.
5. Se tentar publicar comentário ou avaliação, é redirecionado para `login.html`.

**Fluxo B — Usuário autenticado**

1. **Cadastro** (`cadastro.html`): nome, e-mail, senha (mín. 8) e confirmação → conta criada, **login automático** e redirecionamento em 1,2 s com alerta verde de sucesso.
2. O rótulo do menu passa de "Menu" para o **primeiro nome** do usuário; surgem *Meu Perfil* e *Sair*.
3. **Treinos**: cadastra exercícios, séries e grupos musculares; filtra, edita e exclui.
4. **Avaliação física**: informa sexo, idade, peso, altura e nível de atividade → recebe gasto calórico e meta de água, que alimenta a página **Meta de Água**.
5. **Meta de Água**: registra o consumo ao longo do dia.
6. **Avaliações**: publica nota por estrelas e comentário em uma academia ou na plataforma.
7. **Sair** remove a sessão e volta para `index.html`.

```
Visitante ──► index (filtro) ──► detalhes?id=… ──► [tenta ferramenta] ──► aviso educativo
                                                                         │
                                          ┌── Entrar ───────────────────┤
                                          └── Criar Conta ──► login automático
                                                                         ▼
                              Treinos · Avaliação Física · Meta de Água · Perfil · Avaliações
```

---

## 2. Arquitetura e Funcionalidades (Backend / Regras de Negócio)

### 2.1 Arquitetura real encontrada no repositório

```
 Navegador (único ambiente de execução)
 ┌──────────────────────────────────────────────────────────┐
 │  HTML estático (10 páginas)                              │
 │     └─ <script> por página ──► js/feedback.js (global)   │
 │                              ├─ js/<modulo>.js           │
 │                              └─ js/user-menu.js (global) │
 │  CSS/style.css (tokens, componentes, estados)            │
 │  js/dados-academias.js  = "base de dados" em memória     │
 │  localStorage           = persistência por chave         │
 └──────────────────────────────────────────────────────────┘
   Sem servidor de aplicação · Sem API REST · Sem banco · Sem cookies HTTP
```

Cada página carrega `feedback.js` primeiro (define `mostrarMensagem` e `mostrarAcessoRestrito` globais), depois o módulo da página e, por último, `user-menu.js`, que monta o menu e aplica a guarda de acesso.

### 2.2 Inventário de módulos e responsabilidades

| Módulo | Páginas | Responsabilidade | Dados que lê/escreve |
|---|---|---|---|
| `auth.js` | `cadastro`, `login` | Valida e cria conta; valida credenciais; inicia sessão; login automático pós-cadastro | `fitfinder_usuarios`, `fitfinder_usuario_logado` |
| `recuperar-senha.js` | `recuperar-senha` | Recuperação em duas etapas (e-mail → código + nova senha) | `fitfinder_usuarios` |
| `main.js` | `index` | Banner de visitante; filtro de bairros; grid de cards; feedback geral da plataforma com estrelas | `fitfinder_usuario_logado`, `fitfinder_feedback_site_geral` |
| `detalhes.js` | `detalhes` | Renderiza a ficha da academia pelo `?id=`; avaliações com estrelas; exclusão do próprio comentário | `fitfinder_comentarios_<id>` |
| `dados-academias.js` | `detalhes` | Catálogo `window.dadosAcademias` com 14 academias | (somente leitura, em memória) |
| `treinos.js` | `treinos` | CRUD de treinos, filtro por grupo muscular, isolamento por usuário | `fitfinder_treinos_lista_<email>` |
| `avaliacao.js` | `avaliacao` | Cálculo de TMB, gasto calórico e meta de água; histórico | `fitfinder_historico_tmb_<email>`, `fitfinder_meta_agua_custom_<email>` |
| `agua.js` | `agua` | Contador diário de água com meta dinâmica e reset por data | `fitfinder_agua_total_<email>`, `fitfinder_agua_data_<email>`, `fitfinder_meta_agua_custom_<email>` |
| `perfil.js` | `perfil` | Painel de métricas, edição de nome/e-mail, troca de senha, exclusão de conta | todas as chaves do usuário |
| `feedback.js` | todas | Mensagens acessíveis inline; aviso educativo; validação global PT-BR dos formulários | — |
| `user-menu.js` | todas | Menu dropdown único; interceptação de links restritos; guarda de URL direta; logout | `fitfinder_usuario_logado` |

### 2.3 Camada de dados e persistência

| Chave `localStorage` | Estrutura | Escopo | Observação |
|---|---|---|---|
| `fitfinder_usuarios` | `[{ nome, email, senha }]` | Global | "Tabela" de usuários |
| `fitfinder_usuario_logado` | `{ nome, email, senha }` | Global (navegador) | Representa a sessão ativa |
| `fitfinder_treinos_lista_<email>` | `[{ exercicio, series, categorias[] }]` | Por usuário | 8 grupos: Peito, Costas, Pernas, Bíceps, Tríceps, Ombros, Abdômen, Glúteos |
| `fitfinder_historico_tmb_<email>` | `[{ calorias, peso, altura, idade, sexo, atividade, metaAgua, data }]` | Por usuário | Mais recente na posição 0 |
| `fitfinder_meta_agua_custom_<email>` | número (mL) | Por usuário | Padrão 2000 mL |
| `fitfinder_agua_total_<email>` / `fitfinder_agua_data_<email>` | número (mL) / `dd/mm/aaaa` | Por usuário | Reset quando a data muda |
| `fitfinder_comentarios_<id-academia>` | `[{ autor, nota, texto }]` | Por academia (público) | `nota` salva como texto (`"4.0"`) |
| `fitfinder_feedback_site_geral` | `[{ autor, nota, texto }]` | Global | Avaliações da plataforma |

**Catálogo de academias** (`dados-academias.js`): objeto indexado por *slug* (`n2-antares`, `focos-antares`, `focos-serraria`, `red-serraria`, `bg-jatiuca`, `formafit-jatiuca`, `selfit-ponta-verde`, `smartfit-ponta-verde`, `bg-benedito-bentes`, `ds-benedito-bentes`, `gavioes-cidade-universitaria`, `smartfit-cidade-universitaria`, `wd-santa-lucia`, `ds-santa-lucia`). Campos: `nome`, `nota`, `bairro`, `foto1`, `foto2`, `preco`, `planos[]`, `estrutura[]`, `horarios[]`, `endereco`, `telefone`, `instagram`, `avaliacoesIniciais[]`.

### 2.4 Regras de negócio (como operam hoje)

| ID | Regra | Módulo | Validação / efeito |
|---|---|---|---|
| RN01 | E-mail é normalizado (`trim` + minúsculas) e **único** | `auth.js` | Duplicado → "Este e-mail já está cadastrado! Faça login." |
| RN02 | Senha com **mínimo de 8 caracteres** e confirmação idêntica | `auth.js`, `feedback.js`, `perfil.js` | Mensagens inline em PT-BR |
| RN03 | Nome completo obrigatório no cadastro | `auth.js` | Foco devolvido ao campo |
| RN04 | Login exige e-mail válido (regex) e par e-mail/senha existente | `auth.js` | "E-mail ou senha incorretos…" |
| RN05 | **Cadastro concluído = usuário autenticado** (login automático) | `auth.js` | Grava a sessão e redireciona após 1,2 s |
| RN06 | Recuperação: e-mail precisa existir; código de verificação **fixo `123456`** (simulação de envio) | `recuperar-senha.js` | Atualiza a senha e redireciona para o login |
| RN07 | Dados pessoais são **isolados por e-mail** (sufixo na chave) | `treinos.js`, `avaliacao.js`, `agua.js` | Um usuário não lê chaves de outro |
| RN08 | Treino exige exercício, séries e ≥ 1 grupo muscular | `treinos.js` | Edição por índice; filtro por categoria |
| RN09 | **TMB (Harris-Benedict original)** — homem: `66 + 13,7·P + 5·A − 6,8·I`; mulher: `655 + 9,6·P + 1,8·A − 4,7·I` (P kg, A cm, I anos). Gasto = TMB × fator de atividade (1,2 · 1,375 · 1,55 · 1,725 · 1,9), arredondado | `avaliacao.js` | Peso, altura e idade devem ser > 0 |
| RN10 | **Meta de água = peso × 35 mL** (arredondada); padrão 2000 mL sem avaliação | `avaliacao.js`, `agua.js` | Última avaliação define a meta |
| RN11 | Consumo diário: +250, +500, −250 (mín. 0), valor manual > 0 e reset; **zera quando a data (pt-BR) muda** | `agua.js` | Confirmação antes de zerar |
| RN12 | Comentário de academia exige login, **nota 1–5** e texto; o autor vê o botão *Excluir* | `detalhes.js` | Sem login → redireciona para `login.html` |
| RN13 | Avaliação da plataforma segue a mesma regra (nota obrigatória) | `main.js` | Chave global própria |
| RN14 | Trocar senha exige a **senha atual**; atualiza a sessão e a lista de usuários | `perfil.js` | Recarrega a página em 1,2 s |
| RN15 | Excluir conta remove o usuário, água, meta e histórico de TMB e encerra a sessão | `perfil.js` | Confirmação nativa (`confirm`) |
| RN16 | Limpeza automática de comentários de autores de teste (lista fixa) e de "Visitante" | `detalhes.js`, `main.js` | Remove da chave ao carregar |

### 2.5 Equivalência com arquitetura Flask (mapeamento **proposto**)

> Esta tabela é uma **proposta de migração**. Nada disto existe no repositório hoje.

| Funcionalidade atual (JS) | Rota Flask equivalente | Controller / responsabilidade | Template Jinja2 |
|---|---|---|---|
| Listar e filtrar academias (`main.js`) | `GET /` com `?bairro=` | `listar_academias()` consulta o modelo `Academia` | `index.html` com `{% for %}` |
| Detalhes (`detalhes.js`) | `GET /academia/<slug>` | `detalhe_academia(slug)` → 404 se inexistente | `detalhes.html` |
| Comentário com nota | `POST /academia/<slug>/avaliacoes` · `POST …/<id>/excluir` | Valida sessão, nota 1–5 e texto; autor = `session["user_id"]` | `_avaliacoes.html` (parcial) |
| Cadastro com login automático | `GET/POST /cadastro` | Valida, grava `senha_hash`, define `session["user_id"]` | `cadastro.html` |
| Login / logout | `GET/POST /login` · `POST /logout` | Confere hash; `session.clear()` no logout | `login.html` |
| Recuperação de senha | `GET/POST /recuperar-senha` | Token de uso único enviado por e-mail (substitui o `123456`) | `recuperar-senha.html` |
| Perfil, senha, excluir conta | `GET/POST /perfil` · `POST /perfil/excluir` | Atualiza `Usuario`; exclusão em cascata | `perfil.html` |
| Treinos (CRUD) | `GET/POST /treinos` · `POST /treinos/<id>/editar` · `…/excluir` | Filtra por `usuario_id` da sessão | `treinos.html` |
| Avaliação física (TMB) | `GET/POST /avaliacao-fisica` · `POST …/<id>/excluir` | Aplica RN09/RN10 no servidor | `avaliacao.html` |
| Registro de água | `GET/POST /agua` | Soma por `usuario_id` e `data` | `agua.html` |
| Feedback da plataforma | `POST /feedback` | Mesmas regras de RN13 | `index.html` |
| Guarda de acesso (`user-menu.js`) | Decorator `@login_required` | Redireciona visitante para o aviso educativo | `base.html` (menu único) |

**Modelo de dados proposto:** `Usuario(id, nome, email único, senha_hash)` · `Academia(slug, nome, bairro, nota, preco, …)` · `ComentarioAcademia(id, academia_slug, usuario_id, nota, texto, criado_em)` · `FeedbackSite(id, usuario_id, nota, texto)` · `Treino(id, usuario_id, exercicio, series)` + `TreinoCategoria` · `AvaliacaoFisica(id, usuario_id, sexo, idade, peso, altura, fator, calorias, meta_agua, data)` · `RegistroAgua(id, usuario_id, data, total_ml)`.

### 2.6 Limitações e dívidas técnicas identificadas na análise

| # | Achado | Evidência | Impacto | Recomendação |
|---|---|---|---|---|
| 1 | Senhas armazenadas **em texto puro** e copiadas para a sessão | `auth.js`, `perfil.js` | Alto (privacidade) | Hash com `werkzeug.security` no servidor |
| 2 | Código de recuperação fixo `123456` | `recuperar-senha.js` | Alto | Token aleatório de uso único com expiração |
| 3 | Conteúdo do usuário injetado via `innerHTML` **sem escape** (comentários, nome, exercício) | `detalhes.js`, `main.js`, `treinos.js` | Alto (XSS) | `textContent` ou auto-escape do Jinja2 |
| 4 | **Nível de atividade ignorado** na avaliação: o JS busca `#atividade`, mas o HTML define `#nivel-atividade`; o fator cai sempre para 1,2 | `avaliacao.js` × `avaliacao.html` | Médio (cálculo incorreto) | Alinhar o `id` no HTML ou no JS |
| 5 | O campo **Anotação** da avaliação não é lido nem salvo | `avaliacao.html` | Baixo | Persistir ou remover o campo |
| 6 | **Excluir conta não apaga os treinos**, apesar do aviso "todos os seus dados de treinos… serão apagados" | `perfil.js` | Médio | Remover `fitfinder_treinos_lista_<email>` |
| 7 | **Alterar o e-mail no perfil orfana os dados** (chaves usam o e-mail antigo) e não verifica duplicidade | `perfil.js` | Médio | Migrar as chaves ou usar ID imutável |
| 8 | Posse do comentário decidida pelo **nome** do autor (homônimos podem excluir comentários uns dos outros) | `detalhes.js`, `main.js` | Médio | Comparar por e-mail/ID |
| 9 | Lista de "autores antigos" apaga comentários de contas com esses nomes | `detalhes.js` | Médio | Remover a limpeza ou limitá-la à carga inicial |
| 10 | Filtro de bairro compara o **texto inteiro do card** | `main.js` | Baixo | Usar atributo `data-bairro` |
| 11 | Sessão **sem expiração**; guarda de acesso é apenas de interface (o HTML continua acessível) | `user-menu.js` | Médio | Sessão de servidor com expiração e `@login_required` |

---

## 3. Arquitetura Frontend e Experiência do Usuário (UI/UX)

### 3.1 Estrutura de páginas

| Página | Título (`<title>`) | Scripts | Acesso |
|---|---|---|---|
| `index.html` | Encontre sua academia | `feedback`, `main`, `user-menu` | Público |
| `detalhes.html` | Detalhes da Academia | `feedback`, `dados-academias`, `detalhes`, `user-menu` | Público (comentar exige login) |
| `login.html` | Login | `feedback`, `auth`, `user-menu` | Público |
| `cadastro.html` | Cadastre-se | `feedback`, `auth`, `user-menu` | Público |
| `recuperar-senha.html` | Recuperar Senha | `feedback`, `recuperar-senha`, `user-menu` | Público |
| `treinos.html` | Meus Treinos | `feedback`, `treinos`, `user-menu` | Restrito |
| `avaliacao.html` | Taxa Metabólica Basal (TMB) | `feedback`, `avaliacao`, `user-menu` | Restrito |
| `agua.html` | Registro de Água | `feedback`, `agua`, `user-menu` | Restrito |
| `perfil.html` | Meu Perfil | `feedback`, `perfil`, `user-menu` | Restrito |
| `404.html` | Página não encontrada | `user-menu` | Público |

### 3.2 Organização semântica

Todas as páginas usam `lang="pt-BR"`, `meta viewport`, *skip link* "Pular para o conteúdo principal" (`.skip-link`, visível ao receber foco) e a estrutura `header` (h1 + `nav`) → `main#conteudo` → `footer`. Seções usam `h2`/`h3`, cards usam `article`/`figure`/`figcaption`, imagens têm `alt` descritivo e cada campo tem `label for`. Regiões dinâmicas usam `aria-live` (`#nota-site-valor`, `#feedback-global`, container de detalhes com `aria-busy`).

### 3.3 Navegação global unificada (menu dropdown único)

`user-menu.js` **reescreve o `<nav>` de todas as páginas** com um único botão (`.menu-trigger`) e um painel (`.user-dropdown`), eliminando duplicação de menus por página.

| Estado | Rótulo do botão | Itens |
|---|---|---|
| Visitante | **Menu** | Início · Treinos · Avaliação Física · Meta de Água · **Entrar** · **Criar Conta** |
| Autenticado | **Primeiro nome** do usuário (com escape de HTML) | Início · Treinos · Avaliação Física · Meta de Água · **Meu Perfil** · **Sair** |

Acessibilidade do menu: `aria-expanded`, `aria-haspopup`, `aria-controls`; fecha com **Esc** (devolvendo o foco ao botão), clique fora e perda de foco (`focusout`). Links marcados com `data-restrito` são interceptados para visitantes.

### 3.4 Integração dinâmica com os dados (equivalência com *template language*)

| Conceito Jinja2 | Equivalente atual (JavaScript) | Onde |
|---|---|---|
| `{{ variavel }}` | `${variavel}` em *template literal* | `detalhes.js`, `treinos.js`, `avaliacao.js` |
| `{% for x in lista %}` | `lista.map(...).join('')` | lista de treinos, comentários, histórico, planos |
| `{% if cond %}` | Operador ternário / `&&` | botão *Excluir* só para o dono; telefone só se existir |
| `{% extends "base.html" %}` | `feedback.js` + `user-menu.js` carregados em todas as páginas | cabeçalho, menu e mensagens |
| `request.args["id"]` | `new URLSearchParams(location.search).get('id')` | `detalhes.js` |
| Auto-escape do Jinja2 | **Não existe** em *template literals* | ver limitação nº 3 |

A listagem da `index.html` é **HTML estático** (14 `<article>`); apenas a página de detalhes é gerada dinamicamente a partir de `window.dadosAcademias`.

### 3.5 Formulários 100% em português (`novalidate` + mensagens inline)

`feedback.js` define `form.noValidate = true` em todos os formulários e valida na fase de **captura** (antes dos módulos), na ordem abaixo. A primeira falha cancela o envio, exibe a mensagem em **uma única região** `#feedback-global` (inserida no topo do `<main>`) e move o foco ao campo — assim o layout não "salta" com balões nativos do navegador.

| Ordem | Verificação | Mensagem |
|---|---|---|
| 1 | Campo obrigatório vazio | "Preencha este campo para continuar." |
| 2 | E-mail fora do padrão | "Digite um endereço de e-mail válido contendo '@' (exemplo: nome@email.com)." |
| 3 | Senha com menos de 8 caracteres | "A senha precisa ter pelo menos 8 caracteres." |
| 4 | Número fora de `min`/`max` | "Digite um valor numérico válido dentro do intervalo permitido." |

Mensagens de erro usam `role="alert"` + `aria-live="assertive"` e prefixo **"Atenção:"**; sucessos usam `role="status"` + `aria-live="polite"` e prefixo **"Sucesso:"**, sempre com ícone — o estado nunca depende só da cor.

### 3.6 Sistema de avaliações por estrelas

| Comportamento | Implementação |
|---|---|
| Início **zerado** | `notaAcademia = 0` / `notaSite = 0`; estrelas vazias e texto "Nenhuma nota selecionada. Escolha de 1 a 5 estrelas." |
| *Hover* progressivo | `mouseenter` preenche até a estrela atual; `mouseleave` volta à nota confirmada |
| Seleção | `click`; teclado com **Enter** e **Espaço** (`tabindex="0"`, `role="button"`, `aria-label="Avaliar com N de 5 estrelas"`, `aria-pressed`) |
| Anúncio ao leitor de tela | `#nota-academia-valor` / `#nota-site-valor` com `aria-live="polite"` |
| Validação | Sem nota → "Selecione de 1 a 5 estrelas para publicar sua avaliação." |

### 3.7 Responsividade e Dark Mode

- Pontos de quebra em **900 px**, **600 px** e **400 px**; `body { min-width: 320px }`; `overflow-x: clip`.
- Grids com `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`; espaçamento entre cards **2 rem (32 px)** no desktop e **1,5 rem (24 px)** em telas ≤ 600 px.
- Página de detalhes em **coluna única** (`#secao-detalhes .fotos-grid, .info-grid { grid-template-columns: 1fr }`).
- Tema escuro por tokens: `--preto: #05080e`, `--fundo: #0d1117`, `--fundo-card: #111827`.
- `prefers-reduced-motion` respeitado.

---

## 4. Autenticação, Controle de Acesso e Gerenciamento de Sessão (Sessions + Cookies)

### 4.1 Funcionamento na aplicação (mecanismo implementado)

| Etapa | O que o código faz |
|---|---|
| **Criar conta** | `auth.js` valida nome, e-mail (regex), senha ≥ 8 e confirmação; checa duplicidade em `fitfinder_usuarios`; grava `{nome, email, senha}` |
| **Login automático pós-cadastro** | Logo após gravar o usuário, grava o mesmo objeto em `fitfinder_usuario_logado`; exibe alerta **verde** "Conta criada com sucesso!…" e vai para `index.html` em 1,2 s |
| **Login** | Procura `email` + `senha` em `fitfinder_usuarios`; se existir, grava a sessão e mostra "Bem-vindo(a), <nome>!" |
| **Sessão ativa** | Existência (e conteúdo) de `fitfinder_usuario_logado` |
| **Logout** | `localStorage.removeItem('fitfinder_usuario_logado')` e redirecionamento para `index.html` |
| **Recuperar senha** | Etapa 1: e-mail cadastrado; etapa 2: código `123456` + nova senha → atualiza `fitfinder_usuarios` |

### 4.2 Controle de acesso por rota

| Rota | Proteção no menu | Proteção por URL direta | Proteção no script da página | Equivalente Flask |
|---|---|---|---|---|
| `index`, `detalhes`, `login`, `cadastro`, `recuperar-senha`, `404` | — | — | — | Rotas públicas |
| `treinos` | `data-restrito` → aviso educativo | `user-menu.js` compara `location.pathname` | `treinos.js` chama `mostrarAcessoRestrito()` e interrompe | `@login_required` |
| `avaliacao` | idem | idem | `avaliacao.js` | `@login_required` |
| `agua` | idem | idem | `agua.js` | `@login_required` |
| `perfil` | *Meu Perfil* só existe para autenticados | idem | `perfil.js` | `@login_required` |
| Publicar comentário/avaliação | — | — | redireciona para `login.html` | `POST` com sessão obrigatória |

**Aviso educativo** (exibido por `mostrarAcessoRestrito()`): *"Faça o cadastro ou entre na sua conta para ter todas as ferramentas disponíveis."* com os botões **Entrar** (`login.html`) e **Criar Conta** (`cadastro.html`), em região com foco programático.

> **Limite importante:** como não há servidor, a proteção é **de interface**. O HTML restrito é entregue ao navegador de qualquer forma; a guarda apenas impede o uso da ferramenta e orienta o usuário. Segurança real exige validação no servidor (seção 4.5).

### 4.3 Gerenciamento de sessão no cliente

| Propriedade | Valor atual |
|---|---|
| Local de armazenamento | `localStorage` (`fitfinder_usuario_logado`) |
| Conteúdo | Objeto completo do usuário, **incluindo a senha** |
| Duração | Até o logout ou limpeza do navegador — **sem expiração** |
| Escopo | Mesma origem; compartilhado entre abas e janelas |
| Acesso por JavaScript | Total (qualquer script da página lê e altera) |
| Enviado automaticamente ao servidor | Não (não há servidor) |

### 4.4 Segurança: implementado × recomendado

| Aspecto | Implementado | Recomendado |
|---|---|---|
| Armazenamento da senha | Texto puro | Hash (`generate_password_hash`) |
| Identificador de sessão | Objeto do usuário | ID aleatório assinado, no servidor |
| Expiração | Nenhuma | `PERMANENT_SESSION_LIFETIME` / `Max-Age` |
| Proteção de rota | Script de interface | Decorator no servidor |
| CSRF | N/A | Token CSRF em formulários `POST` |
| Transporte | N/A | HTTPS + cookie `Secure` |

### 4.5 Explicação técnica: Sessions + Cookies no ciclo cliente-servidor

**O problema.** HTTP é *stateless*: cada requisição chega sem memória das anteriores. Para "lembrar" quem está logado, o servidor entrega ao navegador um **identificador de estado** que o navegador devolve a cada requisição. O mecanismo padrão é o **cookie**.

**Comparativo de mecanismos**

| Mecanismo | Onde fica o dado | Enviado automaticamente ao servidor? | Legível por JavaScript? | Expiração | Uso típico |
|---|---|---|---|---|---|
| `localStorage` | Navegador | Não | Sim | Nunca (até limpar) | Preferências, *cache* — **usado hoje pelo FitFinder** |
| `sessionStorage` | Navegador (por aba) | Não | Sim | Ao fechar a aba | Estado temporário de uma aba |
| Cookie HTTP comum | Navegador | **Sim**, em toda requisição ao domínio | Sim (sem `HttpOnly`) | `Expires` / `Max-Age` | Preferências lidas pelo servidor |
| Cookie de sessão (`HttpOnly`) | Navegador (só o identificador) | Sim | **Não** | Sessão ou `Max-Age` | Autenticação |
| Sessão de servidor | Servidor (memória, Redis, banco) | — (só o ID viaja no cookie) | Não | Controlada pelo servidor | Autenticação segura |

**Fluxo de login com cookie de sessão**

```
Cliente (navegador)                                Servidor (Flask)
   │  POST /login  (email, senha)                        │
   │ ───────────────────────────────────────────────────►│ valida credenciais
   │                                                     │ session["user_id"] = 42
   │  302 /  +  Set-Cookie: session=<valor assinado>;    │
   │            HttpOnly; Secure; SameSite=Lax; Path=/   │
   │ ◄───────────────────────────────────────────────────│
   │  GET /treinos  +  Cookie: session=<valor>           │
   │ ───────────────────────────────────────────────────►│ lê a sessão → usuário 42
   │  200 (página do usuário 42)                         │
   │ ◄───────────────────────────────────────────────────│
   │  POST /logout                                       │ session.clear()
   │  Set-Cookie: session=; Expires=<passado>            │
```

**Flask `session` (padrão) × sessão de servidor**

- Por padrão, a `session` do Flask é um **cookie assinado** (biblioteca `itsdangerous`) com a chave `SECRET_KEY`: o conteúdo viaja no cookie, é **protegido contra adulteração**, mas **não é criptografado** (o cliente pode lê-lo) — por isso não se guardam segredos nela.
- Com extensões como *Flask-Session*, o cookie carrega **apenas um ID** e os dados ficam no servidor (Redis/banco), permitindo revogação imediata.
- A `SECRET_KEY` deve ser longa, aleatória e **fora do repositório** (variável de ambiente); trocá-la invalida todas as sessões.

**Atributos de segurança do cookie**

| Atributo | Função | Padrão no Flask |
|---|---|---|
| `HttpOnly` | Impede leitura por `document.cookie` (mitiga roubo por XSS) | Ligado |
| `Secure` | Só envia o cookie por HTTPS | Desligado — ligar em produção |
| `SameSite=Lax/Strict` | Limita envio em requisições de outros sites (mitiga CSRF) | Não definido — configurar |
| `Max-Age` / `Expires` | Define a duração | Cookie de sessão do navegador, ou `PERMANENT_SESSION_LIFETIME` se a sessão for permanente |
| `Path` / `Domain` | Escopo de envio | `/` |

**Exemplo ilustrativo** (conceitual — **não existe no repositório**):

```python
app.config.update(SECRET_KEY=os.environ["SECRET_KEY"],
                  SESSION_COOKIE_HTTPONLY=True,
                  SESSION_COOKIE_SECURE=True,
                  SESSION_COOKIE_SAMESITE="Lax")

@app.post("/login")
def login():
    u = Usuario.query.filter_by(email=request.form["email"].lower()).first()
    if u and check_password_hash(u.senha_hash, request.form["senha"]):
        session["user_id"] = u.id
        return redirect(url_for("index"))
    flash("E-mail ou senha incorretos.", "erro")
    return redirect(url_for("login"))

def login_required(f):
    @wraps(f)
    def wrapper(*a, **k):
        if "user_id" not in session:
            flash("Faça o cadastro ou entre na sua conta para ter todas as ferramentas disponíveis.")
            return redirect(url_for("login"))
        return f(*a, **k)
    return wrapper
```

**Correspondência com o FitFinder**

| Hoje (cliente) | Com sessions + cookies (servidor) |
|---|---|
| `fitfinder_usuario_logado` no `localStorage` | Cookie `session` (assinado, `HttpOnly`) |
| `user-menu.js` decide o menu | Template Jinja2: `{% if session.user_id %}` |
| Guarda de URL por `pathname` | `@login_required` |
| `removeItem(...)` no *Sair* | `session.clear()` + cookie expirado |
| Chaves `..._<email>` | Linhas filtradas por `usuario_id` |

---

## 5. Design System e Acessibilidade (WCAG 2.1 — AA/AAA)

### 5.1 Paleta Dark Mode e contrastes

Razões calculadas pela fórmula de luminância relativa da WCAG 2.1. Limiares: texto normal **AA ≥ 4,5:1** · **AAA ≥ 7:1** · componentes de interface e texto grande ≥ **3:1**.

| Papel | Especificado no PRD | Implementado no CSS | Contraste (implementado) | Nível |
|---|---|---|---|---|
| Fundo base | `#05080e` | `--preto: #05080e` | — | — |
| Superfície / página | `#0d1117` | `--fundo: #0d1117` | — | — |
| Cartão | — | `--fundo-card: #111827` | — | — |
| Texto principal | `#f0f6fc` | `--texto: #e2e8f0` | 15,35:1 sobre `#0d1117` (o `#f0f6fc` teria 17,39:1) | **AAA** |
| Texto secundário | — | `--texto-secundario: #c2ccda` | 11,66:1 sobre `#0d1117` | **AAA** |
| Texto discreto | — | `--texto-fraco: #aeb9c8` | 9,53:1 sobre `#0d1117` | **AAA** |
| Link | — | `#60a5fa` (`--azul-texto`) | 7,44:1 sobre `#0d1117` | **AAA** |
| Foco | — | `--foco: #38bdf8` | 8,83:1 sobre `#0d1117` | **AAA** (indicador ≥ 3:1) |
| Azul primário (botão) | `#2563eb` | `--azul: #2563eb` | Texto branco sobre ele: 5,17:1 · sobre `#0d1117` como borda: 3,66:1 | **AA** (texto) · **UI ≥ 3:1** |
| Sucesso | `#052e16` / `#22c55e` / `#bbf7d0` | idem | Texto `#bbf7d0` sobre `#052e16`: 12,30:1 · borda `#22c55e`: 6,54:1 | **AAA** |
| Erro | `#2c0b0e` / `#ef4444` / `#fecaca` | fundo `#251116`, texto `--erro: #fca5a5`, borda `#b91c1c` | Texto `#fca5a5` sobre `#251116`: 9,45:1 (com os valores especificados: `#fecaca` sobre `#2c0b0e` = 12,50:1; `#ef4444` sobre `#2c0b0e` = 4,81:1) | **AAA** (texto) |
| Estrela preenchida | — | `#e3a008` | 8,38:1 sobre `#0d1117` | **AAA** (UI ≥ 3:1) |
| Estrela vazia | — | `#667085` (CSS) | 3,80:1 sobre `#0d1117` | **UI ≥ 3:1** |

**Observações de auditoria**

1. Nem todo par atinge AAA: o texto branco sobre `#2563eb` (5,17:1) cumpre **AA**, não AAA.
2. O CSS define estrelas vazias em `#667085`, mas `main.js`/`detalhes.js` aplicam `#444` com `opacity: .5` por estilo inline (1,94:1 antes da opacidade) — **abaixo de 3:1**. Recomenda-se remover o estilo inline e usar apenas o token do CSS.
3. `#f0f6fc` e `#2c0b0e` constam na especificação, mas **não aparecem no código**; o CSS usa `#e2e8f0` e `#251116`. Ambos os conjuntos atendem AA/AAA para texto.

### 5.2 Tipografia, grid e espaçamentos

| Elemento | Valor |
|---|---|
| Família | `Arial, Helvetica, sans-serif` |
| Entrelinha | `1.6` |
| Título do cabeçalho (`header h1`) | `clamp(1.7rem, 4vw, 2.3rem)` — escala responsiva |
| Largura máxima do conteúdo | `--largura: 1200px` |
| Raios | `--raio: 14px` · `--raio-grande: 20px` |
| Espaçamentos | `--espaco-1..4` = 0,5 · 1 · 1,5 · 2 rem |
| **Alvos de toque** | `min-width/min-height: 44px` em botões, links de navegação, itens do menu, `.btn-secondary`, estrelas e checkboxes (`.checkbox-opcao` com 44 px; caixa de 24 px) |
| **Espaço entre cards** | **32 px (2 rem)** no desktop · **24 px (1,5 rem)** em ≤ 600 px |
| Página de detalhes | **Coluna única** (`grid-template-columns: 1fr`) |

### 5.3 Biblioteca de componentes e estados

| Componente | Normal | Hover | Foco (Tab) | Desabilitado | Erro | Sucesso |
|---|---|---|---|---|---|---|
| **Botão primário** (`.btn-primary`) | Fundo `#2563eb`, texto branco, 44 px | Realce de cor/brilho | Contorno 3 px `#38bdf8`, *offset* 3 px | `opacity: .6`, cursor `not-allowed`, sem sombra | — | — |
| **Botão secundário / ghost** (`.btn-secondary`) | Contorno, fundo transparente | Realce de borda/fundo | Contorno 3 px | idem | — | — |
| **Input / Textarea / Select** | Fundo escuro, borda `--borda` | — | Contorno 3 px | `opacity: .6` | Mensagem na região de alerta; foco devolvido ao campo | — |
| **Card** (`article`) | Fundo `--fundo-card`, borda | Borda azul e elevação de 2 px | Links internos com contorno | — | — | — |
| **Alerta** (`.feedback-global`) | — | — | `tabindex="-1"` com foco programático | — | `.estado-erro` + ícone + "Atenção:" | `.estado-sucesso` (verde) + ícone + "Sucesso:" |
| **Menu dropdown** | Botão "Menu ▾" / nome | Item realçado | Contorno; **Esc** fecha e devolve o foco | — | — | — |
| **Estrela** (`.star-btn`) | Vazia | Preenche até a estrela | Contorno 3 px | — | Mensagem se sem nota | Preenchida em `#e3a008`, `aria-pressed` |

### 5.4 Evidências de acessibilidade

| Critério | Evidência | Status |
|---|---|---|
| Contraste AA/AAA | Cálculo na seção 5.1 sobre os valores reais do CSS | **Verificado por cálculo** |
| Alvos ≥ 44 × 44 px | Regras `min-width`/`min-height: 44px` no CSS | **Verificado no código** |
| Navegação por teclado (`Tab`, `Enter`, `Espaço`, `Esc`) | Menu, estrelas e botões implementados | **Verificado no código** |
| Foco visível | `:focus-visible` com contorno 3 px | **Verificado no código** |
| *Skip link* e landmarks | Todas as páginas | **Verificado no código** |
| ARIA e leitores de tela | `aria-live`, `aria-expanded`, `aria-label`, `aria-pressed`, `role` | **Verificado no código** (teste com NVDA/VoiceOver: a executar) |
| Cor não é o único indicador | Ícone + prefixo textual em alertas; estrela muda de preenchimento | **Verificado no código** |
| Movimento reduzido | `prefers-reduced-motion` | **Verificado no código** |
| **Google Lighthouse 100/100** | Pontuação **declarada pela equipe** | **Declarado** — anexar o relatório |
| **Zoom 200%** | `min-width: 320px`, `overflow-x: clip`, grids fluidos | **Declarado** — teste manual a anexar |
| **Simulação de daltonismo** | Chrome DevTools › Rendering › *Emulate vision deficiencies* | **Declarado** — print a anexar |

**Como reproduzir:** (1) Lighthouse: DevTools › Lighthouse › *Accessibility* › modo Desktop e Mobile; (2) zoom: `Ctrl +` até 200% em 1280 px de largura e verificar ausência de rolagem horizontal; (3) daltonismo: DevTools › Rendering › *Emulate vision deficiencies*; (4) teclado: percorrer toda a página só com `Tab`/`Shift+Tab`.

---

## 6. Changelog e Evolução (2ª AV → 3ª AV)

A tabela usa o histórico Git do repositório. O commit `9830033` (19/11/2026) é tomado como **linha de base da 2ª AV**; os demais (26/11/2026) compõem a evolução da 3ª AV.

| Commit | Mudança | Por quê (técnico / UX) |
|---|---|---|
| `9830033` | **Base 2ª AV**: ajustes visuais, acessibilidade WCAG, filtro de bairros, página 404 | Ponto de partida avaliado |
| `9ae442d` | Auditoria **WCAG AA**; feedback acessível inline; teclado; tokens do Design System | Substituir `alert()` por mensagens com `aria-live`; centralizar cores e espaçamentos em variáveis |
| `b73c970` | **Menu visível** com aviso educativo; login no cabeçalho; **estrelas vazias com hover**; **validação PT-BR** | Orientar o visitante em vez de bloquear sem explicação; evitar nota pré-selecionada; padronizar mensagens em português |
| `0b5887d` | **Menu dropdown unificado**; correção de esticamento de erros em formulários; **espaçamento de cards** | Uma única navegação em todas as páginas; evitar *layout shift* nas mensagens; ritmo visual consistente (32/24 px) |
| `7b39224` | Banner de acesso em coluna; **layout vertical (coluna única) na página de detalhes**; **largura total** do campo de comentário | Leitura linear em telas pequenas e com zoom; formulário mais utilizável |
| `79768f6` | **Alerta de sucesso em verde** e **login automático após cadastro** | Reduzir atrito no *onboarding* (uma etapa a menos); feedback positivo claro, com contraste AAA |
| `87aba15` | **Textarea de feedback com 100% de largura** (`index.html`) | Consistência de largura entre campos de comentário |
| `f0b7661`, `3611d4c` | Correção de capitalização de nomes de imagens e fotos internas | Evitar imagens quebradas em servidores sensíveis a maiúsculas/minúsculas |

---

## 7. Apêndice — Skills de IA Utilizadas no Desenvolvimento (`/.agents/skills.md`)

O desenvolvimento e o refinamento do FitFinder foram conduzidos com apoio de IA em quatro frentes, descritas em detalhe no arquivo `/.agents/skills.md` (incluído integralmente no PDF consolidado).

| # | Skill | Foco | Evidência no projeto |
|---|---|---|---|
| 1 | Engenharia Front-end e Arquitetura Web | HTML5 semântico, CSS3 responsivo, JavaScript modular, estado | `js/*.js` por responsabilidade; chaves `localStorage` por usuário |
| 2 | UI/UX e Design Systems | Tokens, hierarquia, redução de atrito, consistência | Seção 36 do CSS; menu único; login automático |
| 3 | Auditoria de Acessibilidade Digital (WCAG 2.1 AA/AAA) | Contraste, alvos de 44 px, teclado, ARIA, zoom 200%, daltonismo | Commit `9ae442d`; `feedback.js`; seção 5 |
| 4 | Product Management e Redação Técnica (PRD) | Requisitos, fluxos, changelog, arquitetura | Este documento |
