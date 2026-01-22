const API_URL = "https://script.google.com/macros/s/AKfycbwacwYIMMo3bkeKzbH9OZ40HxZSZe7HdyZ0GmeEEgrSx9Ewh-azGugHI9ZZ_KCn9HYS/exec";

// ================================
// VARIÁVEIS GLOBAIS
// ================================
let pagamentosSelecionados = {};

// ================================
// CALCULAR TOTAL AUTOMÁTICO
// ================================
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

// ================================
// ABRIR / FECHAR FORMA DE PAGAMENTO
// ================================
function togglePagamento(forma) {
  const container = document.getElementById("pagamentos");

  // se já existe, remove
  if (pagamentosSelecionados[forma] !== undefined) {
    delete pagamentosSelecionados[forma];
    const el = document.getElementById(`pg-${forma}`);
    if (el) el.remove();
    return;
  }

  pagamentosSelecionados[forma] = 0;

  const div = document.createElement("div");
  div.id = `pg-${forma}`;
  div.className = "flex gap-2 items-center mb-2";

  div.innerHTML = `
    <span class="w-28">${forma}</span>
    <input
      type="number"
      class="border p-2 rounded w-32"
      placeholder="R$"
      oninput="atualizarPagamento('${forma}', this.value)"
    />
    <button onclick="togglePagamento('${forma}')" class="text-red-600 font-bold">✖</button>
  `;

  container.appendChild(div);
}

// ================================
// ATUALIZA VALOR DO PAGAMENTO
// ================================
function atualizarPagamento(forma, valor) {
  pagamentosSelecionados[forma] = Number(valor) || 0;
}

// ================================
// FINALIZAR VENDA
// ================================
async function finalizarVenda() {
  const precoKg = parseFloat(document.getElementById("precoKg").value) || 0;
  const kg = parseFloat(document.getElementById("kg").value) || 0;
  const total = precoKg * kg;

  if (total <= 0) {
    alert("Informe o peso do açaí.");
    return;
  }

  const somaPagamentos = Object.values(pagamentosSelecionados)
    .reduce((a, b) => a + b, 0);

  if (somaPagamentos !== total) {
    alert("A soma dos pagamentos não confere com o total.");
    return;
  }

  const response = await fetch(API_URL, {
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

  const json = await response.json();

  if (json.ok) {
    alert("✅ Venda registrada com sucesso!");
  } else {
    alert("❌ Erro ao registrar venda");
    console.error(json);
  }

  // reset
  document.getElementById("kg").value = "";
  document.getElementById("total").innerText = "R$ 0,00";
  document.getElementById("pagamentos").innerHTML = "";
  pagamentosSelecionados = {};
}

// ================================
// BUSCAR RELATÓRIO COM FILTROS
// ================================
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

    const dataFormatada = new Date(dataVenda);

    if (dataFiltro) {
      const filtro = new Date(dataFiltro).toDateString();
      if (dataFormatada.toDateString() !== filtro) return;
    }

    if (pagamentoFiltro && formaPagamento !== pagamentoFiltro) return;

    totalValor += Number(valorTotal);
    totalKg += Number(kg);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${dataFormatada.toLocaleString("pt-BR")}</td>
      <td>${formaPagamento}</td>
      <td>${Number(kg).toFixed(2)}</td>
      <td>R$ ${Number(valorTotal).toFixed(2)}</td>
      <td>R$ ${Number(valorPago).toFixed(2)}</td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("totalVendas").textContent =
    totalValor.toFixed(2);

  document.getElementById("totalKg").textContent =
    totalKg.toFixed(2);
}
