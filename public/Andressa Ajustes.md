# Candidato: Andressa Teixeira

## Critérios básicos de Avaliação

- [ ] Código limpo e bem estruturado

---

## Bônus

- [ ] Tanstack (Vue-Query) (Não precisa)
- [ ] Gráficos (Não precisa)

---

## Tela home Admin

- [ ] Modal do popup necessita de select -> selecionar user
- [ ] Adicionar rules no modal de criação -> n permitir salvar vazio

---

## Gerenciamento de Permissões

- [ ] Tempo das permissões precisam revisão (41 seg apareceu pós expirar)

---

## Interfaces, Enums e Types

- [x] Não ficaram separados e sim dentro dos componentes

---

## Stores

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

## Passos

- [ ] Service e Interface

- [ ] @filter no selected

- [ ] rules no criacao

- [ ] erros do chrome

- https://medium.com/@luismigueldev/zod-o-poder-de-valida%C3%A7%C3%A3o-e-transforma%C3%A7%C3%A3o-de-dados-365197d03e7f

- https://quasar.dev/vue-components/popup-edit#example--click-on-text

- https://quasar.dev/vue-components/table - expanding rows

- https://quasar.dev/vue-components/date/#example--options

- https://quasar.dev/vue-components/select#filtering-and-autocomplete
