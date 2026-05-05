// i18n dictionary + post content (pt-BR default, en secondary)
window.I18N = {
  'pt-BR': {
    ui: {
      siteTitle: 'EDusik',
      siteTagline: 'notas sobre código, ferramentas e hábitos',
      recent: 'notas recentes',
      readingTime: 'min de leitura',
      backlinks: 'referenciado em',
      tags: 'tags',
      allTags: 'todas as tags',
      filterBy: 'filtrando por',
      clear: 'limpar',
      footer: '',
      langLabel: 'idioma',
      date: (iso) => {
        const [y, m, day] = iso.split('-').map(Number);
        const d = new Date(y, m - 1, day);
        const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
        return `${String(d.getDate()).padStart(2,'0')} ${meses[d.getMonth()]} ${d.getFullYear()}`;
      },
      empty: 'nenhuma nota com essa tag.',
      noteCount: (n) => `${n} ${n === 1 ? 'nota' : 'notas'}`,
    },
    posts: [
      {
        id: 'second-brain',
        date: '2026-04-18',
        minutes: 7,
        tags: ['ferramentas', 'método', 'escrita'],
        title: 'Um segundo cérebro feito de arquivos de texto',
        excerpt: 'Depois de cinco anos migrando entre apps de notas, voltei para pastas e markdown. O que mudou foi menos o formato e mais como eu ligo as coisas entre si.',
        body: [
          { type: 'p', text: 'Eu tinha uma pasta chamada `inbox` com 1.400 arquivos. Nenhum deles tinha título decente. Todos começavam com uma data. A maioria nunca foi relida.' },
          { type: 'p', text: 'O problema não era o app — era o fato de eu tratar notas como registros, não como peças. Um registro você guarda; uma peça você encaixa em outra. [[Zettelkasten]] chama isso de "conectividade", e honestamente o nome importa menos que o gesto.' },
          { type: 'h2', text: 'O que mudou na prática' },
          { type: 'p', text: 'Três regras simples. Primeiro, toda nota recebe pelo menos um link para outra nota no mesmo dia em que é criada. Segundo, títulos são obrigatórios e precisam caber numa linha. Terceiro, se eu não consigo escrever um título em trinta segundos, a nota ainda não existe de verdade.' },
          { type: 'quote', text: 'Uma nota sem ligações é uma ilha. Um arquipélago de ilhas não é um sistema, é um naufrágio.' },
          { type: 'p', text: 'Releio [[Notas diárias]] toda sexta. É pouco, mas é consistente, e é nessa releitura que as conexões acontecem.' },
        ],
      },
      {
        id: 'rust-cli',
        date: '2026-04-09',
        minutes: 11,
        tags: ['rust', 'cli', 'programação'],
        title: 'Escrevendo um CLI em Rust sem ficar bravo',
        excerpt: 'Um guia honesto para quem vem de Python ou Go. Menos sobre a linguagem e mais sobre a ergonomia: clap, anyhow, e a arte de não abraçar o borrow checker cedo demais.',
        body: [
          { type: 'p', text: 'Rust tem fama de ser hostil com iniciantes. Minha experiência foi diferente: a parte difícil não é o compilador, é resistir ao impulso de escrever [[Rust idiomático]] antes de ter um programa que funciona.' },
          { type: 'h2', text: 'Começar feio' },
          { type: 'p', text: 'Comece com `String` em todo lugar. Clone sem culpa. Use `anyhow::Result` como tipo de retorno padrão. Você vai refatorar depois, e vai refatorar com um programa rodando, não com uma ideia.' },
          { type: 'code', lang: 'rust', text: 'use anyhow::Result;\nuse clap::Parser;\n\n#[derive(Parser)]\nstruct Args {\n    path: String,\n    #[arg(short, long)]\n    verbose: bool,\n}\n\nfn main() -> Result<()> {\n    let args = Args::parse();\n    let text = std::fs::read_to_string(&args.path)?;\n    println!("{}", text.lines().count());\n    Ok(())\n}' },
          { type: 'p', text: 'Isso aí é um utilitário útil. Conta linhas, aceita flags, reporta erros decentes. Em Python seriam sete linhas; em Rust foram quinze. A diferença é que este binário vai rodar em dez anos sem mudar.' },
        ],
      },
      {
        id: 'slow-web',
        date: '2026-03-27',
        minutes: 5,
        tags: ['web', 'vida', 'ensaio'],
        title: 'Uma web mais lenta',
        excerpt: 'Um elogio às páginas que carregam em 200ms, não fazem perguntas e não lembram do meu nome. Há um prazer específico nisso que a gente esqueceu.',
        body: [
          { type: 'p', text: 'Abri um blog pessoal esses dias. Era HTML puro, fonte serifada, largura máxima de 640px, zero JavaScript. Fiquei dez minutos lá. É muito tempo para os padrões atuais.' },
          { type: 'p', text: 'Não estou defendendo austeridade por austeridade. Só acho que há uma diferença entre [[design generoso]] e design que quer alguma coisa de você.' },
        ],
      },
      {
        id: 'keyboard',
        date: '2026-03-12',
        minutes: 4,
        tags: ['ferramentas', 'hábitos'],
        title: 'Três atalhos que mudaram meu mês',
        excerpt: 'Não é sobre produtividade. É sobre reduzir a distância entre uma intenção e a primeira tecla que a executa.',
        body: [
          { type: 'p', text: 'Mapear Caps Lock para Esc/Ctrl. Criar um atalho global para abrir a nota de hoje. Um terceiro para colar sem formatação. Só isso.' },
          { type: 'p', text: 'Atalhos bons são aqueles que você esquece que existem. Viram parte da mão. Veja também [[Um segundo cérebro feito de arquivos de texto]].' },
        ],
      },
      {
        id: 'reading-code',
        date: '2026-02-28',
        minutes: 9,
        tags: ['programação', 'método'],
        title: 'Ler código é uma habilidade, escrever é um hábito',
        excerpt: 'A gente passa muito mais tempo lendo do que escrevendo, mas treina o oposto. Algumas rotinas concretas para inverter a proporção.',
        body: [
          { type: 'p', text: 'Toda semana eu leio o código de um projeto que eu não mantenho. Sem motivo, sem pressa. Faço anotações em [[Notas diárias]] quando encontro um padrão bonito.' },
          { type: 'p', text: 'Essa prática me ensinou mais do que qualquer curso.' },
        ],
      },
    ],
  },

  'en': {
    ui: {
      siteTitle: 'EDusik',
      siteTagline: 'notes on code, tools, and habits',
      recent: 'recent notes',
      readingTime: 'min read',
      backlinks: 'referenced in',
      tags: 'tags',
      allTags: 'all tags',
      filterBy: 'filtering by',
      clear: 'clear',
      footer: '',
      langLabel: 'language',
      date: (iso) => {
        const [y, m, day] = iso.split('-').map(Number);
        const d = new Date(y, m - 1, day);
        const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`;
      },
      empty: 'no notes with this tag.',
      noteCount: (n) => `${n} ${n === 1 ? 'note' : 'notes'}`,
    },
    posts: [
      {
        id: 'second-brain',
        date: '2026-04-18',
        minutes: 7,
        tags: ['tools', 'method', 'writing'],
        title: 'A second brain made of plain text files',
        excerpt: 'After five years migrating between note apps, I came back to folders and markdown. What changed was less the format and more how I link things to each other.',
        body: [
          { type: 'p', text: 'I had a folder called `inbox` with 1,400 files. None had a decent title. All started with a date. Most were never re-read.' },
          { type: 'p', text: 'The problem was never the app — it was that I treated notes as records, not as pieces. A record you store; a piece you fit into another. [[Zettelkasten]] calls this "connectivity", and honestly the name matters less than the gesture.' },
          { type: 'h2', text: 'What changed in practice' },
          { type: 'p', text: 'Three simple rules. First, every note gets at least one link to another note on the day it is created. Second, titles are mandatory and must fit on one line. Third, if I cannot write a title in thirty seconds, the note does not really exist yet.' },
          { type: 'quote', text: 'A note without links is an island. An archipelago of islands is not a system — it is a shipwreck.' },
          { type: 'p', text: 'I re-read [[Daily notes]] every Friday. It is a small ritual, but it is consistent, and it is in that re-reading that connections actually happen.' },
        ],
      },
      {
        id: 'rust-cli',
        date: '2026-04-09',
        minutes: 11,
        tags: ['rust', 'cli', 'programming'],
        title: 'Writing a Rust CLI without getting angry',
        excerpt: 'An honest guide for people coming from Python or Go. Less about the language, more about ergonomics: clap, anyhow, and the art of not embracing the borrow checker too early.',
        body: [
          { type: 'p', text: 'Rust has a reputation for being hostile to beginners. My experience was different: the hard part is not the compiler — it is resisting the urge to write [[Idiomatic Rust]] before having a program that works.' },
          { type: 'h2', text: 'Start ugly' },
          { type: 'p', text: 'Start with `String` everywhere. Clone without guilt. Use `anyhow::Result` as your default return type. You will refactor later, and you will refactor with a running program, not with an idea.' },
          { type: 'code', lang: 'rust', text: 'use anyhow::Result;\nuse clap::Parser;\n\n#[derive(Parser)]\nstruct Args {\n    path: String,\n    #[arg(short, long)]\n    verbose: bool,\n}\n\nfn main() -> Result<()> {\n    let args = Args::parse();\n    let text = std::fs::read_to_string(&args.path)?;\n    println!("{}", text.lines().count());\n    Ok(())\n}' },
          { type: 'p', text: 'That is a useful tool. Counts lines, accepts flags, reports decent errors. Seven lines in Python; fifteen in Rust. The difference is this binary will still run in ten years without changing.' },
        ],
      },
      {
        id: 'slow-web',
        date: '2026-03-27',
        minutes: 5,
        tags: ['web', 'life', 'essay'],
        title: 'A slower web',
        excerpt: 'An ode to pages that load in 200ms, do not ask questions, and do not remember my name. There is a specific pleasure in that we seem to have forgotten.',
        body: [
          { type: 'p', text: 'I opened a personal blog the other day. Plain HTML, serif font, 640px max width, zero JavaScript. I stayed there ten minutes. That is a long time by current standards.' },
          { type: 'p', text: 'I am not defending austerity for its own sake. I just think there is a difference between [[generous design]] and design that wants something from you.' },
        ],
      },
      {
        id: 'keyboard',
        date: '2026-03-12',
        minutes: 4,
        tags: ['tools', 'habits'],
        title: 'Three shortcuts that changed my month',
        excerpt: 'Not about productivity. About reducing the distance between an intention and the first key that executes it.',
        body: [
          { type: 'p', text: 'Map Caps Lock to Esc/Ctrl. Bind a global shortcut to open today\'s note. A third one to paste without formatting. That is it.' },
          { type: 'p', text: 'Good shortcuts are the ones you forget exist. They become part of the hand. See also [[A second brain made of plain text files]].' },
        ],
      },
      {
        id: 'reading-code',
        date: '2026-02-28',
        minutes: 9,
        tags: ['programming', 'method'],
        title: 'Reading code is a skill, writing is a habit',
        excerpt: 'We spend far more time reading than writing, but train the opposite. Some concrete routines to flip the ratio.',
        body: [
          { type: 'p', text: 'Every week I read the source of a project I do not maintain. No reason, no hurry. I jot things down in [[Daily notes]] when I find a pretty pattern.' },
          { type: 'p', text: 'That practice taught me more than any course ever did.' },
        ],
      },
    ],
  },
};
