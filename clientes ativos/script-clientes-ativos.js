// ---------- FUNÇÃO PARA PREENCHER A TABELA ----------
function preencherTabelaClientesAtivos(clientes) {
  const tbody = document.getElementById("tbody-clientes-ativos");
  tbody.innerHTML = "";

  clientes.forEach((cliente, index) => {
    let dataFormatada = cliente.data;
    if (dataFormatada.includes("/")) {
      const iso = converterDataBrParaIso(dataFormatada);
      if (iso) {
        const [ano, mes, dia] = iso.split("-");
        dataFormatada = `${dia}/${mes}/${ano}`;
      }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.plano}</td>
      <td>${cliente.veiculo}</td>
      <td>${cliente.modelo}</td>
      <td>${cliente.imei}</td>
      <td>${cliente.linha}</td>
      <td>${cliente.servico}</td>
      <td>${dataFormatada}</td>
    `;
    tr.dataset.index = index;
    tbody.appendChild(tr);
  });
}

// ---------- FILTRO DE PESQUISA ----------
document.getElementById("filtro-input").addEventListener("input", (event) => {
  const termo = event.target.value.toLowerCase();
  const clientes = JSON.parse(localStorage.getItem("clientesAtivos")) || [];

  const resultado = clientes.filter(cliente =>
    Object.values(cliente).some(valor =>
      String(valor).toLowerCase().includes(termo)
    )
  );

  preencherTabelaClientesAtivos(resultado);
});

// ---------- IMPORTAÇÃO JSON ----------
document.getElementById("importar-btn").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result);
        if (!Array.isArray(dados)) {
          alert("O arquivo JSON deve conter um array de clientes.");
          return;
        }

        const todosValidos = dados.every(cliente =>
          cliente.nome && cliente.plano && cliente.veiculo &&
          cliente.modelo && cliente.imei && cliente.linha &&
          cliente.servico && cliente.data
        );

        if (!todosValidos) {
          alert("Alguns clientes estão com dados incompletos.");
          return;
        }

        localStorage.setItem("clientesAtivos", JSON.stringify(dados));
        preencherTabelaClientesAtivos(dados);
        alert(`${dados.length} clientes importados com sucesso!`);
      } catch (erro) {
        console.error("Erro ao importar:", erro);
        alert("Erro ao importar arquivo JSON.");
      }
    };

    reader.readAsText(file);
  });

  input.click();
});

// ---------- CONVERTER DATA BR PARA ISO ----------
function converterDataBrParaIso(dataBr) {
  const [dia, mes, ano] = dataBr.split("/");
  if (!dia || !mes || !ano) return null;
  return `${ano}-${mes}-${dia}`;
}

// ---------- CARREGAR DADOS AO INICIAR ----------
window.addEventListener("load", () => {
  const clientesSalvos = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  preencherTabelaClientesAtivos(clientesSalvos);
});
