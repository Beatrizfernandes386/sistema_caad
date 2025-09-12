// ---------- FUNÇÃO PARA PREENCHER A TABELA ----------
function preencherTabelaClientesAtivos(clientes) {
  const tbody = document.getElementById("tbody-clientes-ativos");
  tbody.innerHTML = "";

  clientes.forEach((cliente, index) => {
    let dataFormatada = cliente.data || cliente.date || '';
    if (dataFormatada && typeof dataFormatada === 'string' && dataFormatada.includes("/")) {
      const iso = converterDataBrParaIso(dataFormatada);
      if (iso) {
        const [ano, mes, dia] = iso.split("-");
        dataFormatada = `${dia}/${mes}/${ano}`;
      }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cliente.name || cliente.nome || '-'}</td>
      <td>${cliente.plan || cliente.plano || '-'}</td>
      <td>${cliente.vehicle || cliente.veiculo || '-'}</td>
      <td>${cliente.model || cliente.modelo || '-'}</td>
      <td>${cliente.imei || '-'}</td>
      <td>${cliente.line || cliente.linha || '-'}</td>
      <td>${cliente.service || cliente.servico || '-'}</td>
      <td>${dataFormatada}</td>
    `;
    tr.dataset.index = index;
    tbody.appendChild(tr);
  });
}

// ---------- FILTRO DE PESQUISA ----------
document.getElementById("filtro-input").addEventListener("input", async (event) => {
  const termo = event.target.value.toLowerCase();

  try {
    let clientes = [];

    if (termo.trim() === "") {
      // Se não há termo de busca, carrega todos os clientes
      const response = await apiRequest('http://192.168.0.18:8282/api/clients/active');
      if (response.ok) {
        clientes = await response.json();
      }
    } else {
      // Busca na API (se implementada) ou filtra localmente
      const response = await apiRequest('http://192.168.0.18:8282/api/clients/active');
      if (response.ok) {
        const todosClientes = await response.json();
        clientes = todosClientes.filter(cliente =>
          Object.values(cliente).some(valor =>
            String(valor).toLowerCase().includes(termo)
          )
        );
      }
    }

    preencherTabelaClientesAtivos(clientes);
  } catch (error) {
    console.error('Erro no filtro:', error);
  }
});

// ---------- IMPORTAÇÃO JSON ----------
document.getElementById("importar-btn").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dados = JSON.parse(e.target.result);
        if (!Array.isArray(dados)) {
          alert("O arquivo JSON deve conter um array de clientes.");
          return;
        }

        const todosValidos = dados.every(cliente =>
          cliente.name && cliente.plan && cliente.vehicle &&
          cliente.model && cliente.imei && cliente.line &&
          cliente.service && cliente.date
        );

        if (!todosValidos) {
          alert("Alguns clientes estão com dados incompletos.");
          return;
        }

        // Enviar para API
        const response = await apiRequest('http://192.168.0.18:8282/api/clients/import', {
          method: 'POST',
          body: JSON.stringify(dados)
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message);

          // Recarregar tabela
          await carregarClientesAtivos();
        } else {
          const error = await response.json();
          alert(error.message || 'Erro ao importar clientes');
        }

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

// ---------- CARREGAR CLIENTES ATIVOS ----------
async function carregarClientesAtivos() {
  try {
    const response = await apiRequest(`${API_BASE_URL}/clients/active`);
    if (response.ok) {
      const clientes = await response.json();
      preencherTabelaClientesAtivos(clientes);
    } else {
      console.error('Erro ao carregar clientes ativos');
    }
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
  }
}

// ---------- CARREGAR DADOS AO INICIAR ----------
window.addEventListener("load", () => {
  carregarClientesAtivos();
});
