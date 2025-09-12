const tabela = document.querySelector("#clientes-cancelados-tabela tbody");
const filtroInput = document.getElementById("filtro-cancelados");
const importarBtn = document.getElementById("importar-cancelados");
const importarInput = document.getElementById("importar-input");

// ========== CARREGAMENTO DE DADOS ==========

// Carrega os dados dos clientes cancelados da API
async function carregarClientesCancelados() {
  try {
    const response = await apiRequest('${API_CONFIG.API_URL}/api/clients/canceled');
    if (!response.ok) {
      console.error('Erro ao carregar clientes cancelados');
      return;
    }

    const dados = await response.json();
    tabela.innerHTML = "";

    dados.forEach((cliente) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cliente.name}</td>
        <td>${cliente.date}</td>
        <td>${cliente.service || 'N/A'}</td>
        <td>${formatarData(cliente.date)}</td>
      `;
      tabela.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar clientes cancelados:', error);
  }
}

// Filtra os clientes cancelados com base no termo de busca
async function filtrarClientes() {
  const termo = filtroInput.value.toLowerCase();

  if (termo.trim() === "") {
    // Se não há termo, recarrega todos
    await carregarClientesCancelados();
    return;
  }

  try {
    const response = await apiRequest('${API_CONFIG.API_URL}/api/clients/canceled');
    if (!response.ok) {
      console.error('Erro ao filtrar clientes cancelados');
      return;
    }

    const dados = await response.json();
    const filtrados = dados.filter(cliente =>
      cliente.name.toLowerCase().includes(termo) ||
      cliente.service?.toLowerCase().includes(termo) ||
      cliente.date?.toLowerCase().includes(termo)
    );

    tabela.innerHTML = "";
    filtrados.forEach((cliente) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cliente.name}</td>
        <td>${cliente.date}</td>
        <td>${cliente.service || 'N/A'}</td>
        <td>${formatarData(cliente.date)}</td>
      `;
      tabela.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao filtrar clientes:', error);
  }
}

// Formata a data no formato DD/MM/AAAA
function formatarData(data) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

if (filtroInput) {
  filtroInput.addEventListener("input", filtrarClientes);
}

// ========== IMPORTAÇÃO DE DADOS ==========

// Função para importar dados JSON
document.getElementById("importar-btn").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (event) {
      try {
        const dadosImportados = JSON.parse(event.target.result);
        if (Array.isArray(dadosImportados)) {
          // Nota: Como os clientes cancelados são gerados automaticamente
          // pela exclusão de clientes ativos, a importação direta pode
          // não ser necessária. Mas mantemos a funcionalidade para compatibilidade
          alert("Importação não suportada para clientes cancelados.\nUse a funcionalidade de exclusão de clientes ativos.");
        } else {
          alert("O arquivo não contém um array válido.");
        }
      } catch (error) {
        alert("Erro ao importar o arquivo. Verifique se é um JSON válido.");
      }
    };

    reader.readAsText(file);
  });

  input.click();
});


// ========== INICIALIZAÇÃO ==========

// Carrega os clientes cancelados ao iniciar
window.addEventListener("load", async () => {
  await carregarClientesCancelados();
});
