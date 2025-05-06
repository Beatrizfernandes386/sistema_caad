const tabela = document.querySelector("#clientes-cancelados-tabela tbody");
const filtroInput = document.getElementById("filtro-cancelados");
const importarBtn = document.getElementById("importar-cancelados");
const importarInput = document.getElementById("importar-input");

// Carrega os dados dos clientes cancelados do localStorage e exibe na tabela
function carregarClientesCancelados() {
  tabela.innerHTML = "";
  const dados = JSON.parse(localStorage.getItem("clientesCancelados") || "[]");

  dados.forEach((cliente) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.dataInstalacao}</td>
      <td>${cliente.motivo}</td>
      <td>${formatarData(cliente.dataCancelamento)}</td>
    `;
    tabela.appendChild(tr);
  });
}

// Filtra os clientes cancelados com base no termo de busca
function filtrarClientes() {
  const termo = filtroInput.value.toLowerCase();
  const linhas = tabela.querySelectorAll("tr");

  linhas.forEach((linha) => {
    const textoLinha = linha.textContent.toLowerCase();
    linha.style.display = textoLinha.includes(termo) ? "" : "none";
  });
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

// Função para importar dados JSON
if (importarBtn && importarInput) {
  importarBtn.addEventListener("click", () => importarInput.click());

  importarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const dadosImportados = JSON.parse(event.target.result);
        if (Array.isArray(dadosImportados)) {
          const clientesExistentes = JSON.parse(localStorage.getItem("clientesCancelados") || "[]");
          const novosClientes = [...clientesExistentes, ...dadosImportados];
          localStorage.setItem("clientesCancelados", JSON.stringify(novosClientes));
          carregarClientesCancelados();
          alert("Importação concluída com sucesso!");
        } else {
          alert("O arquivo não contém um array válido.");
        }
      } catch (error) {
        alert("Erro ao importar o arquivo. Verifique se é um JSON válido.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Limpa o input após importar
  });
}

// Carrega os clientes cancelados ao iniciar
carregarClientesCancelados();
