# Gestão de Acessos

Este projeto é um **sistema de gerenciamento de acessos e permissões temporárias** para documentos.  
Ele foi desenvolvido como parte de um desafio técnico com o objetivo de **simular a administração de usuários, documentos e permissões de forma prática e segura**, incluindo autenticação, controle de tempo de acesso, e funcionalidades avançadas como **Dark/Light Mode** e **suporte a múltiplos idiomas**.

Documento técnico completo: [`public/doc_tec.pdf`](./public/doc_tec.pdf)

---

## Objetivo do Projeto
O sistema busca oferecer uma forma simples e eficiente de:
- Cadastrar usuários e documentos;
- Conceder permissões específicas (leitura, comentário, edição);
- Controlar o tempo de validade de cada permissão, destacando acessos prestes a expirar;
- Revogar permissões individualmente ou em massa;
- Registrar todas as informações de forma persistente no **LocalStorage**.

Esse fluxo simula cenários reais de **gestão de acessos em empresas, equipes ou projetos colaborativos**, mas de forma simplificada para ambiente acadêmico.

---

## Protótipo das Telas

As telas foram prototipadas no Figma e estão disponíveis no arquivo abaixo:

- [Prototipo no Figma (PDF)](./public/design/prototipo-figma.pdf)

---

## Funcionalidades Implementadas
- **Autenticação de usuários**
  - Login e cadastro
  - Perfis distintos: **Admin** e **User**
  - Logout com limpeza de sessão
- **Gestão de documentos**
  - Criação, edição e exclusão de documentos
  - Suporte a títulos e textos
  - Upload de arquivos (imagens e PDF)
- **Permissões temporárias**
  - Definição de permissões por usuário: leitura, comentário, edição
  - **Date/Time Picker** para definir validade exata (data e hora)
  - Expiração automática dos acessos
  - Alerta visual para acessos com menos de **1 hora de validade**
  - Revogação individual ou de todas permissões de um usuário
  - Edição de permissões já concedidas
- **Interface moderna**
  - **Dark/Light mode** com botão de alternância
  - **i18n (internacionalização)** com suporte a:
    - 🇧🇷 Português
    - 🇺🇸 Inglês
- **Persistência**
  - Todos os dados (usuários, documentos e permissões) são armazenados no **LocalStorage**

---

## Usuários de exemplo
O sistema já vem com usuários pré-configurados para teste:

- **Admin**
  - Email: `admin@teste.com`
  - Senha: `123456`

- **User**
  - Email: `user@teste.com`
  - Senha: `123456`

