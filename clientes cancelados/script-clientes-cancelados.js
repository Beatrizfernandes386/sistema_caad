const tabela = document.querySelector("#clientes-cancelados-tabela tbody");
const filtroInput = document.getElementById("filtro-cancelados");
const importarBtn = document.getElementById("importar-btn");
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
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

if (filtroInput) {
  filtroInput.addEventListener("input", filtrarClientes);
}

// Carrega os clientes cancelados ao iniciar
carregarClientesCancelados();
