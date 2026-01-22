const API_URL = "https://script.google.com/macros/s/AKfycbzsezBa1QuxLv6AmVzJ4CH2UXxRevQVS74V6L9pRs5y_gExE5cp1n50oCmp8n7078mTSw/exec";

// Torna a função global
window.buscarRelatorio = async function() {
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

    let totalVendas = 0;
    let totalKg = 0;

    tabelaEl.innerHTML = "";

    vendas.forEach(l => {
      const [, data, total, kg, forma, pago] = l;
      const dataVenda = new Date(data);
      const start = dataInicio ? new Date(dataInicio) : null;
      const end = dataFim ? new Date(dataFim) : null;

      // FILTROS
      if (start && dataVenda < start) return;
      if (end && dataVenda > end) return;
      if (filtroPagamento && forma !== filtroPagamento) return;

      totalVendas += Number(pago || 0);
      totalKg += Number(kg || 0);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${dataVenda.toLocaleString("pt-BR")}</td>
        <td class="border p-2">${forma}</td>
        <td class="border p-2">${kg}</td>
        <td class="border p-2">R$ ${Number(total).toFixed(2)}</td>
        <td class="border p-2">R$ ${Number(pago).toFixed(2)}</td>
      `;
      tabelaEl.appendChild(tr);
    });

    totalVendasEl.innerText = totalVendas.toFixed(2);
    totalKgEl.innerText = totalKg.toFixed(2);

  } catch (error) {
    console.error("Erro ao buscar relatório:", error);
    alert("Erro ao carregar relatório.");
  }
};
