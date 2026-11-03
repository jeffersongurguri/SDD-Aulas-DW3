# Dockerfile Multi-Stage — Projeto Final DWIII (React + Node.js + PocketBase)
# IFCE Campus Baturité — Curso Técnico Subsequente em Informática para Internet
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY src/ ./src/
COPY docs/ ./docs/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/alunos').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/code-samples/u1-node-api/server.js"]
