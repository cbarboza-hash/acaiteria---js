const API_URL = "https://script.google.com/macros/s/AKfycbxaVLZRcNUlWmTV5dt_Ut6j4AZQUqbaF86obOTT62YuhW9Pwnhue3oFsKoW94lccUcoFg/exec";

async function buscarRelatorio() {
  const tabelaEl = document.getElementById("tabelaVendas");
  const totalVendasEl = document.getElementById("totalVendas");
  const totalKgEl = document.getElementById("totalKg");

  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;
  const filtroPagamento = document.getElementById("filtroPagamento").value;

  const payload = encodeURIComponent(JSON.stringify({ action: "relatorio" }));

  try {
    const res = await fetch(`${API_URL}?payload=${payload}`);
    const json = await res.json();

    const vendas = json.vendas.slice(1); // ignora cabeçalho
    tabelaEl.innerHTML = "";

    let totalVendas = 0;
    let totalKg = 0;

    // Map para rastrear KG únicos por venda
    const kgPorVenda = {};

    vendas.forEach(l => {
      const [id, data, total, kgRaw, forma, pagoRaw] = l;

      // Converte kg e pago para número
      const kg = Number(String(kgRaw).replace(",", "."));
      const pago = Number(String(pagoRaw).replace(",", "."));

      // FILTROS DE DATA
      const parts = data.split("/"); // assume formato DD/MM/YYYY
      const dataVenda = new Date(parts[2], parts[1] - 1, parts[0]);

      const start = dataInicio ? new Date(dataInicio + "T00:00:00") : null;
      const end = dataFim ? new Date(dataFim + "T23:59:59") : null;

      if (start && dataVenda < start) return;
      if (end && dataVenda > end) return;
      if (filtroPagamento && forma !== filtroPagamento) return;

      // Somar o KG apenas uma vez por venda
      if (!kgPorVenda[id]) {
        totalKg += kg;
        kgPorVenda[id] = true;
      }

      // Somar valor pago normalmente
      totalVendas += pago;

      // Formata data para DD/MM/YYYY
      const dataFormatada = ("0" + parts[0]).slice(-2) + "/" + ("0" + parts[1]).slice(-2) + "/" + parts[2];

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${dataFormatada}</td>
        <td class="border p-2">${forma}</td>
        <td class="border p-2">${kg}</td>
        <td class="border p-2">R$ ${Number(total).toFixed(2)}</td>
        <td class="border p-2">R$ ${pago.toFixed(2)}</td>
      `;
      tabelaEl.appendChild(tr);
    });

    totalVendasEl.innerText = totalVendas.toFixed(2);
    totalKgEl.innerText = totalKg.toFixed(2);

  } catch (error) {
    console.error("Erro ao buscar relatório:", error);
    alert("Erro ao carregar relatório.");
  }
}

// Listener do botão
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnFiltrar");
  if (btn) btn.addEventListener("click", buscarRelatorio);
});
