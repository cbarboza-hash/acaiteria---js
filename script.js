const API_URL = "https://script.google.com/macros/s/AKfycbyQh_3tjLL4Ox48S91cphdCdrXnlNpfm1WGYPVrMPRA5bN3MHeR8AgMcndXh2u0n6lDqw/exec";

async function buscarRelatorio() {
  const dataFiltro = document.getElementById("filtroData").value;
  const pagamentoFiltro = document.getElementById("filtroPagamento").value;

  const response = await fetch(API_URL);
  const json = await response.json();

  const vendas = json.vendas.slice(1); // remove cabeçalho
  const tbody = document.getElementById("tabelaVendas");
  tbody.innerHTML = "";

  let totalValor = 0;
  let totalKg = 0;

  vendas.forEach(v => {
    const [
      id,
      dataVenda,
      valorTotal,
      kg,
      formaPagamento,
      valorPago
    ] = v;

    if (dataFiltro && !dataVenda.startsWith(dataFiltro)) return;
    if (pagamentoFiltro && formaPagamento !== pagamentoFiltro) return;

    totalValor += Number(valorTotal);
    totalKg += Number(kg);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(dataVenda).toLocaleString()}</td>
      <td>${formaPagamento}</td>
      <td>${kg}</td>
      <td>R$ ${Number(valorTotal).toFixed(2)}</td>
      <td>R$ ${Number(valorPago).toFixed(2)}</td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("totalVendas").textContent = totalValor.toFixed(2);
  document.getElementById("totalKg").textContent = totalKg.toFixed(2);
}
