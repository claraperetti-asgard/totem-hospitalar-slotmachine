import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

for (const envPath of [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
]) {
    if (typeof process.loadEnvFile === 'function' && fs.existsSync(envPath)) {
        process.loadEnvFile(envPath);
        break;
    }
}

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

const PORT = Number(process.env.PORT) || 3000;
const DATABASE_FILE = process.env.DATABASE_FILE || './leads.db';
const RELATORIO_SENHA = process.env.SENHA_RELATORIO;

// Colunas do schema atual: apenas nome e CPF (unico), mais id e data.
const EXPECTED_COLUMNS = ['id', 'name', 'cpf', 'created_at'];

let db;

function getBrazilDateTime() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return formatter.format(now).replace(' ', ' ');
}

async function setupDB() {
  db = await open({
    filename: DATABASE_FILE,
    driver: sqlite3.Database
  });

  // Banco antigo (email/telefone/campanha, CPF sem UNIQUE) e descartado por completo.
  const columns = await db.all('PRAGMA table_info(leads)');
  if (columns.length > 0) {
    const current = columns.map((column) => column.name).sort().join(',');
    if (current !== [...EXPECTED_COLUMNS].sort().join(',')) {
      console.log('Schema antigo detectado. Recriando a tabela leads...');
      await db.exec('DROP TABLE leads');
    }
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS leads(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cpf TEXT NOT NULL UNIQUE,
      created_at DATETIME
    )
  `);
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidCPF(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== parseInt(cpf.charAt(10))) return false;

  return true;
}

app.post('/auth', (request, response) => {
  const { password } = request.body;
  if (!password) {
    return response.status(400).json({ message: 'Senha não informada.' });
  }
  if (password !== RELATORIO_SENHA) {
    return response.status(401).json({ message: 'Senha incorreta.' });
  }
  return response.json({ message: 'Autenticado com sucesso.' });
});

app.get('/leads', async (request, response) => {
  const { startDate, endDate } = request.query;

  let query = 'SELECT id, name, cpf, created_at FROM leads';
  const params = [];

  if (startDate && endDate) {
    query += ' WHERE created_at BETWEEN ? AND ?';
    params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const leads = await db.all(query, params);
    response.json(leads);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

app.post('/leads', async (request, response) => {
    const { name, cpf } = request.body;
    const cleanName = String(name || '').trim();
    const cpfDigits = onlyDigits(cpf);

    if (!cleanName) {
      return response.status(400).json({ message: 'Nome não informado.' });
    }

    if (!isValidCPF(cpfDigits)) {
      return response.status(400).json({ message: 'CPF inválido.' });
    }

    const created_at = getBrazilDateTime();

    try {
      await db.run(
        'INSERT INTO leads (name, cpf, created_at) VALUES (?, ?, ?)',
        [cleanName, cpfDigits, created_at]
      );
    } catch (error) {
      // UNIQUE no CPF garante uma rodada por pessoa.
      if (String(error?.code).startsWith('SQLITE_CONSTRAINT')) {
        return response.status(409).json({ message: 'Este CPF já participou.' });
      }
      console.error(error);
      return response.status(500).json({ message: 'Erro ao cadastrar.' });
    }

    response.json({ message: 'Cadastrado com sucesso!' });
});

await setupDB();

app.listen(PORT, () => {
  console.log(`Api rodando...`);
});
