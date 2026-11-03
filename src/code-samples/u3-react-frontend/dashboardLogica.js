/**
 * Unidade III — Do JavaScript Vanilla ao React + PocketBase Headless CMS
 * Disciplina: Desenvolvimento Web III (UC17-DWIII) — IFCE Campus Baturité
 */

export function renderizarCardAlunoVanilla(aluno) {
  const corBadge = aluno.situacao === 'APROVADO_POR_MEDIA' ? '#10B981' : '#F59E0B';
  return `<article class="card-aluno" data-matricula="${aluno.matricula}"><h3>${aluno.nome}</h3><p>Matrícula: <strong>${aluno.matricula}</strong> | ${aluno.curso}</p><span style="color:${corBadge}">${aluno.situacao || 'CURSANDO'}</span></article>`;
}

export function construirUrlArquivoPocketBase(baseUrl, record, nomeArquivo, thumb = '') {
  if (!record || !record.collectionId || !record.id || !nomeArquivo) return null;
  const base = baseUrl.replace(/\/$/, '');
  const sufixoThumb = thumb ? `?thumb=${encodeURIComponent(thumb)}` : '';
  return `${base}/api/files/${record.collectionId}/${record.id}/${nomeArquivo}${sufixoThumb}`;
}

export function filtrarAlunosReativo(alunos = [], termoBusca = '') {
  const termo = termoBusca.trim().toLowerCase();
  if (!termo) return alunos;
  return alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(termo) ||
      String(a.matricula).includes(termo) ||
      (a.curso && a.curso.toLowerCase().includes(termo))
  );
}

export function calcularResumoDashboard(alunos = []) {
  const total = alunos.length;
  if (total === 0) {
    return { total: 0, aprovados: 0, emExame: 0, reprovados: 0, mediaTurma: 0 };
  }

  let somaMedias = 0;
  let aprovados = 0;
  let emExame = 0;
  let reprovados = 0;

  for (const aluno of alunos) {
    somaMedias += Number(aluno.mediaXs ?? 0);
    if (aluno.situacao === 'APROVADO_POR_MEDIA') aprovados++;
    else if (aluno.situacao === 'EXAME_FINAL_EFP') emExame++;
    else reprovados++;
  }

  return {
    total,
    aprovados,
    emExame,
    reprovados,
    mediaTurma: Number((somaMedias / total).toFixed(2))
  };
}
