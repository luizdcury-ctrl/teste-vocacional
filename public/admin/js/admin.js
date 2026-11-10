(function () {
  const themeToggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("voc_theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  themeToggle.textContent = (document.documentElement.getAttribute("data-theme") === "dark") ? "☀️" : "🌙";
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", current);
    localStorage.setItem("voc_theme", current);
    themeToggle.textContent = current === "dark" ? "☀️" : "🌙";
  });

  let adminPassword = sessionStorage.getItem("voc_admin_pw") || "";
  let charts = {};

  const loginCard = document.getElementById("loginCard");
  const dashboard = document.getElementById("dashboard");

  if (adminPassword) {
    tryLoadDashboard();
  }

  document.getElementById("loginBtn").addEventListener("click", async () => {
    const pw = document.getElementById("password").value;
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      adminPassword = pw;
      sessionStorage.setItem("voc_admin_pw", pw);
      tryLoadDashboard();
    } else {
      document.getElementById("loginError").textContent = "Senha inválida. Tente novamente.";
    }
  });

  document.getElementById("refreshBtn")?.addEventListener("click", () => loadStats());
  document.getElementById("filtroSerie")?.addEventListener("change", () => loadStats());

  async function tryLoadDashboard() {
    const ok = await loadStats();
    if (ok) {
      loginCard.style.display = "none";
      dashboard.style.display = "block";
    }
  }

  async function loadStats() {
    const serie = document.getElementById("filtroSerie").value;
    const url = new URL("/api/admin/stats", window.location.origin);
    if (serie) url.searchParams.set("serie", serie);

    const res = await fetch(url, { headers: { "x-admin-password": adminPassword } });
    if (!res.ok) {
      sessionStorage.removeItem("voc_admin_pw");
      document.getElementById("loginError").textContent = "Sessão expirada. Faça login novamente.";
      loginCard.style.display = "block";
      dashboard.style.display = "none";
      return false;
    }
    const stats = await res.json();
    render(stats);
    window.dispatchEvent(new Event("stats-loaded"));
    return true;
  }

  function render(stats) {
    document.getElementById("totalRespostas").textContent = stats.total;
    document.getElementById("totalPerfis").textContent = Object.keys(stats.distribuicaoPerfis).length;
    const sim = stats.pretendeFaculdade["Sim"] || 0;
    document.getElementById("pctFaculdade").textContent = stats.total ? Math.round((sim / stats.total) * 100) + "%" : "0%";

    const filtroSerie = document.getElementById("filtroSerie");
    const currentValue = filtroSerie.value;
    filtroSerie.innerHTML = '<option value="">Todas</option>' + stats.series.map((s) => `<option value="${s}">${s}</option>`).join("");
    filtroSerie.value = currentValue;

    renderChart("perfilChart", "bar", Object.keys(stats.distribuicaoPerfis), Object.values(stats.distribuicaoPerfis), { indexAxis: "y" });
    renderChart("areasChart", "bar", stats.areasMedia.map((a) => a.label), stats.areasMedia.map((a) => a.media), { indexAxis: "y", max: 100 });
    renderChart("competenciasChart", "bar", stats.competenciasMedia.map((c) => c.label), stats.competenciasMedia.map((c) => c.media), { indexAxis: "y", max: 100 });
    renderChart("serieChart", "bar", Object.keys(stats.distribuicaoSerie), Object.values(stats.distribuicaoSerie), {});

    document.getElementById("cursosIndicados").innerHTML = stats.cursosMaisIndicados.length
      ? stats.cursosMaisIndicados.map((c, i) => `
          <div class="list-item">
            <div class="rank">${i + 1}</div>
            <div class="info"><div class="title">${c.curso}</div></div>
            <div class="compat-bar-wrap"><div class="compat-pct">${c.qtd}</div></div>
          </div>
        `).join("")
      : '<p class="helper-text">Ainda não há dados suficientes.</p>';
  }

  function renderChart(canvasId, type, labels, data, opts) {
    const ctx = document.getElementById(canvasId);
    if (charts[canvasId]) charts[canvasId].destroy();
    charts[canvasId] = new Chart(ctx, {
      type,
      data: { labels, datasets: [{ data, backgroundColor: "#4C6EF5", borderRadius: 6 }] },
      options: {
        indexAxis: opts.indexAxis || "x",
        plugins: { legend: { display: false } },
        scales: opts.max ? (opts.indexAxis === "y" ? { x: { max: opts.max } } : { y: { max: opts.max } }) : {},
      },
    });
  }
})();
