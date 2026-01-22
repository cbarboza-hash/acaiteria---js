const API_URL = "https://script.google.com/macros/s/AKfycbzsezBa1QuxLv6AmVzJ4CH2UXxRevQVS74V6L9pRs5y_gExE5cp1n50oCmp8n7078mTSw/exec";

let pagamentos = {};
let totalVenda = 0;

// ===============================
// CALCULAR TOTAL
// ===============================
function calcularTotal() {
  const preco = Number(document.getElementById("precoKg").value || 0);
  const kg = Number(document.getElementById("kg").value || 0);

  totalVenda = preco * kg;
  document.getElementById("total").innerText =
    "R$ " + totalVenda.toFixed(2).replace(".", ",");
}

// ===============================
// TOGGLE PAGAMENTO
// ===============================
function togglePagamento(forma) {
  const div = document.getElementById("pagamentos");

  if (pagamentos[forma]) {
    delete pagamentos[forma];
    document.getElementById(`pay-${forma}`).remove();
    return;
  }

  pagamentos[forma] = 0;

  const input = document.createElement("input");
  input.type = "number";
  input.placeholder = forma;
  input.className = "border p-2 rounded w-full mb-2";
  input.id = `pay-${forma}`;
  input.oninput = e => pagamentos[forma] = Number(e.target.value || 0);

  div.appendChild(input);
}

// ===============================
// FINALIZAR VENDA (GET SEM CORS)
// ===============================
async function finalizarVenda() {
  const kg = Number(document.getElementById("kg").value || 0);

  if (kg <= 0 || totalVenda <= 0) {
    alert("Informe quantidade válida");
    return;
  }

  const payload = encodeURIComponent(JSON.stringify({
    action: "venda",
    dados: {
      total: totalVenda,
      kg,
      pagamentos
    }
  }));

  const res = await fetch(`${API_URL}?payload=${payload}`);
  const json = await res.json();

  alert("Venda registrada!");
  console.log(json);

  pagamentos = {};
  document.getElementById("pagamentos").innerHTML = "";
}

// ===============================
// RELATÓRIO
// ===============================
async function buscarRelatorio() {
  const payload = encodeURIComponent(JSON.stringify({
    action: "relatorio"
  }));

  const res = await fetch(`${API_URL}?payload=${payload}`);
  const json = await res.json();

  const vendas = json.vendas;
  if (!vendas || vendas.length <= 1) {
    document.getElementById("relatorio").innerHTML = "Nenhuma venda hoje.";
    return;
  }

  const headers = vendas[0];
  const linhas = vendas.slice(1);

  let html = `
    <table class="w-full text-sm border border-gray-300">
      <thead class="bg-gray-200">
        <tr>
          ${headers.map(h => `<th class="border px-2 py-1">${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
  `;

  linhas.forEach(linha => {
    html += `
      <tr class="odd:bg-white even:bg-gray-100">
        ${linha.map(col => `
          <td class="border px-2 py-1">
            ${col instanceof Date ? new Date(col).toLocaleString("pt-BR") : col}
          </td>
        `).join("")}
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  document.getElementById("relatorio").innerHTML = html;
}


// ===============================
// EXCLUIR
// ===============================
async function excluirVenda() {
  const id = document.getElementById("idExcluir").value.trim();
  if (!id) return alert("Informe o ID");

  const payload = encodeURIComponent(JSON.stringify({
    action: "excluir",
    id
  }));

  const res = await fetch(`${API_URL}?payload=${payload}`);
  const json = await res.json();

  alert("Venda excluída");
  console.log(json);
}
