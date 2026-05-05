---
title: Comandos de Git que você usa todo dia
date: 2021-03-02
tags:
  - git
  - desenvolvimento
  - ferramentas
excerpt: "Um roteiro direto para quem está começando: configurar o ambiente, criar repositório, ramificar, commitar e enviar mudanças sem se perder no meio do caminho."
---

Git é um sistema de controle de versão distribuído, gratuito e aberto. Ele ajuda várias pessoas a trabalharem no mesmo projeto ao mesmo tempo e deixa o fluxo de desenvolvimento mais previsível. Este texto é um mapa dos comandos que mais aparecem no dia a dia — com os detalhes que costumam confundir quem está começando.

## Por que vale a pena dominar isso cedo

Quando você aprende os poucos comandos certos, o resto vira reflexo: você para de ter medo de “estragar” o histórico e ganha confiança para experimentar em branches. A documentação oficial continua sendo a referência: [git-scm.com/docs](https://git-scm.com/docs/).

## Instalação e onde rodar

Baixe o Git em [git-scm.com](https://git-scm.com/). Depois de instalar, você pode usar o **Git Bash**, o terminal do sistema ou o terminal integrado do VS Code — o comportamento dos comandos é o mesmo.

## Configuração inicial

Crie uma conta em alguma plataforma (por exemplo [GitHub](https://github.com/)) e configure nome e e-mail **uma vez** na máquina. O Git usa isso em todo commit.

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

Para conferir:

```bash
git config --global user.name
git config --global user.email
```

## Criar ou clonar um projeto

Repositório novo na pasta atual:

```bash
git init
```

Baixar um repositório que já existe (use a URL HTTPS ou SSH que a plataforma mostra — por exemplo `https://github.com/usuario/projeto.git`):

```bash
git clone https://github.com/usuario/projeto.git
```

Se o endereço remoto `origin` mudou (ou foi digitado errado na hora do clone):

```bash
git remote set-url origin https://github.com/usuario/projeto.git
```

## Branches: trabalhar sem misturar tudo

Boa prática: antes de mudar código “na main”, crie uma branch.

```bash
git branch nome-da-branch
git checkout nome-da-branch
```

Ou criar e já entrar na branch em um passo:

```bash
git checkout -b nome-da-branch
```

No Git moderno, o equivalente é:

```bash
git switch -c nome-da-branch
```

Para ver em qual branch você está:

```bash
git branch
```

## Ver o que mudou

```bash
git status
git diff
```

`status` lista arquivos alterados; `diff` mostra o conteúdo das alterações.

## Preparar e registrar mudanças

“Staged” significa que o arquivo está marcado para entrar no próximo commit. Você adiciona arquivos ao stage com `git add` (não existe um comando principal chamado *git stage*).

Um arquivo:

```bash
git add caminho/do/arquivo
```

Tudo que mudou na pasta atual e abaixo:

```bash
git add .
```

Registrar o snapshot:

```bash
git commit -m "Mensagem clara do que mudou"
```

## Atualizar a partir do remoto

Antes de enviar mudanças, é comum puxar o que outros já subiram na mesma branch:

```bash
git pull origin nome-da-branch
```

Em muitos fluxos, `git pull` sozinho (com a branch já rastreada) também funciona.

## Enviar para o remoto

Quando os commits estão prontos na sua máquina, envie para o servidor:

```bash
git push origin nome-da-branch
```

## Fechando

São muitos nomes no começo, mas o fluxo é sempre o mesmo: **branch → editar → status/diff → add → commit → pull (quando necessário) → push**. Com repetição, isso deixa de ser “lista de comandos” e vira parte do trabalho. Se algo sair do esperado, a documentação e o `git status` costumam apontar o próximo passo.

Obrigado por ler.
