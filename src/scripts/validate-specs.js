/**
 * Validador de Especificações SDD (.spec.md) e Ativos Visuais
 * Disciplina: Desenvolvimento Web III (UC17-DWIII) — IFCE Campus Baturité
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const UNIDADES_ESPERADAS = [
  { pasta: 'u1-backend-vibe', aulasEsperadas: 6 },
  { pasta: 'u2-orm-lowcode', aulasEsperadas: 7 },
  { pasta: 'u3-frontend-nocode', aulasEsperadas: 5 },
  { pasta: 'u4-projeto-deploy', aulasEsperadas: 10 }
];

const SECOES_OBRIGATORIAS = [
  'Objetivos de Aprendizagem',
  'Fundamentação Teórica',
  'Atividade Prática Guiada',
  'Especificação de Ativos Visuais'
];

const MODALIDADES_VALIDAS = ['Presencial', 'Síncrono', 'Assíncrono'];

function extrairFrontmatter(conteudo) {
  const match = conteudo.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const yamlTexto = match[1];
  const meta = { competencias_chave: [] };
  let lendoLista = false;

  for (const linha of yamlTexto.split(/\r?\n/)) {
    if (linha.trim().startsWith('- ')) {
      if (lendoLista) {
        meta.competencias_chave.push(linha.trim().slice(2).replace(/^"|"$/g, ''));
      }
      continue;
    }
    lendoLista = false;
    const idx = linha.indexOf(':');
    if (idx === -1) continue;
    const chave = linha.slice(0, idx).trim();
    const valor = linha.slice(idx + 1).trim().replace(/^"|"$/g, '');
    if (chave === 'competencias_chave') {
      lendoLista = true;
    } else {
      meta[chave] = valor;
    }
  }
  return meta;
}

export function executarValidacaoCompleta() {
  const erros = [];
  let totalAulas = 0;
  const aulasPorModalidade = { Presencial: 0, 'Síncrono': 0, 'Assíncrono': 0 };
  const relatorioUnidades = [];

  for (const unidade of UNIDADES_ESPERADAS) {
    const dirUnidade = path.join(DOCS_DIR, unidade.pasta);
    if (!fs.existsSync(dirUnidade)) {
      erros.push(`Diretório de unidade ausente: ${unidade.pasta}`);
      continue;
    }

    const arquivosSpec = fs
      .readdirSync(dirUnidade)
      .filter((f) => f.endsWith('.spec.md'))
      .sort();

    if (arquivosSpec.length !== unidade.aulasEsperadas) {
      erros.push(
        `[${unidade.pasta}] Quantidade de aulas incorreta: esperado ${unidade.aulasEsperadas}, encontrado ${arquivosSpec.length}`
      );
    }

    for (const arquivo of arquivosSpec) {
      totalAulas++;
      const caminhoCompleto = path.join(dirUnidade, arquivo);
      const conteudo = fs.readFileSync(caminhoCompleto, 'utf-8');
      const meta = extrairFrontmatter(conteudo);

      if (!meta) {
        erros.push(`[${arquivo}] YAML Frontmatter ausente ou malformado.`);
        continue;
      }

      const camposObrigatorios = [
        'modulo_id',
        'titulo',
        'unidade',
        'modalidade',
        'prompts_imagem_count'
      ];
      for (const campo of camposObrigatorios) {
        if (!meta[campo]) {
          erros.push(`[${arquivo}] Campo obrigatório '${campo}' ausente no Frontmatter.`);
        }
      }

      if (!Array.isArray(meta.competencias_chave) || meta.competencias_chave.length < 1) {
        erros.push(`[${arquivo}] 'competencias_chave' deve conter ao menos 1 competência.`);
      }

      if (MODALIDADES_VALIDAS.includes(meta.modalidade)) {
        aulasPorModalidade[meta.modalidade]++;
      } else {
        erros.push(`[${arquivo}] Modalidade desconhecida: ${meta.modalidade}`);
      }

      for (const secao of SECOES_OBRIGATORIAS) {
        if (!conteudo.includes(secao)) {
          erros.push(`[${arquivo}] Seção obrigatória ausente no corpo: '${secao}'`);
        }
      }

      // Verifica links de imagens locais ./assets/*.png
      const regexImg = /!\[.*?\]\(\.\/assets\/([A-Za-z0-9_-]+\.png)\)/g;
      let matchImg;
      let contImg = 0;
      while ((matchImg = regexImg.exec(conteudo)) !== null) {
        contImg++;
        const caminhoAsset = path.join(dirUnidade, 'assets', matchImg[1]);
        if (!fs.existsSync(caminhoAsset)) {
          erros.push(`[${arquivo}] Ativo visual referenciado não encontrado: ${caminhoAsset}`);
        }
      }
      if (contImg === 0) {
        erros.push(`[${arquivo}] Nenhuma imagem de ./assets/ referenciada na aula.`);
      }
    }

    relatorioUnidades.push({
      pasta: unidade.pasta,
      aulas: arquivosSpec.length
    });
  }

  return {
    sucesso: erros.length === 0,
    totalAulas,
    aulasPorModalidade,
    relatorioUnidades,
    erros
  };
}

// Execução direta via CLI
const resultado = executarValidacaoCompleta();
console.log('===================================================================');
console.log(' VALIDADOR SDD — DESENVOLVIMENTO WEB III (IFCE CAMPUS BATURITÉ)');
console.log('===================================================================');
for (const u of resultado.relatorioUnidades) {
  console.log(` ✔ ${u.pasta.padEnd(22)} | ${u.aulas} aulas especificadas`);
}
console.log('-------------------------------------------------------------------');
console.log(` Total de Aulas Especificadas : ${resultado.totalAulas} aulas (.spec.md)`);
console.log(
  ` Aulas por Modalidade         : Presencial=${resultado.aulasPorModalidade.Presencial} | Síncrono=${resultado.aulasPorModalidade['Síncrono']} | Assíncrono=${resultado.aulasPorModalidade['Assíncrono']}`
);
console.log('===================================================================');

if (!resultado.sucesso) {
  console.error(' ERROS DE VALIDAÇÃO ENCONTRADOS:');
  for (const e of resultado.erros) console.error(`  - ${e}`);
  process.exit(1);
} else {
  console.log(' STATUS: 100% CONFORME COM O SCHEMA SDD E O PLANO TÉCNICO!');
}
