// Motor de pontuação multidimensional do Teste Vocacional Inteligente.
// Cruza respostas (Likert 1-5) -> dimensões (competências, áreas, valores, ambiente)
// -> similaridade com perfis, cursos e profissões -> plano de ação.

const { QUESTIONS } = require("./questions");
const { PROFILES } = require("./profiles");
const { COURSES } = require("./courses");
const { CAREERS } = require("./careers");
const { COMPETENCIAS, AREAS, VALORES, AMBIENTE_EIXOS } = require("./dimensions");

const AMBIENTE_KEYS = new Set(AMBIENTE_EIXOS.map((e) => e.key));

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Calcula, para cada dimensão citada em QUESTIONS, a média ponderada (1-5) das respostas.
function computeDimensionScores(answers) {
  const acc = {}; // key -> { sum, weight }

  for (const question of QUESTIONS) {
    const value = Number(answers[question.id]);
    if (!value || value < 1 || value > 5) continue;

    for (const [key, weight] of Object.entries(question.dims)) {
      const effectiveValue = weight >= 0 ? value : 6 - value;
      const effectiveWeight = Math.abs(weight);
      if (!acc[key]) acc[key] = { sum: 0, weight: 0 };
      acc[key].sum += effectiveValue * effectiveWeight;
      acc[key].weight += effectiveWeight;
    }
  }

  const scores1a5 = {};
  for (const [key, { sum, weight }] of Object.entries(acc)) {
    scores1a5[key] = weight > 0 ? sum / weight : 3;
  }
  return scores1a5;
}

function to0_100(v1a5) {
  return Math.round(clamp(((v1a5 - 1) / 4) * 100, 0, 100));
}

function to0_1(v1a5) {
  return clamp((v1a5 - 1) / 4, 0, 1);
}

// Centraliza em torno do ponto neutro (3) para diferenciar quem está acima/abaixo
// da média em cada dimensão. Sem isso, respostas "medianas" geram similaridade
// artificialmente alta com todos os perfis (todo mundo pareceria compatível com tudo).
function toSigned(v1a5) {
  return clamp((v1a5 - 3) / 2, -1, 1);
}

// Similaridade de cosseno entre o vetor "ideal" de um item (perfil/curso/profissão)
// e o vetor normalizado (0-1) do aluno, restrita às dimensões citadas pelo item.
function cosineMatch(itemVector, studentVector0_1) {
  let dot = 0;
  let normItem = 0;
  let normStudent = 0;
  for (const [key, weight] of Object.entries(itemVector)) {
    const s = studentVector0_1[key] ?? 0;
    dot += weight * s;
    normItem += weight * weight;
    normStudent += s * s;
  }
  if (normItem === 0 || normStudent === 0) return 0;
  return dot / (Math.sqrt(normItem) * Math.sqrt(normStudent));
}

function cosineToPercent(cos) {
  return Math.round(clamp(58 + cos * 42, 22, 98));
}

function computeResult(answers) {
  const dimScores1a5 = computeDimensionScores(answers);

  const competencias = COMPETENCIAS.map(([key, label]) => ({
    key, label, score: to0_100(dimScores1a5[key] ?? 3),
  }));
  const areas = AREAS.map(([key, label]) => ({
    key, label, score: to0_100(dimScores1a5[key] ?? 3),
  }));
  const valores = VALORES.map(([key, label]) => ({
    key, label, score: to0_100(dimScores1a5[key] ?? 3),
  }));
  const ambiente = AMBIENTE_EIXOS.map((eixo) => {
    const v1a5 = dimScores1a5[eixo.key] ?? 3;
    return {
      key: eixo.key,
      labelA: eixo.labelA,
      labelB: eixo.labelB,
      valor: to0_100(v1a5),
      tendencia: v1a5 <= 2.7 ? eixo.labelA : v1a5 >= 3.3 ? eixo.labelB : "Equilibrado(a) entre os dois estilos",
    };
  });

  // Vetor centralizado (-1 a 1) combinando competências + áreas + valores + eixos de ambiente.
  // Usado para calcular afinidade: só pontua alto quem está genuinamente ACIMA da média
  // nas dimensões que importam para aquele perfil/curso/profissão.
  const studentVectorSigned = {};
  for (const key of Object.keys(dimScores1a5)) {
    studentVectorSigned[key] = toSigned(dimScores1a5[key]);
  }

  // --- Perfis vocacionais ---
  const profileMatches = PROFILES.map((profile) => {
    const cos = cosineMatch(profile.vector, studentVectorSigned);
    return { ...profile, aderencia: cosineToPercent(cos), _cos: cos };
  }).sort((a, b) => b._cos - a._cos);

  const perfilPredominante = profileMatches[0];
  const perfisSecundarios = profileMatches.slice(1, 4);

  // --- Áreas de conhecimento (já calculadas acima, ordenadas para o gráfico de barras) --
  const areasOrdenadas = [...areas].sort((a, b) => b.score - a.score);

  // --- Cursos ---
  const courseMatches = COURSES.map((course) => {
    const vector = { ...course.areas, ...course.competencias };
    const cos = cosineMatch(vector, studentVectorSigned);
    return {
      curso: course.nome,
      explicacao: course.explicacao,
      compatibilidade: cosineToPercent(cos),
      _cos: cos,
    };
  }).sort((a, b) => b._cos - a._cos).slice(0, 10);

  // --- Profissões ---
  const careerMatches = CAREERS.map((career) => {
    const vector = { ...career.areas, ...career.competencias };
    const cos = cosineMatch(vector, studentVectorSigned);
    return {
      profissao: career.nome,
      descricao: career.descricao,
      faixaSalarial: career.faixaSalarial,
      perspectiva: career.perspectiva,
      empregabilidade: career.empregabilidade,
      compatibilidade: cosineToPercent(cos),
      _cos: cos,
    };
  }).sort((a, b) => b._cos - a._cos).slice(0, 20);

  // --- Competências fortes e a desenvolver ---
  const competenciasOrdenadas = [...competencias].sort((a, b) => b.score - a.score);
  const competenciasFortes = competenciasOrdenadas.slice(0, 3);
  const competenciasDesenvolver = [...competenciasOrdenadas].sort((a, b) => a.score - b.score).slice(0, 3);

  // --- Plano de ação de 12 meses ---
  const planoDeAcao = gerarPlanoDeAcao(perfilPredominante, competenciasDesenvolver, areasOrdenadas[0]);

  // --- Mensagem motivacional ---
  const mensagemMotivacional = gerarMensagemMotivacional(perfilPredominante);

  return {
    competencias,
    areas: areasOrdenadas,
    valores: [...valores].sort((a, b) => b.score - a.score),
    ambiente,
    perfilPredominante: stripInternal(perfilPredominante),
    perfisSecundarios: perfisSecundarios.map(stripInternal),
    cursos: courseMatches.map(({ _cos, ...rest }) => rest),
    profissoes: careerMatches.map(({ _cos, ...rest }) => rest),
    competenciasFortes,
    competenciasDesenvolver,
    planoDeAcao,
    mensagemMotivacional,
  };
}

function stripInternal(profile) {
  const { _cos, ...rest } = profile;
  return rest;
}

function gerarPlanoDeAcao(perfil, competenciasDesenvolver, areaTop) {
  const trimestres = [
    {
      periodo: "Meses 1-3 · Autoconhecimento e exploração",
      acoes: [
        `Pesquise a fundo sobre a área de ${areaTop.label} e converse com pelo menos 2 profissionais que atuam nela.`,
        `Leia um livro introdutório sobre o perfil ${perfil.nome.toLowerCase()} e suas áreas de atuação.`,
        "Liste 3 cursos livres (gratuitos ou pagos) relacionados aos seus interesses e comece o primeiro.",
      ],
    },
    {
      periodo: "Meses 4-6 · Desenvolvimento de competências",
      acoes: [
        `Trabalhe ativamente em ${competenciasDesenvolver[0]?.label ?? "uma competência a desenvolver"}, buscando um curso curto ou desafio prático sobre o tema.`,
        "Participe de um projeto escolar, voluntariado ou iniciativa extracurricular ligada à sua área de maior interesse.",
        "Comece a estudar um idioma estrangeiro ou avance no que já iniciou.",
      ],
    },
    {
      periodo: "Meses 7-9 · Experiência prática",
      acoes: [
        "Busque uma vivência prática: estágio, jovem aprendiz, monitoria, projeto voluntário ou iniciação científica.",
        `Desenvolva um pequeno projeto pessoal que combine ${perfil.pontosFortes[0].toLowerCase()} com a área que você mais se interessou.`,
        "Peça feedback de professores, mentores ou familiares sobre seu progresso.",
      ],
    },
    {
      periodo: "Meses 10-12 · Decisão e preparação",
      acoes: [
        "Compare cursos superiores e instituições que mais combinam com o resultado deste teste.",
        "Pesquise formas de ingresso (vestibular, ENEM, cursos técnicos) e monte um cronograma de estudos.",
        "Revise este relatório e observe o quanto sua autopercepção evoluiu nesses 12 meses.",
      ],
    },
  ];
  return trimestres;
}

function gerarMensagemMotivacional(perfil) {
  return `Seu jeito de ser tem nome: ${perfil.nome}. ${perfil.descricao} Isso não é uma sentença definitiva sobre quem você vai ser — é um ponto de partida real, baseado em como você pensa, sente e age hoje. Use esse mapa para explorar caminhos com mais confiança, sabendo que suas escolhas podem (e vão) evoluir junto com você. O mais importante não é acertar a profissão perfeita agora, e sim dar o próximo passo com intenção.`;
}

module.exports = { computeResult };
