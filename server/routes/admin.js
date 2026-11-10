const express = require("express");
const db = require("../db");
const { QUESTIONS } = require("../data/questions");

const LIKERT = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];
const BLOCOS = { 1: "Interesses", 2: "Personalidade", 3: "Competências", 4: "Ambiente de Trabalho", 5: "Valores", 6: "Projetos de Vida" };

const router = express.Router();

function requireAdmin(req, res, next) {
  const password = req.header("x-admin-password") || req.query.password;
  const expected = process.env.ADMIN_PASSWORD || "admin";
  if (!password || password !== expected) {
    return res.status(401).json({ erro: "Senha administrativa inválida." });
  }
  next();
}

router.post("/login", (req, res) => {
  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD || "admin";
  if (password === expected) return res.json({ ok: true });
  res.status(401).json({ erro: "Senha inválida." });
});

router.get("/stats", requireAdmin, (req, res) => {
  const serieFiltro = req.query.serie;

  let rows = db.getAllResults();
  if (serieFiltro) rows = rows.filter((r) => r.serie === serieFiltro);

  const total = rows.length;

  const distribuicaoPerfis = {};
  const distribuicaoSerie = {};
  const cursosMaisIndicados = {};
  const areaSums = {};
  const areaCount = {};
  const competenciaSums = {};
  const competenciaCount = {};
  const pretendeFaculdade = {};

  for (const row of rows) {
    distribuicaoPerfis[row.perfil_predominante] = (distribuicaoPerfis[row.perfil_predominante] || 0) + 1;
    distribuicaoSerie[row.serie || "Não informado"] = (distribuicaoSerie[row.serie || "Não informado"] || 0) + 1;
    if (row.curso_top) cursosMaisIndicados[row.curso_top] = (cursosMaisIndicados[row.curso_top] || 0) + 1;
    pretendeFaculdade[row.pretende_faculdade || "Não informado"] = (pretendeFaculdade[row.pretende_faculdade || "Não informado"] || 0) + 1;

    try {
      const result = JSON.parse(row.result_json);
      for (const a of result.areas || []) {
        areaSums[a.label] = (areaSums[a.label] || 0) + a.score;
        areaCount[a.label] = (areaCount[a.label] || 0) + 1;
      }
      for (const c of result.competencias || []) {
        competenciaSums[c.label] = (competenciaSums[c.label] || 0) + c.score;
        competenciaCount[c.label] = (competenciaCount[c.label] || 0) + 1;
      }
    } catch {
      // ignora registros corrompidos
    }
  }

  const areasMedia = Object.keys(areaSums)
    .map((label) => ({ label, media: Math.round(areaSums[label] / areaCount[label]) }))
    .sort((a, b) => b.media - a.media);

  const competenciasMedia = Object.keys(competenciaSums)
    .map((label) => ({ label, media: Math.round(competenciaSums[label] / competenciaCount[label]) }))
    .sort((a, b) => b.media - a.media);

  res.json({
    total,
    distribuicaoPerfis,
    distribuicaoSerie,
    cursosMaisIndicados: Object.entries(cursosMaisIndicados)
      .map(([curso, qtd]) => ({ curso, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 10),
    areasMedia,
    competenciasMedia,
    pretendeFaculdade,
    series: [...new Set(rows.map((r) => r.serie).filter(Boolean))].sort(),
  });
});

function resumo(r) {
  return {
    id: r.id, data: r.created_at, nome: r.nome, idade: r.idade, serie: r.serie, cidade: r.cidade,
    email: r.email, telefone: r.telefone, pretendeFaculdade: r.pretende_faculdade,
    perfil: r.perfil_predominante, perfilIcone: r.perfil_icone, areaTop: r.area_top, cursoTop: r.curso_top,
  };
}

router.get("/respostas", requireAdmin, (req, res) => {
  const serie = req.query.serie;
  const q = (req.query.q || "").toString().toLowerCase().trim();
  let rows = db.getAllResults();
  if (serie) rows = rows.filter((r) => r.serie === serie);
  if (q) rows = rows.filter((r) => [r.nome, r.email, r.perfil_predominante, r.cidade].join(" ").toLowerCase().includes(q));
  rows.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  res.json({ total: rows.length, respostas: rows.map(resumo) });
});

router.get("/respostas/:id", requireAdmin, (req, res) => {
  const r = db.getResultById(req.params.id);
  if (!r) return res.status(404).json({ erro: "Resposta não encontrada." });
  let answers = {};
  let result = {};
  try { answers = JSON.parse(r.answers_json); result = JSON.parse(r.result_json); } catch {}
  const respostas = QUESTIONS.map((qu) => ({
    id: qu.id, bloco: BLOCOS[qu.block], pergunta: qu.text,
    valor: answers[qu.id] || null, resposta: answers[qu.id] ? LIKERT[answers[qu.id] - 1] : "Sem resposta",
  }));
  res.json({
    ...resumo(r),
    consentimentoLgpd: !!r.consentimento_lgpd,
    respostas,
    resultado: {
      perfil: result.perfilPredominante && { nome: result.perfilPredominante.nome, aderencia: result.perfilPredominante.aderencia },
      competencias: result.competencias, areas: result.areas,
      cursos: (result.cursos || []).slice(0, 5), profissoes: (result.profissoes || []).slice(0, 5),
    },
  });
});

router.get("/respostas.csv", requireAdmin, (req, res) => {
  const esc = (v) => { let s = String(v ?? ""); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  const rows = db.getAllResults();
  const head = ["Data", "Nome", "Idade", "Série", "Cidade", "E-mail", "Telefone", "Pretende faculdade", "Perfil", "Área top", "Curso top", ...QUESTIONS.map((x) => x.id.toUpperCase() + " - " + x.text)];
  const lines = [head.map(esc).join(";")];
  for (const r of rows) {
    let a = {}; try { a = JSON.parse(r.answers_json); } catch {}
    lines.push([r.created_at, r.nome, r.idade, r.serie, r.cidade, r.email, r.telefone, r.pretende_faculdade, r.perfil_predominante, r.area_top, r.curso_top, ...QUESTIONS.map((x) => a[x.id] ?? "")].map(esc).join(";"));
  }
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="respostas-teste-vocacional.csv"');
  res.send("﻿" + lines.join("\r\n"));
});

module.exports = { router, requireAdmin };
