// Banco de perguntas do Teste Vocacional Inteligente.
// Escala Likert 1-5 (1=Discordo totalmente ... 5=Concordo totalmente).
// `dims` mapeia cada pergunta às dimensões que ela alimenta (peso negativo = invertido).

let _id = 0;
const q = (block, text, dims) => ({ id: `q${++_id}`, block, text, dims });

const QUESTIONS = [
  // ===================== BLOCO 1 — INTERESSES =====================
  q(1, "Gosto de resolver problemas difíceis e desafiadores.", { logica: 1, analise: 1, exatas: 0.6 }),
  q(1, "Prefiro trabalhar em contato direto com outras pessoas do que sozinho(a).", { relacionamento: 1, individual_equipe: 1 }),
  q(1, "Tenho interesse em tecnologia, programação ou eletrônica.", { tecnologia: 1, logica: 0.5 }),
  q(1, "Gosto de criar coisas novas: objetos, textos, imagens ou ideias.", { criatividade: 1, artes: 0.6 }),
  q(1, "Gosto de pesquisar, investigar e entender como as coisas funcionam.", { analise: 1, exatas: 0.4, biologicas: 0.4 }),
  q(1, "Sinto-me bem quando estou ensinando ou explicando algo para alguém.", { educacao: 1, comunicacao: 0.6 }),
  q(1, "Tenho facilidade para convencer pessoas e vender uma ideia.", { negocios: 1, comunicacao: 0.6, empreendedorismo: 0.5 }),
  q(1, "Gosto de cuidar de pessoas ou de animais.", { saude: 1, empatia: 0.8 }),
  q(1, "Tenho facilidade e interesse por números, cálculos e estatísticas.", { exatas: 1, logica: 0.6 }),
  q(1, "Prefiro atividades artísticas (desenho, música, teatro, dança, design).", { artes: 1, criatividade: 0.8 }),
  q(1, "Gosto de debater temas sociais, políticos ou de comportamento humano.", { humanas: 1, comunicacao: 0.4 }),

  // ===================== BLOCO 2 — PERSONALIDADE =====================
  q(2, "Fico animado(a) diante de situações novas e imprevisíveis.", { rotina_mudanca: 1, inovacao: 0.6 }),
  q(2, "Costumo pensar em várias soluções antes de agir.", { analise: 1, logica: 0.5 }),
  q(2, "Prefiro seguir meus próprios critérios a seguir regras impostas por outros.", { processo_liberdade: 1, liberdade: 0.7 }),
  q(2, "Percebo com facilidade como as outras pessoas estão se sentindo.", { empatia: 1, relacionamento: 0.5 }),
  q(2, "Gosto de estar cercado(a) de gente e me energizo em grupo.", { individual_equipe: 1, comunicacao: 0.4 }),
  q(2, "Prefiro pensar bastante antes de tomar uma decisão importante.", { analise: 0.8, persistencia: 0.3 }),
  q(2, "Costumo assumir a frente quando um grupo precisa de direção.", { lideranca: 1 }),
  q(2, "Sou uma pessoa organizada com meus horários e compromissos.", { organizacao: 1 }),
  q(2, "Gosto de experimentar formas diferentes de fazer as coisas, mesmo que dê errado.", { inovacao: 1, criatividade: 0.5 }),
  q(2, "Levo em conta os sentimentos das pessoas antes de tomar decisões.", { empatia: 1 }),
  q(2, "Mantenho a calma mesmo em situações de pressão ou imprevisto.", { calma_pressao: -1, persistencia: 0.4 }),

  // ===================== BLOCO 3 — COMPETÊNCIAS =====================
  q(3, "As pessoas costumam me procurar para tomar decisões em grupo.", { lideranca: 1 }),
  q(3, "Consigo explicar minhas ideias de forma clara para diferentes públicos.", { comunicacao: 1 }),
  q(3, "Tenho facilidade para imaginar soluções originais que ninguém pensou antes.", { criatividade: 1, inovacao: 0.6 }),
  q(3, "Consigo perceber quando alguém precisa de apoio, mesmo sem que peça.", { empatia: 1 }),
  q(3, "Mantenho meus materiais, tarefas e prazos organizados.", { organizacao: 1 }),
  q(3, "Quando começo algo, vou até o fim mesmo diante de dificuldades.", { persistencia: 1 }),
  q(3, "Tenho facilidade para identificar padrões e conexões entre informações.", { logica: 1, analise: 0.6 }),
  q(3, "Consigo negociar bem quando duas pessoas discordam.", { comunicacao: 0.5, empatia: 0.5, lideranca: 0.4 }),
  q(3, "Planejo minhas tarefas com antecedência em vez de deixar para a última hora.", { organizacao: 1, persistencia: 0.3 }),
  q(3, "Sei tomar decisões e agir por conta própria, sem depender de instruções.", { relacionamento: -0.2, processo_liberdade: 0.6 }),
  q(3, "Consigo analisar uma grande quantidade de dados e tirar conclusões.", { analise: 1, logica: 0.6 }),

  // ===================== BLOCO 4 — AMBIENTE DE TRABALHO =====================
  q(4, "Prefiro uma rotina previsível a um dia a dia cheio de mudanças.", { rotina_mudanca: -1 }),
  q(4, "Prefiro ambientes de constante transformação e novidade.", { rotina_mudanca: 1, inovacao: 0.4 }),
  q(4, "Prefiro realizar minhas tarefas sozinho(a).", { individual_equipe: -1 }),
  q(4, "Prefiro trabalhar em equipe a trabalhar isoladamente.", { individual_equipe: 1, relacionamento: 0.4 }),
  q(4, "Rendo melhor em ambientes silenciosos e tranquilos.", { silencio_dinamico: -1 }),
  q(4, "Rendo melhor em ambientes agitados, com bastante movimento e estímulo.", { silencio_dinamico: 1 }),
  q(4, "Trabalho bem sob pressão e prazos apertados.", { calma_pressao: 1, persistencia: 0.3 }),
  q(4, "Prefiro um ritmo mais calmo, sem pressão constante.", { calma_pressao: -1, qualidade_vida: 0.4 }),
  q(4, "Prefiro ter liberdade para decidir como fazer minhas tarefas.", { processo_liberdade: 1, liberdade: 0.5 }),
  q(4, "Prefiro processos bem definidos, com regras e passos claros.", { processo_liberdade: -1, seguranca: 0.4 }),
  q(4, "Gosto de assumir riscos calculados em troca de melhores resultados.", { empreendedorismo: 0.6, inovacao: 0.4 }),

  // ===================== BLOCO 5 — VALORES =====================
  q(5, "Ter estabilidade profissional é muito importante para mim.", { estabilidade: 1 }),
  q(5, "Ganhar bastante dinheiro é uma prioridade na escolha da minha carreira.", { dinheiro: 1 }),
  q(5, "Gostaria de ser reconhecido(a) e admirado(a) pelo meu trabalho.", { prestigio: 1 }),
  q(5, "Quero que meu trabalho gere impacto positivo na sociedade.", { impacto_social: 1 }),
  q(5, "Priorizo ter tempo livre e qualidade de vida acima de tudo.", { qualidade_vida: 1 }),
  q(5, "Valorizo ter liberdade para decidir meus próprios horários e projetos.", { liberdade: 1 }),
  q(5, "Prefiro um emprego seguro a um caminho incerto, mesmo que promissor.", { seguranca: 1 }),
  q(5, "Gosto de estar sempre atualizado(a) com o que há de mais novo em minha área.", { inovacao_valor: 1 }),
  q(5, "Pretendo estudar e me atualizar constantemente ao longo da vida.", { aprendizado: 1 }),
  q(5, "Tenho vontade de um dia abrir meu próprio negócio.", { empreendedorismo: 1 }),

  // ===================== BLOCO 6 — PROJETOS DE VIDA =====================
  q(6, "Já imagino claramente onde quero estar profissionalmente daqui a 10 anos.", { organizacao: 0.4, aprendizado: 0.3 }),
  q(6, "Prefiro uma carreira em que eu possa crescer dentro de uma grande empresa.", { estabilidade: 0.6, negocios: 0.4 }),
  q(6, "Prefiro construir meu próprio caminho, mesmo que fora do convencional.", { empreendedorismo: 0.8, liberdade: 0.5 }),
  q(6, "Sonho em ter um trabalho que envolva viajar ou conhecer lugares novos.", { rotina_mudanca: 0.6, liberdade: 0.4 }),
  q(6, "Gostaria que meu trabalho ajudasse diretamente outras pessoas.", { impacto_social: 0.8, empatia: 0.5 }),
  q(6, "Quero uma profissão que me permita expressar minha criatividade todos os dias.", { criatividade: 0.8, artes: 0.4 }),
  q(6, "Pretendo cursar uma faculdade logo após o Ensino Médio.", { aprendizado: 0.5, organizacao: 0.3 }),
  q(6, "Me vejo atuando em uma área técnica ou científica no futuro.", { exatas: 0.5, tecnologia: 0.5, analise: 0.4 }),
  q(6, "Me vejo atuando em uma área ligada a pessoas, cuidado ou ensino no futuro.", { saude: 0.4, educacao: 0.4, empatia: 0.4 }),
  q(6, "Tenho um sonho profissional claro que me motiva a estudar hoje.", { persistencia: 0.5, aprendizado: 0.3 }),
  q(6, "Estou disposto(a) a me dedicar bastante nos próximos anos para alcançar meus objetivos.", { persistencia: 1 }),
];

module.exports = { QUESTIONS };
