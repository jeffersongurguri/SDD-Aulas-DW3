/**
 * Unidade I — API RESTful de Gestão de Alunos em Node.js (JavaScript ES6+)
 * Disciplina: Desenvolvimento Web III (UC17-DWIII) — IFCE Campus Baturité
 */
import http from 'node:http';

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

export class ApiAlunosNode {
  constructor() {
    this.dbAlunos = new Map();
  }

  validarAluno(payload) {
    if (!payload || typeof payload.nome !== 'string' || payload.nome.trim().length < 3) {
      throw new HttpError(422, 'O nome completo do discente deve ter pelo menos 3 caracteres.');
    }
    if (!/^\d{10}$/.test(String(payload.matricula ?? ''))) {
      throw new HttpError(422, 'A matrícula deve conter exatamente 10 dígitos numéricos.');
    }
    return {
      id: this.dbAlunos.size + 1,
      nome: payload.nome.trim(),
      matricula: String(payload.matricula),
      curso: payload.curso || 'Técnico em Informática para Internet',
      criadoEm: new Date().toISOString()
    };
  }

  criarAluno(payload) {
    const aluno = this.validarAluno(payload);
    if (this.dbAlunos.has(aluno.matricula)) {
      throw new HttpError(400, 'Matrícula já cadastrada no sistema acadêmico.');
    }
    this.dbAlunos.set(aluno.matricula, aluno);
    return { mensagem: 'Aluno cadastrado com sucesso', dados: aluno };
  }

  listarAlunos() {
    return Array.from(this.dbAlunos.values());
  }

  buscarPorMatricula(matricula) {
    const aluno = this.dbAlunos.get(String(matricula));
    if (!aluno) {
      throw new HttpError(404, 'Discente não encontrado para a matrícula informada.');
    }
    return aluno;
  }

  removerPorMatricula(matricula) {
    const chave = String(matricula);
    if (!this.dbAlunos.has(chave)) {
      throw new HttpError(404, 'Discente não encontrado para exclusão.');
    }
    this.dbAlunos.delete(chave);
    return { mensagem: 'Discente removido com sucesso' };
  }
}

export function criarServidorHttpAlunos(api = new ApiAlunosNode()) {
  return http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      if (req.method === 'GET' && req.url === '/alunos') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(api.listarAlunos()));
        return;
      }

      if (req.method === 'POST' && req.url === '/alunos') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}');
        const resultado = api.criarAluno(body);
        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(resultado));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ erro: 'Rota não encontrada' }));
    } catch (err) {
      const status = err.statusCode || 500;
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ erro: err.message, statusCode: status }));
    }
  });
}
