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
function preencherSelectClientesEdicao() {
  const clientes = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  clienteSelect.innerHTML = `<option value="">Selecione o cliente</option>`;

  clientes.forEach((cliente, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = cliente.nome;
    clienteSelect.appendChild(option);
  });
}

// Preenche os modelos disponíveis no estoque
function preencherModelosEdicao() {
  const estoqueNovos = JSON.parse(localStorage.getItem("estoqueNovos")) || [];
  const estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];

  modeloEdicao.innerHTML = `<option value="">Modelo</option>`;
  const modelos = new Set();

  [...estoqueNovos, ...estoqueUsados].forEach(item => modelos.add(item.modelo));
  modelos.forEach(modelo => {
    const option = document.createElement("option");
    option.value = modelo;
    option.textContent = modelo;
    modeloEdicao.appendChild(option);
  });
}

// Ao selecionar um cliente, preencher campos
clienteSelect.addEventListener("change", () => {
  const clientes = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  const cliente = clientes[clienteSelect.value];
  if (!cliente) return;

  planoEdicao.value = cliente.plano;
  veiculoEdicao.value = cliente.veiculo;
  modeloEdicao.value = cliente.modelo;

  preencherIMEIEdicao(cliente.modelo, cliente.imei, cliente.linha);
});

// Quando mudar o modelo, atualizar IMEIs disponíveis
modeloEdicao.addEventListener("change", () => {
  preencherIMEIEdicao(modeloEdicao.value);
});

// Preenche IMEIs e armazena equipamentos disponíveis
function preencherIMEIEdicao(modeloSelecionado, imeiSelecionado = "", linhaSelecionada = "") {
  const estoqueNovos = JSON.parse(localStorage.getItem("estoqueNovos")) || [];
  const estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];

  const equipamentos = [
    ...estoqueNovos.filter(eq => eq.modelo === modeloSelecionado),
    ...estoqueUsados.filter(eq => eq.modelo === modeloSelecionado)
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
      linhaEdicao.innerHTML = `<option value="${eqUsado.linha}">${eqUsado.linha}</option>`;
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
}

// Preenche as linhas disponíveis (chips ativos)
function preencherChipsDisponiveisEdicao() {
  const chips = JSON.parse(localStorage.getItem("estoqueChips")) || [];
  const ativos = chips.filter(chip => chip.status === "ATIVO");

  linhaEdicao.innerHTML = `<option value="">Linha</option>`;
  ativos.forEach(chip => {
    const option = document.createElement("option");
    option.value = chip.linha;
    option.textContent = chip.linha;
    linhaEdicao.appendChild(option);
  });
}

document.getElementById("form-edicao-element").addEventListener("submit", (e) => {
  e.preventDefault();

  const index = clienteSelect.value;
  const clientes = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  if (!clientes[index]) return;

  const clienteAntigo = clientes[index];

  const novoPlano = planoEdicao.value;
  const novoVeiculo = veiculoEdicao.value;
  const novoModelo = modeloEdicao.value;
  const novoImei = imeiEdicao.value;
  const novaLinha = linhaEdicao.value;

  // Flags para saber se houve alterações
  const planoAlterado = novoPlano !== clienteAntigo.plano;
  const veiculoAlterado = novoVeiculo !== clienteAntigo.veiculo;
  const equipamentoAlterado = novoImei && novoImei !== clienteAntigo.imei;
  const linhaAlterada = novaLinha && novaLinha !== clienteAntigo.linha;

  let estoqueNovos = JSON.parse(localStorage.getItem("estoqueNovos")) || [];
  let estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];
  let chips = JSON.parse(localStorage.getItem("estoqueChips")) || [];

  // Se trocou de equipamento, devolver o antigo ao estoque e remover o novo
  if (equipamentoAlterado) {
    estoqueUsados.push({
      modelo: clienteAntigo.modelo,
      imei: clienteAntigo.imei,
      linha: clienteAntigo.linha
    });

    const imeiAlvo = novoImei.trim();
    estoqueNovos = estoqueNovos.filter(eq => eq.imei.trim() !== imeiAlvo);
    estoqueUsados = estoqueUsados.filter(eq => eq.imei.trim() !== imeiAlvo);
  }

  // Se trocou de linha, remover a nova linha dos chips disponíveis
  if (linhaAlterada) {
    const linhaAlvo = novaLinha.trim();
    chips = chips.filter(chip => chip.linha.trim() !== linhaAlvo);
  }

  // Atualiza o cliente
  clientes[index] = {
    ...clienteAntigo,
    plano: novoPlano,
    veiculo: novoVeiculo,
    modelo: equipamentoAlterado ? novoModelo : clienteAntigo.modelo,
    imei: equipamentoAlterado ? novoImei : clienteAntigo.imei,
    linha: linhaAlterada ? novaLinha : clienteAntigo.linha
  };

  // Salva os dados atualizados
  localStorage.setItem("clientesAtivos", JSON.stringify(clientes));
  localStorage.setItem("estoqueNovos", JSON.stringify(estoqueNovos));
  localStorage.setItem("estoqueUsados", JSON.stringify(estoqueUsados));
  localStorage.setItem("estoqueChips", JSON.stringify(chips));

  // Exibe popup de sucesso
  const popup = document.getElementById("popup-confirmacao");
  const popupMessage = document.getElementById("popup-message");
  popupMessage.textContent = "Cliente atualizado com sucesso!";
  popup.classList.remove("hidden");

  const popupOk = document.getElementById("popup-ok");
  popupOk.onclick = () => {
    popup.classList.add("hidden");
    modalEdicao.classList.add("hidden");
    document.getElementById("form-edicao-element").reset();

    const atualizarTabela = window.atualizarTabelaClientesAtivos || window.preencherTabelaClientesAtivos;
    if (atualizarTabela) atualizarTabela(clientes);
  };
});
