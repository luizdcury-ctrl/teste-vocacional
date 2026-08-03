// Espaço vetorial usado pelo motor de pontuação.
// Cada resposta (1 a 5) alimenta uma ou mais dimensões, com peso positivo ou negativo.

const COMPETENCIAS = [
  ["criatividade", "Criatividade"],
  ["lideranca", "Liderança"],
  ["empatia", "Empatia"],
  ["comunicacao", "Comunicação"],
  ["analise", "Capacidade Analítica"],
  ["organizacao", "Organização"],
  ["inovacao", "Inovação"],
  ["persistencia", "Persistência"],
  ["logica", "Raciocínio Lógico"],
  ["relacionamento", "Relacionamento Interpessoal"],
];

const AREAS = [
  ["humanas", "Humanas"],
  ["exatas", "Exatas"],
  ["biologicas", "Biológicas"],
  ["tecnologia", "Tecnologia"],
  ["negocios", "Negócios"],
  ["artes", "Artes"],
  ["comunicacao_area", "Comunicação"],
  ["saude", "Saúde"],
  ["educacao", "Educação"],
  ["direito", "Direito"],
  ["engenharias", "Engenharias"],
];

const VALORES = [
  ["estabilidade", "Estabilidade"],
  ["dinheiro", "Retorno Financeiro"],
  ["prestigio", "Prestígio"],
  ["impacto_social", "Impacto Social"],
  ["qualidade_vida", "Qualidade de Vida"],
  ["liberdade", "Liberdade"],
  ["seguranca", "Segurança"],
  ["inovacao_valor", "Inovação"],
  ["aprendizado", "Aprendizado Contínuo"],
  ["empreendedorismo", "Empreendedorismo"],
];

// Eixos de ambiente: cada um vai de 1 (polo A) a 5 (polo B)
const AMBIENTE_EIXOS = [
  { key: "rotina_mudanca", labelA: "Rotina", labelB: "Mudança constante" },
  { key: "individual_equipe", labelA: "Trabalho individual", labelB: "Trabalho em equipe" },
  { key: "silencio_dinamico", labelA: "Ambientes silenciosos", labelB: "Ambientes dinâmicos" },
  { key: "calma_pressao", labelA: "Ritmo calmo", labelB: "Alta pressão" },
  { key: "processo_liberdade", labelA: "Processos definidos", labelB: "Liberdade e autonomia" },
];

module.exports = { COMPETENCIAS, AREAS, VALORES, AMBIENTE_EIXOS };
