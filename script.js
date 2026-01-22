const API_URL = "https://script.google.com/macros/s/AKfycbyEFsYZwHf53yE25lwEfr5UZg6ZhAT2YS_XARoCAMi7XZH5qg6WEBl20PkHzS4KC9X1XQ/exec";

// ================================
// REGISTRAR VENDA
// ================================
async function registrarVenda() {
  const dados = {
    total: 35,
    kg: 1.2,
    pagamentos: {
      dinheiro: 20,
      pix: 15
    }
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "venda",
      dados
    })
  });

  const json = await res.json();
  console.log(json);
}

// ================================
// BUSCAR RELATÓRIO
// ================================
async function buscarRelatorio() {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "relatorio"
    })
  });

  const json = await res.json();
  console.log(json);
}
