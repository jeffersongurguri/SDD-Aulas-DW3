/**
 * Unidade II — ORM, Regras Acadêmicas ROD/IFCE e Integração PocketBase BaaS
 * Disciplina: Desenvolvimento Web III (UC17-DWIII) — IFCE Campus Baturité
 */

export class PocketBaseAlunosService {
  constructor(baseUrl = 'http://127.0.0.1:8090') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  montarUrlColecao(colecao = 'alunos', params = {}) {
    const url = new URL(`/api/collections/${colecao}/records`, this.baseUrl);
    for (const [chave, valor] of Object.entries(params)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        url.searchParams.set(chave, String(valor));
      }
    }
    return url.toString();
  }

  async listarAlunos({ page = 1, perPage = 20, filter = '', expand = '' } = {}, fetchFn = fetch) {
    const endpoint = this.montarUrlColecao('alunos', { page, perPage, filter, expand, sort: '-created' });
    const res = await fetchFn(endpoint, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Erro ao consultar PocketBase: HTTP ${res.status}`);
    }
    return res.json();
  }
}

export function avaliarRegraAcessoPocketBase(operacao, authUser, registroMatricula) {
  if (!authUser || !authUser.id) return false;
  switch (operacao) {
    case 'view':
    case 'list':
      return (
        authUser.role === 'docente' ||
        authUser.role === 'coordenador' ||
        registroMatricula?.aluno_id === authUser.id
      );
    case 'create':
    case 'update':
      return authUser.role === 'docente' || authUser.role === 'coordenador';
    case 'delete':
      return authUser.role === 'coordenador';
    default:
      return false;
  }
}

export function calcularMediaSemestralIFCE(notaAD, notaAP, frequencia) {
  const ad = Number(notaAD);
  const ap = Number(notaAP);
  const freq = Number(frequencia);

  if (Number.isNaN(ad) || ad < 0 || ad > 10 || Number.isNaN(ap) || ap < 0 || ap > 10) {
    throw new Error('As notas AD e AP devem estar no intervalo de 0.0 a 10.0.');
  }
  if (Number.isNaN(freq) || freq < 0 || freq > 100) {
    throw new Error('O percentual de frequência deve estar entre 0 e 100.');
  }

  const mediaXs = Number(((2 * ad + 3 * ap) / 5).toFixed(2));
  let situacao = 'REPROVADO';

  if (freq < 75) {
    situacao = 'REPROVADO_POR_FALTA';
  } else if (mediaXs >= 6.0) {
    situacao = 'APROVADO_POR_MEDIA';
  } else if (mediaXs >= 3.0) {
    situacao = 'EXAME_FINAL_EFP';
  }

  return { notaAD: ad, notaAP: ap, frequencia: freq, mediaXs, situacao };
}

export function simularFechamentoSemestreIFCE({ notaAD, notaAP, frequencia, notaEFP = null }) {
  const parcial = calcularMediaSemestralIFCE(notaAD, notaAP, frequencia);
  if (parcial.situacao !== 'EXAME_FINAL_EFP') {
    return {
      ...parcial,
      notaMinimaEFP: parcial.situacao === 'APROVADO_POR_MEDIA' ? 0 : null,
      mediaXf: parcial.mediaXs
    };
  }

  const notaMinimaEFP = Number((10.0 - parcial.mediaXs).toFixed(2));
  if (notaEFP === null || notaEFP === undefined) {
    return {
      ...parcial,
      situacao: 'AGUARDANDO_EXAME_FINAL_EFP',
      notaMinimaEFP,
      mediaXf: null
    };
  }

  const mediaXf = Number(((parcial.mediaXs + Number(notaEFP)) / 2).toFixed(2));
  return {
    ...parcial,
    notaMinimaEFP,
    notaEFP: Number(notaEFP),
    mediaXf,
    situacao: mediaXf >= 5.0 ? 'APROVADO_EM_EXAME_FINAL' : 'REPROVADO_EM_EXAME_FINAL'
  };
}
