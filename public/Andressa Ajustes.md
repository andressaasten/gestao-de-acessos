# Candidato: Andressa Teixeira

---

## Componentes visuais

- [ ] Sidebar
- [ ] Formulário

---

## Codificação

- [ ] Responsividade: Utilizar breakpoints, flex-box e/ou grid layout

---

## Critérios básicos de Avaliação

- [ ] Código limpo e bem estruturado

---

## Bônus

- [*] TailwindCSS
- [ ] Tanstack (Vue-Query)
- [ ] Técnicas de Acessibilidade
- [ ] Gráficos
- [ ] Utilizar alguma api pública para compor algum dos recursos

---

## Telas

### Tela de login

- [*] Não há transição de cor ao trocar a funcionalidade
- [ ] Não há logo, nem nome do sistema, não sei onde eu estou (ajustar no header)
  - - [ ] Não utilizou notificações próprias - [ ] Não validou senhas fortes
          -> [ ] Não armazenou idioma e tema ao atualizar a página - [ ] Não há formulário `<q-form>` onde deveria
  - - [ ] No modo dark, os inputs ficam sem contraste

### Tela home User

     - [ ] Não há formulário `<q-form>` no editar

1 -> [ ] Tela muito simples, nada indicando pro usuário o porquê a tela está vazia
2 -> [ ] Cards de recursos grudados sem gap entre eles
2 -> [ ] Pouco padding na seção main
3 -> [ ] O indicativo de expiração não possui legenda
4 -> [ ] No editar, as informações de senha permanecem ao salvar ou cancelar

5 -> [ ] Não há Sidebar
-> [ ] Header quebra muito em telas menores
-> Component Header
-> [ ] No header, não há indicativo visual da tela que estou no momento, como o `Sair` é branco parece que eu estou em Sair e não em Documentos.

### Tela home Admin

°-° [ ] A responsividade com os cards não fica legal em alguns momentos ao redimencionar a tela
°-° [ ] No modal de permissões não há indicativo para o usuário sobre o que a data e hora se referem
[ ] Modal de criação com pouco gap entre alguns elementos

1 -> [ ] Funcionalidade de adicionar comentários poderia estar no modal de comentários. Não fica legal o usuário adicionar um comentário fora e ter que abrir o modal pra visualizar.
2 -> [ ] No modal de permissões, a data não é no padrão dd/mm/yyyy
2 -> [ ] O sistema permite colocar expiração em datas anteriores ao dia atual

### Gerenciamento de Permissões

- [ ] A tabela fica quebrada quando 1 usuário tem muitas permissões
- [ ] No expirar quando são muitas horas poderia se transformar em dias, semanas, meses e anos
- [ ] O expirar em 1 min ficou 0 min

### Pasta Public

- [ ] Não alterou favicon

### Pasta SRC

#### Assets

- [ ] Nenhuma logo encontrada

#### Components

    - [ ] `EditorPopup.vue` não utiliza `<q-form>` com submit
    - [ ] `LoginRegister.vue` não utiliza `<q-form>` com submit

- [ ] `isLargeScreen` utilizando v-show, o ideal é v-if para remover da DOM, mas tudo depende do caso, não está errado.
- [ ] Não usou `defineOptions` em nenhum arquivo do projeto

#### CSS

- [ ] `app.scss` vazio, mas pelo visto não foi necessário
- [ ] `quasar.variables` não modificado

#### Layouts

- [ ] uiStore pra dark mode é totalmente incorreto. O Quasar já fornece acesso se o tema está dark ou light com $dark.isActive. Além disso, ele deveria estar no localStorage.
- [ ] q-header e q-footer poderiam estar separados em outros componentes

#### Pages

- [ ] Os icones podem ser importados também
- [ ] H4 não serve para título principal
- [ ] O elemento `<section>` não foi utilizado para melhorar semântica
- [ ] Não encontrado atributos de acessibilidade como `alt` e `aria-*`
- [ ] `permissoesPage` não altera o idioma no header da tabela. Faltou tipar e deixar as colunas reativas.

#### Interfaces, Enums e Types

- [ ] Não ficaram separados e sim dentro dos componentes

#### Router

- [*] `routes.ts` Repetindo o mesmo layout toda vez, deveria estar agrupando

#### Stores

Os Stores contém toda a lógica de armazenamento de dados e não está totalmente errado mas:

- [ ] Não existe camada services. Muita lógica poderia ser movida para a camada services, onde seria feita a requisição pro Fake Backend.
- [ ] Aplicar ajustes nas requisições e utilização dos Stores.

Obs: Os stores servem principalmente para estados globais e cache em memória, ele pode consumir o localStorage, mas normalmente não faz.

O fluxo poderia ser o seguinte:

- Componente -> UserService (Fake backend com Storage)

Se precisar de estados globais:

- Componente -> Pinia (Estado global)

Se precisar cachear em memória e se não existir na memória puxar do Backend:

- Componente -> Pinia (Cache) -> UserService (Fake backend com Storage)

Neste último caso o Tanstack poderia ser uma alternativa

### Arquivos de configuração

- [*] Lendo `postcss.config.js` e `tailwind.config.ts` acredito que o Tailwind não funcione no projeto.
- [*] Em `quasar.config.ts` poderia utilizar `vueRouterMode: 'history'` para remover a hashtag da URL.
