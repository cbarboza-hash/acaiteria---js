  const API_URL = "https://script.google.com/macros/s/AKfycbwtAgkUExE3QJlyZ4qJTS7n63o_B2ABh7sH61mBdqpORsWJOhKTH_63-1hRZwDY8bAJxg/exec";

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
