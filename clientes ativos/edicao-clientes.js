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

fecharEdicao.addEventListener("click", () => modalEdicao.classList.add("hidden"));

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
  const novoImei = imeiEdicao.value || clienteAntigo.imei;
  const novaLinha = linhaEdicao.value || clienteAntigo.linha;

  const equipamentoAlterado = clienteAntigo.imei !== novoImei;
  const linhaAlterada = clienteAntigo.linha !== novaLinha;

  // Carrega os estoques
  let estoqueNovos = JSON.parse(localStorage.getItem("estoqueNovos")) || [];
  let estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];
  let chips = JSON.parse(localStorage.getItem("estoqueChips")) || [];

  // Se houve troca de equipamento ou linha
  if (equipamentoAlterado || linhaAlterada) {
    // Devolve o equipamento antigo para o estoque de usados
    estoqueUsados.push({
      modelo: clienteAntigo.modelo,
      imei: clienteAntigo.imei,
      linha: clienteAntigo.linha
    });

    console.log("Equipamento antigo devolvido ao estoque de usados:", clienteAntigo.modelo, clienteAntigo.imei, clienteAntigo.linha);

    // Remove o novo IMEI dos estoques, se ele existir
const imeiAlvo = novoImei.trim();
const linhaAlvo = novaLinha.trim();

const antesNovos = estoqueNovos.length;
const antesUsados = estoqueUsados.length;
const antesChips = chips.length;

estoqueNovos = estoqueNovos.filter(eq => eq.imei && eq.imei.trim() !== imeiAlvo);
estoqueUsados = estoqueUsados.filter(eq => eq.imei && eq.imei.trim() !== imeiAlvo);

chips = chips.filter(chip => chip.linha && chip.linha.trim() !== linhaAlvo);

console.log(`Removido novo IMEI ${imeiAlvo}?`, antesNovos !== estoqueNovos.length || antesUsados !== estoqueUsados.length);
console.log(`Removido nova linha ${linhaAlvo}?`, antesChips !== chips.length);
  }

  // Atualiza o cliente no array
  clientes[index] = {
    ...clienteAntigo,
    plano: novoPlano,
    veiculo: novoVeiculo,
    modelo: novoModelo,
    imei: novoImei,
    linha: novaLinha
  };

  // Salva tudo no localStorage
  localStorage.setItem("clientesAtivos", JSON.stringify(clientes));
  localStorage.setItem("estoqueNovos", JSON.stringify(estoqueNovos));
  localStorage.setItem("estoqueUsados", JSON.stringify(estoqueUsados));
  localStorage.setItem("estoqueChips", JSON.stringify(chips));

  alert("Cliente atualizado com sucesso!");

  // Fecha o modal e limpa o formulário
  modalEdicao.classList.add("hidden");
  document.getElementById("form-edicao-element").reset();

  // Atualiza a tabela na tela
  const atualizarTabela = window.atualizarTabelaClientesAtivos || window.preencherTabelaClientesAtivos;
  if (atualizarTabela) atualizarTabela(clientes);
});
