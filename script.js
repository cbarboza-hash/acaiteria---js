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
  const tabelaEl = document.getElementById("tabelaVendas");
  const relatorioPre = document.getElementById("relatorio");

  // Prepara a chamada para a API
  const payload = encodeURIComponent(JSON.stringify({
    action: "relatorio"
  }));

  try {
    const res = await fetch(`${API_URL}?payload=${payload}`);
    const json = await res.json();

    // Se não houver a tabela no HTML, mostra o JSON bruto (modo debug)
    if (!tabelaEl) {
      if (relatorioPre) {
        relatorioPre.innerText = JSON.stringify(json, null, 2);
      }
      return;
    }

    // Pega as vendas (pulando o cabeçalho da planilha)
    const vendas = json.vendas.slice(1);

    let totalVendas = 0;
    let totalKg = 0;

    // Limpa a tabela antes de preencher
    tabelaEl.innerHTML = "";

    vendas.forEach(l => {
      // Desestrutura os dados da linha da planilha
      const [, data, total, kg, forma, pago] = l;

      // Soma os totais (sem filtros, pega tudo)
      totalVendas += Number(pago || 0);
      totalKg += Number(kg || 0);

      // Cria a linha da tabela
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(data).toLocaleString("pt-BR")}</td>
        <td>${forma}</td>
        <td>${kg}</td>
        <td>R$ ${Number(total).toFixed(2)}</td>
        <td>R$ ${Number(pago).toFixed(2)}</td>
      `;

      tabelaEl.appendChild(tr);
    });

    // Atualiza os elementos de total no HTML
    const totalVendasEl = document.getElementById("totalVendas");
    const totalKgEl = document.getElementById("totalKg");

    if (totalVendasEl) totalVendasEl.innerText = totalVendas.toFixed(2);
    if (totalKgEl) totalKgEl.innerText = totalKg.toFixed(2);

  } catch (error) {
    console.error("Erro ao carregar relatório:", error);
    alert("Erro ao buscar dados da planilha.");
  }
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
