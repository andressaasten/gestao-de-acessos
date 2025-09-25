# Candidato: Andressa Teixeira

---

## Componentes visuais

- [x] Separar em outro componente Sidebar
- [x] Corrigir cores

---

## Critérios básicos de Avaliação

- [ ] Código limpo e bem estruturado

---

## Bônus

- [x] Utilizar alguma api pública para compor algum dos recursos

---

## Telas

### Tela de login

- [x] Não há logo, nem nome do sistema, não sei onde eu estou
- [x] Não armazenou idioma e tema ao atualizar a página

### Tela home User

- [x] O indicativo de expiração não possui legenda

### Tela home Admin

- [x] No header, não há indicativo visual da tela que estou no momento, como o `Sair` é branco parece que eu estou em Sair e não em Documentos.
- [x] No modal de permissões, a data não é no padrão dd/mm/yyyy

### Gerenciamento de Permissões

- [ ] A tabela fica quebrada quando 1 usuário tem muitas permissões
- [x] O expirar em 1 min ficou 0 min

#### Components

- [x] `isLargeScreen` utilizando v-show, o ideal é v-if para remover da DOM, mas tudo depende do caso, não está errado.
      => o docs quasar faz assim
- [x] Não usou `defineOptions` em nenhum arquivo do projeto

#### Layouts

- [x] Armazenar tema no LocalStorage

#### Interfaces, Enums e Types

- [ ] Não ficaram separados e sim dentro dos componentes

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

### Passos

- [ ] Ajustar tabela para não quebrar -> retornar docs do user apenas
- [ ] Stores

- [ ] erros do chrome
  - - reclama q n pode iniciar doc com null

- https://medium.com/@luismigueldev/zod-o-poder-de-valida%C3%A7%C3%A3o-e-transforma%C3%A7%C3%A3o-de-dados-365197d03e7f

- https://quasar.dev/vue-components/popup-edit#example--click-on-text

- https://quasar.dev/vue-components/table - expanding rows

- https://quasar.dev/vue-components/date/#example--options
