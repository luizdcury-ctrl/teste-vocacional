(function () {
  const themeToggle = document.getElementById("themeToggle");
  initTheme();

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

  const SUGESTOES_BANCO = [
    "Faça um curso livre online (Coursera, Alura, Khan Academy) na sua área de maior interesse.",
    "Comece ou continue o estudo de um idioma estrangeiro.",
    "Leia um livro sobre a área ou perfil identificado no seu resultado.",
    "Desenvolva uma soft skill específica: comunicação, organização ou trabalho em equipe.",
    "Participe de um projeto extracurricular, clube ou grupo de estudos na escola.",
    "Busque uma experiência de voluntariado ligada a uma causa que te interessa.",
    "Pesquise certificações introdutórias gratuitas relacionadas à sua área de interesse.",
    "Converse com 2 ou 3 profissionais da área que mais chamou sua atenção.",
  ];

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.getElementById("loadingScreen").innerHTML = '<div class="loading-screen"><p>Resultado não encontrado. <a href="index.html">Fazer o teste</a></p></div>';
    return;
  }

  load();

  async function load() {
    try {
      const res = await fetch(`/api/result/${id}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      render(data);
    } catch (err) {
      document.getElementById("loadingScreen").innerHTML = '<div class="loading-screen"><p>Não conseguimos carregar esse resultado. <a href="index.html">Fazer o teste novamente</a></p></div>';
    }
  }

  function render(data) {
    const { dadosIniciais, result } = data;
    const perfil = result.perfilPredominante;

    document.getElementById("loadingScreen").style.display = "none";
    const screen = document.getElementById("resultScreen");
    screen.style.display = "block";

    // Hero
    document.getElementById("profileHero").innerHTML = `
      <div class="profile-icon" style="background:${perfil.cor}22; color:${perfil.cor};">${perfil.icone}</div>
      <div class="kicker">Olá, ${escapeHtml(dadosIniciais.nome.split(" ")[0] || dadosIniciais.nome)} · seu perfil predominante é</div>
      <h1 style="color:${perfil.cor};">${perfil.nome}</h1>
      <div class="aderencia-badge" style="background:${perfil.cor}22; color:${perfil.cor};">${perfil.aderencia}% de aderência</div>
      <p class="descricao">${perfil.descricao}</p>
      <div class="tag-row" style="justify-content:center;">
        ${result.perfisSecundarios.map((p) => `<span class="tag">${p.icone} ${p.nome} · ${p.aderencia}%</span>`).join("")}
      </div>
    `;

    // Radar chart - competências
    new Chart(document.getElementById("radarChart"), {
      type: "radar",
      data: {
        labels: result.competencias.map((c) => c.label),
        datasets: [{
          label: "Competências",
          data: result.competencias.map((c) => c.score),
          backgroundColor: "rgba(76,110,245,0.18)",
          borderColor: "#4C6EF5",
          pointBackgroundColor: "#4C6EF5",
        }],
      },
      options: {
        scales: { r: { min: 0, max: 100, ticks: { display: false }, pointLabels: { font: { size: 10 } } } },
        plugins: { legend: { display: false } },
      },
    });

    // Bar chart - áreas
    new Chart(document.getElementById("barChart"), {
      type: "bar",
      data: {
        labels: result.areas.map((a) => a.label),
        datasets: [{
          label: "Afinidade",
          data: result.areas.map((a) => a.score),
          backgroundColor: "#7048E8",
          borderRadius: 6,
        }],
      },
      options: {
        indexAxis: "y",
        scales: { x: { min: 0, max: 100 } },
        plugins: { legend: { display: false } },
      },
    });

    // Cursos
    document.getElementById("cursosList").innerHTML = result.cursos.map((c, i) => `
      <div class="list-item">
        <div class="rank">${i + 1}</div>
        <div class="info">
          <div class="title">${c.curso}</div>
          <div class="sub">${c.explicacao}</div>
        </div>
        <div class="compat-bar-wrap">
          <div class="compat-pct">${c.compatibilidade}%</div>
          <div class="compat-track"><div class="compat-fill" style="width:${c.compatibilidade}%"></div></div>
        </div>
      </div>
    `).join("");

    // Profissões
    document.getElementById("profissoesList").innerHTML = result.profissoes.map((p, i) => `
      <div class="list-item">
        <div class="rank">${i + 1}</div>
        <div class="info">
          <div class="title">${p.profissao}</div>
          <div class="sub">${p.descricao}</div>
          <div class="meta-pills">
            <span class="meta-pill">💰 ${p.faixaSalarial}</span>
            <span class="meta-pill">📈 ${p.perspectiva}</span>
            <span class="meta-pill">🎯 Empregabilidade: ${p.empregabilidade}</span>
          </div>
        </div>
        <div class="compat-bar-wrap">
          <div class="compat-pct">${p.compatibilidade}%</div>
          <div class="compat-track"><div class="compat-fill" style="width:${p.compatibilidade}%"></div></div>
        </div>
      </div>
    `).join("");

    // Competências
    document.getElementById("competenciasFortes").innerHTML = result.competenciasFortes.map((c) => `
      <div class="pill-check">✅ <div><strong>${c.label}</strong> — ${c.score}/100</div></div>
    `).join("");
    document.getElementById("competenciasDesenvolver").innerHTML = result.competenciasDesenvolver.map((c) => `
      <div class="pill-check">🌱 <div><strong>${c.label}</strong> — ${c.score}/100</div></div>
    `).join("");

    // Ambiente
    document.getElementById("ambienteGrid").innerHTML = result.ambiente.map((e) => `
      <div class="env-axis">
        <div class="labels"><span>${e.labelA}</span><span>${e.labelB}</span></div>
        <div class="env-track"><div class="env-dot" style="left:${e.valor}%;"></div></div>
      </div>
    `).join("");
    document.getElementById("ambientesTags").innerHTML = perfil.ambienteIdeal.map((a) => `<span class="tag">${a}</span>`).join("");

    // Sugestões práticas (embaralha e pega 6)
    const sugestoes = [...SUGESTOES_BANCO].sort(() => Math.random() - 0.5).slice(0, 6);
    document.getElementById("sugestoesPraticas").innerHTML = sugestoes.map((s) => `<div class="pill-check">💡 <div>${s}</div></div>`).join("");

    // Plano de ação
    document.getElementById("planoAcao").innerHTML = result.planoDeAcao.map((q) => `
      <div class="action-quarter">
        <h3>${q.periodo}</h3>
        <ul>${q.acoes.map((a) => `<li>${a}</li>`).join("")}</ul>
      </div>
    `).join("");

    // Mensagem motivacional
    document.getElementById("mensagemMotivacional").textContent = result.mensagemMotivacional;

    // Link + QR code
    const resultUrl = window.location.href.split("?")[0] + "?id=" + data.id;
    document.getElementById("resultLink").textContent = resultUrl;
    new QRCode(document.getElementById("qrCanvas"), { text: resultUrl, width: 180, height: 180 });

    // Ações
    document.getElementById("btnCopyLink").addEventListener("click", async () => {
      await navigator.clipboard.writeText(resultUrl);
      const btn = document.getElementById("btnCopyLink");
      const original = btn.textContent;
      btn.textContent = "✅ Link copiado!";
      setTimeout(() => (btn.textContent = original), 1800);
    });

    document.getElementById("btnEmail").addEventListener("click", async () => {
      const btn = document.getElementById("btnEmail");
      const original = btn.textContent;
      btn.textContent = "Enviando…";
      btn.disabled = true;
      try {
        const res = await fetch(`/api/result/${data.id}/email`, { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.erro || "Erro ao enviar e-mail.");
        btn.textContent = "✅ E-mail enviado!";
      } catch (err) {
        alert(err.message);
        btn.textContent = original;
      } finally {
        btn.disabled = false;
        setTimeout(() => (btn.textContent = original), 2500);
      }
    });

    document.getElementById("btnPdf").addEventListener("click", () => exportPdf(dadosIniciais, result));
  }

  function exportPdf(dadosIniciais, result) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 48;
    let y = 60;

    function addTitle(text, size = 18) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.text(text, margin, y);
      y += size * 0.9;
    }
    function addText(text, size = 11, color = "#333") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      doc.setTextColor(color);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * (size * 1.3) + 6;
    }
    function checkPage(space = 60) {
      if (y > doc.internal.pageSize.getHeight() - space) {
        doc.addPage();
        y = 60;
      }
    }

    doc.setTextColor("#000");
    addTitle("Relatório de Orientação Vocacional", 20);
    addText(`${dadosIniciais.nome} · ${dadosIniciais.serie} · ${dadosIniciais.escola} · ${dadosIniciais.cidade}`, 10, "#666");
    y += 6;

    const perfil = result.perfilPredominante;
    addTitle(`Perfil predominante: ${perfil.nome} (${perfil.aderencia}%)`, 15);
    addText(perfil.descricao);

    checkPage();
    addTitle("Pontos fortes", 13);
    addText(perfil.pontosFortes.map((p) => `• ${p}`).join("\n"));

    checkPage();
    addTitle("Desafios a observar", 13);
    addText(perfil.desafios.map((p) => `• ${p}`).join("\n"));

    checkPage();
    addTitle("Como evoluir", 13);
    addText(perfil.comoEvoluir.map((p) => `• ${p}`).join("\n"));

    checkPage();
    addTitle("Top 10 cursos superiores compatíveis", 14);
    result.cursos.forEach((c) => {
      checkPage(40);
      addText(`${c.curso} — ${c.compatibilidade}% · ${c.explicacao}`, 10.5);
    });

    doc.addPage(); y = 60;
    addTitle("Top profissões compatíveis", 14);
    result.profissoes.forEach((p) => {
      checkPage(50);
      addText(`${p.profissao} — ${p.compatibilidade}%`, 11, "#111");
      addText(`${p.descricao} | Faixa salarial: ${p.faixaSalarial} | Empregabilidade: ${p.empregabilidade}`, 9.5, "#666");
    });

    checkPage();
    addTitle("Competências em destaque", 13);
    addText(result.competenciasFortes.map((c) => `${c.label}: ${c.score}/100`).join(" · "));
    addTitle("Competências para desenvolver", 13);
    addText(result.competenciasDesenvolver.map((c) => `${c.label}: ${c.score}/100`).join(" · "));

    doc.addPage(); y = 60;
    addTitle("Plano de desenvolvimento — 12 meses", 14);
    result.planoDeAcao.forEach((q) => {
      checkPage(60);
      addTitle(q.periodo, 12);
      addText(q.acoes.map((a) => `• ${a}`).join("\n"), 10.5);
    });

    checkPage();
    addTitle("Mensagem final", 13);
    addText(result.mensagemMotivacional);

    doc.save(`relatorio-vocacional-${dadosIniciais.nome.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }
})();
