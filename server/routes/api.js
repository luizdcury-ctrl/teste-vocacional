const express = require("express");
const { nanoid } = require("nanoid");
const db = require("../db");
const { QUESTIONS } = require("../data/questions");
const { computeResult } = require("../data/scoring");
const { sendResultEmail, isEmailConfigured } = require("../email");

const router = express.Router();

const BLOCOS = {
  1: "Interesses",
  2: "Personalidade",
  3: "Competências",
  4: "Ambiente de Trabalho",
  5: "Valores",
  6: "Projetos de Vida",
};

router.get("/questions", (req, res) => {
  res.json({
    blocos: BLOCOS,
    perguntas: QUESTIONS.map(({ id, block, text }) => ({ id, block, text })),
  });
});

router.post("/submit", (req, res) => {
  const { dadosIniciais, answers, consentimento } = req.body || {};

  if (!dadosIniciais || !answers) {
    return res.status(400).json({ erro: "Dados incompletos." });
  }
  if (consentimento !== true) {
    return res.status(400).json({ erro: "É necessário aceitar a Política de Privacidade (LGPD) para continuar." });
  }
  if (!dadosIniciais.nome || !dadosIniciais.email) {
    return res.status(400).json({ erro: "Nome e e-mail são obrigatórios." });
  }

  const answeredCount = QUESTIONS.filter((q) => answers[q.id]).length;
  if (answeredCount < QUESTIONS.length * 0.9) {
    return res.status(400).json({ erro: "Responda todas as perguntas antes de enviar." });
  }

  let result;
  try {
    result = computeResult(answers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao calcular o resultado." });
  }

  const id = nanoid(12);
  const createdAt = new Date().toISOString();

  db.insertResult({
    id,
    created_at: createdAt,
    nome: dadosIniciais.nome || "",
    idade: dadosIniciais.idade || "",
    serie: dadosIniciais.serie || "",
    cidade: dadosIniciais.cidade || "",
    escola: dadosIniciais.escola || "",
    email: dadosIniciais.email || "",
    telefone: dadosIniciais.telefone || "",
    pretende_faculdade: dadosIniciais.pretendeFaculdade || "",
    answers_json: JSON.stringify(answers),
    result_json: JSON.stringify(result),
    perfil_predominante: result.perfilPredominante.nome,
    perfil_icone: result.perfilPredominante.icone,
    perfil_cor: result.perfilPredominante.cor,
    area_top: result.areas[0]?.label || "",
    curso_top: result.cursos[0]?.curso || "",
    email_enviado: 0,
    consentimento_lgpd: true,
    consentimento_em: createdAt,
  });

  res.json({ id, dadosIniciais, result });
});

router.get("/result/:id", (req, res) => {
  const row = db.getResultById(req.params.id);
  if (!row) return res.status(404).json({ erro: "Resultado não encontrado." });

  res.json({
    id: row.id,
    createdAt: row.created_at,
    dadosIniciais: {
      nome: row.nome,
      idade: row.idade,
      serie: row.serie,
      cidade: row.cidade,
      escola: row.escola,
      email: row.email,
      telefone: row.telefone,
      pretendeFaculdade: row.pretende_faculdade,
    },
    result: JSON.parse(row.result_json),
  });
});

router.post("/result/:id/email", async (req, res) => {
  const row = db.getResultById(req.params.id);
  if (!row) return res.status(404).json({ erro: "Resultado não encontrado." });

  if (!isEmailConfigured()) {
    return res.status(503).json({ erro: "O envio automático de e-mail ainda não foi configurado pela escola." });
  }

  const result = JSON.parse(row.result_json);
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  const resultUrl = `${baseUrl}/resultado.html?id=${row.id}`;

  try {
    await sendResultEmail({
      to: row.email,
      nome: row.nome,
      resultUrl,
      perfilNome: result.perfilPredominante.nome,
    });
    db.markEmailSent(row.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Não foi possível enviar o e-mail agora. Tente novamente mais tarde." });
  }
});

module.exports = router;
