# Plano Técnico e Especificação do Material Didático (plan.md)
## Disciplina: Desenvolvimento Web III (UC17-DWIII)
### Instituto Federal de Educação, Ciência e Tecnologia do Ceará (IFCE) — Campus Baturité

---

## 1. Visão Geral e Arquitetura Pedagógica

O presente plano técnico estabelece a especificação completa para a criação do material didático da disciplina **Desenvolvimento Web III (UC17-DWIII)** do Curso Técnico Subsequente em Informática para Internet na modalidade de Educação a Distância (EaD), ofertado pelo IFCE *Campus* Baturité, estruturado em momentos presenciais, síncronos e assíncronos no Ambiente Virtual de Aprendizagem Moodle.

Para atender às exigências do mercado de trabalho contemporâneo e integrar as inovações tecnológicas emergentes ao Projeto Pedagógico do Curso (PPC) e ao Regulamento da Organização Didática (ROD) do IFCE, a produção deste material adota a abordagem de **Desenvolvimento Orientado a Especificação (Specification-Driven Development — SDD)**. O ecossistema de conteúdo utiliza uma *stack* padronizada baseada em **JavaScript Vanilla (ES6+), Node.js, PocketBase e React**, documentada em arquivos Markdown para textos e código-fonte, combinada com *prompts* estruturados de Inteligência Artificial para geração de ativos visuais (diagramas de arquitetura, infográficos comparativos e artes de abertura).

### 1.1 Tríade Metodológica Integrada

A ementa tradicional da disciplina foi expandida e entrelaçada com três pilares metodológicos modernos:

1. **Programação Assistida por IA e Vibe Coding**: O estudante evolui da escrita manual de *boilerplate* para o papel de especificador de arquitetura e auditor de código em **JavaScript Vanilla e Node.js**, utilizando assistentes de IA generativa (como Cursor, GitHub Copilot e Gemini Code Assist) para scaffolding acelerado de APIs RESTful, middlewares e controladores.
2. **Soluções Low-Code e BaaS (Backend-as-a-Service com PocketBase)**: O Mapeamento Objeto-Relacional (ORM) tradicional em Node.js é confrontado e integrado ao **PocketBase** (plataforma BaaS *open-source* com banco SQLite embutido, autenticação nativa e tempo real), permitindo a geração instantânea de endpoints RESTful, coleções tipadas e regras de acesso (*API Rules*).
3. **Ferramentas No-Code, Headless CMS e UI Generativa com React**: No front-end, o ensino evolui da manipulação imperativa do DOM com **JavaScript Vanilla** para componentes reativos com **React**, enriquecido com geradores de interface a partir do design (ex.: v0 e Figma-to-Code) e consumo do **PocketBase** como Gerenciador de Conteúdo sem cabeça (*Headless CMS*).

---

## 2. Framework de Especificação de Conteúdo (Content Spec Schema)

Cada módulo ou unidade letiva da disciplina é especificado por meio de um arquivo `.spec.md` normatizado. A estrutura obrigatória garante a rastreabilidade pedagógica, o alinhamento com a Taxonomia de Bloom e a facilidade de compilação automatizada.

### 2.1 Schema Estrutural em Markdown

O esquema padrão de cada especificação de aula segue a estrutura abaixo:

```yaml
---
modulo_id: "DW3-U0X-A0X"
titulo: "Título Orientado a Insights da Aula"
unidade: "Unidade X: Nome da Unidade Curricular"
modalidade: "Presencial | Síncrono | Assíncrono"
competencias_chave:
  - "Competência prática 1"
  - "Competência prática 2"
prompts_imagem_count: N
---
```

A especificação de conteúdo do corpo do documento deve conter obrigatoriamente:
- **Objetivos de Aprendizagem**: Lista de verificação com verbos de ação mensuráveis.
- **Fundamentação Teórica (Markdown)**: Exposição conceitual intercalando a arquitetura tradicional e a abordagem de IA/Low-Code.
- **Atividade Prática Guiada (Hands-on)**: Bloco com especificações de prompts para assistentes de código, snippets explicativos em JavaScript/Node.js/PocketBase/React e testes de validação.
- **Especificação de Ativos Visuais**: Bloco de especificação de imagens com prompts prontos para renderização.

---

## 3. Framework de Especificação Visual (Visual Asset Spec Schema)

Para manter a identidade visual coesa no Ambiente Virtual de Aprendizagem (Moodle) e nos materiais impressos/PDF, todos os ativos visuais são gerados por modelos de IA de imagem a partir de uma taxonomia bem definida.

### 3.1 Taxonomia dos Ativos Visuais

| Categoria | Sigla | Finalidade Pedagógica | Formato / Aspect Ratio |
| :--- | :---: | :--- | :---: |
| **Diagrama Técnico** | `DIAG` | Representar fluxos de dados, arquiteturas cliente-servidor Node.js/React, esquemas de ORM/PocketBase e pipelines de deploy. | 16:9 |
| **Infográfico Conceitual** | `INFO` | Comparar paradigmas (ex.: Código Manual vs. Vibe Coding; ORM Tradicional vs. PocketBase BaaS; JS Vanilla DOM vs. React). | 16:9 |
| **Arte Didática de Abertura** | `ART` | Ilustração conceitual de capa para módulos e cabeçalhos do Moodle. | 21:9 / Banner |

### 3.2 Template Universal de Prompt de Geração de Imagem

```text
[TIPO]: <DIAG | INFO | ART>
[TEMA]: <Assunto técnico central>
[ESTILO]: Modern minimalist tech vector illustration, clean lines, dark mode background (#0F172A), vibrant accent colors (#38BDF8, #818CF8, #34D399).
[COMPOSIÇÃO]: <Descrição detalhada dos elementos visuais, blocos de dados, setas e ícones>
[TEXT RENDERING]: Crisp legible text rendering for labels: "<ROTULO_1>", "<ROTULO_2>".
[ASPECT RATIO]: 16:9
```

---

## 4. Especificação Detalhada das Unidades Curriculares

A matriz curricular de Desenvolvimento Web III é composta por 4 unidades sequenciais, cobrindo o ciclo completo de desenvolvimento de software Web com **JavaScript Vanilla, Node.js, PocketBase e React**.

### 4.1 Unidade I: Framework Back-end, Padrões de Software & Vibe Coding

A Unidade I introduz a arquitetura de sistemas Web no servidor com **Node.js** e **JavaScript Vanilla (ES6+)**, gerenciamento de pacotes (`npm`), padrões de projeto (MVC, Services, Controllers, RESTful) e o tratamento de exceções, integrando o conceito de Vibe Coding para prototipagem rápida de controladores e rotas.

#### Plano de Aulas (Unidade I)
- **Aula 1 (Assíncrona)**: Introdução aos Frameworks Web em Node.js e Gerenciamento de Pacotes com IA.
- **Aula 2 (Presencial)**: Configuração de Ambiente Node.js e Arquitetura Web na Prática (Laboratório).
- **Aula 3 (Síncrona)**: Padrões de Arquitetura Back-end (MVC/Controllers) e Scaffolding com Vibe Coding.
- **Aula 4 (Assíncrona)**: Estudo Dirigido: Análise Crítica e Auditoria de Código Node.js Gerado por IA.
- **Aula 5 (Síncrona)**: Arquitetura RESTful, Verbos HTTP, Middlewares e Tratamento de Exceções.
- **Aula 6 (Assíncrona)**: Resolução de Exercícios Práticos Virtuais de Construção de APIs REST em Node.js.

#### Exemplo de Código e Especificação de Prompt (Unidade I)

O snippet a seguir ilustra a especificação de uma API RESTful em **Node.js** (utilizando padrões modernos ES Modules e validação estruturada) gerada sob o paradigma de Vibe Coding, incluindo tratamento de exceções HTTP:

```javascript
import http from 'node:http';

const dbAlunos = new Map();

function validarAluno(payload) {
  if (!payload || typeof payload.nome !== 'string' || payload.nome.trim().length < 3) {
    const err = new Error('O nome completo do discente deve ter pelo menos 3 caracteres.');
    err.statusCode = 422;
    throw err;
  }
  if (!/^\d{10}$/.test(String(payload.matricula ?? ''))) {
    const err = new Error('A matrícula deve conter exatamente 10 dígitos numéricos.');
    err.statusCode = 422;
    throw err;
  }
  return {
    id: dbAlunos.size + 1,
    nome: payload.nome.trim(),
    matricula: String(payload.matricula),
    curso: payload.curso || 'Técnico em Informática para Internet'
  };
}

export function processarCriacaoAluno(payload) {
  const aluno = validarAluno(payload);
  if (dbAlunos.has(aluno.matricula)) {
    const err = new Error('Matrícula já cadastrada no sistema acadêmico.');
    err.statusCode = 400;
    throw err;
  }
  dbAlunos.set(aluno.matricula, aluno);
  return { mensagem: 'Aluno cadastrado com sucesso', dados: aluno };
}
```

*Prompt de Imagem (`DW3-U01-DIAG01`)*:
> `[DIAG] Vibe Coding Back-end Workflow: Professional isometric technical diagram showing a developer entering natural language specifications on the left, feeding into an AI Code Engine in the center. The AI Engine outputs structured Node.js REST routes, JavaScript schema validators, and HTTP error handlers on the right. Dark blue background (#0F172A), cyan (#06B6D4) and purple (#A855F7) glows, clean vector lines, 16:9 aspect ratio.`

---

### 4.2 Unidade II: Framework ORM, Persistência & Backend Low-Code / BaaS com PocketBase

A Unidade II aborda a abstração do banco de dados relacional em **Node.js** por meio de Mapeamento Objeto-Relacional (ORM), geração de migrações e construção de consultas avançadas, comparando e integrando essa abordagem clássica com a plataforma Low-Code de Backend como Serviço (**PocketBase**).

#### Plano de Aulas (Unidade II)
- **Aula 1 (Assíncrona)**: Conceitos Fundamentais de ORM em Node.js e Abstração de Entidades.
- **Aula 2 (Síncrona)**: Mapeamento de Atributos, Chaves e Relacionamentos no ORM.
- **Aula 3 (Assíncrona)**: Modelagem e Geração Automática de Migrações (*Migrations*).
- **Aula 4 (Assíncrona)**: Automação de Scripts de Banco de Dados e Introdução ao BaaS com PocketBase.
- **Aula 5 (Presencial)**: Laboratório Prático: Integração Back-end Node.js + ORM/PocketBase + Banco Relacional (1ª Atividade Avaliativa Prática).
- **Aula 6 (Síncrona)**: Consultas Avançadas, Joins/Expand e Performance no ORM e PocketBase auxiliados por IA.
- **Aula 7 (Assíncrona)**: Atividade de Fixação: Mapeamento de Tabelas Complexas e API Rules no PocketBase.

#### Prompt de Imagem Especificado (`DW3-U02-INFO01`)
> `[INFO] ORM vs PocketBase BaaS Low-Code Architecture: Modern side-by-side comparison infographic. Left side labeled "Traditional Node.js ORM" showing JavaScript Models mapping to SQL Tables via Migration Scripts. Right side labeled "PocketBase BaaS" showing direct Auto-generated REST & Realtime APIs from SQLite Collections with built-in Auth and API Rules. Dark background (#0F172A), vibrant emerald (#10B981) and sky blue (#0284C7) accents, crisp typography, 16:9 aspect ratio.`

---

### 4.3 Unidade III: Framework Front-end (JS Vanilla & React), Headless CMS & No-Code UI

A Unidade III foca na construção da camada de apresentação, partindo da manipulação do DOM e Fetch API em **JavaScript Vanilla** para a reatividade declarativa de componentes em **React**, integrando o consumo do **PocketBase** como Headless CMS e ferramentas de UI Generativa (`v0` / Figma).

#### Plano de Aulas (Unidade III)
- **Aula 1 (Assíncrona)**: Do JavaScript Vanilla ao React: Componentes Visuais, Reatividade e Ciclo de Vida.
- **Aula 2 (Assíncrona)**: Soluções de Gerenciamento de Conteúdo (PocketBase Headless CMS) e Prototipagem No-Code (v0 / Figma).
- **Aula 3 (Síncrona)**: Integração do Front-end React com APIs RESTful e Gerenciamento de Estado (`useState` / `useEffect`).
- **Aula 4 (Assíncrona)**: Requisições Assíncronas (`fetch` / SDK `pocketbase`) e Manipulação de Estado Reativo.
- **Aula 5 (Presencial)**: Laboratório Prático: Consumo de Dados e Renderização Dinâmica na Interface React.

#### Prompt de Imagem Especificado (`DW3-U03-DIAG01`)
> `[DIAG] React Front-end API Integration & PocketBase Headless CMS: Technical vector flow diagram illustrating a reactive React Component tree on the left, consuming JSON payload via async Fetch API and SDK from a central REST API Gateway, connected to a PocketBase Headless CMS and Node.js Server on the right. Dark mode aesthetics (#0F172A), bright indigo (#6366F1) and amber (#F59E0B) highlights, 16:9 aspect ratio.`

---

### 4.4 Unidade IV: Projeto Web Completo, Testes por IA & Deploy na Nuvem

A Unidade IV consolida o aprendizado na execução de um projeto de sistema Web Full-Stack completo (**React + Node.js + PocketBase**). Os discentes passam pelo levantamento de requisitos, modelagem da persistência, autenticação JWT, geração de testes automatizados com IA (`node:test`) e publicação (*deploy*) da aplicação em ambiente de nuvem.

#### Plano de Aulas (Unidade IV)
- **Aula 1 (Síncrona)**: Planejamento de Projeto: Escopo e Levantamento de Requisitos com SDD.
- **Aula 2 (Assíncrona)**: Modelagem de Interface (UI/UX) e Fluxos de Navegação em React.
- **Aula 3 (Assíncrona)**: Camada de Persistência no PocketBase/Node.js, Autenticação e Segurança da Informação.
- **Aula 4 (Síncrona)**: Padrões Avançados de Arquitetura Full-Stack e Integração de Sistemas.
- **Aula 5 (Assíncrona)**: Codificação Supervisionada do Projeto Final.
- **Aula 6 (Assíncrona)**: Testes Automatizados Gerados por IA (`node:test`) e Estratégias de Deploy (Docker/Vercel/Render/Fly.io).
- **Aula 7 (Presencial)**: Laboratório Prático: Publicação Prática (Deploy) e Testes de Carga Finais.
- **Aula 8 (Síncrona)**: Code Review, Análise de Performance e Apresentação de Projetos.
- **Aula 9 (Assíncrona)**: Envio Final do Repositório do Projeto no AVA Moodle (2ª Atividade Avaliativa - Projeto Final).
- **Aula 10 (Assíncrona)**: Fechamento de Diário de Classe e Orientações para Exame Final.

---

## 5. Diretrizes de Avaliação, Frequência e Matriz de Aprovação

A avaliação da aprendizagem nesta disciplina segue rigorosamente o Regulamento da Organização Didática (ROD) do IFCE para os cursos técnicos subsequentes.

### 5.1 Fórmulas e Critérios de Aprovação

O rendimento acadêmico semestral é calculado pela combinação das Atividades a Distância (AD) e das Avaliações Presenciais (AP).

1. **Frequência Mínima Obrigatória**: O estudante deve registrar no mínimo **75% de frequência** no somatório dos momentos presenciais, síncronos e assíncronos (comprovados pela entrega de atividades no Moodle).
2. **Média Semestral Parcial ($X_S$)**:
   $$X_S = \frac{2 \cdot AD + 3 \cdot AP}{5}$$
   - Se $X_S \ge 6,0$ e Frequência $\ge 75\%$: O estudante está **Aprovado por Média**.
   - Se $3,0 \le X_S < 6,0$: O estudante é submetido ao **Exame Presencial Final (EFP)**.
3. **Média Final pós-Exame ($X_F$)**:
   $$X_F = \frac{X_S + EFP}{2}$$
   - Se $X_F \ge 5,0$: O estudante é considerado **Aprovado em Exame Final**.

---

## 6. Guia de Implementação e Pipeline de Compilação

Para operacionalizar a criação do material didático, a equipe de professores e designers instrucionais deve utilizar a seguinte estrutura de diretórios e pipeline de automação Git/Markdown:

### 6.1 Estrutura de Repositório no GitHub / GitLab

```text
dw3-material-didatico/
├── .github/
│   └── workflows/
│       └── compile-moodle.yml
├── docs/
│   ├── plan.md  (Este Plano Técnico Master)
│   ├── moodle-organization.md
│   ├── u1-backend-vibe/
│   │   ├── DW3-U01-A01.spec.md ... DW3-U01-A06.spec.md
│   │   └── assets/
│   ├── u2-orm-lowcode/
│   │   ├── DW3-U02-A01.spec.md ... DW3-U02-A07.spec.md
│   │   └── assets/
│   ├── u3-frontend-nocode/
│   │   ├── DW3-U03-A01.spec.md ... DW3-U03-A05.spec.md
│   │   └── assets/
│   └── u4-projeto-deploy/
│       ├── DW3-U04-A01.spec.md ... DW3-U04-A10.spec.md
│       └── assets/
├── src/
│   ├── scripts/
│   │   ├── validate-specs.js
│   │   └── compile-moodle.js
│   └── code-samples/
│       ├── u1-node-api/
│       ├── u2-pocketbase-orm/
│       ├── u3-react-frontend/
│       └── u4-fullstack-tests/
└── build/
    ├── pdf/
    └── moodle-mbz/
```

### 6.2 Pipeline de Compilação Automática

1. **Validação de Especificação**: O script verifica se cada arquivo `.spec.md` atende ao YAML Frontmatter obrigatório e se os snippets de código executam sem erros sintáticos.
2. **Renderização de Imagens**: Os prompts visuais contidos nas especificações são submetidos ao gerador de imagem, que salva os arquivos PNG otimizados na pasta `assets/`.
3. **Publicação no AVA Moodle e Geração de E-Book**: O compilador une os arquivos Markdown das aulas com os links dos ativos visuais, gerando o pacote HTML/MBZ pronto para importação direta no ambiente Moodle do IFCE *Campus* Baturité e o E-Book em PDF.
