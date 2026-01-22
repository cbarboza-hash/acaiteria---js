const API_URL = "https://script.google.com/macros/s/AKfycbxE9-6hiJiYLOJZ4ogkduNo9HKKrNLxDcEAV4hPX1YuaiqFg2O2JxDhKk2dpyMn4koc8A/exec";

let pagamentos = {};

// ================================
// CALCULAR TOTAL
// ================================
function calcularTotal() {
  const preco = Number(document.getElementById("precoKg").value) || 0;
  const kg = Number(document.getElementById("kg").value) || 0;
  const total = preco * kg;

  document.getElementById("total").innerText =
    total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ================================
// ABRIR INPUT DE PAGAMENTO
// ================================
function abrirPagamento(tipo) {
  const div = document.getElementById("pagamentos");

  if (pagamentos[tipo]) return;

  pagamentos[tipo] = 0;

  const el = document.createElement("div");
  el.id = `pag-${tipo}`;
  el.className = "flex gap-2 mb-2";

  el.innerHTML = `
    <span class="w-24 capitalize">${tipo}</span>
    <input type="number" class="border p-2 rounded w-full"
           oninput="pagamentos['${tipo}'] = Number(this.value)">
    <button onclick="removerPagamento('${tipo}')" class="bg-red-500 text-white px-2 rounded">X</button>
  `;

  div.appendChild(el);
}

// ================================
// REMOVER PAGAMENTO
// ================================
function removerPagamento(tipo) {
  delete pagamentos[tipo];
  document.getElementById(`pag-${tipo}`).remove();
}

// ================================
// FINALIZAR VENDA
// ================================
async function finalizarVenda() {
  const preco = Number(precoKg.value);
  const kg = Number(document.getElementById("kg").value);
  const total = preco * kg;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "venda",
      dados: { total, kg, pagamentos }
    })
  });

  const json = await res.json();
  alert("Venda registrada! ID: " + json.id);

  pagamentos = {};
  document.getElementById("pagamentos").innerHTML = "";
  document.getElementById("kg").value = "";
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
  const div = document.getElementById("relatorio");
  div.innerHTML = "";

  json.vendas.forEach(v => {
    div.innerHTML += `
      <div class="border p-2 mb-1">
        <b>ID:</b> ${v[0]} | <b>Total:</b> R$ ${v[2]} | <b>Forma:</b> ${v[4]}
      </div>
    `;
  });
}

// ================================
// EXCLUIR VENDA
// ================================
async function excluirVenda() {
  const id = document.getElementById("idExcluir").value;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "excluir", id })
  });

  alert("Venda excluída!");
  buscarRelatorio();
}
