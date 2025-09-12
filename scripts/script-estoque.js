// ========== GESTÃO DE ESTOQUE - API INTEGRATION ==========

// Referências de tabelas
const novosTable = document.querySelector("#tabela-equipamentos-novos");
const usadosTable = document.querySelector("#tabela-equipamentos-usados");
const chipsTable = document.querySelector("#tabela-chips");

// ========== CARREGAMENTO DE DADOS ==========

// Carregar equipamentos novos
async function carregarEquipamentosNovos() {
  try {
    const response = await apiRequest('http://192.168.0.18:8282/api/inventory/new');
    if (!response.ok) {
      console.error('Erro ao carregar equipamentos novos');
      return;
    }

    const equipamentos = await response.json();
    novosTable.innerHTML = "";

    equipamentos.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${item.model}</td><td>${item.imei}</td>`;
      novosTable.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar equipamentos novos:', error);
  }
}

// Carregar equipamentos usados
async function carregarEquipamentosUsados() {
  try {
    const response = await apiRequest('http://192.168.0.18:8282/api/inventory/used');
    if (!response.ok) {
      console.error('Erro ao carregar equipamentos usados');
      return;
    }

    const equipamentos = await response.json();
    usadosTable.innerHTML = "";

    equipamentos.forEach((equipamento) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${equipamento.model}</td>
        <td>${equipamento.imei}</td>
        <td>${equipamento.line || 'N/A'}</td>
      `;
      usadosTable.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar equipamentos usados:', error);
  }
}

// Carregar chips
async function carregarChips() {
  try {
    const response = await apiRequest('http://192.168.0.18:8282/api/inventory/sim-cards');
    if (!response.ok) {
      console.error('Erro ao carregar chips');
      return;
    }

    const chips = await response.json();
    chipsTable.innerHTML = "";

    chips.forEach((chip) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${chip.line}</td><td>${chip.status}</td>`;
      chipsTable.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar chips:', error);
  }
}

// Função para atualizar todas as tabelas
async function atualizarTabelas() {
  await Promise.all([
    carregarEquipamentosNovos(),
    carregarEquipamentosUsados(),
    carregarChips()
  ]);
}

// ========== PREENCHIMENTO DE SELECTS ==========

// Preencher o select de IMEI de exclusão com equipamentos usados
async function preencherSelectIMEI() {
  try {
    const response = await apiRequest('http://192.168.0.18:8282/api/inventory/used');
    if (!response.ok) {
      console.error('Erro ao carregar equipamentos para exclusão');
      return;
    }

    const equipamentos = await response.json();
    const imeiSelect = document.getElementById("imei-excluir");
    imeiSelect.innerHTML = '<option value="">Selecione o IMEI</option>';

    equipamentos.forEach((equipamento) => {
      const option = document.createElement("option");
      option.value = equipamento.imei;
      option.textContent = equipamento.imei;
      imeiSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao preencher select IMEI:', error);
  }
}

// ========== EVENTOS DE CARREGAMENTO ==========

// Evento para carregar as tabelas ao abrir a página
window.addEventListener("load", async () => {
  await atualizarTabelas();
  await preencherSelectIMEI();
});

// ========== FORMULÁRIOS DE CADASTRO ==========

// Formulário de cadastrar equipamento
document.getElementById("formCadastrarEquipamento").addEventListener("submit", async (e) => {
  e.preventDefault();

  const modelo = document.getElementById("modelo-equipamento").value.trim();
  const imei = document.getElementById("imei-equipamento").value.trim();

  if (!modelo || !imei) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const response = await apiRequest('http://192.168.0.18:8282/api/inventory/equipment', {
      method: 'POST',
      body: JSON.stringify({ model: modelo, imei: imei })
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message);
      await atualizarTabelas();
      e.target.reset();
    } else {
      const error = await response.json();
      alert(error.message || 'Erro ao cadastrar equipamento');
    }
  } catch (error) {
    console.error('Erro ao cadastrar equipamento:', error);
    alert('Erro ao cadastrar equipamento');
  }
});

// Formulário de cadastrar chip
document.getElementById("formCadastrarChip").addEventListener("submit", async (e) => {
  e.preventDefault();

  const linha = document.getElementById("linha-chip").value.trim();
  const status = document.getElementById("status-chip").value;

  if (!linha || !status) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const response = await apiRequest('http://192.168.0.18:8282/api/inventory/sim-card', {
      method: 'POST',
      body: JSON.stringify({ line: linha, status: status })
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message);
      await atualizarTabelas();
      e.target.reset();
    } else {
      const error = await response.json();
      alert(error.message || 'Erro ao cadastrar chip');
    }
  } catch (error) {
    console.error('Erro ao cadastrar chip:', error);
    alert('Erro ao cadastrar chip');
  }
});

// ========== EVENTOS DE EXCLUSÃO ==========

// Evento para preencher modelo e linha ao selecionar um IMEI
document.getElementById("imei-excluir")?.addEventListener("change", async function () {
  const imeiSelecionado = this.value;

  if (!imeiSelecionado) {
    document.getElementById("modelo-excluir").value = "";
    document.getElementById("linha-excluir").value = "";
    return;
  }

  try {
    const response = await apiRequest('http://192.168.0.18:8282/api/inventory/used');
    if (!response.ok) {
      console.error('Erro ao buscar equipamento');
      return;
    }

    const equipamentos = await response.json();
    const equipamento = equipamentos.find(eq => eq.imei === imeiSelecionado);

    if (equipamento) {
      document.getElementById("modelo-excluir").value = equipamento.model;
      document.getElementById("linha-excluir").value = equipamento.line || "";
    } else {
      document.getElementById("modelo-excluir").value = "";
      document.getElementById("linha-excluir").value = "";
    }
  } catch (error) {
    console.error('Erro ao preencher dados do equipamento:', error);
  }
});

// Formulário de excluir equipamento
document.getElementById("formExcluirEquipamento")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const modelo = document.getElementById("modelo-excluir").value;
  const imei = document.getElementById("imei-excluir").value;
  const linha = document.getElementById("linha-excluir").value;
  const data = document.getElementById("data-excluir").value;
  const motivo = document.getElementById("motivo-excluir").value.trim();
  const statusChip = document.getElementById("status-chip-excluir").value;

  if (!modelo || !imei || !data || !motivo || !statusChip) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    const response = await apiRequest(`http://192.168.0.18:8282/api/inventory/equipment/${imei}`, {
      method: 'DELETE',
      body: JSON.stringify({
        reason: motivo,
        date: data,
        statusChip: statusChip
      })
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message);

      // Atualiza a visualização
      await atualizarTabelas();
      await preencherSelectIMEI();
      e.target.reset();
    } else {
      const error = await response.json();
      alert(error.message || 'Erro ao excluir equipamento');
    }
  } catch (error) {
    console.error('Erro ao excluir equipamento:', error);
    alert('Erro ao excluir equipamento');
  }
});
