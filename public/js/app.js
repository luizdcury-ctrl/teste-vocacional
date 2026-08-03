(function () {
  const LIKERT_LABELS = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];
  const STORAGE_KEY = "vocacional_progress_v1";

  const themeToggle = document.getElementById("themeToggle");
  const questionsRoot = document.getElementById("questionsRoot");
  const progressBar = document.getElementById("progressBar");
  const progressLabel = document.getElementById("progressLabel");
  const submitBtn = document.getElementById("submitBtn");
  const form = document.getElementById("vocForm");

  let BLOCOS = {};
  let PERGUNTAS = [];

  initTheme();
  loadQuestions();

  function initTheme() {
    const saved = localStorage.getItem("voc_theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    updateThemeIcon();
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("voc_theme", next);
      updateThemeIcon();
    });
  }

  function updateThemeIcon() {
    const current = document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    themeToggle.textContent = current === "dark" ? "☀️" : "🌙";
  }

  async function loadQuestions() {
    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      BLOCOS = data.blocos;
      PERGUNTAS = data.perguntas;
      renderQuestions();
      restoreProgress();
      attachListeners();
      updateProgress();
    } catch (err) {
      questionsRoot.innerHTML = '<div class="card"><p class="helper-text">Não foi possível carregar as perguntas. Verifique se o servidor está rodando e recarregue a página.</p></div>';
    }
  }

  function renderQuestions() {
    const byBlock = {};
    for (const p of PERGUNTAS) {
      (byBlock[p.block] = byBlock[p.block] || []).push(p);
    }

    const blockDescriptions = {
      1: "O que desperta sua curiosidade e vontade de agir.",
      2: "Seu jeito de pensar, sentir e reagir ao mundo.",
      3: "Habilidades que você já demonstra no dia a dia.",
      4: "Onde e como você rende melhor.",
      5: "O que realmente importa para você em uma carreira.",
      6: "Como você imagina seu futuro.",
    };

    let html = "";
    Object.keys(byBlock).sort((a, b) => a - b).forEach((blockNum) => {
      html += `
        <section class="card" data-block="${blockNum}">
          <div class="block-title">
            <span class="badge">Bloco ${blockNum}</span>
            <h2>${BLOCOS[blockNum]}</h2>
          </div>
          <p class="block-desc">${blockDescriptions[blockNum] || ""}</p>
          ${byBlock[blockNum].map(renderQuestion).join("")}
        </section>
      `;
    });
    questionsRoot.innerHTML = html;
  }

  function renderQuestion(q) {
    return `
      <div class="question" data-qid="${q.id}">
        <p class="qtext">${q.text}</p>
        <div class="likert" role="radiogroup" aria-label="${q.text}">
          ${[1, 2, 3, 4, 5].map((v) => `
            <label class="likert-opt" data-value="${v}">
              <input type="radio" name="${q.id}" value="${v}">
              <span class="dot"></span>
              <span class="label">${LIKERT_LABELS[v - 1]}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
  }

  function attachListeners() {
    form.addEventListener("change", (e) => {
      if (e.target.matches('.likert-opt input[type="radio"]')) {
        const opt = e.target.closest(".likert-opt");
        const group = opt.closest(".likert");
        group.querySelectorAll(".likert-opt").forEach((el) => el.classList.remove("selected"));
        opt.classList.add("selected");
        saveProgress();
        updateProgress();
      }
      if (e.target.matches('#pretendeFaculdadeGroup input[type="radio"]')) {
        const opt = e.target.closest(".radio-pill");
        opt.parentElement.querySelectorAll(".radio-pill").forEach((el) => el.classList.remove("selected"));
        opt.classList.add("selected");
        saveProgress();
        updateProgress();
      }
    });

    form.addEventListener("input", (e) => {
      if (e.target.matches("input[type=text], input[type=email], input[type=tel], input[type=number], select")) {
        saveProgress();
        updateProgress();
      }
    });

    submitBtn.addEventListener("click", handleSubmit);
  }

  function getDadosIniciais() {
    return {
      nome: document.getElementById("nome").value.trim(),
      idade: document.getElementById("idade").value.trim(),
      serie: document.getElementById("serie").value,
      cidade: document.getElementById("cidade").value.trim(),
      escola: document.getElementById("escola").value.trim(),
      email: document.getElementById("email").value.trim(),
      telefone: document.getElementById("telefone").value.trim(),
      pretendeFaculdade: form.querySelector('input[name="pretendeFaculdade"]:checked')?.value || "",
    };
  }

  function getAnswers() {
    const answers = {};
    for (const p of PERGUNTAS) {
      const checked = form.querySelector(`input[name="${p.id}"]:checked`);
      if (checked) answers[p.id] = Number(checked.value);
    }
    return answers;
  }

  function updateProgress() {
    const dados = getDadosIniciais();
    const dadosFields = Object.values(dados);
    const dadosFilled = dadosFields.filter((v) => v && v.length > 0).length;

    const answers = getAnswers();
    const answered = Object.keys(answers).length;

    const totalSteps = dadosFields.length + PERGUNTAS.length;
    const doneSteps = dadosFilled + answered;
    const pct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;

    progressBar.style.width = pct + "%";
    progressLabel.textContent = `${pct}% concluído · ${answered} de ${PERGUNTAS.length} perguntas respondidas`;

    const requiredDados = ["nome", "idade", "serie", "cidade", "escola", "email", "pretendeFaculdade"];
    const dadosOk = requiredDados.every((k) => dados[k] && dados[k].length > 0);
    const allAnswered = answered === PERGUNTAS.length;

    submitBtn.disabled = !(dadosOk && allAnswered);
    submitBtn.textContent = dadosOk && allAnswered
      ? "Enviar e ver meu resultado"
      : `Enviar e ver meu resultado (${answered}/${PERGUNTAS.length})`;
  }

  function saveProgress() {
    const data = { dados: getDadosIniciais(), answers: getAnswers() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function restoreProgress() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.dados) {
        for (const [key, value] of Object.entries(data.dados)) {
          if (key === "pretendeFaculdade") {
            const input = form.querySelector(`input[name="pretendeFaculdade"][value="${value}"]`);
            if (input) { input.checked = true; input.closest(".radio-pill").classList.add("selected"); }
            continue;
          }
          const el = document.getElementById(key);
          if (el) el.value = value;
        }
      }
      if (data.answers) {
        for (const [qid, value] of Object.entries(data.answers)) {
          const input = form.querySelector(`input[name="${qid}"][value="${value}"]`);
          if (input) { input.checked = true; input.closest(".likert-opt").classList.add("selected"); }
        }
      }
    } catch { /* ignora progresso corrompido */ }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const dadosIniciais = getDadosIniciais();
    const answers = getAnswers();

    submitBtn.disabled = true;
    submitBtn.textContent = "Calculando seu resultado…";

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dadosIniciais, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao enviar.");

      localStorage.removeItem(STORAGE_KEY);
      window.location.href = `/resultado.html?id=${data.id}`;
    } catch (err) {
      alert(err.message || "Não foi possível enviar suas respostas. Tente novamente.");
      submitBtn.disabled = false;
      updateProgress();
    }
  }
})();
