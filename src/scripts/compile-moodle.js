/**
 * Compilador de Material Didático SDD para AVA Moodle (HTML + Manifesto MBZ) e E-Book PDF Editorial
 * Disciplina: Desenvolvimento Web III (UC17-DWIII) — IFCE Campus Baturité
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const BUILD_MOODLE_DIR = path.join(ROOT_DIR, 'build', 'moodle-mbz');
const BUILD_PDF_DIR = path.join(ROOT_DIR, 'build', 'pdf');

const UNIDADES = [
  {
    id: 'U1',
    numero: 'Unidade I',
    pasta: 'u1-backend-vibe',
    nome: 'Unidade I: Framework Back-end (Node.js), Padrões & Vibe Coding',
    banner: 'DW3-U01-ART01.png',
    ementa:
      'Arquitetura cliente-servidor com Node.js e JavaScript Vanilla (ES6+), gerenciamento de pacotes npm, padrões MVC/Services/Controllers, construção de APIs RESTful, middlewares, tratamento de exceções HTTP e auditoria crítica de código gerado por IA (Vibe Coding).'
  },
  {
    id: 'U2',
    numero: 'Unidade II',
    pasta: 'u2-orm-lowcode',
    nome: 'Unidade II: Framework ORM, Persistência & Backend Low-Code (PocketBase)',
    banner: 'DW3-U02-ART01.png',
    ementa:
      'Impedância objeto-relacional, modelagem de entidades e relacionamentos (1:1, 1:N, N:N), geração de Migrations e Seeds, integração com PocketBase BaaS (SQLite embutido, Collections, Auth JWT, Realtime), otimização de queries (expand vs N+1) e segurança declarativa com API Rules.'
  },
  {
    id: 'U3',
    numero: 'Unidade III',
    pasta: 'u3-frontend-nocode',
    nome: 'Unidade III: Framework Front-end (JS Vanilla & React), Headless CMS & No-Code UI',
    banner: 'DW3-U03-ART01.png',
    ementa:
      'Transição da manipulação imperativa do DOM (JavaScript Vanilla) para interfaces declarativas em React (JSX, Props, useState, useEffect, Estado Derivado), consumo do PocketBase como Headless CMS, prototipagem com UI Generativa (v0 / Figma) e requisições assíncronas.'
  },
  {
    id: 'U4',
    numero: 'Unidade IV',
    pasta: 'u4-projeto-deploy',
    nome: 'Unidade IV: Projeto Web Completo, Testes por IA & Deploy na Nuvem',
    banner: 'DW3-U04-ART01.png',
    ementa:
      'Engenharia Full-Stack orientada a especificação (SDD), fluxos de navegação e rotas protegidas em React, autenticação JWT e segurança OWASP Top 10, padrão BFF, testes automatizados nativos com node:test gerados por IA, containerização Docker, deploy na nuvem e fechamento acadêmico segundo o ROD/IFCE.'
  }
];

function parseFrontmatterECorpo(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: { competencias_chave: [] }, corpo: raw };
  const yaml = match[1];
  const corpo = match[2];
  const meta = { competencias_chave: [] };
  let lendoLista = false;

  for (const line of yaml.split(/\r?\n/)) {
    if (line.trim().startsWith('- ')) {
      if (lendoLista) {
        meta.competencias_chave.push(line.trim().slice(2).replace(/^"|"$/g, ''));
      }
      continue;
    }
    lendoLista = false;
    const idx = line.indexOf(':');
    if (idx !== -1) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
      if (k === 'competencias_chave') {
        lendoLista = true;
      } else {
        meta[k] = v;
      }
    }
  }
  return { meta, corpo };
}

function removerSecaoAtivosVisuaisDoBuild(md) {
  return md
    .replace(/\r?\n---\r?\n+\s*##\s*\d*\.?\s*Especificação de Ativos Visuais[\s\S]*$/i, '')
    .replace(/\r?\n+##\s*\d*\.?\s*Especificação de Ativos Visuais[\s\S]*$/i, '')
    .trim();
}

function renderizarTabelasMarkdown(html) {
  const linhas = html.split(/\r?\n/);
  const saida = [];
  let emTabela = false;
  let cabecalhoProcessado = false;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (linha.startsWith('|') && linha.endsWith('|')) {
      if (/^\|[\s:|-]+\|$/.test(linha)) {
        continue;
      }
      if (!emTabela) {
        emTabela = true;
        cabecalhoProcessado = false;
        saida.push('<table class="md-table">');
      }
      const celulas = linha
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      if (!cabecalhoProcessado) {
        saida.push('<thead><tr>' + celulas.map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>');
        cabecalhoProcessado = true;
      } else {
        saida.push('<tr>' + celulas.map((c) => `<td>${c}</td>`).join('') + '</tr>');
      }
    } else {
      if (emTabela) {
        saida.push('</tbody></table>');
        emTabela = false;
      }
      saida.push(linhas[i]);
    }
  }
  if (emTabela) {
    saida.push('</tbody></table>');
  }
  return saida.join('\n');
}

function markdownParaHtmlBasico(md, pastaUnidadeRelativa) {
  const mdLimpo = removerSecaoAtivosVisuaisDoBuild(md);
  let html = mdLimpo
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const blocosCodigo = [];
  html = html.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const token = `@@CODE_BLOCK_${blocosCodigo.length}@@`;
    blocosCodigo.push(
      `<pre class="code-block" data-lang="${lang || 'code'}"><div class="code-lang">${(lang || 'code').toUpperCase()}</div><code>${code.trim()}</code></pre>`
    );
    return token;
  });

  html = renderizarTabelasMarkdown(html);

  html = html.replace(/!\[(.*?)\]\(\.\/assets\/(.*?)\)/g, (_, alt, imgFile) => {
    const srcPath = `${pastaUnidadeRelativa}/assets/${imgFile}`;
    return `<figure class="visual-asset"><img src="${srcPath}" alt="${alt}" /><figcaption>${alt}</figcaption></figure>`;
  });

  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1 class="lesson-main-title">$1</h1>');

  html = html.replace(/^---$/gm, '<hr class="section-divider" />');

  html = html.replace(/^- \[x\] (.*)$/gm, '<li class="task-item">✅ $1</li>');
  html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*)$/gm, '<li class="num-item"><span class="num-badge">$1.</span> $2</li>');

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

  html = html.replace(/@@CODE_BLOCK_(\d+)@@/g, (_, idx) => blocosCodigo[Number(idx)]);

  return html;
}

const CSS_ESTILO_IFCE = `
  :root {
    --bg-dark: #0f172a;
    --bg-card: #1e293b;
    --accent-cyan: #38bdf8;
    --accent-indigo: #818cf8;
    --accent-emerald: #34d399;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
  }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: var(--bg-dark);
    color: var(--text-main);
    margin: 0;
    padding: 2rem;
    line-height: 1.65;
  }
  .container { max-width: 1080px; margin: 0 auto; }
  header.hero {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    border: 1px solid #334155;
    border-left: 6px solid var(--accent-emerald);
    border-radius: 12px;
    padding: 1.75rem 2rem;
    margin-bottom: 2rem;
  }
  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    background: rgba(56, 189, 248, 0.15);
    color: var(--accent-cyan);
    margin-right: 0.5rem;
  }
  .lesson-card {
    background: var(--bg-card);
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
  }
  h1, h2, h3 { color: var(--accent-cyan); }
  pre.code-block {
    background: #020617;
    border: 1px solid #334155;
    border-left: 4px solid var(--accent-indigo);
    padding: 1rem 1.25rem;
    border-radius: 8px;
    overflow-x: auto;
    color: #e2e8f0;
    font-size: 0.9rem;
    position: relative;
  }
  .code-lang {
    font-size: 0.7rem;
    color: var(--accent-indigo);
    font-weight: 700;
    margin-bottom: 0.4rem;
    letter-spacing: 0.08em;
  }
  code.inline-code {
    background: rgba(129, 140, 248, 0.15);
    color: #c7d2fe;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
  }
  table.md-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.25rem 0;
    font-size: 0.92rem;
  }
  table.md-table th, table.md-table td {
    border: 1px solid #334155;
    padding: 0.6rem 0.85rem;
    text-align: left;
  }
  table.md-table th {
    background: #020617;
    color: var(--accent-emerald);
  }
  figure.visual-asset {
    margin: 1.5rem 0;
    text-align: center;
  }
  figure.visual-asset img {
    max-width: 100%;
    border-radius: 10px;
    border: 1px solid #475569;
  }
  figure.visual-asset figcaption {
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }
`;

const CSS_EBOOK_PDF = `
  @page {
    size: A4 portrait;
    margin: 16mm 15mm 18mm 15mm;
  }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #0f172a;
    background: #ffffff;
    margin: 0;
    padding: 0;
    line-height: 1.58;
    font-size: 10.5pt;
  }
  /* CAPA EDITORIAL */
  .ebook-cover {
    background: linear-gradient(145deg, #090d16 0%, #0f172a 55%, #1e1b4b 100%);
    color: #f8fafc;
    min-height: 262mm;
    padding: 18mm 16mm;
    border-radius: 10px;
    border: 2px solid #1e293b;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    break-after: page;
  }
  .cover-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #10b981;
    padding-bottom: 12px;
  }
  .inst-tag {
    font-size: 9.5pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #34d399;
  }
  .code-tag {
    background: rgba(56, 189, 248, 0.18);
    border: 1px solid #38bdf8;
    color: #38bdf8;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 8.5pt;
    font-weight: 700;
  }
  .cover-hero {
    margin: 12mm 0 8mm 0;
  }
  .cover-pretitle {
    color: #38bdf8;
    font-size: 11pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 8px;
  }
  .cover-title {
    font-size: 27pt;
    line-height: 1.15;
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 12px 0;
  }
  .cover-subtitle {
    font-size: 12.5pt;
    color: #cbd5e1;
    font-weight: 400;
    margin: 0 0 18px 0;
  }
  .cover-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  .cover-pill {
    background: rgba(129, 140, 248, 0.2);
    border: 1px solid #818cf8;
    color: #e0e7ff;
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 9pt;
    font-weight: 600;
  }
  .cover-banner-box {
    margin: 6mm 0;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #334155;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  }
  .cover-banner-box img {
    width: 100%;
    max-height: 78mm;
    object-fit: cover;
    display: block;
  }
  .cover-footer {
    border-top: 1px solid #334155;
    padding-top: 14px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    font-size: 9.5pt;
    color: #cbd5e1;
  }
  .cover-footer strong { color: #38bdf8; display: block; font-size: 8.5pt; text-transform: uppercase; }

  /* SEÇÃO DE AUTOR E FICHA TÉCNICA */
  .author-page {
    page-break-after: always;
    break-after: page;
    padding-top: 4mm;
  }
  .section-eyebrow {
    color: #0284c7;
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 4px;
  }
  .page-header-title {
    font-size: 20pt;
    color: #0f172a;
    margin: 0 0 14px 0;
    padding-bottom: 8px;
    border-bottom: 3px solid #0f172a;
  }
  .author-card {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 6px solid #0284c7;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 18px;
  }
  .author-card h3 {
    margin: 0 0 6px 0;
    color: #0f172a;
    font-size: 13.5pt;
  }
  .author-role {
    color: #0369a1;
    font-weight: 600;
    font-size: 10pt;
    margin-bottom: 10px;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 18px;
  }
  .meta-box {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 12px 14px;
  }
  .meta-box h4 {
    margin: 0 0 6px 0;
    font-size: 9.5pt;
    text-transform: uppercase;
    color: #0f172a;
  }
  .formula-box {
    background: #0f172a;
    color: #f8fafc;
    border-radius: 8px;
    padding: 14px 18px;
    margin-top: 12px;
  }
  .formula-box h4 { color: #34d399; margin: 0 0 8px 0; }

  /* SUMÁRIO EXECUTIVO E NAVEGÁVEL */
  .toc-page {
    page-break-after: always;
    break-after: page;
  }
  .toc-unit-block {
    margin-bottom: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .toc-unit-header {
    background: #0f172a;
    color: #ffffff;
    padding: 8px 14px;
    font-weight: 700;
    font-size: 10.5pt;
    display: flex;
    justify-content: space-between;
  }
  .toc-unit-header span.ch { color: #34d399; }
  .toc-list {
    list-style: none;
    margin: 0;
    padding: 6px 14px;
    background: #ffffff;
  }
  .toc-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 5px 0;
    border-bottom: 1px dashed #e2e8f0;
    font-size: 9.5pt;
  }
  .toc-item:last-child { border-bottom: none; }
  .toc-item a {
    color: #0f172a;
    text-decoration: none;
    font-weight: 500;
  }
  .toc-item .toc-code {
    color: #0284c7;
    font-weight: 700;
    margin-right: 8px;
    font-family: Consolas, monospace;
  }
  .toc-item .toc-meta {
    font-size: 8.5pt;
    color: #475569;
    white-space: nowrap;
    margin-left: 10px;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 99px;
  }

  /* CAPA DE UNIDADE */
  .unit-divider {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #ffffff;
    padding: 18px 22px;
    border-radius: 10px;
    border-left: 8px solid #10b981;
    margin-bottom: 16px;
    page-break-before: always;
    break-before: page;
  }
  .unit-divider h2 {
    color: #38bdf8;
    margin: 4px 0 8px 0;
    font-size: 16pt;
  }
  .unit-divider p {
    margin: 0;
    color: #e2e8f0;
    font-size: 10pt;
  }

  /* PÁGINA DE AULA */
  .ebook-lesson {
    page-break-before: always;
    break-before: page;
    padding-bottom: 10mm;
  }
  .lesson-meta-bar {
    background: #0f172a;
    color: #f8fafc;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .lesson-meta-bar .mod-id {
    color: #38bdf8;
    font-weight: 800;
    font-size: 10.5pt;
  }
  .lesson-meta-bar .mod-info {
    background: rgba(52, 211, 153, 0.2);
    color: #34d399;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 8.5pt;
    font-weight: 700;
  }
  .competencias-box {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-left: 4px solid #0284c7;
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 12px;
    font-size: 9.2pt;
  }
  .competencias-box strong { color: #0369a1; }
  h1.lesson-main-title {
    font-size: 16pt;
    color: #0f172a;
    margin: 8px 0 12px 0;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 6px;
  }
  .ebook-lesson h2 {
    font-size: 12.5pt;
    color: #0369a1;
    margin: 14px 0 6px 0;
  }
  .ebook-lesson h3 {
    font-size: 10.8pt;
    color: #1e293b;
    margin: 10px 0 4px 0;
  }
  pre.code-block {
    background: #0f172a;
    color: #f8fafc;
    border: 1px solid #334155;
    border-left: 4px solid #6366f1;
    padding: 10px 12px;
    border-radius: 6px;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 8.3pt;
    line-height: 1.42;
    white-space: pre-wrap;
    word-break: break-word;
    page-break-inside: avoid;
    break-inside: avoid;
    margin: 10px 0;
  }
  .code-lang {
    color: #818cf8;
    font-size: 7.2pt;
    font-weight: 700;
    margin-bottom: 4px;
  }
  code.inline-code {
    background: #f1f5f9;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    padding: 1px 4px;
    border-radius: 4px;
    font-family: Consolas, monospace;
    font-size: 9pt;
  }
  figure.visual-asset {
    margin: 10px auto;
    text-align: center;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  figure.visual-asset img {
    max-width: 92%;
    max-height: 68mm;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
  }
  figure.visual-asset figcaption {
    font-size: 8.2pt;
    color: #475569;
    margin-top: 4px;
    font-style: italic;
  }
  table.md-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 8.8pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  table.md-table th, table.md-table td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
  }
  table.md-table th {
    background: #0f172a;
    color: #38bdf8;
  }
  li.task-item, li.num-item {
    list-style: none;
    margin: 4px 0;
  }
  .num-badge {
    font-weight: 700;
    color: #0284c7;
  }
  hr.section-divider {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 12px 0;
  }
`;

export function compilarMaterialMoodleEPdf() {
  fs.mkdirSync(BUILD_MOODLE_DIR, { recursive: true });
  fs.mkdirSync(BUILD_PDF_DIR, { recursive: true });

  const sumarioAulas = [];
  const blocosUnidadesEbook = [];
  let markdownConsolidado = `# E-Book & Caderno Didático — Desenvolvimento Web III (UC17-DWIII)\n## IFCE Campus Baturité | Stack: JavaScript Vanilla, Node.js, PocketBase e React\n\n---\n\n`;

  for (const unidade of UNIDADES) {
    const dirOrigem = path.join(DOCS_DIR, unidade.pasta);
    const dirDestinoMoodleAssets = path.join(BUILD_MOODLE_DIR, unidade.pasta, 'assets');
    const dirDestinoPdfAssets = path.join(BUILD_PDF_DIR, unidade.pasta, 'assets');
    fs.mkdirSync(dirDestinoMoodleAssets, { recursive: true });
    fs.mkdirSync(dirDestinoPdfAssets, { recursive: true });

    const dirOrigemAssets = path.join(dirOrigem, 'assets');
    if (fs.existsSync(dirOrigemAssets)) {
      for (const img of fs.readdirSync(dirOrigemAssets)) {
        fs.copyFileSync(path.join(dirOrigemAssets, img), path.join(dirDestinoMoodleAssets, img));
        fs.copyFileSync(path.join(dirOrigemAssets, img), path.join(dirDestinoPdfAssets, img));
      }
    }

    const arquivos = fs
      .readdirSync(dirOrigem)
      .filter((f) => f.endsWith('.spec.md'))
      .sort();

    const aulasDaUnidadeHtml = [];
    const aulasDaUnidadeToc = [];

    for (const arq of arquivos) {
      const raw = fs.readFileSync(path.join(dirOrigem, arq), 'utf-8');
      const { meta, corpo } = parseFrontmatterECorpo(raw);
      const htmlAulaCorpo = markdownParaHtmlBasico(corpo, `./${unidade.pasta}`);
      const nomeHtmlAula = arq.replace('.spec.md', '.html');

      const paginaAulaHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${meta.modulo_id} — ${meta.titulo}</title>
  <style>${CSS_ESTILO_IFCE}</style>
</head>
<body>
  <div class="container">
    <header class="hero">
      <span class="badge">${meta.modulo_id}</span>
      <span class="badge">${meta.modalidade}</span>
      <span class="badge">Stack: JS Vanilla • Node.js • PocketBase • React</span>
      <h1>${meta.titulo}</h1>
      <p>${meta.unidade}</p>
    </header>
    <main class="lesson-card">
      ${htmlAulaCorpo}
    </main>
  </div>
</body>
</html>`;

      fs.writeFileSync(path.join(BUILD_MOODLE_DIR, nomeHtmlAula), paginaAulaHtml, 'utf-8');

      const itemAula = {
        modulo_id: meta.modulo_id,
        titulo: meta.titulo,
        unidade: unidade.nome,
        unidadeId: unidade.id,
        modalidade: meta.modalidade,
        competencias: meta.competencias_chave || [],
        arquivoHtml: nomeHtmlAula
      };
      sumarioAulas.push(itemAula);
      aulasDaUnidadeToc.push(itemAula);

      const competenciasHtml =
        itemAula.competencias.length > 0
          ? `<div class="competencias-box"><strong>Competências-Chave:</strong> ${itemAula.competencias.join(' • ')}</div>`
          : '';

      aulasDaUnidadeHtml.push(`
        <article class="ebook-lesson" id="${meta.modulo_id}">
          <div class="lesson-meta-bar">
            <span class="mod-id">${meta.modulo_id} — ${unidade.numero}</span>
            <span class="mod-info">Modalidade: ${meta.modalidade}</span>
          </div>
          ${competenciasHtml}
          ${htmlAulaCorpo}
        </article>
      `);

      const corpoParaBuild = removerSecaoAtivosVisuaisDoBuild(corpo);
      markdownConsolidado += `\n\n<!-- ${meta.modulo_id} -->\n` + corpoParaBuild + `\n\n---\n`;
    }

    blocosUnidadesEbook.push({
      unidade,
      aulasToc: aulasDaUnidadeToc,
      aulasHtml: aulasDaUnidadeHtml.join('\n')
    });
  }

  // Gera o Portal Index do Moodle (build/moodle-mbz/index.html)
  const linhasTabela = sumarioAulas
    .map(
      (a) =>
        `<tr>
          <td><strong>${a.modulo_id}</strong></td>
          <td>${a.unidade}</td>
          <td><a href="./${a.arquivoHtml}" style="color:#38bdf8">${a.titulo}</a></td>
          <td>${a.modalidade}</td>
        </tr>`
    )
    .join('\n');

  const indexMoodleHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>AVA Moodle — Desenvolvimento Web III (IFCE Campus Baturité)</title>
  <style>
    ${CSS_ESTILO_IFCE}
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; background: var(--bg-card); border-radius: 8px; overflow: hidden; }
    th, td { padding: 0.75rem 1rem; border-bottom: 1px solid #334155; text-align: left; }
    th { background: #020617; color: var(--accent-emerald); }
  </style>
</head>
<body>
  <div class="container">
    <header class="hero">
      <span class="badge">IFCE Campus Baturité</span>
      <span class="badge">UC17-DWIII</span>
      <span class="badge">SDD Specification-Driven</span>
      <h1>Desenvolvimento Web III — Pacote Instrucional Moodle</h1>
      <p>Stack Oficial: <strong>JavaScript Vanilla (ES6+), Node.js, PocketBase e React</strong></p>
    </header>
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Unidade Curricular</th>
          <th>Título da Aula Compilada</th>
          <th>Modalidade</th>
        </tr>
      </thead>
      <tbody>
        ${linhasTabela}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(BUILD_MOODLE_DIR, 'index.html'), indexMoodleHtml, 'utf-8');

  // Manifesto Moodle XML
  const itensXml = sumarioAulas
    .map(
      (a, idx) =>
        `    <activity id="${idx + 1}" moduleid="${a.modulo_id}" modulename="page">
      <title>${a.modulo_id} - ${a.titulo}</title>
      <modality>${a.modalidade}</modality>
      <content_file>${a.arquivoHtml}</content_file>
    </activity>`
    )
    .join('\n');

  const moodleXml = `<?xml version="1.0" encoding="UTF-8"?>
<moodle_backup>
  <information>
    <name>dw3-ifce-baturite-moodle.mbz</name>
    <course_fullname>Desenvolvimento Web III (UC17-DWIII) - IFCE Campus Baturité</course_fullname>
    <course_shortname>UC17-DWIII</course_shortname>
    <stack>JavaScript Vanilla, Node.js, PocketBase, React</stack>
    <activities>
${itensXml}
    </activities>
  </information>
</moodle_backup>
`;
  fs.writeFileSync(path.join(BUILD_MOODLE_DIR, 'moodle_backup.xml'), moodleXml, 'utf-8');
  fs.writeFileSync(
    path.join(BUILD_MOODLE_DIR, 'manifest.json'),
    JSON.stringify({ disciplina: 'UC17-DWIII', totalAulas: sumarioAulas.length, aulas: sumarioAulas }, null, 2),
    'utf-8'
  );

  // Construção do Sumário HTML para o E-book
  const tocHtmlUnidades = blocosUnidadesEbook
    .map(
      ({ unidade, aulasToc }) => `
      <div class="toc-unit-block">
        <div class="toc-unit-header">
          <span>${unidade.nome}</span>
          <span class="ch">${aulasToc.length} Aulas</span>
        </div>
        <ul class="toc-list">
          ${aulasToc
            .map(
              (a) => `
            <li class="toc-item">
              <a href="#${a.modulo_id}"><span class="toc-code">${a.modulo_id}</span>${a.titulo}</a>
              <span class="toc-meta">${a.modalidade}</span>
            </li>`
            )
            .join('')}
        </ul>
      </div>`
    )
    .join('\n');

  // Construção do Corpo das 4 Unidades + 28 Aulas para o E-book
  const corpoUnidadesEbookHtml = blocosUnidadesEbook
    .map(
      ({ unidade, aulasHtml }) => `
      <section class="unit-section" id="unidade-${unidade.id}">
        <div class="unit-divider">
          <div class="inst-tag">Unidade Curricular • ${unidade.numero}</div>
          <h2>${unidade.nome}</h2>
          <p>${unidade.ementa}</p>
        </div>
        ${aulasHtml}
      </section>`
    )
    .join('\n');

  // HTML Completo do E-book com Capa, Seção de Autor/Ficha Técnica, Sumário e Conteúdo Integral
  const ebookCompletoHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>E-Book: Desenvolvimento Web III (UC17-DWIII) — IFCE Campus Baturité</title>
  <style>${CSS_EBOOK_PDF}</style>
</head>
<body>

  <!-- 1. CAPA DO E-BOOK -->
  <section class="ebook-cover">
    <div>
      <div class="cover-top-bar">
        <span class="inst-tag">Instituto Federal do Ceará (IFCE) — Campus Baturité</span>
        <span class="code-tag">UC17-DWIII • Material Didático SDD</span>
      </div>

      <div class="cover-hero">
        <div class="cover-pretitle">Curso Técnico Subsequente em Informática para Internet (EaD)</div>
        <h1 class="cover-title">Desenvolvimento Web III</h1>
        <p class="cover-subtitle">
          Arquitetura Back-end com Node.js, Persistência Low-Code com PocketBase, Interfaces Reativas com JavaScript Vanilla &amp; React e Engenharia Assistida por IA (Vibe Coding &amp; SDD)
        </p>

        <div class="cover-pills">
          <span class="cover-pill">JavaScript Vanilla (ES6+)</span>
          <span class="cover-pill">Node.js REST APIs</span>
          <span class="cover-pill">PocketBase BaaS &amp; ORM</span>
          <span class="cover-pill">React &amp; Headless CMS</span>
          <span class="cover-pill">Vibe Coding &amp; Cloud Deploy</span>
        </div>
      </div>

      <div class="cover-banner-box">
        <img src="./u1-backend-vibe/assets/DW3-U01-ART01.png" alt="Capa Desenvolvimento Web III" />
      </div>
    </div>

    <div class="cover-footer">
      <div>
        <strong>Autoria &amp; Coordenação Pedagógica</strong>
        Equipe Docente de Desenvolvimento Web &amp; Design Instrucional — IFCE Campus Baturité
      </div>
      <div>
        <strong>Metodologia &amp; Edição</strong>
        Specification-Driven Development (SDD) • Edição Acadêmica 2026
      </div>
    </div>
  </section>

  <!-- 2. SEÇÃO DE AUTOR, FICHA CATALOGRÁFICA E ARQUITETURA PEDAGÓGICA -->
  <section class="author-page">
    <div class="section-eyebrow">Expediente Acadêmico &amp; Ficha Técnica</div>
    <h2 class="page-header-title">Sobre os Autores e a Obra Didática</h2>

    <div class="author-card">
      <h3>Equipe Docente — Eixo de Informação e Comunicação (IFCE Campus Baturité)</h3>
      <div class="author-role">Autoria Técnica, Arquitetura de Software Educacional e Design Instrucional EaD</div>
      <p>
        Este livro digital (E-Book) foi concebido e desenvolvido pelo corpo docente da disciplina <strong>Desenvolvimento Web III (UC17-DWIII)</strong> do <strong>Instituto Federal de Educação, Ciência e Tecnologia do Ceará (IFCE) — Campus Baturité</strong>, destinado aos discentes do Curso Técnico Subsequente em Informática para Internet na modalidade de Educação a Distância (EaD).
      </p>
      <p>
        A obra adota pioneiramente a abordagem de <strong>Desenvolvimento Orientado a Especificação (Specification-Driven Development — SDD)</strong> aliada à tríade contemporânea de engenharia de software: <em>Programação Assistida por IA (Vibe Coding Responsável)</em>, <em>Backend-as-a-Service (PocketBase &amp; ORM)</em> e <em>Interfaces Declarativas Reativas (JavaScript Vanilla, React &amp; UI Generativa)</em>.
      </p>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h4>Dados Curriculares Oficiais (PPC / IFCE)</h4>
        <p><strong>Unidade Curricular:</strong> Desenvolvimento Web III (UC17-DWIII)</p>
        <p><strong>Estrutura Pedagógica:</strong> 4 Unidades Curriculares • 28 Aulas Especificadas</p>
        <p><strong>Modalidades de Ensino:</strong> Momentos Presenciais, Síncronos e Assíncronos (AVA Moodle)</p>
      </div>
      <div class="meta-box">
        <h4>Stack Tecnológica Padronizada</h4>
        <p><strong>Linguagem &amp; Runtime:</strong> JavaScript Vanilla (ES6+) &amp; Node.js LTS</p>
        <p><strong>Persistência &amp; BaaS:</strong> ORM Relacional, SQLite &amp; PocketBase</p>
        <p><strong>Front-end &amp; Testes:</strong> React (Hooks), UI Generativa (v0), <code>node:test</code> &amp; Docker</p>
      </div>
    </div>

    <div class="formula-box">
      <h4>Sistema de Avaliação e Matriz de Aprovação (ROD / IFCE)</h4>
      <p>
        Conforme o Regulamento da Organização Didática (ROD) do IFCE, exige-se frequência mínima obrigatória de <strong>75%</strong>. A Média Semestral Parcial (<strong>Xs</strong>) combina a nota das Atividades a Distância (<strong>AD</strong>, peso 2) e das Avaliações Presenciais (<strong>AP</strong>, peso 3):
      </p>
      <p style="font-family: Consolas, monospace; font-size: 11pt; color: #38bdf8; margin: 6px 0;">
        Xs = (2 × AD + 3 × AP) / 5
      </p>
      <p style="margin: 0; font-size: 9.5pt;">
        • <strong>Aprovado por Média:</strong> Xs ≥ 6,0 e Frequência ≥ 75%.<br/>
        • <strong>Exame Presencial Final (EFP):</strong> 3,0 ≤ Xs &lt; 6,0 → Média Final <strong>Xf = (Xs + EFP) / 2 ≥ 5,0</strong>.
      </p>
    </div>
  </section>

  <!-- 3. SUMÁRIO GERAL NAVEGÁVEL -->
  <section class="toc-page">
    <div class="section-eyebrow">Estrutura Curricular Completa • 4 Unidades • 28 Aulas</div>
    <h2 class="page-header-title">Sumário Geral</h2>
    ${tocHtmlUnidades}
  </section>

  <!-- 4. CONTEÚDO INTEGRAL DAS 4 UNIDADES E 28 AULAS -->
  ${corpoUnidadesEbookHtml}

</body>
</html>`;

  const caminhoHtmlConsolidado = path.join(BUILD_PDF_DIR, 'DW3-Caderno-Didatico-Completo.html');
  const caminhoPdfEbook = path.join(BUILD_PDF_DIR, 'DW3-Ebook-Desenvolvimento-Web-III-IFCE.pdf');

  fs.writeFileSync(path.join(BUILD_PDF_DIR, 'DW3-Caderno-Didatico-Completo.md'), markdownConsolidado, 'utf-8');
  fs.writeFileSync(caminhoHtmlConsolidado, ebookCompletoHtml, 'utf-8');

  const userDataDir = path.join(ROOT_DIR, 'build', '.chrome-profile');
  fs.mkdirSync(userDataDir, { recursive: true });
  const candidatosBrowser = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  const fileUrl = 'file:///' + caminhoHtmlConsolidado.replace(/\\/g, '/');
  for (const browserExe of candidatosBrowser) {
    if (!fs.existsSync(browserExe)) continue;
    try {
      execFileSync(browserExe, [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${userDataDir}`,
        '--no-pdf-header-footer',
        `--print-to-pdf=${caminhoPdfEbook}`,
        fileUrl
      ]);
      if (fs.existsSync(caminhoPdfEbook)) break;
    } catch {
      // Tenta o próximo navegador disponível
    }
  }
  fs.rmSync(userDataDir, { recursive: true, force: true });

  console.log('===================================================================');
  console.log(' COMPILADOR MOODLE & E-BOOK PDF — DWIII (IFCE CAMPUS BATURITÉ)');
  console.log('===================================================================');
  console.log(` ✔ ${sumarioAulas.length} páginas HTML de aulas geradas em: build/moodle-mbz/`);
  console.log(` ✔ Manifesto Moodle XML gerado em    : build/moodle-mbz/moodle_backup.xml`);
  console.log(` ✔ Caderno HTML Editorial em         : build/pdf/DW3-Caderno-Didatico-Completo.html`);
  if (fs.existsSync(caminhoPdfEbook)) {
    const stats = fs.statSync(caminhoPdfEbook);
    console.log(
      ` ✔ E-Book PDF Oficial gerado em      : build/pdf/DW3-Ebook-Desenvolvimento-Web-III-IFCE.pdf (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`
    );
  }
  console.log('===================================================================');
}

compilarMaterialMoodleEPdf();
