// Armazenamento simples em arquivo JSON (sem dependências nativas de compilação).
// Adequado para a escala de uso de uma escola. Escreve de forma síncrona para evitar
// condições de corrida em poucos requests simultâneos.

const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");
const dbFile = path.join(dataDir, "results.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "[]", "utf-8");

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(dbFile, "utf-8"));
  } catch {
    return [];
  }
}

function writeAll(rows) {
  fs.writeFileSync(dbFile, JSON.stringify(rows, null, 2), "utf-8");
}

function insertResult(row) {
  const rows = readAll();
  rows.push(row);
  writeAll(rows);
  return row;
}

function getResultById(id) {
  return readAll().find((r) => r.id === id) || null;
}

function getAllResults() {
  return readAll();
}

function markEmailSent(id) {
  const rows = readAll();
  const row = rows.find((r) => r.id === id);
  if (row) {
    row.email_enviado = 1;
    writeAll(rows);
  }
}

module.exports = { insertResult, getResultById, getAllResults, markEmailSent };
