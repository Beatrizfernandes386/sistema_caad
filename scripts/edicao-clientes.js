const btnEditar = document.getElementById("editar-btn");
const modalEdicao = document.getElementById("form-edicao");
const fecharEdicao = document.getElementById("fechar-edicao");

const clienteSelect = document.getElementById("cliente-edicao");
const planoEdicao = document.getElementById("plano-edicao");
const veiculoEdicao = document.getElementById("veiculo");
const modeloEdicao = document.getElementById("modelo-edicao");
const imeiEdicao = document.getElementById("imei-edicao");
const linhaEdicao = document.getElementById("linha-edicao");

let equipamentosDisponiveis = [];

btnEditar.addEventListener("click", () => {
  preencherSelectClientesEdicao();
  preencherModelosEdicao();
  abrirModal(modalEdicao);
});

fecharEdicao.addEventListener("click", () => {
  modalEdicao.classList.add("hidden");
  document.getElementById("form-edicao-element").reset();
});


function abrirModal(modal) {
  modal.classList.remove("hidden");
}

// Preenche a lista de clientes
async function preencherSelectClientesEdicao() {
  try {
    const response = await apiRequest(`${API_BASE_URL}/clients/active`);
    if (!response.ok) {
      console.error('Erro ao carregar clientes para edição');
      return;
    }

    const clientes = await response.json();
    clienteSelect.innerHTML = `<option value="">Selecione o cliente</option>`;

    clientes.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id;
      option.textContent = cliente.name;
      clienteSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao preencher select de clientes:', error);
  }
}

// Preenche os modelos disponíveis no estoque
async function preencherModelosEdicao() {
  try {
    const [newResponse, usedResponse] = await Promise.all([
      apiRequest('${API_CONFIG.API_URL}/api/inventory/new'),
      apiRequest('${API_CONFIG.API_URL}/api/inventory/used')
    ]);

    if (!newResponse.ok || !usedResponse.ok) {
      console.error('Erro ao carregar equipamentos para edição');
      return;
    }

    const estoqueNovos = await newResponse.json();
    const estoqueUsados = await usedResponse.json();

    modeloEdicao.innerHTML = `<option value="">Modelo</option>`;
    const modelos = new Set();

    [...estoqueNovos, ...estoqueUsados].forEach(item => modelos.add(item.model));
    modelos.forEach(modelo => {
      const option = document.createElement("option");
      option.value = modelo;
      option.textContent = modelo;
      modeloEdicao.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao preencher modelos:', error);
  }
}

// Ao selecionar um cliente, preencher campos
clienteSelect.addEventListener("change", async () => {
  const clientId = clienteSelect.value;
  if (!clientId) return;

  try {
    const response = await apiRequest(`${API_CONFIG.API_URL}/api/clients/${clientId}`);
    if (!response.ok) {
      console.error('Erro ao carregar cliente para edição');
      return;
    }

    const cliente = await response.json();

    planoEdicao.value = cliente.plan;
    veiculoEdicao.value = cliente.vehicle;
    modeloEdicao.value = cliente.model;

    preencherIMEIEdicao(cliente.model, cliente.imei, cliente.line);
  } catch (error) {
    console.error('Erro ao carregar cliente:', error);
  }
});

// Quando mudar o modelo, atualizar IMEIs disponíveis
modeloEdicao.addEventListener("change", () => {
  preencherIMEIEdicao(modeloEdicao.value);
});

// Preenche IMEIs e armazena equipamentos disponíveis
async function preencherIMEIEdicao(modeloSelecionado, imeiSelecionado = "", linhaSelecionada = "") {
  try {
    const [newResponse, usedResponse] = await Promise.all([
      apiRequest('${API_CONFIG.API_URL}/api/inventory/new'),
      apiRequest('${API_CONFIG.API_URL}/api/inventory/used')
    ]);

    if (!newResponse.ok || !usedResponse.ok) {
      console.error('Erro ao carregar equipamentos para edição');
      return;
    }

    const estoqueNovos = await newResponse.json();
    const estoqueUsados = await usedResponse.json();

    const equipamentos = [
      ...estoqueNovos.filter(eq => eq.model === modeloSelecionado),
      ...estoqueUsados.filter(eq => eq.model === modeloSelecionado)
    ];

    imeiEdicao.innerHTML = `<option value="">IMEI</option>`;
    equipamentos.forEach(eq => {
      const option = document.createElement("option");
      option.value = eq.imei;
      option.textContent = eq.imei;
      imeiEdicao.appendChild(option);
    });

    if (imeiSelecionado) imeiEdicao.value = imeiSelecionado;

    imeiEdicao.onchange = () => {
      const imei = imeiEdicao.value;
      const eqNovo = estoqueNovos.find(eq => eq.imei === imei);
      const eqUsado = estoqueUsados.find(eq => eq.imei === imei);

      if (eqNovo) {
        preencherChipsDisponiveisEdicao();
        linhaEdicao.disabled = false;
        linhaEdicao.value = "";
      } else if (eqUsado) {
        linhaEdicao.innerHTML = `<option value="${eqUsado.line}">${eqUsado.line}</option>`;
        linhaEdicao.disabled = true;
      }
    };

    // Se já tiver um IMEI pré-selecionado, forçar disparo e preencher linha
    if (imeiSelecionado) {
      const evento = new Event("change");
      imeiEdicao.dispatchEvent(evento);

      setTimeout(() => {
        if (!linhaEdicao.disabled) {
          linhaEdicao.value = linhaSelecionada;
        }
      }, 100);
    }
  } catch (error) {
    console.error('Erro ao preencher IMEI para edição:', error);
  }
}

// Preenche as linhas disponíveis (chips ativos)
async function preencherChipsDisponiveisEdicao() {
  try {
    const response = await apiRequest('${API_CONFIG.API_URL}/api/inventory/available-sim-cards');
    if (!response.ok) {
      console.error('Erro ao carregar chips disponíveis para edição');
      return;
    }

    const ativos = await response.json();

    linhaEdicao.innerHTML = `<option value="">Linha</option>`;
    ativos.forEach(chip => {
      const option = document.createElement("option");
      option.value = chip.line;
      option.textContent = chip.line;
      linhaEdicao.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao preencher chips para edição:', error);
  }
}

document.getElementById("form-edicao-element").addEventListener("submit", async (e) => {
  e.preventDefault();

  const clientId = clienteSelect.value;
  if (!clientId) return;

  const novoPlano = planoEdicao.value;
  const novoVeiculo = veiculoEdicao.value;
  const novoModelo = modeloEdicao.value;
  const novoImei = imeiEdicao.value;
  const novaLinha = linhaEdicao.value;

  try {
    const updateData = {
      plan: novoPlano,
      vehicle: novoVeiculo,
      model: novoModelo,
      imei: novoImei,
      line: novaLinha
    };

    const response = await apiRequest(`${API_CONFIG.API_URL}/api/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      alert('Cliente atualizado com sucesso!');

      modalEdicao.classList.add("hidden");
      document.getElementById("form-edicao-element").reset();

      // Recarregar tabela
      if (window.carregarClientesAtivos) {
        window.carregarClientesAtivos();
      }
    } else {
      const error = await response.json();
      alert(error.message || 'Erro ao atualizar cliente');
    }
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    alert('Erro ao atualizar cliente');
  }
});
