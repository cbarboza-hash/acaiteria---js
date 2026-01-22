const API_URL = "https://script.google.com/macros/s/AKfycbxaVLZRcNUlWmTV5dt_Ut6j4AZQUqbaF86obOTT62YuhW9Pwnhue3oFsKoW94lccUcoFg/exec";

// Função principal de relatório
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
    let totalVendas = 0;
    let totalKg = 0;

    tabelaEl.innerHTML = "";

    vendas.forEach(l => {
      const [, data, total, kg, forma, pago] = l;

      // Transformar data da planilha em ano-mês-dia
      const dataVendaFull = new Date(data);
      const ano = dataVendaFull.getFullYear();
      const mes = dataVendaFull.getMonth(); // 0 a 11
      const dia = dataVendaFull.getDate();

      const dataVenda = new Date(ano, mes, dia); // apenas ano-mês-dia

      // Converter filtros do input para datas locais
      const start = dataInicio ? new Date(dataInicio + "T00:00:00") : null;
      const end = dataFim ? new Date(dataFim + "T23:59:59") : null;

      // FILTROS
      if (start && dataVenda < start) return;
      if (end && dataVenda > end) return;
      if (filtroPagamento && forma !== filtroPagamento) return;

      totalVendas += Number(pago || 0);
      totalKg += Number(kg || 0);

      // Formata a data para DD/MM/YYYY
      const dataFormatada = ("0" + dia).slice(-2) + "/" + ("0" + (mes + 1)).slice(-2) + "/" + ano;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${dataFormatada}</td>
        <td class="border p-2">${forma}</td>
        <td class="border p-2">${kg}</td>
        <td class="border p-2">R$ ${Number(total).toFixed(2)}</td>
        <td class="border p-2">R$ ${Number(pago).toFixed(2)}</td>
      `;
      tabelaEl.appendChild(tr);
    });

    // Atualiza totais
    totalVendasEl.innerText = totalVendas.toFixed(2);
    totalKgEl.innerText = totalKg.toFixed(2);

  } catch (error) {
    console.error("Erro ao buscar relatório:", error);
    alert("Erro ao carregar relatório.");
  }
}

// Registrando listener do botão após o DOM carregar
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnFiltrar");
  if (btn) {
    btn.addEventListener("click", buscarRelatorio);
  }
});
