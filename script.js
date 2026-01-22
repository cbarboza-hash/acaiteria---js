const API_URL = "https://script.google.com/macros/s/AKfycbwacwYIMMo3bkeKzbH9OZ40HxZSZe7HdyZ0GmeEEgrSx9Ewh-azGugHI9ZZ_KCn9HYS/exec";

function calcularTotal() {
  const precoKg = parseFloat(document.getElementById("precoKg").value) || 0;
  const kg = parseFloat(document.getElementById("kg").value) || 0;

  const total = precoKg * kg;

  document.getElementById("total").innerText =
    total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
}


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
