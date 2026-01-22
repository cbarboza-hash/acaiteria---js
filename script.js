// ======================================================
// CONFIG
// ======================================================
const API_URL =
  "https://script.google.com/macros/s/AKfycbwacwYIMMo3bkeKzbH9OZ40HxZSZe7HdyZ0GmeEEgrSx9Ewh-azGugHI9ZZ_KCn9HYS/exec";

let pagamentosSelecionados = {};

// ======================================================
// CALCULAR TOTAL
// ======================================================
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
window.calcularTotal = calcularTotal;

// ======================================================
// PAGAMENTOS
// ======================================================
function togglePagamento(forma) {
  const container = document.getElementById("pagamentos");

  // remove se já existir
  if (pagamentosSelecionados[forma] !== undefined) {
    delete pagamentosSelecionados[forma];
    document.getElementById(`pg-${forma}`)?.remove();
    return;
  }

  pagamentosSelecionados[forma] = 0;

  const div = document.createElement("div");
  div.id = `pg-${forma}`;
  div.className = "flex gap-3 items-center mb-2";

  div.innerHTML = `
    <span class="w-28 font-semibold">${forma}</span>
    <input
      type="number"
      class="border p-2 rounded w-32"
      placeholder="R$"
      oninput="atualizarPagamento('${forma}', this.value)"
    />
    <button onclick="togglePagamento('${forma}')"
      class="text-red-600 font-bold">✖</button>
  `;

  container.appendChild(div);
}
window.togglePagamento = togglePagamento;

function atualizarPagamento(forma, valor) {
  pagamentosSelecionados[forma] = Number(valor) || 0;
}
window.atualizarPagamento = atualizarPagamento;

// ======================================================
// FINALIZAR VENDA
// ======================================================
async function finalizarVenda() {
  const precoKg = parseFloat(document.getElementById("precoKg").value) || 0;
  const kg = parseFloat(document.getElementById("kg").value) || 0;
  const total = precoKg * kg;

  if (!kg || total <= 0) {
    alert("Informe o peso do açaí.");
    return;
  }

  if (Object.keys(pagamentosSelecionados).length === 0) {
    alert("Informe ao menos uma forma de pagamento.");
    return;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "venda",
      dados: {
        total,
        kg,
        pagamentos: pagamentosSelecionados
      }
    })
  });

  const json = await res.json();

  if (json.ok) {
    alert("Venda registrada com sucesso!");
    document.getElementById("kg").value = "";
    document.getElementById("pagamentos").innerHTML = "";
    document.getElementById("total").innerText = "R$ 0,00";
    pagamentosSelecionados = {};
    buscarRelatorio();
  } else {
    alert("Erro ao registrar venda");
  }
}
window.finalizarVenda = finalizarVenda;

// ======================================================
// RELATÓRIO
// ======================================================
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
    const [id, dataVenda, valorTotal, kg, forma, valorPago] = v;

    const dataISO = new Date(dataVenda).toISOString().slice(0, 10);

    if (dataFiltro && dataISO !== dataFiltro) return;
    if (pagamentoFiltro && forma !== pagamentoFiltro) return;

    totalValor += Number(valorTotal);
    totalKg += Number(kg);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border p-2">${new Date(dataVenda).toLocaleString()}</td>
      <td class="border p-2">${forma}</td>
      <td class="border p-2">${kg}</td>
      <td class="border p-2">R$ ${Number(valorTotal).toFixed(2)}</td>
      <td class="border p-2">R$ ${Number(valorPago).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalVendas").textContent =
    totalValor.toFixed(2);
  document.getElementById("totalKg").textContent =
    totalKg.toFixed(2);
}
window.buscarRelatorio = buscarRelatorio;

// ======================================================
// EXCLUSÃO
// ======================================================
async function excluirVenda() {
  const id = document.getElementById("idExcluir").value;
  if (!id) return alert("Informe o ID da venda");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "excluir", id })
  });

  const json = await res.json();

  if (json.ok) {
    alert("Venda excluída");
    buscarRelatorio();
  } else {
    alert("Erro ao excluir");
  }
}
window.excluirVenda = excluirVenda;

// ======================================================
// AUTO LOAD
// ======================================================
document.addEventListener("DOMContentLoaded", buscarRelatorio);
