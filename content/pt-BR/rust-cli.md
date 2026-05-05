---
title: Escrevendo um CLI em Rust sem ficar bravo
date: 2026-04-09
tags:
  - rust
  - cli
  - programação
excerpt: "Um guia honesto para quem vem de Python ou Go. Menos sobre a linguagem e mais sobre a ergonomia: clap, anyhow, e a arte de não abraçar o borrow checker cedo demais."
---

Rust tem fama de ser hostil com iniciantes. Minha experiência foi diferente: a parte difícil não é o compilador, é resistir ao impulso de escrever [[Rust idiomático]] antes de ter um programa que funciona.

## Começar feio

Comece com `String` em todo lugar. Clone sem culpa. Use `anyhow::Result` como tipo de retorno padrão. Você vai refatorar depois, e vai refatorar com um programa rodando, não com uma ideia.

```rust
use anyhow::Result;
use clap::Parser;

#[derive(Parser)]
struct Args {
    path: String,
    #[arg(short, long)]
    verbose: bool,
}

fn main() -> Result<()> {
    let args = Args::parse();
    let text = std::fs::read_to_string(&args.path)?;
    println!("{}", text.lines().count());
    Ok(())
}
```

Isso aí é um utilitário útil. Conta linhas, aceita flags, reporta erros decentes. Em Python seriam sete linhas; em Rust foram quinze. A diferença é que este binário vai rodar em dez anos sem mudar.
