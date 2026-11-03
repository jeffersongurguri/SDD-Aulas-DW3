/**
 * Unidade IV — Suíte de Testes Automatizados Full-Stack (node:test)
 * Valida os códigos de exemplo das Unidades I, II, III e IV
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ApiAlunosNode, HttpError } from '../u1-node-api/server.js';
import {
  PocketBaseAlunosService,
  avaliarRegraAcessoPocketBase,
  calcularMediaSemestralIFCE,
  simularFechamentoSemestreIFCE
} from '../u2-pocketbase-orm/pocketbase-client.js';
import {
  renderizarCardAlunoVanilla,
  construirUrlArquivoPocketBase,
  filtrarAlunosReativo,
  calcularResumoDashboard
} from '../u3-react-frontend/dashboardLogica.js';

describe('Unidade I: API REST de Gestão de Alunos em Node.js', () => {
  test('Deve cadastrar discente válido e listar com status 201 lógico', () => {
    const api = new ApiAlunosNode();
    const res = api.criarAluno({
      nome: 'Maria Fernanda Souza',
      matricula: '2026100999'
    });
    assert.equal(res.dados.nome, 'Maria Fernanda Souza');
    assert.equal(res.dados.curso, 'Técnico em Informática para Internet');
    assert.equal(api.listarAlunos().length, 1);
  });

  test('Deve rejeitar matrícula duplicada com HttpError 400', () => {
    const api = new ApiAlunosNode();
    api.criarAluno({ nome: 'João Pedro', matricula: '2026100111' });
    assert.throws(
      () => api.criarAluno({ nome: 'Outro Aluno', matricula: '2026100111' }),
      (err) => err instanceof HttpError && err.statusCode === 400
    );
  });

  test('Deve rejeitar matrícula fora do formato de 10 dígitos com HttpError 422', () => {
    const api = new ApiAlunosNode();
    assert.throws(
      () => api.criarAluno({ nome: 'Carlos', matricula: '12345' }),
      (err) => err instanceof HttpError && err.statusCode === 422
    );
  });
});

describe('Unidade II: ORM, PocketBase BaaS e Regras Acadêmicas ROD/IFCE', () => {
  test('Deve construir URL de coleção PocketBase com paginação, filtro e expand', () => {
    const pb = new PocketBaseAlunosService('http://127.0.0.1:8090');
    const url = pb.montarUrlColecao('matriculas', {
      page: 1,
      perPage: 25,
      filter: 'frequencia>=75',
      expand: 'aluno_id,turma_id'
    });
    assert.ok(url.includes('/api/collections/matriculas/records'));
    assert.ok(url.includes('expand=aluno_id%2Cturma_id'));
  });

  test('Deve aplicar API Rules do PocketBase corretamente por perfil', () => {
    const registro = { id: 'm1', aluno_id: 'u_aluno_1' };
    assert.equal(avaliarRegraAcessoPocketBase('view', { id: 'u_aluno_1', role: 'discente' }, registro), true);
    assert.equal(avaliarRegraAcessoPocketBase('view', { id: 'u_aluno_2', role: 'discente' }, registro), false);
    assert.equal(avaliarRegraAcessoPocketBase('update', { id: 'u_aluno_1', role: 'discente' }, registro), false);
    assert.equal(avaliarRegraAcessoPocketBase('update', { id: 'u_prof_1', role: 'docente' }, registro), true);
  });

  test('Deve calcular Média Semestral Xs = (2*AD + 3*AP)/5 e Exame Final EFP segundo o ROD/IFCE', () => {
    const aprovado = calcularMediaSemestralIFCE(8.0, 7.0, 85);
    assert.equal(aprovado.mediaXs, 7.4);
    assert.equal(aprovado.situacao, 'APROVADO_POR_MEDIA');

    const posExame = simularFechamentoSemestreIFCE({
      notaAD: 5.0,
      notaAP: 4.0,
      frequencia: 80,
      notaEFP: 6.0
    });
    assert.equal(posExame.mediaXs, 4.4);
    assert.equal(posExame.notaMinimaEFP, 5.6);
    assert.equal(posExame.mediaXf, 5.2);
    assert.equal(posExame.situacao, 'APROVADO_EM_EXAME_FINAL');
  });
});

describe('Unidade III & IV: Front-end JS Vanilla, React Reativo e PocketBase Headless CMS', () => {
  test('Deve gerar URL de arquivo do PocketBase Headless CMS e renderizar card HTML', () => {
    const urlPdf = construirUrlArquivoPocketBase(
      'http://127.0.0.1:8090',
      { collectionId: 'pbc_editais', id: 'rec_01' },
      'edital_monitoria.pdf'
    );
    assert.equal(urlPdf, 'http://127.0.0.1:8090/api/files/pbc_editais/rec_01/edital_monitoria.pdf');

    const html = renderizarCardAlunoVanilla({
      nome: 'Ana Clara',
      matricula: '2026100101',
      curso: 'Informática para Internet',
      situacao: 'APROVADO_POR_MEDIA'
    });
    assert.ok(html.includes('data-matricula="2026100101"'));
  });

  test('Deve filtrar discentes reativamente e calcular resumo do Dashboard React', () => {
    const turma = [
      { nome: 'Ana Clara', matricula: '2026100101', mediaXs: 8.0, situacao: 'APROVADO_POR_MEDIA' },
      { nome: 'Bruno Costa', matricula: '2026100102', mediaXs: 4.5, situacao: 'EXAME_FINAL_EFP' }
    ];
    const filtrados = filtrarAlunosReativo(turma, 'bruno');
    assert.equal(filtrados.length, 1);

    const kpis = calcularResumoDashboard(turma);
    assert.equal(kpis.total, 2);
    assert.equal(kpis.aprovados, 1);
    assert.equal(kpis.emExame, 1);
    assert.equal(kpis.mediaTurma, 6.25);
  });
});
