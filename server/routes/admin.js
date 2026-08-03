const express = require("express");
const db = require("../db");

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

module.exports = { router, requireAdmin };
