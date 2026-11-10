(function () {
  const $ = (id) => document.getElementById(id);
  const pw = () => sessionStorage.getItem("voc_admin_pw") || "";
  const api = (path) => fetch(path, { headers: { "x-admin-password": pw() } });
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtData = (iso) => { try { return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); } catch { return ""; } };
  let timer;

  async function carregar() {
    const params = new URLSearchParams();
    const serie = $("filtroSerie").value;
    if (serie) params.set("serie", serie);
    if ($("busca").value.trim()) params.set("q", $("busca").value.trim());
    const res = await api("/api/admin/respostas?" + params);
    if (!res.ok) return;
    const data = await res.json();
    $("respostasCount").textContent = data.total + (data.total === 1 ? " resposta" : " respostas") + " — clique em uma linha para ver o detalhe.";
    $("respostasBody").innerHTML = data.respostas.length
      ? data.respostas.map((r) => `<tr data-id="${esc(r.id)}"><td>${esc(fmtData(r.data))}</td><td><strong>${esc(r.nome)}</strong><br><span class="muted">${esc(r.email)}</span></td><td>${esc(r.serie)}</td><td>${esc(r.perfilIcone)} ${esc(r.perfil)}</td><td>${esc(r.cursoTop)}</td></tr>`).join("")
      : '<tr><td colspan="5" class="muted">Nenhuma resposta encontrada.</td></tr>';
  }

  async function abrir(id) {
    const res = await api("/api/admin/respostas/" + encodeURIComponent(id));
    if (!res.ok) return alert("Não foi possível abrir essa resposta.");
    const d = await res.json();
    const porBloco = {};
    d.respostas.forEach((r) => (porBloco[r.bloco] = porBloco[r.bloco] || []).push(r));
    const r = d.resultado || {};
    $("modalContent").innerHTML = `
      <h2 style="margin:0 0 4px;">${esc(d.nome)}</h2>
      <p class="muted" style="margin:0 0 14px;">${esc(fmtData(d.data))} · ${esc(d.serie)} · ${esc(d.idade)} anos · ${esc(d.cidade)}</p>
      <div class="detail-grid">
        <div><b>E-mail</b><br>${esc(d.email)}</div>
        <div><b>Telefone</b><br>${esc(d.telefone) || "—"}</div>
        <div><b>Pretende faculdade</b><br>${esc(d.pretendeFaculdade)}</div>
        <div><b>Consentimento LGPD</b><br>${d.consentimentoLgpd ? "Sim" : "Não registrado"}</div>
        <div><b>Perfil</b><br>${esc(d.perfilIcone)} ${esc(d.perfil)}${r.perfil ? " (" + esc(r.perfil.aderencia) + "%)" : ""}</div>
        <div><b>Área / curso top</b><br>${esc(d.areaTop)} · ${esc(d.cursoTop)}</div>
      </div>
      ${r.cursos ? `<h3>Top cursos</h3><p>${r.cursos.map((c) => esc(c.curso) + " (" + esc(c.compatibilidade) + "%)").join(" · ")}</p>` : ""}
      <h3>Respostas, pergunta por pergunta</h3>
      ${Object.entries(porBloco).map(([bloco, itens]) => `
        <h4>${esc(bloco)}</h4>
        <table class="resp-table answers"><tbody>${itens.map((i) => `<tr><td>${esc(i.pergunta)}</td><td class="ans v${i.valor || 0}">${esc(i.valor || "–")} · ${esc(i.resposta)}</td></tr>`).join("")}</tbody></table>`).join("")}
    `;
    $("modal").style.display = "flex";
  }

  async function exportarCsv() {
    const res = await api("/api/admin/respostas.csv");
    if (!res.ok) return alert("Não foi possível exportar.");
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url; a.download = "respostas-teste-vocacional.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  window.addEventListener("stats-loaded", carregar);
  $("filtroSerie").addEventListener("change", carregar);
  $("busca").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(carregar, 250); });
  $("respostasBody").addEventListener("click", (e) => { const tr = e.target.closest("tr[data-id]"); if (tr) abrir(tr.dataset.id); });
  $("csvBtn").addEventListener("click", exportarCsv);
  $("modalClose").addEventListener("click", () => ($("modal").style.display = "none"));
  $("modal").addEventListener("click", (e) => { if (e.target === $("modal")) $("modal").style.display = "none"; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("modal").style.display = "none"; });
})();
