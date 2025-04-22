// 1. Recupera os dados do localStorage ou inicializa como array vazio
let estoqueNovos = JSON.parse(localStorage.getItem("estoqueNovos")) || [];
let estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];
let estoqueChips = JSON.parse(localStorage.getItem("estoqueChips")) || [];

// 2. Atualiza o localStorage com os dados recuperados (se ainda não existirem)
localStorage.setItem("estoqueNovos", JSON.stringify(estoqueNovos));
localStorage.setItem("estoqueUsados", JSON.stringify(estoqueUsados));
localStorage.setItem("estoqueChips", JSON.stringify(estoqueChips));

// 3. Referências de tabelas
const novosTable = document.querySelector("#tabela-equipamentos-novos");
const usadosTable = document.querySelector("#tabela-equipamentos-usados");
const chipsTable = document.querySelector("#tabela-chips");

// 4. Função para atualizar todas as tabelas
function atualizarTabelas() {
  // Equipamentos Novos
  novosTable.innerHTML = "";
  estoqueNovos.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.modelo}</td><td>${item.imei}</td>`;
    novosTable.appendChild(row);
  });

  // Equipamentos Usados
  usadosTable.innerHTML = "";
  estoqueUsados.forEach((equipamento) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${equipamento.modelo}</td>
      <td>${equipamento.imei}</td>
      <td>${equipamento.linha}</td>
    `;
    usadosTable.appendChild(row);
  });

  // Chips
  chipsTable.innerHTML = "";
  estoqueChips.forEach((chip) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${chip.linha}</td><td>${chip.status}</td>`;
    chipsTable.appendChild(row);
  });
}

// 5. Função para preencher o select de IMEI de exclusão com equipamentos usados
function preencherSelectIMEI() {
  const imeiSelect = document.getElementById("imei-excluir");
  imeiSelect.innerHTML = '<option value="">Selecione o IMEI</option>'; // Limpa as opções existentes

  // Preenche com os IMEIs dos equipamentos usados
  estoqueUsados.forEach((equipamento) => {
    const option = document.createElement("option");
    option.value = equipamento.imei;
    option.textContent = equipamento.imei;
    imeiSelect.appendChild(option);
  });
}

// 6. Evento para carregar as tabelas ao abrir a página
window.addEventListener("load", () => {
  atualizarTabelas();
  preencherSelectIMEI(); // Preenche o select de IMEI ao carregar a página
});

// 7. Formulário de cadastrar equipamento
document.getElementById("formCadastrarEquipamento").addEventListener("submit", (e) => {
  e.preventDefault();
  const modelo = document.getElementById("modelo-equipamento").value.trim();
  const imei = document.getElementById("imei-equipamento").value.trim();

  if (!modelo || !imei) {
    alert("Preencha todos os campos.");
    return;
  }

  estoqueNovos.push({ modelo, imei });
  localStorage.setItem("estoqueNovos", JSON.stringify(estoqueNovos));
  atualizarTabelas();
  e.target.reset();
  alert("Equipamento cadastrado com sucesso.");
});

// 8. Formulário de cadastrar chip
document.getElementById("formCadastrarChip").addEventListener("submit", (e) => {
  e.preventDefault();
  const linha = document.getElementById("linha-chip").value.trim();
  const status = document.getElementById("status-chip").value;

  if (!linha || !status) {
    alert("Preencha todos os campos.");
    return;
  }

  estoqueChips.push({ linha, status });
  localStorage.setItem("estoqueChips", JSON.stringify(estoqueChips));
  atualizarTabelas();
  e.target.reset();
  alert("Chip cadastrado com sucesso.");
});

// Evento para preencher modelo e linha ao selecionar um IMEI
document.getElementById("imei-excluir")?.addEventListener("change", function () {
  const imeiSelecionado = this.value;
  const equipamento = estoqueUsados.find(eq => eq.imei === imeiSelecionado);

  if (equipamento) {
    document.getElementById("modelo-excluir").value = equipamento.modelo;
    document.getElementById("linha-excluir").value = equipamento.linha;
  } else {
    document.getElementById("modelo-excluir").value = "";
    document.getElementById("linha-excluir").value = "";
  }
});

// Lógica do botão de excluir equipamento
document.getElementById("formExcluirEquipamento")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const modelo = document.getElementById("modelo-excluir").value;
  const imei = document.getElementById("imei-excluir").value;
  const linha = document.getElementById("linha-excluir").value;
  const data = document.getElementById("data-excluir").value;
  const motivo = document.getElementById("motivo-excluir").value.trim();
  const statusChip = document.getElementById("status-chip-excluir").value;

  if (!modelo || !imei || !linha || !data || !motivo || !statusChip) {
    alert("Preencha todos os campos.");
    return;
  }

  // Remove do estoque de usados
  estoqueUsados = estoqueUsados.filter(e => e.imei !== imei);
  localStorage.setItem("estoqueUsados", JSON.stringify(estoqueUsados));

  // Se ATIVO, devolve o chip ao estoque
  if (statusChip === "ATIVO") {
    estoqueChips.push({ linha, status: "ATIVO" });
    localStorage.setItem("estoqueChips", JSON.stringify(estoqueChips));
  }

  // Adiciona aos equipamentos perdidos
  const equipamentosPerdidos = JSON.parse(localStorage.getItem("equipamentosPerdidos")) || [];
  equipamentosPerdidos.push({ modelo, imei, linha, data, motivo, statusChip });
  localStorage.setItem("equipamentosPerdidos", JSON.stringify(equipamentosPerdidos));

  // Atualiza a visualização
  atualizarTabelas();
  preencherSelectIMEI(); // Atualiza o select de IMEI
  e.target.reset();
  alert("Equipamento excluído com sucesso.");
});
