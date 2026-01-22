const API_URL = "https://script.google.com/macros/s/AKfycbyEFsYZwHf53yE25lwEfr5UZg6ZhAT2YS_XARoCAMi7XZH5qg6WEBl20PkHzS4KC9X1XQ/exec";

let pagamentos = {};

// ================================
// CALCULAR TOTAL
// ================================
function calcularTotal() {
  const preco = Number(document.getElementById("precoKg").value || 0);
  const kg = Number(document.getElementById("kg").value || 0);
  const total = preco * kg;

  document.getElementById("total").innerText =
    "R$ " + total.toFixed(2).replace(".", ",");

  return total;
}

// ================================
// ADICIONAR FORMA DE PAGAMENTO
// ================================
function addPagamento(forma) {
  if (pagamentos[forma] !== undefined) return;

  pagamentos[forma] = 0;

  const div = document.createElement("div");
  div.className = "flex gap-2 items-center";
  div.id = `pg-${forma}`;

  div.innerHTML = `
    <label class="w-32 font-semibold">${forma}</label>
    <input type="number" step="0.01"
      class="border p-2 rounded w-40"
      oninput="atualizarPagamento('${forma}', this.value)">
    <button onclick="removerPagamento('${forma}')"
      class="bg-red-500 text-white px-2 rounded">X</button>
  `;

  document.getElementById("pagamentos").appendChild(div);
}

// ================================
// ATUALIZAR VALOR DO PAGAMENTO
// ================================
function atualizarPagamento(forma, valor) {
  pagamentos[forma] = Number(valor || 0);
}

// ================================
// REMOVER FORMA DE PAGAMENTO
// ================================
function removerPagamento(forma) {
  delete pagamentos[forma];
  document.getElementById(`pg-${forma}`).remove();
}

// ================================
// FINALIZAR VENDA
// ================================
async function finalizarVenda() {
  const kg = Number(document.getElementById("kg").value);
  const total = calcularTotal();

  if (!kg || kg <= 0) {
    alert("Informe a quantidade em KG");
    return;
  }

  if (Object.keys(pagamentos).length === 0) {
    alert("Informe ao menos uma forma de pagamento");
    return;
  }

  const somaPagamentos = Object.values(pagamentos)
    .reduce((a, b) => a + b, 0);

  if (somaPagamentos < total) {
    alert("Valor pago insuficiente");
    return;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "venda",
      dados: {
        total: total.toFixed(2),
        kg: kg.toFixed(2),
        pagamentos
      }
    })
  });

  const json = await res.json();

  if (json.ok) {
    alert("✅ Venda registrada com sucesso!");
    limparFormulario();
    buscarRelatorio();
  } else {
    alert("❌ Erro ao registrar venda");
    console.error(json);
  }
}

// ================================
// LIMPAR FORMULÁRIO
// ================================
function limparFormulario() {
  document.getElementById("kg").value = "";
  document.getElementById("pagamentos").innerHTML = "";
  pagamentos = {};
  calcularTotal();
}

// ================================
// BUSCAR RELATÓRIO
// ================================
async function buscarRelatorio() {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "relatorio" })
  });

  const json = await res.json();
  renderRelatorio(json.vendas || []);
}

// ================================
// RENDERIZAR RELATÓRIO
// ================================
function renderRelatorio(vendas) {
  const div = document.getElementById("relatorio");

  if (!vendas.length) {
    div.innerHTML = "<p>Nenhuma venda hoje.</p>";
    return;
  }

  let html = `
    <table class="w-full text-sm border">
      <tr class="bg-gray-200">
        <th>ID</th>
        <th>Data</th>
        <th>Total</th>
        <th>KG</th>
        <th>Forma</th>
        <th>Valor</th>
      </tr>
  `;

  vendas.forEach(v => {
    html += `
      <tr class="border-t">
        <td>${v[0]}</td>
        <td>${new Date(v[1]).toLocaleString()}</td>
        <td>R$ ${Number(v[2]).toFixed(2)}</td>
        <td>${v[3]}</td>
        <td>${v[4]}</td>
        <td>R$ ${Number(v[5]).toFixed(2)}</td>
      </tr>
    `;
  });

  html += "</table>";
  div.innerHTML = html;
}

// ================================
// EXCLUIR VENDA
// ================================
async function excluirVenda() {
  const id = document.getElementById("idExcluir").value.trim();
  if (!id) {
    alert("Informe o ID da venda");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir esta venda?")) return;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "excluir",
      id
    })
  });

  const json = await res.json();

  if (json.ok) {
    alert("✅ Venda excluída");
    buscarRelatorio();
  } else {
    alert("❌ Erro ao excluir");
    console.error(json);
  }
}
