/**
 * Compilador de Material Didático SDD para AVA Moodle (HTML + Manifesto MBZ) e Guia PDF/HTML
 * Disciplina: Desenvolvimento Web III (UC17-DWIII) — IFCE Campus Baturité
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const BUILD_MOODLE_DIR = path.join(ROOT_DIR, 'build', 'moodle-mbz');
const BUILD_PDF_DIR = path.join(ROOT_DIR, 'build', 'pdf');

const UNIDADES = [
  { id: 'U1', pasta: 'u1-backend-vibe', nome: 'Unidade I: Framework Back-end (Node.js), Padrões & Vibe Coding (20h)' },
  { id: 'U2', pasta: 'u2-orm-lowcode', nome: 'Unidade II: Framework ORM, Persistência & PocketBase BaaS (20h)' },
  { id: 'U3', pasta: 'u3-frontend-nocode', nome: 'Unidade III: Front-end (JS Vanilla & React), Headless CMS & No-Code UI (16h)' },
  { id: 'U4', pasta: 'u4-projeto-deploy', nome: 'Unidade IV: Projeto Web Completo, Testes por IA & Deploy na Nuvem (24h)' }
];

function parseFrontmatterECorpo(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, corpo: raw };
  const yaml = match[1];
  const corpo = match[2];
  const meta = {};
  for (const line of yaml.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx !== -1 && !line.trim().startsWith('-')) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
      meta[k] = v;
    }
  }
  return { meta, corpo };
}

function markdownParaHtmlBasico(md, pastaUnidadeRelativa) {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Blocos de código ```lang ... ```
  html = html.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="code-block" data-lang="${lang || 'text'}"><code>${code.trim()}</code></pre>`;
  });

  // Imagens ![alt](./assets/file.png)
  html = html.replace(/!\[(.*?)\]\(\.\/assets\/(.*?)\)/g, (_, alt, imgFile) => {
    const srcPath = `${pastaUnidadeRelativa}/assets/${imgFile}`;
    return `<figure class="visual-asset"><img src="${srcPath}" alt="${alt}" loading="lazy" /><figcaption>${alt}</figcaption></figure>`;
  });

  // Títulos
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

  // Checkboxes e listas
  html = html.replace(/^- \[x\] (.*)$/gm, '<li class="task-item">✅ $1</li>');
  html = html.replace(/^- (.*)$/gm, '<li>$1</li>');

  // Negrito, itálico e inline code
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

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
  }
  code.inline-code {
    background: rgba(129, 140, 248, 0.15);
    color: #c7d2fe;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
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

export function compilarMaterialMoodleEPdf() {
  fs.mkdirSync(BUILD_MOODLE_DIR, { recursive: true });
  fs.mkdirSync(BUILD_PDF_DIR, { recursive: true });

  const sumarioAulas = [];
  let htmlCadernoCompleto = '';
  let markdownConsolidado = `# Caderno Didático Consolidado — Desenvolvimento Web III (UC17-DWIII)\n## IFCE Campus Baturité | Stack: JavaScript Vanilla, Node.js, PocketBase e React\n\n---\n\n`;

  for (const unidade of UNIDADES) {
    const dirOrigem = path.join(DOCS_DIR, unidade.pasta);
    const dirDestinoAssets = path.join(BUILD_MOODLE_DIR, unidade.pasta, 'assets');
    fs.mkdirSync(dirDestinoAssets, { recursive: true });

    // Copia os ativos visuais .png para o pacote compilado do Moodle
    const dirOrigemAssets = path.join(dirOrigem, 'assets');
    if (fs.existsSync(dirOrigemAssets)) {
      for (const img of fs.readdirSync(dirOrigemAssets)) {
        fs.copyFileSync(path.join(dirOrigemAssets, img), path.join(dirDestinoAssets, img));
      }
    }

    const arquivos = fs
      .readdirSync(dirOrigem)
      .filter((f) => f.endsWith('.spec.md'))
      .sort();

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
      <span class="badge">${meta.modalidade} (${meta.carga_horaria})</span>
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

      fs.writeFileSync(
        path.join(BUILD_MOODLE_DIR, nomeHtmlAula),
        paginaAulaHtml.replace(new RegExp(`./${unidade.pasta}/assets/`, 'g'), `./${unidade.pasta}/assets/`),
        'utf-8'
      );

      sumarioAulas.push({
        modulo_id: meta.modulo_id,
        titulo: meta.titulo,
        unidade: unidade.nome,
        carga_horaria: meta.carga_horaria,
        modalidade: meta.modalidade,
        arquivoHtml: nomeHtmlAula
      });

      htmlCadernoCompleto += `<section class="lesson-card" id="${meta.modulo_id}">
        <div><span class="badge">${meta.modulo_id}</span><span class="badge">${meta.modalidade} - ${meta.carga_horaria}</span></div>
        ${htmlAulaCorpo}
      </section>\n`;

      markdownConsolidado += `\n\n<!-- ${meta.modulo_id} -->\n` + corpo + `\n\n---\n`;
    }
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
          <td>${a.carga_horaria}</td>
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
      <span class="badge">UC17-DWIII • 80 Horas (4 Créditos)</span>
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
          <th>CH</th>
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

  // Gera manifesto XML de importação Moodle (moodle_backup.xml)
  const itensXml = sumarioAulas
    .map(
      (a, idx) =>
        `    <activity id="${idx + 1}" moduleid="${a.modulo_id}" modulename="page">
      <title>${a.modulo_id} - ${a.titulo}</title>
      <modality>${a.modalidade}</modality>
      <workload>${a.carga_horaria}</workload>
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
    <total_hours>80h</total_hours>
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

  // Gera Caderno Consolidado para Impressão/PDF em build/pdf/
  fs.writeFileSync(path.join(BUILD_PDF_DIR, 'DW3-Caderno-Didatico-Completo.md'), markdownConsolidado, 'utf-8');
  fs.writeFileSync(
    path.join(BUILD_PDF_DIR, 'DW3-Caderno-Didatico-Completo.html'),
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Caderno Completo DWIII - IFCE Baturité</title><style>${CSS_ESTILO_IFCE}</style></head><body><div class="container">${htmlCadernoCompleto}</div></body></html>`,
    'utf-8'
  );

  console.log('===================================================================');
  console.log(' COMPILADOR MOODLE & CADERNO PDF — DWIII (IFCE CAMPUS BATURITÉ)');
  console.log('===================================================================');
  console.log(` ✔ ${sumarioAulas.length} páginas HTML de aulas geradas em: build/moodle-mbz/`);
  console.log(` ✔ Manifesto Moodle XML gerado em    : build/moodle-mbz/moodle_backup.xml`);
  console.log(` ✔ Caderno Didático Completo em      : build/pdf/DW3-Caderno-Didatico-Completo.html`);
  console.log('===================================================================');
}

compilarMaterialMoodleEPdf();
