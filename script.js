const API_URL = "https://script.google.com/macros/s/AKfycbxqe7sT3jqUswJucwkC3LewK9kQ50jKduBDAHhwfl24FRqFQq8aT2O8AQzKH_144HHeZA/exec";

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
  
  // Atualiza campo de pagamento único se só houver 1 opção selecionada
  const formasSelecionadas = Object.keys(pagamentos);
  if (formasSelecionadas.length === 1 && formasSelecionadas[0] !== "Dinheiro") {
    pagamentos[formasSelecionadas[0]] = totalVenda;
    const input = document.getElementById(`pay-${formasSelecionadas[0]}`);
    if(input) input.value = totalVenda;
  }
}

// ===============================
// TOGGLE PAGAMENTO
// ===============================
function togglePagamento(forma) {
  const div = document.getElementById("pagamentos");

  // Remove forma
  if (pagamentos[forma]) {
    delete pagamentos[forma];
    const el = document.getElementById(`pay-${forma}`);
    if (el) el.remove();
    return;
  }

  // Adiciona forma
  pagamentos[forma] = 0;

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "mb-2";

  const label = document.createElement("label");
  label.innerText = forma + (forma === "Dinheiro" ? " (Valor recebido)" : "");
  label.className = "block font-bold";

  const input = document.createElement("input");
  input.type = "number";
  input.placeholder = "Valor";
  input.className = "border p-2 rounded w-full";
  input.id = `pay-${forma}`;

  input.oninput = e => {
    pagamentos[forma] = Number(e.target.value || 0);
    // Troco automático se Dinheiro
    if (forma === "Dinheiro") {
      const trocoEl = document.getElementById("troco");
      if (!trocoEl) {
        const t = document.createElement("div");
        t.id = "troco";
        t.className = "mt-1 text-sm font-bold";
        inputWrapper.appendChild(t);
      }
      document.getElementById("troco").innerText =
        pagamentos[forma] >= totalVenda
          ? "Troco: R$ " + (pagamentos[forma] - totalVenda).toFixed(2)
          : "Troco: R$ 0,00";
    }
  };

  inputWrapper.appendChild(label);
  inputWrapper.appendChild(input);
  div.appendChild(inputWrapper);
}

// ===============================
// FINALIZAR VENDA
// ===============================
async function finalizarVenda() {
  const kg = Number(document.getElementById("kg").value || 0);

  if (kg <= 0 || totalVenda <= 0) {
    alert("Informe quantidade válida");
    return;
  }

  const formas = Object.keys(pagamentos);
  if (formas.length === 0) {
    alert("Escolha ao menos uma forma de pagamento");
    return;
  }

  // Distribuir valores sem ultrapassar totalVenda
  let totalDistribuido = 0;
  const pagamentosRegistrar = {};

  formas.forEach((forma, index) => {
    let valor = Number(pagamentos[forma] || 0);

    // Se for a última forma, garante que soma exatamente totalVenda
    if (index === formas.length - 1) {
      valor = totalVenda - totalDistribuido;
    } else {
      // Não pode ultrapassar o totalVenda
      if (valor + totalDistribuido > totalVenda) valor = totalVenda - totalDistribuido;
    }

    pagamentosRegistrar[forma] = valor;
    totalDistribuido += valor;
  });

  const payload = encodeURIComponent(JSON.stringify({
    action: "venda",
    dados: {
      total: totalVenda,
      kg,
      pagamentos: pagamentosRegistrar
    }
  }));

  const res = await fetch(`${API_URL}?payload=${payload}`);
  const json = await res.json();

  alert("Venda registrada!");
  console.log(json);

  // Reset
  pagamentos = {};
  document.getElementById("pagamentos").innerHTML = "";
  document.getElementById("kg").value = "";
  calcularTotal();
}

