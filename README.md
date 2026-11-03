# Desenvolvimento Web III (UC17-DWIII) — Material Didático SDD
**Instituto Federal de Educação, Ciência e Tecnologia do Ceará (IFCE) — Campus Baturité**  
*Curso Técnico Subsequente em Informática para Internet (Modalidade EaD)*

---

## Visão Geral

Este repositório armazena o ecossistema completo de material didático da disciplina **Desenvolvimento Web III (UC17-DWIII)**, construído sob a metodologia de **Specification-Driven Development (SDD)** e alinhado ao Projeto Pedagógico do Curso (PPC) e ao Regulamento da Organização Didática (ROD) do IFCE.

### Stack Tecnológica Oficial da Disciplina
- **Linguagem Base**: JavaScript Vanilla (ES6+ / ES Modules / Fetch API / DOM)
- **Back-end & APIs RESTful**: Node.js (HTTP nativo, Express/Fastify patterns, validação de schemas e middlewares)
- **Persistência, ORM & BaaS Low-Code**: ORM em Node.js + **PocketBase** (SQLite embutido, Collections, API Rules, Auth JWT e Realtime)
- **Front-end Reativo & UI Generativa**: **React** (JSX, Hooks `useState`/`useEffect`, componentização) + Prototipagem `v0` / Figma-to-Code
- **Engenharia Assistida por IA**: Vibe Coding responsável, auditoria de código, testes automatizados com `node:test` e deploy em nuvem (Docker / Render / Vercel / Fly.io)

---

## Estrutura das Unidades Curriculares

| Unidade Curricular | Aulas Especificadas |
| :--- | :---: |
| **Unidade I**: Framework Back-end (Node.js), Padrões & Vibe Coding | 6 (`A01`–`A06`) |
| **Unidade II**: ORM, Persistência & Backend Low-Code (PocketBase) | 7 (`A01`–`A07`) |
| **Unidade III**: Front-end (JS Vanilla & React), Headless CMS & No-Code UI | 5 (`A01`–`A05`) |
| **Unidade IV**: Projeto Web Completo, Testes por IA & Deploy na Nuvem | 10 (`A01`–`A10`) |
| **Total Geral da Disciplina** | **28 Aulas** |

---

## Como Executar o Pipeline Localmente

1. **Validar todas as 28 especificações `.spec.md` e ativos visuais**:
   ```bash
   npm run validate
   ```
2. **Executar a suíte de testes automatizados dos códigos de exemplo (`node:test`)**:
   ```bash
   npm test
   ```
3. **Compilar os pacotes HTML/Moodle (`.mbz`) e E-Book PDF (`build/`)**:
   ```bash
   npm run build:moodle
   ```
4. **Executar todo o pipeline de ponta a ponta**:
   ```bash
   npm run all
   ```
